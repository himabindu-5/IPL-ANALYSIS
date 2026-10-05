import React, { useEffect, useState } from 'react';
import { Target, Search, ArrowUpDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchBowlingAnalytics, fetchSeasons } from '../services/api';
import type { BowlingAnalyticsResponse, SeasonInfo } from '../types';
import { Pagination } from '../components/Pagination';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { formatDecimal, formatInt } from '../utils/formatters';

export const BowlingPage: React.FC = () => {
  const [data, setData] = useState<BowlingAnalyticsResponse | null>(null);
  const [seasons, setSeasons] = useState<SeasonInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('All');
  const [sortBy, setSortBy] = useState('wickets');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const loadSeasons = async () => {
    try {
      const res = await fetchSeasons();
      setSeasons(res);
    } catch (err) {
      console.error(err);
    }
  };

  const loadBowling = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBowlingAnalytics(selectedSeason, search, sortBy, order, page, 25);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load bowling analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeasons();
  }, []);

  useEffect(() => {
    loadBowling();
  }, [selectedSeason, sortBy, order, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadBowling();
  };

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setOrder(order === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(col);
      setOrder(col === 'economy' || col === 'bowling_average' || col === 'bowling_strike_rate' ? 'asc' : 'desc');
    }
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedSeason('All');
    setSortBy('wickets');
    setOrder('desc');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            Bowling Analytics & Leaderboard
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Sortable bowling metrics: Wickets, Economy, Bowling Average, Strike Rate & Legal Balls
          </p>
        </div>

        {/* Toolbar */}
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search bowler name..."
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
              <option key={s.season} value={s.season}>{s.season}</option>
            ))}
          </select>

          {(search || selectedSeason !== 'All') && (
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

      {error ? (
        <ErrorMessage message={error} onRetry={loadBowling} />
      ) : (
        <>
          {/* Top Chart */}
          {data?.top_chart && data.top_chart.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Top 10 Wicket Takers {selectedSeason !== 'All' ? `(${selectedSeason})` : '(Career Aggregate)'}
              </h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.top_chart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="display_name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-25} textAnchor="end" height={45} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="total_wickets" fill="#10b981" radius={[4, 4, 0, 0]} name="Wickets Taken" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Bowling Leaderboard Table */}
          {loading ? (
            <LoadingSpinner message="Calculating bowling analytics..." />
          ) : !data || data.data.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Player</th>
                      <th className="py-3 px-4">Season</th>
                      <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('matches')}>
                        <div className="flex items-center justify-end space-x-1">
                          <span>Matches</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('innings')}>
                        <div className="flex items-center justify-end space-x-1">
                          <span>Innings</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('wickets')}>
                        <div className="flex items-center justify-end space-x-1 text-emerald-600">
                          <span>Wickets</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('overs')}>
                        <div className="flex items-center justify-end space-x-1">
                          <span>Overs</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('runs_conceded')}>
                        <div className="flex items-center justify-end space-x-1">
                          <span>Runs Conceded</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('economy')}>
                        <div className="flex items-center justify-end space-x-1">
                          <span>Economy</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('bowling_average')}>
                        <div className="flex items-center justify-end space-x-1">
                          <span>Average</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('bowling_strike_rate')}>
                        <div className="flex items-center justify-end space-x-1">
                          <span>Strike Rate</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {data.data.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-extrabold text-slate-900">{row.display_name}</td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                            {row.season}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600">{formatInt(row.matches)}</td>
                        <td className="py-3 px-4 text-right text-slate-600">{formatInt(row.innings)}</td>
                        <td className="py-3 px-4 text-right font-black text-emerald-600 text-sm">{formatInt(row.wickets)}</td>
                        <td className="py-3 px-4 text-right text-slate-500">{formatDecimal(row.overs, 1)}</td>
                        <td className="py-3 px-4 text-right text-slate-700">{formatInt(row.runs_conceded)}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">{formatDecimal(row.economy)}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">{formatDecimal(row.bowling_average)}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">{formatDecimal(row.bowling_strike_rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                page={data.page}
                pages={data.pages}
                total={data.total}
                limit={data.limit}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </>
      )}

    </div>
  );
};
