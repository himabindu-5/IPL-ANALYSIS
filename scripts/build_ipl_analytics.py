
import json
from pathlib import Path
from collections import defaultdict

import pandas as pd

# ==================================================
# 1. PATHS AND SETTINGS
# ==================================================

BASE_DIR = Path(__file__).resolve().parent.parent
JSON_DIR = BASE_DIR / "data" / "raw" / "ipl_json"
DATA_DIR = BASE_DIR / "data" / "cleaned"

DATA_DIR.mkdir(parents=True, exist_ok=True)

matches = pd.read_csv(
    DATA_DIR / "matches_clean.csv",
    dtype={"match_id": "string", "season": "string"}
)

match_info = {
    str(row["match_id"]): row.to_dict()
    for _, row in matches.iterrows()
}

# Standard dismissal types credited to the bowler.
BOWLER_WICKETS = {
    "bowled",
    "caught",
    "caught and bowled",
    "lbw",
    "stumped",
    "hit wicket",
}

# ==================================================
# 2. STORAGE
# ==================================================

player_names = defaultdict(lambda: defaultdict(int))
player_matches = defaultdict(set)

match_aliases = set()
unresolved = []

batting_innings = {}
bowling_innings = {}

team_scores = defaultdict(int)
match_teams = {}

json_files = sorted(JSON_DIR.glob("*.json"))
file_errors = []

# ==================================================
# 3. PROCESS EACH MATCH
# ==================================================

for file_path in json_files:
    match_id = file_path.stem

    if match_id not in match_info:
        unresolved.append({
            "match_id": match_id,
            "player_name": "",
            "reason": "Match missing from cleaned match data",
        })
        continue

    try:
        with file_path.open("r", encoding="utf-8") as file:
            data = json.load(file)
    except (OSError, json.JSONDecodeError) as error:
        file_errors.append({
            "file": file_path.name,
            "error": str(error),
        })
        continue

    info = data.get("info", {})
    season = str(match_info[match_id]["season"]).strip()

    registry = info.get("registry", {}).get("people", {})
    name_to_id = {
        str(name).strip(): str(source_id).strip()
        for name, source_id in registry.items()
        if name and source_id
    }

    # Names appearing in lineups and delivery records.
    participants = set()

    for team_names in info.get("players", {}).values():
        if isinstance(team_names, list):
            participants.update(
                str(name).strip()
                for name in team_names
                if name
            )

    for innings in data.get("innings", []):
        for over in innings.get("overs", []):
            for delivery in over.get("deliveries", []):
                for role in ["batter", "bowler", "non_striker"]:
                    if delivery.get(role):
                        participants.add(
                            str(delivery[role]).strip()
                        )

                for wicket in delivery.get("wickets", []):
                    if wicket.get("player_out"):
                        participants.add(
                            str(wicket["player_out"]).strip()
                        )

    # Resolve identities within this match, not globally by name.
    for name in participants:
        source_id = name_to_id.get(name)

        if not source_id:
            unresolved.append({
                "match_id": match_id,
                "player_name": name,
                "reason": "No registry ID in this match",
            })
            continue

        match_aliases.add((match_id, name, source_id))
        player_names[source_id][name] += 1
        player_matches[source_id].add(match_id)

    team1 = match_info[match_id].get("team1")
    team2 = match_info[match_id].get("team2")
    winner = match_info[match_id].get("winner")

    match_teams[match_id] = {
        "season": season,
        "team1": team1,
        "team2": team2,
        "winner": winner,
        "result_type": match_info[match_id].get("result_type"),
    }

    # ==================================================
    # 4. PROCESS INNINGS AND DELIVERIES
    # ==================================================

    for innings_number, innings in enumerate(
        data.get("innings", []), start=1
    ):
        innings_team = innings.get("team")
        is_super_over = bool(innings.get("super_over", False))

        innings_batters = set()
        innings_bowlers = set()

        for over in innings.get("overs", []):
            for delivery in over.get("deliveries", []):
                batter_name = str(delivery.get("batter", "")).strip()
                bowler_name = str(delivery.get("bowler", "")).strip()
                non_striker_name = str(
                    delivery.get("non_striker", "")
                ).strip()

                batter_id = name_to_id.get(batter_name)
                bowler_id = name_to_id.get(bowler_name)
                non_striker_id = name_to_id.get(non_striker_name)

                runs = delivery.get("runs", {})
                batter_runs = int(runs.get("batter", 0))
                total_runs = int(runs.get("total", 0))

                extras = delivery.get("extras", {})
                wides = int(extras.get("wides", 0))
                no_balls = int(extras.get("noballs", 0))

                # Team totals exclude super-over runs.
                if not is_super_over and innings_team:
                    team_scores[
                        (match_id, innings_team)
                    ] += total_runs

                # Batting innings: the striker and non-striker
                # are both participating in this innings.
                for player_id in [batter_id, non_striker_id]:
                    if not player_id:
                        continue

                    key = (
                        player_id, season, match_id, innings_number
                    )

                    batting_innings.setdefault(key, {
                        "player_id": player_id,
                        "season": season,
                        "match_id": match_id,
                        "runs": 0,
                        "balls_faced": 0,
                        "fours": 0,
                        "sixes": 0,
                        "dismissed": False,
                    })

                    innings_batters.add(player_id)

                if batter_id:
                    key = (
                        batter_id, season, match_id, innings_number
                    )
                    stats = batting_innings[key]

                    stats["runs"] += batter_runs

                    # A wide is not a ball faced.
                    # A no-ball is counted as a ball faced here.
                    if wides == 0:
                        stats["balls_faced"] += 1

                    non_boundary = bool(
                        delivery.get("non_boundary", False)
                    )

                    if batter_runs == 4 and not non_boundary:
                        stats["fours"] += 1

                    if batter_runs == 6 and not non_boundary:
                        stats["sixes"] += 1

                # Bowling figures.
                if bowler_id:
                    key = (
                        bowler_id, season, match_id, innings_number
                    )

                    bowling_innings.setdefault(key, {
                        "player_id": bowler_id,
                        "season": season,
                        "match_id": match_id,
                        "legal_balls": 0,
                        "runs_conceded": 0,
                        "wickets": 0,
                    })

                    bowling = bowling_innings[key]
                    innings_bowlers.add(bowler_id)

                    # Bowler-conceded runs include batter runs,
                    # wides and no-balls, not byes or leg-byes.
                    bowling["runs_conceded"] += (
                        batter_runs + wides + no_balls
                    )

                    # Wides and no-balls are not legal balls.
                    if wides == 0 and no_balls == 0:
                        bowling["legal_balls"] += 1

                # Record dismissals and bowler-creditable wickets.
                for wicket in delivery.get("wickets", []):
                    dismissed_name = str(
                        wicket.get("player_out", "")
                    ).strip()
                    dismissed_id = name_to_id.get(dismissed_name)

                    if dismissed_id:
                        key = (
                            dismissed_id, season, match_id,
                            innings_number
                        )

                        batting_innings.setdefault(key, {
                            "player_id": dismissed_id,
                            "season": season,
                            "match_id": match_id,
                            "runs": 0,
                            "balls_faced": 0,
                            "fours": 0,
                            "sixes": 0,
                            "dismissed": False,
                        })

                        batting_innings[key]["dismissed"] = True
                        innings_batters.add(dismissed_id)

                    kind = str(wicket.get("kind", "")).lower().strip()

                    if bowler_id and kind in BOWLER_WICKETS:
                        key = (
                            bowler_id, season, match_id, innings_number
                        )
                        bowling_innings[key]["wickets"] += 1

