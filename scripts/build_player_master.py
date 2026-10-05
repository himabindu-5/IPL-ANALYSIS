
import json
from pathlib import Path
from collections import defaultdict

import pandas as pd

# --------------------------------------------------
# 1. Project paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
JSON_DIR = BASE_DIR / "data" / "raw" / "ipl_json"
OUTPUT_DIR = BASE_DIR / "data" / "cleaned"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

if not JSON_DIR.exists():
    raise FileNotFoundError(f"JSON folder not found: {JSON_DIR}")

json_files = sorted(JSON_DIR.glob("*.json"))

if not json_files:
    raise FileNotFoundError(f"No JSON files found in {JSON_DIR}")

# --------------------------------------------------
# 2. Store registry mappings and player appearances
# --------------------------------------------------

# One name can potentially map to more than one ID.
name_to_ids = defaultdict(set)

# Names observed among actual match participants.
name_match_ids = defaultdict(set)

# Registry names associated with each source player ID.
id_to_registry_names = defaultdict(set)

# Matches in which each resolved player ID appears.
id_to_match_ids = defaultdict(set)

# Count how often each player name appears across matches.
name_match_counts = defaultdict(int)

errors = []

# --------------------------------------------------
# 3. Read all match JSON files
# --------------------------------------------------

for file_path in json_files:
    try:
        with file_path.open("r", encoding="utf-8") as file:
            data = json.load(file)
    except (OSError, json.JSONDecodeError) as error:
        errors.append({
            "file": file_path.name,
            "error": str(error)
        })
        continue

    match_id = file_path.stem
    info = data.get("info", {})

    # Read Cricsheet registry information.
    registry = info.get("registry", {}).get("people", {})

    for name, source_id in registry.items():
        name = str(name).strip()
        source_id = str(source_id).strip()

        if name and source_id:
            name_to_ids[name].add(source_id)
            id_to_registry_names[source_id].add(name)

    # Collect names of players listed in each team's lineup.
    participants = set()

    team_players = info.get("players", {})

    if isinstance(team_players, dict):
        for player_list in team_players.values():
            if isinstance(player_list, list):
                for name in player_list:
                    if name:
                        participants.add(str(name).strip())

    # Collect players appearing in delivery records.
    for innings in data.get("innings", []):
        for over in innings.get("overs", []):
            for delivery in over.get("deliveries", []):
                for role in ["batter", "bowler", "non_striker"]:
                    name = delivery.get(role)

                    if name:
                        participants.add(str(name).strip())

                # Also capture players dismissed.
                for wicket in delivery.get("wickets", []):
                    name = wicket.get("player_out")

                    if name:
                        participants.add(str(name).strip())

    # Count each observed player name once per match.
    for name in participants:
        if not name:
            continue

        name_match_ids[name].add(match_id)
        name_match_counts[name] += 1

# --------------------------------------------------
# 4. Resolve names using registry IDs
# --------------------------------------------------

alias_rows = []
unresolved_rows = []

for name in sorted(name_match_ids):
    source_ids = sorted(name_to_ids.get(name, set()))
    match_count = len(name_match_ids[name])

    if len(source_ids) == 1:
        source_id = source_ids[0]

        alias_rows.append({
            "player_name": name,
            "source_player_id": source_id,
            "matches_seen": match_count,
            "mapping_status": "matched"
        })

        id_to_match_ids[source_id].update(name_match_ids[name])

    elif len(source_ids) == 0:
        unresolved_rows.append({
            "player_name": name,
            "matches_seen": match_count,
            "mapping_status": "no_registry_match",
            "candidate_ids": ""
        })

        alias_rows.append({
            "player_name": name,
            "source_player_id": "",
            "matches_seen": match_count,
            "mapping_status": "unresolved"
        })

    else:
        unresolved_rows.append({
            "player_name": name,
            "matches_seen": match_count,
            "mapping_status": "ambiguous_registry_match",
            "candidate_ids": ";".join(source_ids)
        })

        alias_rows.append({
            "player_name": name,
            "source_player_id": "",
            "matches_seen": match_count,
            "mapping_status": "ambiguous"
        })

# --------------------------------------------------
# 5. Build one master row per resolved player ID
# --------------------------------------------------

player_rows = []

for source_id in sorted(id_to_match_ids):
    # Only include aliases actually observed among participants
    # and uniquely matched to this registry ID.
    aliases = sorted(
        row["player_name"]
        for row in alias_rows
        if row["source_player_id"] == source_id
    )

    if not aliases:
        continue

    # This is the most frequently observed alias, not a claim
    # that it is the player's official full name.
    display_name = sorted(
        aliases,
        key=lambda name: (-name_match_counts[name], name)
    )[0]

    player_rows.append({
        "player_id": source_id,
        "display_name": display_name,
        "alias_count": len(aliases),
        "matches_seen": len(id_to_match_ids[source_id]),
        "registry_names": "; ".join(
            sorted(id_to_registry_names[source_id])
        )
    })

# --------------------------------------------------
# 6. Save datasets
# --------------------------------------------------

players_df = pd.DataFrame(
    player_rows,
    columns=[
        "player_id",
        "display_name",
        "alias_count",
        "matches_seen",
        "registry_names"
    ]
)

aliases_df = pd.DataFrame(
    alias_rows,
    columns=[
        "player_name",
        "source_player_id",
        "matches_seen",
        "mapping_status"
    ]
)

unresolved_df = pd.DataFrame(
    unresolved_rows,
    columns=[
        "player_name",
        "matches_seen",
        "mapping_status",
        "candidate_ids"
    ]
)

players_df.to_csv(
    OUTPUT_DIR / "player_master.csv",
    index=False,
    encoding="utf-8-sig"
)

aliases_df.to_csv(
    OUTPUT_DIR / "player_aliases.csv",
    index=False,
    encoding="utf-8-sig"
)

unresolved_df.to_csv(
    OUTPUT_DIR / "unresolved_player_names.csv",
    index=False,
    encoding="utf-8-sig"
)

errors_df = pd.DataFrame(errors, columns=["file", "error"])

errors_df.to_csv(
    OUTPUT_DIR / "player_extraction_errors.csv",
    index=False,
    encoding="utf-8-sig"
)

# --------------------------------------------------
# 7. Print summary
# --------------------------------------------------

print("\nPLAYER IDENTITY EXTRACTION")
print("-" * 40)
print("JSON files found:", len(json_files))
print("Files with read/JSON errors:", len(errors))
print("Unique observed participant names:", len(name_match_ids))
print("Resolved player IDs:", len(players_df))
print("Player aliases:", len(aliases_df))
print("Unresolved or ambiguous names:", len(unresolved_df))

if not unresolved_df.empty:
    print("\nUnresolved mapping types:")
    print(unresolved_df["mapping_status"].value_counts().to_string())

print("\nOutput folder:", OUTPUT_DIR.resolve())
print("Player identity extraction completed.")