
import json
from pathlib import Path

import pandas as pd

# Input and output folders
RAW_DIR = Path("data/raw/ipl_json")
OUTPUT_DIR = Path("data/processed")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

matches = []
deliveries = []
player_records = {}

json_files = sorted(RAW_DIR.rglob("*.json"))

if not json_files:
    raise FileNotFoundError(
        f"No JSON files found inside: {RAW_DIR.resolve()}"
    )

print("Starting IPL data extraction...")
print("JSON files found:", len(json_files))

for index, file_path in enumerate(json_files, start=1):
    try:
        with file_path.open("r", encoding="utf-8") as file:
            data = json.load(file)

        info = data.get("info", {})
        match_id = file_path.stem

        teams = info.get("teams", [])
        dates = info.get("dates", [])
        outcome = info.get("outcome", {})
        toss = info.get("toss", {})
        event = info.get("event", {})

        # Extract match-level information
        matches.append({
            "match_id": match_id,
            "date": dates[0] if dates else None,
            "season": info.get("season"),
            "event_name": event.get("name"),
            "match_number": event.get("match_number"),
            "match_type": info.get("match_type"),
            "venue": info.get("venue"),
            "city": info.get("city"),
            "team1": teams[0] if len(teams) > 0 else None,
            "team2": teams[1] if len(teams) > 1 else None,
            "toss_winner": toss.get("winner"),
            "toss_decision": toss.get("decision"),
            "winner": outcome.get("winner"),
            "result_runs": outcome.get("by", {}).get("runs"),
            "result_wickets": outcome.get("by", {}).get("wickets"),
            "result_method": outcome.get("method"),
            "result_type": outcome.get("result"),
            "player_of_match": "; ".join(
                info.get("player_of_match", [])
            ),
            "balls_per_over": info.get("balls_per_over"),
            "scheduled_overs": info.get("overs")
        })

        # Collect player names and source registry IDs
        registry = info.get("registry", {}).get("people", {})

        def add_player(name):
            if not name:
                return

            source_id = registry.get(name)

            if name not in player_records:
                player_records[name] = {
                    "player_name": name,
                    "source_player_id": source_id
                }
            elif (
                not player_records[name]["source_player_id"]
                and source_id
            ):
                player_records[name]["source_player_id"] = source_id

        # Match squad lists
        for team_players in info.get("players", {}).values():
            for name in team_players:
                add_player(name)

        # Players involved in recorded deliveries
        for innings in data.get("innings", []):
            for over_data in innings.get("overs", []):
                for delivery in over_data.get("deliveries", []):
                    add_player(delivery.get("batter"))
                    add_player(delivery.get("bowler"))
                    add_player(delivery.get("non_striker"))

                    for wicket in delivery.get("wickets", []):
                        add_player(wicket.get("player_out"))

                        for fielder in wicket.get("fielders", []):
                            if isinstance(fielder, dict):
                                add_player(fielder.get("name"))
                            elif isinstance(fielder, str):
                                add_player(fielder)

        # Extract delivery-level information
        for innings_no, innings in enumerate(
            data.get("innings", []), start=1
        ):
            batting_team = innings.get("team")

            for over_data in innings.get("overs", []):
                over_number = over_data.get("over")

                for position, delivery in enumerate(
                    over_data.get("deliveries", []), start=1
                ):
                    runs = delivery.get("runs", {})
                    extras = delivery.get("extras", {})
                    wickets = delivery.get("wickets", [])

                    deliveries.append({
                        "match_id": match_id,
                        "innings_no": innings_no,
                        "batting_team": batting_team,
                        "over_number": over_number,
                        "delivery_position": position,
                        "batter": delivery.get("batter"),
                        "bowler": delivery.get("bowler"),
                        "non_striker": delivery.get("non_striker"),
                        "batter_runs": runs.get("batter", 0),
                        "extra_runs": runs.get("extras", 0),
                        "total_runs": runs.get("total", 0),
                        "extras_json": json.dumps(extras),
                        "wickets_json": json.dumps(wickets)
                    })

    except (json.JSONDecodeError, OSError, ValueError) as error:
        print(f"ERROR in {file_path.name}: {error}")

    if index % 100 == 0:
        print(f"Processed {index}/{len(json_files)} files")

# Save the extracted tables
pd.DataFrame(matches).to_csv(
    OUTPUT_DIR / "matches.csv",
    index=False,
    encoding="utf-8-sig"
)

pd.DataFrame(deliveries).to_csv(
    OUTPUT_DIR / "deliveries.csv",
    index=False,
    encoding="utf-8-sig"
)

pd.DataFrame(list(player_records.values())).to_csv(
    OUTPUT_DIR / "players_raw.csv",
    index=False,
    encoding="utf-8-sig"
)

print("\nEXTRACTION COMPLETED")
print("-------------------------")
print("Matches extracted:", len(matches))
print("Delivery records extracted:", len(deliveries))
print("Unique player names:", len(player_records))
print("Output folder:", OUTPUT_DIR.resolve())