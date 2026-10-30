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

export interface PieChartItem {
  name: string;
  value: number;
  color?: string;
}

export interface DashboardCharts {
  season_matches: Array<{ season: string; matches: number; dec_matches: number }>;
  team_wins: Array<{ team: string; wins: number }>;
  season_trends: Array<{ season: string; total_runs: number; extra_runs: number; total_deliveries: number }>;
  toss_decision_pie?: PieChartItem[];
  match_outcome_pie?: PieChartItem[];
  boundary_share_pie?: PieChartItem[];
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

export interface PlayerPhaseAnalysis {
  powerplay_runs: number;
  powerplay_balls: number;
  powerplay_sr: number;
  death_runs: number;
  death_balls: number;
  death_sr: number;
  death_wickets: number;
  death_economy: number;
}

export interface PlayerProfile {
  player: Player;
  forte?: string;
  phase_analysis?: PlayerPhaseAnalysis;
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

export interface FranchiseMeta {
  id: string;
  name: string;
  short_name: string;
  captain: string;
  primary_color: string;
  secondary_color: string;
  total_budget_cr: number;
  home_venue: string;
}

export interface SquadPlayer {
  player: string;
  role: string;
  is_overseas: boolean;
  price_cr: number;
  career_runs: number;
  career_wickets: number;
  strike_rate: number;
  economy: number;
  fours: number;
  sixes: number;
  player_of_match_awards: number;
  pp_sr: number;
  death_sr: number;
  death_econ: number;
  forte: string;
  impact_score: number;
  fair_value_cr: number;
  vfm_index: number;
  roi_status: string;
  roi_color: string;
  radar_skills: Array<{ subject: string; score: number }>;
}

export interface TradeRecommendation {
  target: string;
  team: string;
  role: string;
  price_cr: number;
  impact_gain: string;
  trade_feasibility: string;
  swap_offer: string;
}

export interface AuctionTeamProfileResponse {
  team_info: {
    name: string;
    short_name: string;
    id: string;
    captain: string;
    home_venue: string;
    primary_color: string;
    secondary_color: string;
    total_budget_cr: number;
    total_spent_cr: number;
    remaining_purse_cr: number;
    squad_size: number;
    overseas_count: number;
    max_overseas: number;
  };
  squad: SquadPlayer[];
  spend_by_role: Array<{ role: string; spent_cr: number }>;
  optimal_playing_xi: SquadPlayer[];
  impact_player_sub: SquadPlayer | null;
  team_deficits: string[];
  recommended_trades: TradeRecommendation[];
  valuation_formula: {
    formula_name: string;
    impact_equation: string;
    fair_value_equation: string;
    vfm_equation: string;
    thresholds: Array<{ status: string; range: string; color: string }>;
  };
}
