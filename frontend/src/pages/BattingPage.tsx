import React, { useEffect, useState } from 'react';
import { Zap, Search, ArrowUpDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchBattingAnalytics, fetchSeasons } from '../services/api';
import type { BattingAnalyticsResponse, SeasonInfo } from '../types';
import { Pagination } from '../components/Pagination';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { formatDecimal, formatInt } from '../utils/formatters';

export const BattingPage: React.FC = () => {
  const [data, setData] = useState<BattingAnalyticsResponse | null>(null);
  const [seasons, setSeasons] = useState<SeasonInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('All');
  const [sortBy, setSortBy] = useState('runs');
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

  const loadBatting = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBattingAnalytics(selectedSeason, search, sortBy, order, page, 25);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load batting analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeasons();
  }, []);

  useEffect(() => {
    loadBatting();
  }, [selectedSeason, sortBy, order, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadBatting();
  };

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setOrder(order === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(col);
      setOrder('desc');
    }
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedSeason('All');
    setSortBy('runs');
    setOrder('desc');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            Batting Analytics & Leaderboard
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Sortable season-wise batting metrics: Runs, Averages, Strike Rates, Boundaries, 50s & 100s
          </p>
        </div>

        {/* Toolbar */}
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search batter name..."
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
        <ErrorMessage message={error} onRetry={loadBatting} />
      ) : (
        <>
          {/* Top Chart */}
          {data?.top_chart && data.top_chart.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Top 10 Batters by Total Runs {selectedSeason !== 'All' ? `(${selectedSeason})` : '(Career Aggregate)'}
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
                    <Bar dataKey="total_runs" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Runs Scored" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Batting Leaderboard Table */}
          {loading ? (
            <LoadingSpinner message="Calculating batting analytics..." />
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
                      <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('runs')}>
                        <div className="flex items-center justify-end space-x-1 text-indigo-600">
                          <span>Runs</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('balls_faced')}>
                        <div className="flex items-center justify-end space-x-1">
                          <span>Balls</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('batting_average')}>
                        <div className="flex items-center justify-end space-x-1">
                          <span>Average</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('strike_rate')}>
                        <div className="flex items-center justify-end space-x-1">
                          <span>Strike Rate</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('fours')}>
                        <div className="flex items-center justify-end space-x-1">
                          <span>4s</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('sixes')}>
                        <div className="flex items-center justify-end space-x-1">
                          <span>6s</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('fifties')}>
                        <div className="flex items-center justify-end space-x-1">
                          <span>50s / 100s</span>
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
                          <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                            {row.season}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600">{formatInt(row.matches)}</td>
                        <td className="py-3 px-4 text-right text-slate-600">{formatInt(row.innings)}</td>
                        <td className="py-3 px-4 text-right font-black text-indigo-600 text-sm">{formatInt(row.runs)}</td>
                        <td className="py-3 px-4 text-right text-slate-500">{formatInt(row.balls_faced)}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">{formatDecimal(row.batting_average)}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">{formatDecimal(row.strike_rate)}</td>
                        <td className="py-3 px-4 text-right text-slate-700">{formatInt(row.fours)}</td>
                        <td className="py-3 px-4 text-right text-slate-700">{formatInt(row.sixes)}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {formatInt(row.fifties)} / {formatInt(row.hundreds)}
                        </td>
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
