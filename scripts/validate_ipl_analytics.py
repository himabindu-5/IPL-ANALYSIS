
from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data" / "cleaned"

files = {
    "players": "player_master.csv",
    "aliases": "player_match_aliases.csv",
    "batting": "batting_stats.csv",
    "bowling": "bowling_stats.csv",
    "teams": "team_season_stats.csv",
    "unresolved": "unresolved_player_names.csv",
}

data = {}

for name, filename in files.items():
    path = DATA_DIR / filename

    if not path.exists():
        raise FileNotFoundError(f"Missing output file: {path}")

    data[name] = pd.read_csv(path)

players = data["players"]
aliases = data["aliases"]
batting = data["batting"]
bowling = data["bowling"]
teams = data["teams"]
unresolved = data["unresolved"]

print("\nIPL ANALYTICS VALIDATION")
print("-" * 45)

print("Player master rows:", len(players))
print("Unique player IDs:", players["player_id"].nunique())
print("Duplicate player IDs:", players["player_id"].duplicated().sum())

print("\nPlayer match aliases:", len(aliases))
print("Unique match-name-ID combinations:", len(aliases.drop_duplicates()))

print("\nBatting rows:", len(batting))
print("Bowling rows:", len(bowling))
print("Team-season rows:", len(teams))
print("Unresolved names:", len(unresolved))

if not batting.empty:
    print("\nBatting checks:")
    print("Negative runs:", int((batting["runs"] < 0).sum()))
    print("Negative balls faced:", int((batting["balls_faced"] < 0).sum()))
    print("Negative dismissals:", int((batting["dismissals"] < 0).sum()))
    print("Duplicate player-season rows:", int(
        batting.duplicated(["player_id", "season"]).sum()
    ))

if not bowling.empty:
    print("\nBowling checks:")
    print("Negative wickets:", int((bowling["wickets"] < 0).sum()))
    print("Negative legal balls:", int((bowling["legal_balls"] < 0).sum()))
    print("Duplicate player-season rows:", int(
        bowling.duplicated(["player_id", "season"]).sum()
    ))

if not teams.empty:
    print("\nTeam checks:")
    print("Negative match counts:", int((teams["matches"] < 0).sum()))
    print("Duplicate team-season rows:", int(
        teams.duplicated(["season", "team"]).sum()
    ))

print("\nTop 10 run scorers across all seasons:")
if not batting.empty:
    top_scorers = (
        batting.groupby(["player_id", "display_name"], as_index=False)
        .agg(
            runs=("runs", "sum"),
            seasons=("season", "nunique")
        )
        .sort_values("runs", ascending=False)
        .head(10)
    )
    print(top_scorers.to_string(index=False))

print("\nTop 10 wicket takers across all seasons:")
if not bowling.empty:
    top_wicket_takers = (
        bowling.groupby(["player_id", "display_name"], as_index=False)
        .agg(
            wickets=("wickets", "sum"),
            seasons=("season", "nunique")
        )
        .sort_values("wickets", ascending=False)
        .head(10)
    )
    print(top_wicket_takers.to_string(index=False))

print("\nValidation completed.")