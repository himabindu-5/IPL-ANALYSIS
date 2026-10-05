
from pathlib import Path
import pandas as pd

folder = Path("data/processed")

matches = pd.read_csv(folder / "matches.csv")
deliveries = pd.read_csv(folder / "deliveries.csv")
players = pd.read_csv(folder / "players_raw.csv")

print("IPL EXTRACTION VALIDATION")
print("-------------------------")
print("Match rows:", len(matches))
print("Delivery rows:", len(deliveries))
print("Player name rows:", len(players))

print("\nAvailable seasons:")
print(sorted(matches["season"].dropna().unique().tolist()))

print("\nDuplicate match IDs:", matches["match_id"].duplicated().sum())

known_ids = set(matches["match_id"].dropna())
missing_match_links = (
    ~deliveries["match_id"].isin(known_ids)
).sum()

print("Deliveries without a matching match:", missing_match_links)

print("\nMissing match dates:", matches["date"].isna().sum())
print("Missing batter names:", deliveries["batter"].isna().sum())
print("Missing bowler names:", deliveries["bowler"].isna().sum())

print("\nFirst five matches:")
print(matches[["match_id", "date", "team1", "team2", "winner"]].head())

print("\nValidation check completed.")