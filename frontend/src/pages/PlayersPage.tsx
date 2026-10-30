import React, { useEffect, useState } from 'react';
import { Users, Search, X, Zap, Target, Flame, Clock } from 'lucide-react';
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

  const QUICK_SUGGESTIONS = [
    { label: 'Virat Kohli', query: 'Virat Kohli' },
    { label: 'Rohit Sharma', query: 'Rohit Sharma' },
    { label: 'MS Dhoni', query: 'MS Dhoni' },
    { label: 'Jasprit Bumrah', query: 'Jasprit Bumrah' },
    { label: 'Hardik Pandya', query: 'Hardik Pandya' },
    { label: 'Suryakumar Yadav', query: 'SKY' },
    { label: 'Rashid Khan', query: 'Rashid Khan' },
    { label: 'Andre Russell', query: 'Russell' }
  ];

  const loadSeasons = async () => {
    try {
      const res = await fetchSeasons();
      setSeasons(res);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPlayers = async (overrideSearch?: string) => {
    setLoading(true);
    try {
      const q = overrideSearch !== undefined ? overrideSearch : search;
      const res = await fetchPlayers(q, selectedSeason, selectedRole, page, 24);
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

  const handleQuickSearch = (query: string) => {
    setSearch(query);
    setPage(1);
    loadPlayers(query);
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
    loadPlayers('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Search Toolbar */}
      <div className="clean-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-[#FB542B]" />
                IPL Player Directory & Forte Intelligence
              </h1>
              <span className="text-[10px] bg-[#FB542B]/10 text-[#FB542B] font-bold px-2 py-0.5 rounded-full border border-[#FB542B]/30">
                809 Verified Masters
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Search any player by full name, initial, or nickname with empirical delivery phase stats and forte tags
            </p>
          </div>

          {/* Filter Controls */}
          <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search 'Virat', 'Rohit', 'Bumrah'..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#FB542B]"
              />
            </div>

            <select
              value={selectedRole}
              onChange={(e) => { setSelectedRole(e.target.value); setPage(1); }}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="All" className="dark:bg-[#121624]">All Roles</option>
              <option value="batter" className="dark:bg-[#121624]">Batters</option>
              <option value="bowler" className="dark:bg-[#121624]">Bowlers</option>
            </select>

            <select
              value={selectedSeason}
              onChange={(e) => { setSelectedSeason(e.target.value); setPage(1); }}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="All" className="dark:bg-[#121624]">All Seasons</option>
              {seasons.map((s) => (
                <option key={s.season} value={s.season} className="dark:bg-[#121624]">{s.season}</option>
              ))}
            </select>

            <button
              type="submit"
              className="brave-btn-primary px-4 py-1.5 text-xs font-bold"
            >
              Search
            </button>

            {(search || selectedSeason !== 'All' || selectedRole !== 'All') && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-[#FB542B] bg-[#FB542B]/10 hover:bg-[#FB542B]/20 px-3 py-1.5 rounded-xl border border-[#FB542B]/30 transition-colors"
              >
                Reset
              </button>
            )}
          </form>
        </div>

        {/* Quick Search Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">
            Popular:
          </span>
          {QUICK_SUGGESTIONS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleQuickSearch(chip.query)}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#FB542B]/10 hover:text-[#FB542B] dark:hover:text-[#FB542B] hover:border-[#FB542B]/40 border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-all"
            >
              {chip.label}
            </button>
          ))}
        </div>
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
                className="clean-card p-5 cursor-pointer group hover:border-[#FB542B]/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FB542B] to-[#434FCF] p-[2px]">
                    <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white font-black text-sm">
                      {p.display_name.charAt(0)}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {p.matches_seen} Matches
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white group-hover:text-[#FB542B] transition-colors line-clamp-1">
                  {p.display_name}
                </h3>
                <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500">ID: {p.player_id}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Career Runs</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{p.total_runs ? p.total_runs.toLocaleString() : '0'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Career Wickets</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{p.total_wickets ? p.total_wickets.toLocaleString() : '0'}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="clean-card bg-white dark:bg-[#0d111c] max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-[#101428] to-[#0A0D18] text-white p-6 flex items-start justify-between relative border-b border-slate-800">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FB542B] to-[#434FCF] p-0.5 shadow-lg">
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white text-2xl font-black">
                    {profile?.player.display_name.charAt(0) || 'P'}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{profile?.player.display_name}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400 font-mono">ID: {profile?.player.player_id}</span>
                    {profile?.forte && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-[#FB542B] border border-orange-500/30 text-[11px] font-bold">
                        <Flame className="w-3 h-3" />
                        <span>Forte: {profile.forte}</span>
                      </span>
                    )}
                  </div>
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
                
                {/* Empirical Phase Analysis Highlight */}
                {profile.phase_analysis && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-indigo-500/10 to-blue-500/10 border border-orange-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-[#FB542B]" />
                        <span>Empirical Ball-by-Ball Phase Metrics</span>
                      </h4>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Real Delivery Log Analysis</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Powerplay Runs (1-6)</span>
                        <span className="text-base font-extrabold text-slate-900 dark:text-white">
                          {profile.phase_analysis.powerplay_runs.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 block">SR: {profile.phase_analysis.powerplay_sr}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Death Overs Runs (16-20)</span>
                        <span className="text-base font-extrabold text-[#FB542B]">
                          {profile.phase_analysis.death_runs.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 block">SR: {profile.phase_analysis.death_sr}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Death Wickets (16-20)</span>
                        <span className="text-base font-extrabold text-slate-900 dark:text-white">
                          {profile.phase_analysis.death_wickets}
                        </span>
                        <span className="text-[10px] text-slate-500 block">Clutch overs</span>
                      </div>

                      <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Death Overs Economy</span>
                        <span className="text-base font-extrabold text-indigo-500">
                          {profile.phase_analysis.death_economy > 0 ? profile.phase_analysis.death_economy : '—'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">Runs/over (16-20)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Career Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Batting Career Summary */}
                  <div className="clean-card p-5 border border-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20">
                    <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-3">
                      <Zap className="w-4 h-4" />
                      <span>Batting Career Aggregate</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Runs</span>
                        <div className="text-lg font-black text-slate-900 dark:text-white">{profile.career_batting.runs.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Average</span>
                        <div className="text-lg font-black text-slate-900 dark:text-white">{profile.career_batting.career_average}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Strike Rate</span>
                        <div className="text-lg font-black text-slate-900 dark:text-white">{profile.career_batting.career_strike_rate}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Fifties</span>
                        <div className="text-base font-bold text-slate-800 dark:text-slate-200">{profile.career_batting.fifties}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Hundreds</span>
                        <div className="text-base font-bold text-slate-800 dark:text-slate-200">{profile.career_batting.hundreds}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">4s / 6s</span>
                        <div className="text-base font-bold text-slate-800 dark:text-slate-200">{profile.career_batting.fours} / {profile.career_batting.sixes}</div>
                      </div>
                    </div>
                  </div>

                  {/* Bowling Career Summary */}
                  <div className="clean-card p-5 border border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20">
                    <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-3">
                      <Target className="w-4 h-4" />
                      <span>Bowling Career Aggregate</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Wickets</span>
                        <div className="text-lg font-black text-slate-900 dark:text-white">{profile.career_bowling.wickets}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Economy</span>
                        <div className="text-lg font-black text-slate-900 dark:text-white">{profile.career_bowling.career_economy}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Average</span>
                        <div className="text-lg font-black text-slate-900 dark:text-white">{profile.career_bowling.career_average}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Overs</span>
                        <div className="text-base font-bold text-slate-800 dark:text-slate-200">{profile.career_bowling.total_overs}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Strike Rate</span>
                        <div className="text-base font-bold text-slate-800 dark:text-slate-200">{profile.career_bowling.career_strike_rate}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Runs Conceded</span>
                        <div className="text-base font-bold text-slate-800 dark:text-slate-200">{profile.career_bowling.runs_conceded.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Season-by-Season Batting Table */}
                {profile.batting_seasons.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Season-wise Batting Breakdown</h4>
                    <div className="clean-card overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
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
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                          {profile.batting_seasons.map((b, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="p-3 font-bold text-slate-900 dark:text-white">{b.season}</td>
                              <td className="p-3 text-right text-slate-600 dark:text-slate-400">{b.matches}</td>
                              <td className="p-3 text-right text-slate-600 dark:text-slate-400">{b.innings}</td>
                              <td className="p-3 text-right font-extrabold text-[#FB542B]">{b.runs}</td>
                              <td className="p-3 text-right text-slate-700 dark:text-slate-300">{b.batting_average ?? '—'}</td>
                              <td className="p-3 text-right text-slate-700 dark:text-slate-300">{b.strike_rate ?? '—'}</td>
                              <td className="p-3 text-right text-slate-800 dark:text-slate-200">{b.fifties} / {b.hundreds}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Registered Match Aliases */}
                {profile.aliases.length > 0 && (
                  <div className="clean-card p-4">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Verified Match Identity Aliases</span>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.aliases.map((alias, idx) => (
                        <span key={idx} className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300">
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
