CREATE TABLE IF NOT EXISTS players (
    player_id VARCHAR(50) PRIMARY KEY,
    display_name TEXT NOT NULL,
    alias_count INTEGER,
    matches_seen INTEGER,
    registry_names TEXT
);

CREATE TABLE IF NOT EXISTS player_match_aliases (
    match_id VARCHAR(50) NOT NULL,
    player_name TEXT NOT NULL,
    player_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (match_id, player_name, player_id),
    FOREIGN KEY (player_id) REFERENCES players(player_id)
);

CREATE TABLE IF NOT EXISTS matches (
    match_id VARCHAR(50) PRIMARY KEY,
    date DATE,
    season TEXT,
    team1 TEXT,
    team2 TEXT,
    venue TEXT,
    city TEXT,
    toss_winner TEXT,
    toss_decision TEXT,
    winner TEXT,
    result TEXT,
    result_margin NUMERIC,
    method TEXT,
    player_of_match TEXT
);

CREATE TABLE IF NOT EXISTS deliveries (
    match_id VARCHAR(50) NOT NULL,
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

CREATE TABLE IF NOT EXISTS batting_stats (
    player_id VARCHAR(50) NOT NULL,
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
    batting_average NUMERIC,
    strike_rate NUMERIC,
    PRIMARY KEY (player_id, season),
    FOREIGN KEY (player_id) REFERENCES players(player_id)
);

CREATE TABLE IF NOT EXISTS bowling_stats (
    player_id VARCHAR(50) NOT NULL,
    display_name TEXT,
    season TEXT NOT NULL,
    matches INTEGER,
    innings INTEGER,
    legal_balls INTEGER,
    overs NUMERIC,
    runs_conceded INTEGER,
    wickets INTEGER,
    economy NUMERIC,
    bowling_average NUMERIC,
    bowling_strike_rate NUMERIC,
    PRIMARY KEY (player_id, season),
    FOREIGN KEY (player_id) REFERENCES players(player_id)
);

CREATE TABLE IF NOT EXISTS team_season_stats (
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

CREATE INDEX IF NOT EXISTS idx_deliveries_match
ON deliveries(match_id);

CREATE INDEX IF NOT EXISTS idx_deliveries_batter
ON deliveries(batter);

CREATE INDEX IF NOT EXISTS idx_deliveries_bowler
ON deliveries(bowler);

CREATE INDEX IF NOT EXISTS idx_batting_player
ON batting_stats(player_id);

CREATE INDEX IF NOT EXISTS idx_bowling_player
ON bowling_stats(player_id);

CREATE INDEX IF NOT EXISTS idx_matches_season
ON matches(season);

CREATE INDEX IF NOT EXISTS idx_matches_team1
ON matches(team1);

CREATE INDEX IF NOT EXISTS idx_matches_team2
ON matches(team2);