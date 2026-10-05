
from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data" / "cleaned"

path = DATA_DIR / "deliveries_clean.csv"
deliveries = pd.read_csv(path, nrows=5)

print("\nDELIVERY DATA COLUMNS")
print("-" * 40)

for column in deliveries.columns:
    print(f"{column}: {deliveries[column].dtype}")

print("\nSAMPLE DELIVERY ROWS")
print(deliveries.head(5).to_string(index=False))

print("\nMATCH DATA COLUMNS")
matches = pd.read_csv(DATA_DIR / "matches_clean.csv", nrows=3)
print(matches.columns.tolist())