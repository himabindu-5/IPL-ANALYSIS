import React, { useEffect, useState } from 'react';
import { Trophy, Search, MapPin, Award, X, ChevronRight, Calendar } from 'lucide-react';
import { fetchMatches, fetchMatchDetail, fetchSeasons, fetchTeams } from '../services/api';
import type { MatchesListResponse, MatchDetailResponse, SeasonInfo } from '../types';
import { Pagination } from '../components/Pagination';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

export const MatchesPage: React.FC = () => {
  const [matchesRes, setMatchesRes] = useState<MatchesListResponse | null>(null);
  const [seasons, setSeasons] = useState<SeasonInfo[]>([]);
  const [teamsList, setTeamsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('All');
  const [selectedTeam, setSelectedTeam] = useState('All');
  const [page, setPage] = useState(1);

  // Match detail modal state
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [matchDetail, setMatchDetail] = useState<MatchDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadFilterOptions = async () => {
    try {
      const [sRes, tRes] = await Promise.all([fetchSeasons(), fetchTeams()]);
      setSeasons(sRes);
      setTeamsList(tRes.teams);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMatches = async () => {
    setLoading(true);
    try {
      const res = await fetchMatches(selectedSeason, selectedTeam, search, page, 20);
      setMatchesRes(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadMatches();
  }, [selectedSeason, selectedTeam, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadMatches();
  };

  const openMatchDetail = async (matchId: string) => {
    setSelectedMatchId(matchId);
    setDetailLoading(true);
    try {
      const detail = await fetchMatchDetail(matchId);
      setMatchDetail(detail);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedSeason('All');
    setSelectedTeam('All');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-600" />
            Match Explorer & Scorecards
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Browse 1,243 IPL match records with venues, toss results, and player-of-the-match awards
          </p>
        </div>

        {/* Search & Filter Form */}
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search team, venue, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedSeason}
            onChange={(e) => { setSelectedSeason(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Seasons</option>
            {seasons.map((s) => (
              <option key={s.season} value={s.season}>{s.season} ({s.matches} matches)</option>
            ))}
          </select>

          <select
            value={selectedTeam}
            onChange={(e) => { setSelectedTeam(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Teams</option>
            {teamsList.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {(search || selectedSeason !== 'All' || selectedTeam !== 'All') && (
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

      {/* Matches Grid / Table */}
      {loading ? (
        <LoadingSpinner message="Fetching match records..." />
      ) : !matchesRes || matchesRes.data.length === 0 ? (
        <EmptyState onReset={resetFilters} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date / Season</th>
                  <th className="py-3 px-4">Matchup</th>
                  <th className="py-3 px-4">Venue & City</th>
                  <th className="py-3 px-4">Toss Decision</th>
                  <th className="py-3 px-4">Winner & Result</th>
                  <th className="py-3 px-4">Player of Match</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {matchesRes.data.map((m) => {
                  const isWinner1 = m.winner === m.team1;
                  const isWinner2 = m.winner === m.team2;
                  return (
                    <tr
                      key={m.match_id}
                      onClick={() => openMatchDetail(m.match_id)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">
                        <div className="text-slate-900 font-bold">{m.date || 'N/A'}</div>
                        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                          {m.season}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className={`font-semibold ${isWinner1 ? 'text-slate-900 font-extrabold' : 'text-slate-600'}`}>
                            {m.team1} {isWinner1 && '🏆'}
                          </div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">vs</div>
                          <div className={`font-semibold ${isWinner2 ? 'text-slate-900 font-extrabold' : 'text-slate-600'}`}>
                            {m.team2} {isWinner2 && '🏆'}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-start space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <div className="font-semibold text-slate-800 line-clamp-1">{m.venue || 'Unknown Venue'}</div>
                            <div className="text-slate-500 text-[11px]">{m.city || 'N/A'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {m.toss_winner ? (
                          <div className="text-slate-700">
                            <span className="font-semibold text-slate-900">{m.toss_winner}</span>
                            <div className="text-[11px] text-slate-500 capitalize">Elected to {m.toss_decision}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-italic">No Toss Data</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {m.winner ? (
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {m.winner}
                            </span>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Won by {m.result_margin} {m.result} {m.method ? `(${m.method})` : ''}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700">
                            {m.result || 'No Result / Tie'}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {m.player_of_match ? (
                          <div className="flex items-center space-x-1 text-slate-800 font-semibold">
                            <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>{m.player_of_match}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-italic">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-500 transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            page={matchesRes.page}
            pages={matchesRes.pages}
            total={matchesRes.total}
            limit={matchesRes.limit}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Match Detail Modal */}
      {selectedMatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex items-start justify-between relative">
              <div>
                <span className="text-xs font-semibold bg-indigo-500 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Season {matchDetail?.match.season}
                </span>
                <h2 className="text-xl font-extrabold mt-2">
                  {matchDetail?.match.team1} vs {matchDetail?.match.team2}
                </h2>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  {matchDetail?.match.date} • {matchDetail?.match.venue}, {matchDetail?.match.city}
                </p>
              </div>

              <button
                onClick={() => setSelectedMatchId(null)}
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailLoading || !matchDetail ? (
              <LoadingSpinner message="Fetching match scorecard details..." />
            ) : (
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                
                {/* Result Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-900 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">Match Winner</div>
                    <div className="text-lg font-extrabold text-slate-900">{matchDetail.match.winner || 'No Result'}</div>
                    <div className="text-xs text-slate-600 font-medium mt-0.5">
                      {matchDetail.match.winner ? `Won by ${matchDetail.match.result_margin} ${matchDetail.match.result}` : 'Match abandoned or tied'}
                    </div>
                  </div>
                  {matchDetail.match.player_of_match && (
                    <div className="text-right">
                      <div className="text-xs font-bold uppercase tracking-wider text-amber-600">Player of Match</div>
                      <div className="text-sm font-extrabold text-slate-900">{matchDetail.match.player_of_match}</div>
                    </div>
                  )}
                </div>

                {/* Innings Totals */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Innings Scorecards</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {matchDetail.innings.map((inn) => (
                      <div key={inn.innings_no} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <div className="text-xs font-semibold text-indigo-600 uppercase">Innings {inn.innings_no}</div>
                        <div className="text-base font-extrabold text-slate-900 mt-1">{inn.batting_team}</div>
                        <div className="text-2xl font-black text-indigo-600 mt-2">
                          {inn.total_runs} <span className="text-xs font-semibold text-slate-500">runs</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex justify-between">
                          <span>Batter Runs: {inn.batter_runs}</span>
                          <span>Extras: {inn.extra_runs}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Batting Performers */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Top Batting Performers</h4>
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-500 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Batter</th>
                          <th className="p-3">Team</th>
                          <th className="p-3 text-right">Runs</th>
                          <th className="p-3 text-right">Balls</th>
                          <th className="p-3 text-right">4s / 6s</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium">
                        {matchDetail.top_batters.map((b, idx) => (
                          <tr key={idx}>
                            <td className="p-3 font-bold text-slate-900">{b.batter}</td>
                            <td className="p-3 text-slate-600">{b.batting_team}</td>
                            <td className="p-3 text-right font-extrabold text-indigo-600">{b.runs}</td>
                            <td className="p-3 text-right text-slate-500">{b.balls}</td>
                            <td className="p-3 text-right text-slate-700">{b.fours} / {b.sixes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Bowling Performers */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Top Bowling Performers</h4>
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-500 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Bowler</th>
                          <th className="p-3 text-right">Wickets</th>
                          <th className="p-3 text-right">Runs Conceded</th>
                          <th className="p-3 text-right">Legal Balls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium">
                        {matchDetail.top_bowlers.map((bw, idx) => (
                          <tr key={idx}>
                            <td className="p-3 font-bold text-slate-900">{bw.bowler}</td>
                            <td className="p-3 text-right font-extrabold text-emerald-600">{bw.wickets}</td>
                            <td className="p-3 text-right text-slate-700">{bw.runs_conceded}</td>
                            <td className="p-3 text-right text-slate-500">{bw.legal_balls}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
