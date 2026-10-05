
import csv
import os
import sys
from pathlib import Path

import pg8000
from dotenv import load_dotenv

load_dotenv()

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "cleaned"

DB_CONFIG = {
    "host": os.getenv("PGHOST", "127.0.0.1"),
    "port": int(os.getenv("PGPORT", "5432")),
    "user": os.getenv("PGUSER", "postgres"),
    "password": os.getenv("PGPASSWORD"),
    "database": os.getenv("PGDATABASE", "ipl_analysis"),
}

def clean(value):
    if value is None:
        return None
    value = value.strip()
    return value if value else None

def read_csv(filename):
    path = DATA / filename
    if not path.exists():
        raise FileNotFoundError(f"CSV file not found: {path}")
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))

def as_int(value):
    value = clean(value)
    return int(value) if value is not None else None

def as_float(value):
    value = clean(value)
    return float(value) if value is not None else None

def insert_rows(cursor, table, columns, rows):
    if not rows:
        print(f"{table}: 0 rows")
        return 0

    names = ", ".join(columns)
    placeholders = ", ".join(["%s"] * len(columns))
    sql = f"INSERT INTO {table} ({names}) VALUES ({placeholders})"

    values = [
        tuple(row.get(column) for column in columns)
        for row in rows
    ]
    cursor.executemany(sql, values)
    print(f"{table}: imported {len(values):,} rows")
    return len(values)

