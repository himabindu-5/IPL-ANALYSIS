CREATE DATABASE IF NOT EXISTS ipl_analytics;
USE ipl_analytics;

SHOW VARIABLES LIKE 'local_infile';
SET GLOBAL local_infile = 1;
SELECT COUNT(*) AS total_matches
FROM matches;
LOAD DATA LOCAL INFILE 'C:/Users/himab/OneDrive/Desktop/IPL-Analytics/data/matches.csv'
INTO TABLE matches
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
DROP TABLE matches;
CREATE TABLE matches (
    id INT,
    season VARCHAR(20),
    city VARCHAR(100),
    date DATE,
    match_type VARCHAR(30),
    player_of_match VARCHAR(100),
    venue VARCHAR(255),
    team1 VARCHAR(100),
    team2 VARCHAR(100),
    toss_winner VARCHAR(100),
    toss_decision VARCHAR(20),
    winner VARCHAR(100),
    result VARCHAR(30),
    result_margin INT,
    target_runs INT,
    target_overs DECIMAL(6,2),
    super_over VARCHAR(10),
    method VARCHAR(50),
    umpire1 VARCHAR(100),
    umpire2 VARCHAR(100)
);
LOAD DATA LOCAL INFILE 'C:/Users/himab/OneDrive/Desktop/IPL-Analytics/data/matches.csv'
INTO TABLE matches
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS;
SELECT COUNT(*) AS total_matches
FROM matches;

SELECT *
FROM matches
LIMIT 5;
DROP TABLE IF EXISTS deliveries;

CREATE TABLE deliveries (
    match_id INT,
    inning INT,
    batting_team VARCHAR(100),
    bowling_team VARCHAR(100),
    `over` INT,
    ball INT,
    batter VARCHAR(100),
    bowler VARCHAR(100),
    non_striker VARCHAR(100),
    batsman_runs INT,
    extra_runs INT,
    total_runs INT,
    extras_type VARCHAR(50),
    is_wicket INT,
    player_dismissed VARCHAR(100),
    dismissal_kind VARCHAR(50),
    fielder VARCHAR(100)
);
LOAD DATA LOCAL INFILE 'C:/Users/himab/OneDrive/Desktop/IPL-Analytics/data/deliveries.csv'
INTO TABLE deliveries
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS;
SELECT COUNT(*) AS total_deliveries
FROM deliveries;

SELECT *
FROM deliveries
LIMIT 5;
SELECT COUNT(*) AS total_matches FROM matches;


SELECT
    batter,
    SUM(batsman_runs) AS total_runs
FROM deliveries
GROUP BY batter
ORDER BY total_runs DESC
LIMIT 5;
SELECT
    batter,
    COUNT(*) AS fours
FROM deliveries
WHERE batsman_runs = 4
GROUP BY batter
ORDER BY fours DESC
LIMIT 5;
SELECT
    batter,
    COUNT(*) AS sixes
FROM deliveries
WHERE batsman_runs = 6
GROUP BY batter
ORDER BY sixes DESC
LIMIT 5;
SELECT
    bowler,
    COUNT(*) AS wickets
FROM deliveries
WHERE is_wicket = 1
  AND dismissal_kind NOT IN ('run out', 'retired hurt', 'obstructing the field')
GROUP BY bowler
ORDER BY wickets DESC
LIMIT 5;
SELECT
    winner,
    COUNT(*) AS wins
FROM matches
WHERE winner IS NOT NULL
  AND winner <> 'NA'
GROUP BY winner
ORDER BY wins DESC;
SELECT
    ROUND(
        100.0 * SUM(CASE WHEN toss_winner = winner THEN 1 ELSE 0 END) / COUNT(*),
        2
    ) AS toss_winner_match_win_percentage
FROM matches
WHERE winner IS NOT NULL
  AND winner <> 'NA';
  SELECT
    player_of_match,
    COUNT(*) AS awards
FROM matches
WHERE player_of_match IS NOT NULL
  AND player_of_match <> 'NA'
GROUP BY player_of_match
ORDER BY awards DESC
LIMIT 1;
SELECT
    batter,
    SUM(batsman_runs) AS powerplay_runs
FROM deliveries
WHERE `over` BETWEEN 0 AND 5
GROUP BY batter
ORDER BY powerplay_runs DESC
LIMIT 1;
SELECT
    batter,
    SUM(batsman_runs) AS death_over_runs
FROM deliveries
WHERE `over` BETWEEN 16 AND 19
GROUP BY batter
ORDER BY death_over_runs DESC
LIMIT 10;
SELECT
    bowler,
    SUM(total_runs) AS runs_conceded,
    SUM(
        CASE
            WHEN extras_type IN ('wides', 'noballs') THEN 0
            ELSE 1
        END
    ) AS legal_balls,
    ROUND(
        SUM(total_runs) * 6.0 /
        NULLIF(
            SUM(
                CASE
                    WHEN extras_type IN ('wides', 'noballs') THEN 0
                    ELSE 1
                END
            ),
            0
        ),
        2
    ) AS economy_rate
FROM deliveries
WHERE `over` BETWEEN 16 AND 19
GROUP BY bowler
HAVING legal_balls >= 60
ORDER BY economy_rate ASC
LIMIT 10;
SELECT
    venue,
    COUNT(*) AS matches_hosted
FROM matches
WHERE venue IS NOT NULL
  AND venue <> 'NA'
GROUP BY venue
ORDER BY matches_hosted DESC
LIMIT 10;