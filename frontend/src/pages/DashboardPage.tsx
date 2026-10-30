import React, { useEffect, useState } from 'react';
import { Activity, Trophy, Users, Layers, Calendar, RotateCcw, Flame, Disc } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { fetchDashboard } from '../services/api';
import type { DashboardResponse } from '../types';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const DashboardPage: React.FC<{ onSelectPlayer: (id: string) => void }> = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState('All');
  const [selectedTeam, setSelectedTeam] = useState('All');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchDashboard(selectedSeason, selectedTeam);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSeason, selectedTeam]);

  const handleReset = () => {
    setSelectedSeason('All');
    setSelectedTeam('All');
  };

  if (loading && !data) return <LoadingSpinner message="Loading dashboard statistics..." />;

  const summary = data?.summary;
  const charts = data?.charts;

  const TOSS_COLORS = ['#FB542B', '#434FCF'];
  const OUTCOME_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#64748B'];
  const BOUNDARY_COLORS = ['#FB542B', '#434FCF', '#10B981', '#F59E0B'];

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="clean-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#FB542B]" />
              IPL Master Overview & Analytics
            </h1>
            <span className="text-[10px] bg-[#FB542B]/10 text-[#FB542B] font-bold px-2 py-0.5 rounded-full border border-[#FB542B]/30">
              19 Seasons
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Empirically verified metrics across 1,243 matches and 295,732 deliveries (2007/08–2026)
          </p>
        </div>

        {/* Global Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Season:</span>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden cursor-pointer"
            >
              <option value="All" className="dark:bg-[#121624]">All Seasons</option>
              {summary?.available_seasons.map((s) => (
                <option key={s} value={s} className="dark:bg-[#121624]">{s}</option>
              ))}
            </select>
          </div>

          {(selectedSeason !== 'All' || selectedTeam !== 'All') && (
            <button
              onClick={handleReset}
              className="flex items-center space-x-1 text-xs font-semibold text-[#FB542B] bg-[#FB542B]/10 hover:bg-[#FB542B]/20 px-3 py-1.5 rounded-xl border border-[#FB542B]/30 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Matches"
          value={summary?.total_matches || 0}
          subtitle="Clean match records"
          icon={Trophy}
          color="blue"
        />
        <StatCard
          title="Total Players"
          value={summary?.total_players || 0}
          subtitle="Master player registry"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Total Deliveries"
          value={summary?.total_deliveries || 0}
          subtitle="Ball-by-ball dataset"
          icon={Layers}
          color="purple"
        />
        <StatCard
          title="Available Seasons"
          value={summary?.total_seasons || 0}
          subtitle="2007/08 through 2026"
          icon={Calendar}
          color="emerald"
        />
        <StatCard
          title="Recorded Wins"
          value={summary?.total_wins || 0}
          subtitle="Decisive match results"
          icon={Activity}
          color="rose"
        />
      </div>

      {/* PIE CHARTS ROW (New Data Visualizations) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Toss Decision Pie */}
        <div className="clean-card p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Disc className="w-4 h-4 text-[#FB542B]" />
                <span>Toss Decision Share</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Bat vs Field preference</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.toss_decision_pie || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {(charts?.toss_decision_pie || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={TOSS_COLORS[index % TOSS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} Matches`, 'Decisions']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Match Outcome Pie */}
        <div className="clean-card p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Trophy className="w-4 h-4 text-emerald-500" />
                <span>Win Condition Breakdown</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Chasing vs Defending vs Ties</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.match_outcome_pie || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {(charts?.match_outcome_pie || []).map((_, index) => (
                    <Cell key={`cell-out-${index}`} fill={OUTCOME_COLORS[index % OUTCOME_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} Matches`, 'Outcomes']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Boundary & Run Share Pie */}
        <div className="clean-card p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Boundary & Run Share</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">4s vs 6s vs Running vs Extras</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.boundary_share_pie || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {(charts?.boundary_share_pie || []).map((entry, index) => (
                    <Cell key={`cell-bound-${index}`} fill={entry.color || BOUNDARY_COLORS[index % BOUNDARY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toLocaleString()} Runs`, 'Scoring Contribution']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Matches Per Season */}
        <div className="clean-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Matches Per Season</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Historical match volume from 2008 to 2026</p>
            </div>
            <span className="text-xs font-semibold bg-[#434FCF]/10 text-[#434FCF] dark:text-indigo-400 px-2.5 py-1 rounded-lg border border-[#434FCF]/20">
              {charts?.season_matches.length} Seasons
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.season_matches}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="season" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-30} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="matches" fill="#434FCF" radius={[4, 4, 0, 0]} name="Total Matches" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Teams by Wins */}
        <div className="clean-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Team Victories Leaderboard</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Highest win count across all recorded matches</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.team_wins} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="team" type="category" width={130} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="wins" fill="#10b981" radius={[0, 4, 4, 0]} name="Total Wins" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Season Scoring Trends */}
        <div className="clean-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Season Run Scoring & Extra Trends</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Aggregate runs and extra runs conceded per IPL season</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.season_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="season" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-30} textAnchor="end" height={40} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line yAxisId="left" type="monotone" dataKey="total_runs" stroke="#FB542B" strokeWidth={2.5} name="Total Runs" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="extra_runs" stroke="#F59E0B" strokeWidth={2} name="Extra Runs" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