def main():
    if not DB_CONFIG["password"]:
        raise RuntimeError(
            "PostgreSQL password is missing. Set PGPASSWORD in PowerShell first."
        )

    print("IPL ANALYSIS DATA IMPORT")
    print("=" * 40)
    print("Database:", DB_CONFIG["database"])

    conn = pg8000.connect(**DB_CONFIG)

    try:
        conn.autocommit = False
        cursor = conn.cursor()

        # Never add another copy to tables that already contain data.
        tables = [
            "players",
            "player_match_aliases",
            "matches",
            "deliveries",
            "batting_stats",
            "bowling_stats",
            "team_season_stats",
        ]

        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            if count:
                raise RuntimeError(
                    f"Table '{table}' already contains {count:,} rows. "
                    "Import cancelled to prevent duplicate data."
                )

        print("\nReading CSV files...")

        players_csv = read_csv("player_master.csv")
        aliases_csv = read_csv("player_match_aliases.csv")
        matches_csv = read_csv("matches_clean.csv")
        deliveries_csv = read_csv("deliveries_clean.csv")
        batting_csv = read_csv("batting_stats.csv")
        bowling_csv = read_csv("bowling_stats.csv")
        teams_csv = read_csv("team_season_stats.csv")

        print("All seven CSV files found.")
        print("\nImporting data...")

        # 1. Players must be imported before tables referencing player_id.
        players = []
        for r in players_csv:
            players.append({
                "player_id": clean(r["player_id"]),
                "display_name": clean(r["display_name"]),
                "alias_count": as_int(r["alias_count"]),
                "matches_seen": as_int(r["matches_seen"]),
                "registry_names": clean(r["registry_names"]),
            })

        insert_rows(
            cursor, "players",
            ["player_id", "display_name", "alias_count",
             "matches_seen", "registry_names"],
            players,
        )

        # 2. Match records.
        matches = []
        for r in matches_csv:
            runs = clean(r["result_runs"])
            wickets = clean(r["result_wickets"])
            margin = runs if runs is not None else wickets

            matches.append({
                "match_id": clean(r["match_id"]),
                "date": clean(r["date"]),
                "season": clean(r["season"]),
                "team1": clean(r["team1"]),
                "team2": clean(r["team2"]),
                "venue": clean(r["venue"]),
                "city": clean(r["city"]),
                "toss_winner": clean(r["toss_winner"]),
                "toss_decision": clean(r["toss_decision"]),
                "winner": clean(r["winner"]),
                "result": clean(r["result_type"]),
                "result_margin": as_float(margin),
                "method": clean(r["result_method"]),
                "player_of_match": clean(r["player_of_match"]),
            })

        insert_rows(
            cursor, "matches",
            ["match_id", "date", "season", "team1", "team2",
             "venue", "city", "toss_winner", "toss_decision",
             "winner", "result", "result_margin", "method",
             "player_of_match"],
            matches,
        )

        # 3. Player names associated with matches.
        aliases = []
        for r in aliases_csv:
            aliases.append({
                "match_id": clean(r["match_id"]),
                "player_name": clean(r["player_name"]),
                "player_id": clean(r["player_id"]),
            })

        insert_rows(
            cursor, "player_match_aliases",
            ["match_id", "player_name", "player_id"],
            aliases,
        )

        # 4. Ball-by-ball delivery records.
        deliveries = []
        for r in deliveries_csv:
            deliveries.append({
                "match_id": clean(r["match_id"]),
                "innings_no": as_int(r["innings_no"]),
                "batting_team": clean(r["batting_team"]),
                "over_number": as_int(r["over_number"]),
                "delivery_position": as_int(r["delivery_position"]),
                "batter": clean(r["batter"]),
                "bowler": clean(r["bowler"]),
                "non_striker": clean(r["non_striker"]),
                "batter_runs": as_int(r["batter_runs"]),
                "extra_runs": as_int(r["extra_runs"]),
                "total_runs": as_int(r["total_runs"]),
                "extras_json": clean(r["extras_json"]),
                "wickets_json": clean(r["wickets_json"]),
            })

        insert_rows(
            cursor, "deliveries",
            ["match_id", "innings_no", "batting_team", "over_number",
             "delivery_position", "batter", "bowler", "non_striker",
             "batter_runs", "extra_runs", "total_runs",
             "extras_json", "wickets_json"],
            deliveries,
        )

        # 5. Batting statistics.
        batting = []
        for r in batting_csv:
            batting.append({
                "player_id": clean(r["player_id"]),
                "display_name": clean(r["display_name"]),
                "season": clean(r["season"]),
                "matches": as_int(r["matches"]),
                "innings": as_int(r["innings"]),
                "runs": as_int(r["runs"]),
                "balls_faced": as_int(r["balls_faced"]),
                "fours": as_int(r["fours"]),
                "sixes": as_int(r["sixes"]),
                "dismissals": as_int(r["dismissals"]),
                "not_outs": as_int(r["not_outs"]),
                "fifties": as_int(r["fifties"]),
                "hundreds": as_int(r["hundreds"]),
                "batting_average": as_float(r["batting_average"]),
                "strike_rate": as_float(r["strike_rate"]),
            })

        insert_rows(
            cursor, "batting_stats",
            ["player_id", "display_name", "season", "matches", "innings",
             "runs", "balls_faced", "fours", "sixes", "dismissals",
             "not_outs", "fifties", "hundreds", "batting_average",
             "strike_rate"],
            batting,
        )

        # 6. Bowling statistics.
        bowling = []
        for r in bowling_csv:
            bowling.append({
                "player_id": clean(r["player_id"]),
                "display_name": clean(r["display_name"]),
                "season": clean(r["season"]),
                "matches": as_int(r["matches"]),
                "innings": as_int(r["innings"]),
                "legal_balls": as_int(r["legal_balls"]),
                "overs": as_float(r["overs"]),
                "runs_conceded": as_int(r["runs_conceded"]),
                "wickets": as_int(r["wickets"]),
                "economy": as_float(r["economy"]),
                "bowling_average": as_float(r["bowling_average"]),
                "bowling_strike_rate": as_float(r["bowling_strike_rate"]),
            })

        insert_rows(
            cursor, "bowling_stats",
            ["player_id", "display_name", "season", "matches", "innings",
             "legal_balls", "overs", "runs_conceded", "wickets",
             "economy", "bowling_average", "bowling_strike_rate"],
            bowling,
        )

        # 7. Team statistics by season.
        teams = []
        for r in teams_csv:
            teams.append({
                "season": clean(r["season"]),
                "team": clean(r["team"]),
                "matches": as_int(r["matches"]),
                "wins": as_int(r["wins"]),
                "losses": as_int(r["losses"]),
                "no_result_or_tie": as_int(r["no_result_or_tie"]),
                "runs_for": as_int(r["runs_for"]),
                "runs_against": as_int(r["runs_against"]),
            })

        insert_rows(
            cursor, "team_season_stats",
            ["season", "team", "matches", "wins", "losses",
             "no_result_or_tie", "runs_for", "runs_against"],
            teams,
        )

        conn.commit()
        print("\nSUCCESS: All seven datasets imported.")

        print("\nFinal database row counts:")
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            print(f"{table}: {cursor.fetchone()[0]:,}")

    except Exception:
        conn.rollback()
        print("\nIMPORT FAILED. The current import transaction was rolled back.")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"\nERROR: {exc}")
        sys.exit(1)