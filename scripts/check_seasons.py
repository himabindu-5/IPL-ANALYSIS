
from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent

files = [
    BASE_DIR / "data" / "processed" / "matches.csv",
    BASE_DIR / "data" / "cleaned" / "matches_clean.csv",
]

for file_path in files:
    print("\n" + "=" * 60)
    print("FILE:", file_path.name)
    print("=" * 60)

    if not file_path.exists():
        print("File not found:", file_path)
        continue

    df = pd.read_csv(file_path, dtype={"season": "string"})

    print("\nColumns:", df.columns.tolist())

    if "season" not in df.columns:
        print("The season column does not exist!")
        continue

    season = df["season"].str.strip()

    print("\nTotal matches:", len(df))
    print("Missing seasons:", season.isna().sum())
    print("\nSeason values and counts:")
    print(season.value_counts(dropna=False).to_string())

    print("\nFirst 10 rows:")
    columns = [
        c for c in ["match_id", "date", "season", "team1", "team2"]
        if c in df.columns
    ]
    print(df[columns].head(10).to_string(index=False))