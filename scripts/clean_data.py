

from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
INPUT_DIR = BASE_DIR / "data" / "processed"
OUTPUT_DIR = BASE_DIR / "data" / "cleaned"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

matches = pd.read_csv(
    INPUT_DIR / "matches.csv",
    dtype={
        "match_id": "string",
        "season": "string"
    }
)

# Diagnostic check: confirm seasons are preserved on input.
print("\nSeason check immediately after reading matches.csv:")
print(matches["season"].value_counts(dropna=False).to_string())

deliveries = pd.read_csv(
    INPUT_DIR / "deliveries.csv",
    dtype={"match_id": "string"}
)

players = pd.read_csv(
    INPUT_DIR / "players_raw.csv",
    dtype={"source_player_id": "string"}
)

issues = []


def record_issue(issue_type, row_index, match_id, details):
    issues.append({
        "issue_type": issue_type,
        "row_index": row_index,
        "match_id": match_id,
        "details": details
    })


# 1. Clean text fields without changing historical names.
match_text_columns = [
    "event_name", "match_type", "venue", "city",
    "team1", "team2", "toss_winner", "toss_decision",
    "winner", "result_method", "result_type",
    "player_of_match"
]

for column in match_text_columns:
    if column in matches.columns:
        matches[column] = (
            matches[column]
            .astype("string")
            .str.strip()
            .replace("", pd.NA)
        )

delivery_text_columns = [
    "batting_team", "batter", "bowler", "non_striker"
]

for column in delivery_text_columns:
    if column in deliveries.columns:
        deliveries[column] = (
            deliveries[column]
            .astype("string")
            .str.strip()
            .replace("", pd.NA)
        )

players["player_name"] = (
    players["player_name"]
    .astype("string")
    .str.strip()
    .replace("", pd.NA)
)

# 2. Convert dates and numeric columns.
matches["date"] = pd.to_datetime(
    matches["date"], errors="coerce"
)

# Preserve IPL season labels such as 2007/08.
matches["season"] = (
    matches["season"]
    .astype("string")
    .str.strip()
)

# Convert only fields that should contain numbers.
for column in [
    "match_number", "balls_per_over", "scheduled_overs"
]:
    matches[column] = pd.to_numeric(
        matches[column], errors="coerce"
    )
for column in [
    "innings_no", "over_number", "delivery_position",
    "batter_runs", "extra_runs", "total_runs"
]:
    deliveries[column] = pd.to_numeric(
        deliveries[column], errors="coerce"
    )

# 3. Check duplicate match IDs.
duplicate_match_mask = matches["match_id"].duplicated(
    keep=False
)

for idx in matches.index[duplicate_match_mask]:
    record_issue(
        "duplicate_match_id",
        idx,
        matches.at[idx, "match_id"],
        "Review repeated match ID."
    )

# 4. Check missing dates and match IDs.
for idx in matches.index[matches["date"].isna()]:
    record_issue(
        "missing_or_invalid_date",
        idx,
        matches.at[idx, "match_id"],
        "Date is missing or could not be parsed."
    )

for idx in matches.index[matches["match_id"].isna()]:
    record_issue(
        "missing_match_id",
        idx,
        None,
        "Match ID is missing."
    )

# 5. Check deliveries that reference unknown matches.
known_match_ids = set(matches["match_id"].dropna())

orphan_mask = ~deliveries["match_id"].isin(known_match_ids)

for idx in deliveries.index[orphan_mask]:
    record_issue(
        "unknown_match_reference",
        idx,
        deliveries.at[idx, "match_id"],
        "Delivery does not reference a known match."
    )

# 6. Check required delivery fields.
for column in ["batter", "bowler"]:
    missing_mask = deliveries[column].isna()

    for idx in deliveries.index[missing_mask]:
        record_issue(
            f"missing_{column}",
            idx,
            deliveries.at[idx, "match_id"],
            f"{column} is missing."
        )

# 7. Check run totals.
# This should hold for the extracted Cricsheet delivery fields.
calculated_total = (
    deliveries["batter_runs"] + deliveries["extra_runs"]
)

totals_mask = (
    deliveries["total_runs"].notna()
    & calculated_total.notna()
    & (deliveries["total_runs"] != calculated_total)
)

for idx in deliveries.index[totals_mask]:
    record_issue(
        "run_total_mismatch",
        idx,
        deliveries.at[idx, "match_id"],
        "Total runs differ from batter runs plus extras."
    )

# 8. Flag missing or negative run values.
run_columns = ["batter_runs", "extra_runs", "total_runs"]

for column in run_columns:
    missing_mask = deliveries[column].isna()

    for idx in deliveries.index[missing_mask]:
        record_issue(
            f"missing_{column}",
            idx,
            deliveries.at[idx, "match_id"],
            f"{column} is missing or not numeric."
        )

    negative_mask = deliveries[column] < 0

    for idx in deliveries.index[negative_mask]:
        record_issue(
            f"negative_{column}",
            idx,
            deliveries.at[idx, "match_id"],
            f"{column} is negative; investigate source."
        )

# 9. Check exact duplicate rows, but do not delete them.
duplicate_delivery_mask = deliveries.duplicated(keep=False)

for idx in deliveries.index[duplicate_delivery_mask]:
    record_issue(
        "exact_duplicate_delivery_row",
        idx,
        deliveries.at[idx, "match_id"],
        "Identical row exists; review before taking action."
    )

# 10. Save cleaned copies. All source rows are preserved.
matches.to_csv(
    OUTPUT_DIR / "matches_clean.csv",
    index=False,
    encoding="utf-8-sig"
)

deliveries.to_csv(
    OUTPUT_DIR / "deliveries_clean.csv",
    index=False,
    encoding="utf-8-sig"
)

players.to_csv(
    OUTPUT_DIR / "players_raw_clean.csv",
    index=False,
    encoding="utf-8-sig"
)

issues_df = pd.DataFrame(
    issues,
    columns=["issue_type", "row_index", "match_id", "details"]
)

issues_df.to_csv(
    OUTPUT_DIR / "quality_issues.csv",
    index=False,
    encoding="utf-8-sig"
)

# 11. Print a summary.
print("Matches:", len(matches))
print("Deliveries:", len(deliveries))
print("Player name entries:", len(players))
print("Duplicate match ID rows:", int(duplicate_match_mask.sum()))
print("Unknown match references:", int(orphan_mask.sum()))
print("Run total mismatches:", int(totals_mask.sum()))
print("Exact duplicate delivery rows:", int(duplicate_delivery_mask.sum()))
print("Issues recorded:", len(issues_df))

print("\nFiles saved in:", OUTPUT_DIR.resolve())
print("Cleaning pass completed.")