import React, { useEffect, useState } from 'react';
import { Activity, Trophy, Users, Layers, Calendar, RotateCcw } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            IPL Master Overview & Analytics
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Verified database metrics across 19 IPL seasons (2007/08 to 2026)
          </p>
        </div>

        {/* Global Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Season:</span>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Seasons</option>
              {summary?.available_seasons.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {(selectedSeason !== 'All' || selectedTeam !== 'All') && (
            <button
              onClick={handleReset}
              className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Matches Per Season */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Matches Per Season</h3>
              <p className="text-xs text-slate-500">Historical match volume from 2008 to 2026</p>
            </div>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg">
              {charts?.season_matches.length} Seasons
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.season_matches}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="season" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-30} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="matches" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Total Matches" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Teams by Wins */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Team Victories Leaderboard</h3>
              <p className="text-xs text-slate-500">Highest win count across all recorded matches</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.team_wins} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="team" type="category" width={130} tick={{ fontSize: 10, fill: '#334155' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="wins" fill="#10b981" radius={[0, 4, 4, 0]} name="Total Wins" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Season Scoring Trends */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Season Run Scoring & Extra Trends</h3>
              <p className="text-xs text-slate-500">Aggregate runs and extra runs conceded per IPL season</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.season_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="season" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-30} textAnchor="end" height={40} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line yAxisId="left" type="monotone" dataKey="total_runs" stroke="#4f46e5" strokeWidth={2.5} name="Total Runs" />
                <Line yAxisId="right" type="monotone" dataKey="extra_runs" stroke="#f59e0b" strokeWidth={2} name="Extra Runs" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