# ==================================================
# 5. BUILD PLAYER MASTER AND MATCH ALIASES
# ==================================================

master_rows = []

for player_id, names in player_names.items():
    display_name = sorted(
        names,
        key=lambda name: (-names[name], name)
    )[0]

    master_rows.append({
        "player_id": player_id,
        "display_name": display_name,
        "alias_count": len(names),
        "matches_seen": len(player_matches[player_id]),
        "registry_names": "; ".join(sorted(names)),
    })

master = pd.DataFrame(
    master_rows,
    columns=[
        "player_id", "display_name", "alias_count",
        "matches_seen", "registry_names"
    ]
).sort_values("display_name")

aliases = pd.DataFrame(
    sorted(match_aliases),
    columns=["match_id", "player_name", "player_id"]
)

unresolved_df = pd.DataFrame(
    unresolved,
    columns=["match_id", "player_name", "reason"]
).drop_duplicates()

master.to_csv(DATA_DIR / "player_master.csv", index=False)
aliases.to_csv(DATA_DIR / "player_match_aliases.csv", index=False)
unresolved_df.to_csv(
    DATA_DIR / "unresolved_player_names.csv", index=False
)

# ==================================================
# 6. CALCULATE BATTING STATISTICS
# ==================================================

batting_df = pd.DataFrame(list(batting_innings.values()))

if batting_df.empty:
    batting_stats = pd.DataFrame()
else:
    batting_stats = (
        batting_df.groupby(["player_id", "season"], as_index=False)
        .agg(
            matches=("match_id", "nunique"),
            innings=("match_id", "size"),
            runs=("runs", "sum"),
            balls_faced=("balls_faced", "sum"),
            fours=("fours", "sum"),
            sixes=("sixes", "sum"),
            dismissals=("dismissed", "sum"),
            fifties=("runs", lambda s: ((s >= 50) & (s < 100)).sum()),
            hundreds=("runs", lambda s: (s >= 100).sum()),
        )
    )

    batting_df["fifty_flag"] = (
        (batting_df["runs"] >= 50) & (batting_df["runs"] < 100)
    )
    batting_df["hundred_flag"] = batting_df["runs"] >= 100

    milestones = (
        batting_df.groupby(["player_id", "season"], as_index=False)
        .agg(
            fifties=("fifty_flag", "sum"),
            hundreds=("hundred_flag", "sum"),
        )
    )

    batting_stats = batting_stats.drop(
        columns=["fifties", "hundreds"]
    ).merge(
        milestones,
        on=["player_id", "season"],
        how="left"
    )

    batting_stats["not_outs"] = (
        batting_stats["innings"] - batting_stats["dismissals"]
    )

    batting_stats["batting_average"] = (
        batting_stats["runs"]
        / batting_stats["dismissals"].replace(0, float("nan"))
    )

    batting_stats["strike_rate"] = (
        100 * batting_stats["runs"]
        / batting_stats["balls_faced"].replace(0, float("nan"))
    )

    batting_stats = batting_stats.merge(
        master[["player_id", "display_name"]],
        on="player_id",
        how="left"
    )

    batting_stats = batting_stats[
        [
            "player_id", "display_name", "season", "matches",
            "innings", "runs", "balls_faced", "fours", "sixes",
            "dismissals", "not_outs", "fifties", "hundreds",
            "batting_average", "strike_rate"
        ]
    ]

