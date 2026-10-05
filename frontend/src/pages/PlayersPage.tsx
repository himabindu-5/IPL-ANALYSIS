import React, { useEffect, useState } from 'react';
import { Users, Search, X, Zap, Target } from 'lucide-react';
import { fetchPlayers, fetchPlayerProfile, fetchSeasons } from '../services/api';
import type { PlayersListResponse, PlayerProfile, SeasonInfo } from '../types';
import { Pagination } from '../components/Pagination';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

export const PlayersPage: React.FC = () => {
  const [playersRes, setPlayersRes] = useState<PlayersListResponse | null>(null);
  const [seasons, setSeasons] = useState<SeasonInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [page, setPage] = useState(1);

  // Player Profile Modal state
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadSeasons = async () => {
    try {
      const res = await fetchSeasons();
      setSeasons(res);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPlayers = async () => {
    setLoading(true);
    try {
      const res = await fetchPlayers(search, selectedSeason, selectedRole, page, 24);
      setPlayersRes(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeasons();
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [selectedSeason, selectedRole, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadPlayers();
  };

  const openPlayerProfile = async (playerId: string) => {
    setSelectedPlayerId(playerId);
    setProfileLoading(true);
    try {
      const res = await fetchPlayerProfile(playerId);
      setProfile(res);
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedSeason('All');
    setSelectedRole('All');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Search Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            IPL Player Directory & Master Profiles
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Search 809 verified player profiles with career & season-by-season analytics
          </p>
        </div>

        {/* Filter Controls */}
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search player name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => { setSelectedRole(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="batter">Batters</option>
            <option value="bowler">Bowlers</option>
          </select>

          <select
            value={selectedSeason}
            onChange={(e) => { setSelectedSeason(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Seasons</option>
            {seasons.map((s) => (
              <option key={s.season} value={s.season}>{s.season}</option>
            ))}
          </select>

          {(search || selectedSeason !== 'All' || selectedRole !== 'All') && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Players Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Searching player master registry..." />
      ) : !playersRes || playersRes.data.length === 0 ? (
        <EmptyState onReset={resetFilters} />
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {playersRes.data.map((p) => (
              <div
                key={p.player_id}
                onClick={() => openPlayerProfile(p.player_id)}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {p.display_name.charAt(0)}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {p.matches_seen} Matches
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {p.display_name}
                </h3>
                <p className="text-[11px] font-mono text-slate-400">ID: {p.player_id}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Runs</span>
                    <span className="font-extrabold text-slate-800">{p.total_runs ? p.total_runs.toLocaleString() : '0'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Wickets</span>
                    <span className="font-extrabold text-slate-800">{p.total_wickets ? p.total_wickets.toLocaleString() : '0'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6">
            <Pagination
              page={playersRes.page}
              pages={playersRes.pages}
              total={playersRes.total}
              limit={playersRes.limit}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>
      )}

      {/* Player Profile Modal */}
      {selectedPlayerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 flex items-start justify-between relative">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                  {profile?.player.display_name.charAt(0) || 'P'}
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{profile?.player.display_name}</h2>
                  <p className="text-xs text-indigo-200 font-mono mt-0.5">Player ID: {profile?.player.player_id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPlayerId(null)}
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {profileLoading || !profile ? (
              <LoadingSpinner message="Fetching player profile and career metrics..." />
            ) : (
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                
                {/* Career Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Batting Career Summary */}
                  <div className="bg-indigo-50/60 p-5 rounded-2xl border border-indigo-100">
                    <div className="flex items-center space-x-2 text-indigo-700 font-bold text-sm mb-3">
                      <Zap className="w-4 h-4" />
                      <span>Batting Career Aggregate</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Runs</span>
                        <div className="text-lg font-black text-slate-900">{profile.career_batting.runs.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Average</span>
                        <div className="text-lg font-black text-slate-900">{profile.career_batting.career_average}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Strike Rate</span>
                        <div className="text-lg font-black text-slate-900">{profile.career_batting.career_strike_rate}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Fifties</span>
                        <div className="text-base font-bold text-slate-800">{profile.career_batting.fifties}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Hundreds</span>
                        <div className="text-base font-bold text-slate-800">{profile.career_batting.hundreds}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">4s / 6s</span>
                        <div className="text-base font-bold text-slate-800">{profile.career_batting.fours} / {profile.career_batting.sixes}</div>
                      </div>
                    </div>
                  </div>

                  {/* Bowling Career Summary */}
                  <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100">
                    <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm mb-3">
                      <Target className="w-4 h-4" />
                      <span>Bowling Career Aggregate</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Wickets</span>
                        <div className="text-lg font-black text-slate-900">{profile.career_bowling.wickets}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Economy</span>
                        <div className="text-lg font-black text-slate-900">{profile.career_bowling.career_economy}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Average</span>
                        <div className="text-lg font-black text-slate-900">{profile.career_bowling.career_average}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Overs</span>
                        <div className="text-base font-bold text-slate-800">{profile.career_bowling.total_overs}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Strike Rate</span>
                        <div className="text-base font-bold text-slate-800">{profile.career_bowling.career_strike_rate}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Runs Conceded</span>
                        <div className="text-base font-bold text-slate-800">{profile.career_bowling.runs_conceded.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Season-by-Season Batting Table */}
                {profile.batting_seasons.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Season-wise Batting Breakdown</h4>
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-500 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Season</th>
                            <th className="p-3 text-right">Matches</th>
                            <th className="p-3 text-right">Innings</th>
                            <th className="p-3 text-right">Runs</th>
                            <th className="p-3 text-right">Avg</th>
                            <th className="p-3 text-right">SR</th>
                            <th className="p-3 text-right">50s / 100s</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium">
                          {profile.batting_seasons.map((b, idx) => (
                            <tr key={idx}>
                              <td className="p-3 font-bold text-slate-900">{b.season}</td>
                              <td className="p-3 text-right text-slate-600">{b.matches}</td>
                              <td className="p-3 text-right text-slate-600">{b.innings}</td>
                              <td className="p-3 text-right font-extrabold text-indigo-600">{b.runs}</td>
                              <td className="p-3 text-right text-slate-700">{b.batting_average ?? '—'}</td>
                              <td className="p-3 text-right text-slate-700">{b.strike_rate ?? '—'}</td>
                              <td className="p-3 text-right text-slate-800">{b.fifties} / {b.hundreds}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Registered Match Aliases */}
                {profile.aliases.length > 0 && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Verified Match Identity Aliases</span>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.aliases.map((alias, idx) => (
                        <span key={idx} className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700">
                          {alias}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
