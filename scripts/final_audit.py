
import os
import pg8000

connection = pg8000.connect(
    host=os.getenv("PGHOST", "127.0.0.1"),
    port=int(os.getenv("PGPORT", "5432")),
    user=os.getenv("PGUSER", "postgres"),
    password=os.getenv("PGPASSWORD"),
    database=os.getenv("PGDATABASE", "ipl_analysis"),
)

cursor = connection.cursor()

tables = [
    "players",
    "player_match_aliases",
    "matches",
    "deliveries",
    "batting_stats",
    "bowling_stats",
    "team_season_stats",
]

print("=" * 55)
print("IPL ANALYSIS - FINAL DATABASE AUDIT")
print("=" * 55)

print("\n1. TABLE ROW COUNTS")

for table in tables:
    cursor.execute(f"SELECT COUNT(*) FROM {table}")
    count = cursor.fetchone()[0]
    print(f"{table}: {count:,}")

print("\n2. MATCH DATA CHECKS")

cursor.execute("""
    SELECT
        COUNT(*),
        COUNT(DISTINCT match_id),
        COUNT(*) FILTER (WHERE date IS NULL),
        COUNT(*) FILTER (WHERE season IS NULL),
        COUNT(*) FILTER (
            WHERE team1 IS NULL OR team2 IS NULL
        )
    FROM matches
""")

total, unique_ids, missing_dates, missing_seasons, missing_teams = (
    cursor.fetchone()
)

print("Total matches:", total)
print("Unique match IDs:", unique_ids)
print("Missing dates:", missing_dates)
print("Missing seasons:", missing_seasons)
print("Matches missing a team name:", missing_teams)

print("\n3. DELIVERY DATA CHECKS")

cursor.execute("""
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE match_id IS NULL),
        COUNT(*) FILTER (WHERE batter IS NULL),
        COUNT(*) FILTER (WHERE bowler IS NULL),
        COUNT(*) FILTER (WHERE total_runs IS NULL),
        COUNT(*) FILTER (
            WHERE batter_runs + extra_runs <> total_runs
        )
    FROM deliveries
""")

(
    total_deliveries,
    missing_match_ids,
    missing_batters,
    missing_bowlers,
    missing_runs,
    inconsistent_runs,
) = cursor.fetchone()

print("Total deliveries:", total_deliveries)
print("Missing match IDs:", missing_match_ids)
print("Missing batter names:", missing_batters)
print("Missing bowler names:", missing_bowlers)
print("Missing total runs:", missing_runs)
print("Run-total inconsistencies:", inconsistent_runs)

cursor.execute("""
    SELECT COUNT(*)
    FROM deliveries d
    LEFT JOIN matches m ON d.match_id = m.match_id
    WHERE m.match_id IS NULL
""")

print("Deliveries without a matching match:", cursor.fetchone()[0])

print("\n4. SEASON COVERAGE")

cursor.execute("""
    SELECT season, COUNT(*)
    FROM matches
    GROUP BY season
    ORDER BY MIN(date), season
""")

for season, count in cursor.fetchall():
    print(f"{season}: {count} matches")

print("\n5. PLAYER STATISTICS RELATIONSHIPS")

for table in ["batting_stats", "bowling_stats"]:
    cursor.execute(f"""
        SELECT COUNT(*)
        FROM {table} s
        LEFT JOIN players p ON s.player_id = p.player_id
        WHERE p.player_id IS NULL
    """)
    print(
        f"{table} rows without a matching player:",
        cursor.fetchone()[0],
    )

print("\n6. MATCH DATE RANGE")

cursor.execute("""
    SELECT MIN(date), MAX(date)
    FROM matches
""")

first_date, last_date = cursor.fetchone()
print("First match date:", first_date)
print("Last match date:", last_date)

cursor.close()
connection.close()

print("\nAudit completed.")