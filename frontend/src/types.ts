export interface StatusResponse {
  status: string;
  database_mode: 'postgresql' | 'sqlite' | 'unknown';
  database_message: string;
  row_counts: Record<string, number>;
}

export interface DashboardSummary {
  total_matches: number;
  total_players: number;
  total_deliveries: number;
  total_seasons: number;
  available_seasons: string[];
  total_wins: number;
}

export interface DashboardCharts {
  season_matches: Array<{ season: string; matches: number; dec_matches: number }>;
  team_wins: Array<{ team: string; wins: number }>;
  season_trends: Array<{ season: string; total_runs: number; extra_runs: number; total_deliveries: number }>;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  charts: DashboardCharts;
}

export interface SeasonInfo {
  season: string;
  matches: number;
  start_date: string;
  end_date: string;
  venues: number;
  cities: number;
}

export interface Match {
  match_id: string;
  date: string;
  season: string;
  team1: string;
  team2: string;
  venue: string;
  city: string;
  toss_winner: string;
  toss_decision: string;
  winner: string;
  result: string;
  result_margin: number | null;
  method: string | null;
  player_of_match: string | null;
}

export interface MatchesListResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
  data: Match[];
}

export interface MatchDetailResponse {
  match: Match;
  innings: Array<{
    innings_no: number;
    batting_team: string;
    batter_runs: number;
    extra_runs: number;
    total_runs: number;
    total_deliveries: number;
  }>;
  top_batters: Array<{
    batter: string;
    batting_team: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
  }>;
  top_bowlers: Array<{
    bowler: string;
    runs_conceded: number;
    legal_balls: number;
    wickets: number;
  }>;
}

export interface Player {
  player_id: string;
  display_name: string;
  alias_count: number;
  matches_seen: number;
  registry_names: string;
  total_runs: number | null;
  total_wickets: number | null;
}

export interface PlayersListResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
  data: Player[];
}

export interface BattingSeasonStat {
  player_id: string;
  display_name: string;
  season: string;
  matches: number;
  innings: number;
  runs: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  dismissals: number;
  not_outs: number;
  fifties: number;
  hundreds: number;
  batting_average: number | null;
  strike_rate: number | null;
}

export interface BowlingSeasonStat {
  player_id: string;
  display_name: string;
  season: string;
  matches: number;
  innings: number;
  legal_balls: number;
  overs: number;
  runs_conceded: number;
  wickets: number;
  economy: number | null;
  bowling_average: number | null;
  bowling_strike_rate: number | null;
}

export interface PlayerProfile {
  player: Player;
  career_batting: {
    matches: number;
    innings: number;
    runs: number;
    balls_faced: number;
    fours: number;
    sixes: number;
    dismissals: number;
    not_outs: number;
    fifties: number;
    hundreds: number;
    career_average: number;
    career_strike_rate: number;
  };
  career_bowling: {
    matches: number;
    innings: number;
    legal_balls: number;
    total_overs: number;
    runs_conceded: number;
    wickets: number;
    career_economy: number;
    career_average: number;
    career_strike_rate: number;
  };
  batting_seasons: BattingSeasonStat[];
  bowling_seasons: BowlingSeasonStat[];
  aliases: string[];
}

export interface TeamOverview {
  team: string;
  matches: number;
  wins: number;
  losses: number;
  no_result_or_tie: number;
  total_runs_for: number;
  total_runs_against: number;
}

export interface TeamsListResponse {
  teams: string[];
  overview: TeamOverview[];
}

export interface TeamSeasonStat {
  season: string;
  team: string;
  matches: number;
  wins: number;
  losses: number;
  no_result_or_tie: number;
  runs_for: number;
  runs_against: number;
}

export interface TeamProfile {
  team_name: string;
  overall: TeamOverview;
  seasons: TeamSeasonStat[];
  recent_matches: Match[];
  top_batters: Array<{ batter: string; player_id: string; total_runs: number; matches: number }>;
}

export interface BattingAnalyticsResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
  data: BattingSeasonStat[];
  top_chart: Array<{ display_name: string; total_runs: number; total_sixes: number; total_fours: number }>;
}

export interface BowlingAnalyticsResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
  data: BowlingSeasonStat[];
  top_chart: Array<{ display_name: string; total_wickets: number; total_runs: number }>;
}

export interface HeadToHeadResponse {
  team1: string;
  team2: string;
  summary: {
    total_matches: number;
    team1_wins: number;
    team2_wins: number;
    no_results: number;
  };
  season_breakdown: Array<{ season: string; total: number; team1_wins: number; team2_wins: number; no_result: number }>;
  highest_individual_score: { batter: string; batting_team: string; runs: number; balls: number } | null;
  best_bowling_figures: { bowler: string; runs: number; wickets: number } | null;
  matches: Match[];
}

export interface ValidationCheck {
  id: string;
  title: string;
  description: string;
  status: 'passed' | 'failed' | 'warning';
  details: string;
}

export interface QualityReportResponse {
  status: string;
  database_mode: string;
  total_checks: number;
  passed_checks: number;
  failed_checks: number;
  warning_checks: number;
  checks: ValidationCheck[];
  known_data_quality_issues: Array<Record<string, string>>;
}
