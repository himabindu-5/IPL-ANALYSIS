
import json
from pathlib import Path

import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
JSON_DIR = BASE_DIR / "data" / "raw" / "ipl_json"
MATCHES_PATH = BASE_DIR / "data" / "cleaned" / "matches_clean.csv"

TARGET_NAME = "Harmeet Singh"

matches = pd.read_csv(
    MATCHES_PATH,
    dtype={"match_id": "string", "season": "string"}
)

match_lookup = matches.set_index("match_id").to_dict("index")

print("\nAMBIGUOUS PLAYER INVESTIGATION")
print("-" * 55)

for file_path in sorted(JSON_DIR.glob("*.json")):
    with file_path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    registry = data.get("info", {}).get("registry", {}).get("people", {})
    matching_ids = [
        (name, source_id)
        for name, source_id in registry.items()
        if name.strip().casefold() == TARGET_NAME.casefold()
    ]

    if not matching_ids:
        continue

    match_id = file_path.stem
    match_info = match_lookup.get(match_id, {})
    teams = data.get("info", {}).get("players", {})

    print(f"\nMatch ID: {match_id}")
    print("Date:", match_info.get("date"))
    print("Season:", match_info.get("season"))
    print("Teams:", match_info.get("team1"), "vs", match_info.get("team2"))
    print("Registry matches:", matching_ids)

    for team, names in teams.items():
        if TARGET_NAME in names:
            print("Listed in team:", team)

    for innings in data.get("innings", []):
        for over in innings.get("overs", []):
            for delivery in over.get("deliveries", []):
                names = [
                    delivery.get("batter"),
                    delivery.get("bowler"),
                    delivery.get("non_striker"),
                ]

                for wicket in delivery.get("wickets", []):
                    names.append(wicket.get("player_out"))

                if TARGET_NAME in names:
                    print("Appears in delivery data.")
                    break
            else:
                continue
            break