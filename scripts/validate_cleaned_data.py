
from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
CLEANED_DIR = BASE_DIR / "data" / "cleaned"

matches_path = CLEANED_DIR / "matches_clean.csv"
deliveries_path = CLEANED_DIR / "deliveries_clean.csv"
issues_path = CLEANED_DIR / "quality_issues.csv"

required_files = [
    matches_path,
    deliveries_path,
    issues_path,
]

for file_path in required_files:
    if not file_path.exists():
        raise FileNotFoundError(
            f"Missing file: {file_path}\n"
            "Run scripts/clean_data.py first."
        )

matches = pd.read_csv(matches_path)
deliveries = pd.read_csv(deliveries_path)
issues = pd.read_csv(issues_path)

print("\n--- CLEANED DATA VALIDATION ---")
print(f"Matches: {len(matches)}")
print(f"Deliveries: {len(deliveries)}")

print("\n--- SEASONS ---")
print(sorted(matches["season"].dropna().astype(str).unique()))

print("\n--- MATCH ID CHECK ---")
print(
    "Duplicate match IDs:",
    matches["match_id"].duplicated().sum()
)

match_ids = set(matches["match_id"].dropna())
delivery_match_ids = set(deliveries["match_id"].dropna())

print(
    "Deliveries with unknown match IDs:",
    len(delivery_match_ids - match_ids)
)

print("\n--- MISSING VALUES ---")
for column in ["date", "season", "team1", "team2"]:
    if column in matches.columns:
        print(
            f"Matches missing {column}:",
            matches[column].isna().sum()
        )

for column in ["batter", "bowler", "match_id"]:
    if column in deliveries.columns:
        print(
            f"Deliveries missing {column}:",
            deliveries[column].isna().sum()
        )

print("\n--- QUALITY ISSUES ---")
if issues.empty:
    print("No quality issues were recorded.")
elif "issue_type" in issues.columns:
    print(issues["issue_type"].value_counts().to_string())
else:
    print(issues.head(10).to_string(index=False))

print("\nValidation finished.")