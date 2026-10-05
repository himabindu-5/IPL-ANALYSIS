import type {
  StatusResponse,
  DashboardResponse,
  SeasonInfo,
  MatchesListResponse,
  MatchDetailResponse,
  PlayersListResponse,
  PlayerProfile,
  TeamsListResponse,
  TeamProfile,
  BattingAnalyticsResponse,
  BowlingAnalyticsResponse,
  HeadToHeadResponse,
  QualityReportResponse,
} from '../types';

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_BASE = `${BASE_URL}/api`;

export async function fetchStatus(): Promise<StatusResponse> {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) throw new Error('Failed to fetch system status');
  return res.json();
}

export async function fetchDashboard(season?: string, team?: string): Promise<DashboardResponse> {
  const params = new URLSearchParams();
  if (season && season !== 'All') params.append('season', season);
  if (team && team !== 'All') params.append('team', team);
  const res = await fetch(`${API_BASE}/dashboard?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch dashboard data');
  return res.json();
}

export async function fetchSeasons(): Promise<SeasonInfo[]> {
  const res = await fetch(`${API_BASE}/seasons`);
  if (!res.ok) throw new Error('Failed to fetch seasons list');
  return res.json();
}

export async function fetchMatches(
  season?: string,
  team?: string,
  search?: string,
  page: number = 1,
  limit: number = 20
): Promise<MatchesListResponse> {
  const params = new URLSearchParams();
  if (season && season !== 'All') params.append('season', season);
  if (team && team !== 'All') params.append('team', team);
  if (search) params.append('search', search);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const res = await fetch(`${API_BASE}/matches?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch matches');
  return res.json();
}

export async function fetchMatchDetail(matchId: string): Promise<MatchDetailResponse> {
  const res = await fetch(`${API_BASE}/matches/${matchId}`);
  if (!res.ok) throw new Error('Failed to fetch match detail');
  return res.json();
}

export async function fetchPlayers(
  search?: string,
  season?: string,
  role?: string,
  page: number = 1,
  limit: number = 24
): Promise<PlayersListResponse> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (season && season !== 'All') params.append('season', season);
  if (role && role !== 'All') params.append('role', role);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const res = await fetch(`${API_BASE}/players?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch players');
  return res.json();
}

export async function fetchPlayerProfile(playerId: string): Promise<PlayerProfile> {
  const res = await fetch(`${API_BASE}/players/${playerId}`);
  if (!res.ok) throw new Error('Failed to fetch player profile');
  return res.json();
}

export async function fetchTeams(): Promise<TeamsListResponse> {
  const res = await fetch(`${API_BASE}/teams`);
  if (!res.ok) throw new Error('Failed to fetch teams list');
  return res.json();
}

export async function fetchTeamProfile(teamName: string): Promise<TeamProfile> {
  const res = await fetch(`${API_BASE}/teams/${encodeURIComponent(teamName)}`);
  if (!res.ok) throw new Error('Failed to fetch team profile');
  return res.json();
}

export async function fetchBattingAnalytics(
  season?: string,
  search?: string,
  sortBy: string = 'runs',
  order: string = 'desc',
  page: number = 1,
  limit: number = 25
): Promise<BattingAnalyticsResponse> {
  const params = new URLSearchParams();
  if (season && season !== 'All') params.append('season', season);
  if (search) params.append('search', search);
  params.append('sort_by', sortBy);
  params.append('order', order);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const res = await fetch(`${API_BASE}/batting?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch batting analytics');
  return res.json();
}

export async function fetchBowlingAnalytics(
  season?: string,
  search?: string,
  sortBy: string = 'wickets',
  order: string = 'desc',
  page: number = 1,
  limit: number = 25
): Promise<BowlingAnalyticsResponse> {
  const params = new URLSearchParams();
  if (season && season !== 'All') params.append('season', season);
  if (search) params.append('search', search);
  params.append('sort_by', sortBy);
  params.append('order', order);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const res = await fetch(`${API_BASE}/bowling?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch bowling analytics');
  return res.json();
}

export async function fetchHeadToHead(team1: string, team2: string): Promise<HeadToHeadResponse> {
  const params = new URLSearchParams({ team1, team2 });
  const res = await fetch(`${API_BASE}/head-to-head?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to fetch head-to-head analytics');
  }
  return res.json();
}

export async function fetchQualityReport(): Promise<QualityReportResponse> {
  const res = await fetch(`${API_BASE}/quality-report`);
  if (!res.ok) throw new Error('Failed to fetch data quality report');
  return res.json();
}
