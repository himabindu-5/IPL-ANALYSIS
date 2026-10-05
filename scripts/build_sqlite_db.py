import sqlite3
import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data" / "cleaned"
DB_PATH = ROOT / "database" / "ipl_analysis.db"

def clean(val):
    if val is None:
        return None
    val = str(val).strip()
    return val if val != "" else None

def as_int(val):
    v = clean(val)
    if v is None:
        return None
    try:
        return int(float(v))
    except ValueError:
        return None

def as_float(val):
    v = clean(val)
    if v is None:
        return None
    try:
        return float(v)
    except ValueError:
        return None

def build_sqlite():
    print("Building local SQLite database from cleaned CSV files...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create tables
    cursor.executescript("""
        DROP TABLE IF EXISTS players;
        CREATE TABLE players (
            player_id TEXT PRIMARY KEY,
            display_name TEXT NOT NULL,
            alias_count INTEGER,
            matches_seen INTEGER,
            registry_names TEXT
        );

        DROP TABLE IF EXISTS player_match_aliases;
        CREATE TABLE player_match_aliases (
            match_id TEXT NOT NULL,
            player_name TEXT NOT NULL,
            player_id TEXT NOT NULL,
            PRIMARY KEY (match_id, player_name, player_id),
            FOREIGN KEY (player_id) REFERENCES players(player_id)
        );

        DROP TABLE IF EXISTS matches;
        CREATE TABLE matches (
            match_id TEXT PRIMARY KEY,
            date TEXT,
            season TEXT,
            team1 TEXT,
            team2 TEXT,
            venue TEXT,
            city TEXT,
            toss_winner TEXT,
            toss_decision TEXT,
            winner TEXT,
            result TEXT,
            result_margin REAL,
            method TEXT,
            player_of_match TEXT
        );

        DROP TABLE IF EXISTS deliveries;
        CREATE TABLE deliveries (
            match_id TEXT NOT NULL,
            innings_no INTEGER NOT NULL,
            batting_team TEXT,
            over_number INTEGER,
            delivery_position INTEGER,
            batter TEXT,
            bowler TEXT,
            non_striker TEXT,
            batter_runs INTEGER,
            extra_runs INTEGER,
            total_runs INTEGER,
            extras_json TEXT,
            wickets_json TEXT
        );

        DROP TABLE IF EXISTS batting_stats;
        CREATE TABLE batting_stats (
            player_id TEXT NOT NULL,
            display_name TEXT,
            season TEXT NOT NULL,
            matches INTEGER,
            innings INTEGER,
            runs INTEGER,
            balls_faced INTEGER,
            fours INTEGER,
            sixes INTEGER,
            dismissals INTEGER,
            not_outs INTEGER,
            fifties INTEGER,
            hundreds INTEGER,
            batting_average REAL,
            strike_rate REAL,
            PRIMARY KEY (player_id, season),
            FOREIGN KEY (player_id) REFERENCES players(player_id)
        );

        DROP TABLE IF EXISTS bowling_stats;
        CREATE TABLE bowling_stats (
            player_id TEXT NOT NULL,
            display_name TEXT,
            season TEXT NOT NULL,
            matches INTEGER,
            innings INTEGER,
            legal_balls INTEGER,
            overs REAL,
            runs_conceded INTEGER,
            wickets INTEGER,
            economy REAL,
            bowling_average REAL,
            bowling_strike_rate REAL,
            PRIMARY KEY (player_id, season),
            FOREIGN KEY (player_id) REFERENCES players(player_id)
        );

        DROP TABLE IF EXISTS team_season_stats;
        CREATE TABLE team_season_stats (
            season TEXT NOT NULL,
            team TEXT NOT NULL,
            matches INTEGER,
            wins INTEGER,
            losses INTEGER,
            no_result_or_tie INTEGER,
            runs_for INTEGER,
            runs_against INTEGER,
            PRIMARY KEY (season, team)
        );
    """)

    def read_csv(filename):
        with open(DATA_DIR / filename, "r", encoding="utf-8-sig") as f:
            return list(csv.DictReader(f))

    # 1. players
    players_raw = read_csv("player_master.csv")
    cursor.executemany(
        "INSERT INTO players VALUES (?, ?, ?, ?, ?)",
        [
            (clean(r["player_id"]), clean(r["display_name"]), as_int(r["alias_count"]), as_int(r["matches_seen"]), clean(r["registry_names"]))
            for r in players_raw
        ]
    )

    # 2. matches
    matches_raw = read_csv("matches_clean.csv")
    cursor.executemany(
        "INSERT INTO matches VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
            (
                clean(r["match_id"]), clean(r["date"]), clean(r["season"]), clean(r["team1"]), clean(r["team2"]),
                clean(r["venue"]), clean(r["city"]), clean(r["toss_winner"]), clean(r["toss_decision"]),
                clean(r["winner"]), clean(r["result_type"]), as_float(r["result_runs"]) or as_float(r["result_wickets"]),
                clean(r["result_method"]), clean(r["player_of_match"])
            )
            for r in matches_raw
        ]
    )

    # 3. player_match_aliases
    aliases_raw = read_csv("player_match_aliases.csv")
    cursor.executemany(
        "INSERT INTO player_match_aliases VALUES (?, ?, ?)",
        [
            (clean(r["match_id"]), clean(r["player_name"]), clean(r["player_id"]))
            for r in aliases_raw
        ]
    )

    # 4. deliveries
    deliveries_raw = read_csv("deliveries_clean.csv")
    cursor.executemany(
        "INSERT INTO deliveries VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
            (
                clean(r["match_id"]), as_int(r["innings_no"]), clean(r["batting_team"]), as_int(r["over_number"]),
                as_int(r["delivery_position"]), clean(r["batter"]), clean(r["bowler"]), clean(r["non_striker"]),
                as_int(r["batter_runs"]), as_int(r["extra_runs"]), as_int(r["total_runs"]),
                clean(r["extras_json"]), clean(r["wickets_json"])
            )
            for r in deliveries_raw
        ]
    )

    # 5. batting_stats
    batting_raw = read_csv("batting_stats.csv")
    cursor.executemany(
        "INSERT INTO batting_stats VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
            (
                clean(r["player_id"]), clean(r["display_name"]), clean(r["season"]), as_int(r["matches"]),
                as_int(r["innings"]), as_int(r["runs"]), as_int(r["balls_faced"]), as_int(r["fours"]),
                as_int(r["sixes"]), as_int(r["dismissals"]), as_int(r["not_outs"]), as_int(r["fifties"]),
                as_int(r["hundreds"]), as_float(r["batting_average"]), as_float(r["strike_rate"])
            )
            for r in batting_raw
        ]
    )

    # 6. bowling_stats
    bowling_raw = read_csv("bowling_stats.csv")
    cursor.executemany(
        "INSERT INTO bowling_stats VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
            (
                clean(r["player_id"]), clean(r["display_name"]), clean(r["season"]), as_int(r["matches"]),
                as_int(r["innings"]), as_int(r["legal_balls"]), as_float(r["overs"]), as_int(r["runs_conceded"]),
                as_int(r["wickets"]), as_float(r["economy"]), as_float(r["bowling_average"]), as_float(r["bowling_strike_rate"])
            )
            for r in bowling_raw
        ]
    )

    # 7. team_season_stats
    teams_raw = read_csv("team_season_stats.csv")
    cursor.executemany(
        "INSERT INTO team_season_stats VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
            (
                clean(r["season"]), clean(r["team"]), as_int(r["matches"]), as_int(r["wins"]),
                as_int(r["losses"]), as_int(r["no_result_or_tie"]), as_int(r["runs_for"]), as_int(r["runs_against"])
            )
            for r in teams_raw
        ]
    )

    # Build indexes for ultra-fast queries
    cursor.executescript("""
        CREATE INDEX IF NOT EXISTS idx_deliveries_match ON deliveries(match_id);
        CREATE INDEX IF NOT EXISTS idx_deliveries_batter ON deliveries(batter);
        CREATE INDEX IF NOT EXISTS idx_deliveries_bowler ON deliveries(bowler);
        CREATE INDEX IF NOT EXISTS idx_batting_player ON batting_stats(player_id);
        CREATE INDEX IF NOT EXISTS idx_bowling_player ON bowling_stats(player_id);
        CREATE INDEX IF NOT EXISTS idx_matches_season ON matches(season);
        CREATE INDEX IF NOT EXISTS idx_matches_team1 ON matches(team1);
        CREATE INDEX IF NOT EXISTS idx_matches_team2 ON matches(team2);
        CREATE INDEX IF NOT EXISTS idx_matches_winner ON matches(winner);
        CREATE INDEX IF NOT EXISTS idx_aliases_name ON player_match_aliases(player_name);
        CREATE INDEX IF NOT EXISTS idx_aliases_pid ON player_match_aliases(player_id);
    """)

    conn.commit()

    print("\nVerified SQLite Row Counts:")
    for t in ["players", "player_match_aliases", "matches", "deliveries", "batting_stats", "bowling_stats", "team_season_stats"]:
        cursor.execute(f"SELECT COUNT(*) FROM {t}")
        print(f"  {t}: {cursor.fetchone()[0]:,}")

    conn.close()
    print("\nSQLite database successfully built at database/ipl_analysis.db")

if __name__ == "__main__":
    build_sqlite()