batting_stats.to_csv(DATA_DIR / "batting_stats.csv", index=False)

# ==================================================
# 7. CALCULATE BOWLING STATISTICS
# ==================================================

bowling_df = pd.DataFrame(list(bowling_innings.values()))

if bowling_df.empty:
    bowling_stats = pd.DataFrame()
else:
    bowling_stats = (
        bowling_df.groupby(["player_id", "season"], as_index=False)
        .agg(
            matches=("match_id", "nunique"),
            innings=("match_id", "size"),
            legal_balls=("legal_balls", "sum"),
            runs_conceded=("runs_conceded", "sum"),
            wickets=("wickets", "sum"),
        )
    )

    bowling_stats["overs"] = (
        bowling_stats["legal_balls"] // 6
    ).astype(str) + "." + (
        bowling_stats["legal_balls"] % 6
    ).astype(str)

    bowling_stats["economy"] = (
        bowling_stats["runs_conceded"] * 6
        / bowling_stats["legal_balls"].replace(0, float("nan"))
    )

    bowling_stats["bowling_average"] = (
        bowling_stats["runs_conceded"]
        / bowling_stats["wickets"].replace(0, float("nan"))
    )

    bowling_stats["bowling_strike_rate"] = (
        bowling_stats["legal_balls"]
        / bowling_stats["wickets"].replace(0, float("nan"))
    )

    bowling_stats = bowling_stats.merge(
        master[["player_id", "display_name"]],
        on="player_id",
        how="left"
    )

    bowling_stats = bowling_stats[
        [
            "player_id", "display_name", "season", "matches",
            "innings", "legal_balls", "overs", "runs_conceded",
            "wickets", "economy", "bowling_average",
            "bowling_strike_rate"
        ]
    ]

bowling_stats.to_csv(DATA_DIR / "bowling_stats.csv", index=False)

# ==================================================
# 8. CALCULATE TEAM PERFORMANCE BY SEASON
# ==================================================

team_rows = []

for match_id, details in match_teams.items():
    season = details["season"]
    team1 = details["team1"]
    team2 = details["team2"]
    winner = details["winner"]

    for team, opponent in [(team1, team2), (team2, team1)]:
        if pd.isna(team) or not team:
            continue

        runs_for = team_scores.get((match_id, team), 0)
        runs_against = team_scores.get((match_id, opponent), 0)

        has_winner = (
            pd.notna(winner)
            and winner in [team1, team2]
        )

        team_rows.append({
            "season": season,
            "team": team,
            "match_id": match_id,
            "matches": 1,
            "wins": int(has_winner and winner == team),
            "losses": int(has_winner and winner != team),
            "no_result_or_tie": int(not has_winner),
            "runs_for": runs_for,
            "runs_against": runs_against,
        })

team_df = pd.DataFrame(team_rows)

if team_df.empty:
    team_stats = pd.DataFrame()
else:
    team_stats = (
        team_df.groupby(["season", "team"], as_index=False)
        .agg(
            matches=("matches", "sum"),
            wins=("wins", "sum"),
            losses=("losses", "sum"),
            no_result_or_tie=("no_result_or_tie", "sum"),
            runs_for=("runs_for", "sum"),
            runs_against=("runs_against", "sum"),
        )
    )

team_stats.to_csv(DATA_DIR / "team_season_stats.csv", index=False)

# ==================================================
# 9. PRINT SUMMARY
# ==================================================

print("\nIPL ANALYTICS BUILD COMPLETE")
print("-" * 45)
print("JSON files found:", len(json_files))
print("JSON read errors:", len(file_errors))
print("Player IDs:", len(master))
print("Match-specific aliases:", len(aliases))
print("Unresolved name records:", len(unresolved_df))
print("Batting statistic rows:", len(batting_stats))
print("Bowling statistic rows:", len(bowling_stats))
print("Team-season rows:", len(team_stats))

print("\nFiles saved in:", DATA_DIR.resolve())

if file_errors:
    pd.DataFrame(file_errors).to_csv(
        DATA_DIR / "analytics_file_errors.csv", index=False
    )
    print("Some JSON files could not be processed.")
else:
    print("All JSON files were read successfully.")