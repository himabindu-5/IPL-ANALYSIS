
from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data" / "cleaned"

players = pd.read_csv(DATA_DIR / "player_master.csv")
aliases = pd.read_csv(DATA_DIR / "player_aliases.csv")
unresolved = pd.read_csv(DATA_DIR / "unresolved_player_names.csv")
errors = pd.read_csv(DATA_DIR / "player_extraction_errors.csv")

print("\nPLAYER MASTER VALIDATION")
print("-" * 40)

print("Player master rows:", len(players))
print("Unique player IDs:", players["player_id"].nunique())
print("Duplicate player IDs:", players["player_id"].duplicated().sum())
print("Missing player IDs:", players["player_id"].isna().sum())
print("Missing display names:", players["display_name"].isna().sum())

print("\nAlias mapping statuses:")
print(aliases["mapping_status"].value_counts().to_string())

print("\nUnresolved names:", len(unresolved))
print("JSON file errors:", len(errors))

if not unresolved.empty:
    print("\nFirst 15 unresolved names:")
    print(unresolved.head(15).to_string(index=False))

print("\nFirst 10 player master rows:")
print(players.head(10).to_string(index=False))

print("\nValidation completed.")