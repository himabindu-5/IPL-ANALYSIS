import React, { useEffect, useState } from 'react';
import { 
  Sparkles, Users, Award, ShieldAlert, ArrowRightLeft, 
  HelpCircle, Flame, PieChart as PieIcon, Layers
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { fetchAuctionFranchises, fetchAuctionTeam } from '../services/api';
import type { FranchiseMeta, AuctionTeamProfileResponse, SquadPlayer } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { TeamLogo } from '../components/TeamLogo';

export const AuctionPage: React.FC = () => {
  const [franchises, setFranchises] = useState<FranchiseMeta[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('Chennai Super Kings');
  const [teamData, setTeamData] = useState<AuctionTeamProfileResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<SquadPlayer | null>(null);
  const [activeTab, setActiveTab] = useState<'roster' | 'trades' | 'xi'>('roster');

  // Load list of franchises on mount
  useEffect(() => {
    fetchAuctionFranchises()
      .then((data) => {
        setFranchises(data);
        if (data.length > 0 && !selectedTeam) {
          setSelectedTeam(data[0].name);
        }
      })
      .catch((err) => {
        console.error('Failed to load auction franchises', err);
      });
  }, []);

  // Load team auction profile when selectedTeam changes
  useEffect(() => {
    if (!selectedTeam) return;
    setLoading(true);
    setError(null);
    fetchAuctionTeam(selectedTeam)
      .then((data) => {
        setTeamData(data);
        if (data.squad.length > 0) {
          setSelectedPlayer(data.squad[0]);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load auction profile');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedTeam]);

  const ROLE_COLORS: Record<string, string> = {
    'Batter': '#3B82F6',
    'Fast Bowler': '#EF4444',
    'Spin Bowler': '#8B5CF6',
    'All-Rounder': '#10B981',
    'Wicketkeeper': '#F59E0B'
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="relative overflow-hidden clean-card p-6 sm:p-8 border border-orange-500/30 bg-gradient-to-r from-slate-900 via-[#101426] to-[#0A0D18] text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#FB542B]/15 to-[#434FCF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FB542B]/20 border border-[#FB542B]/40 text-[#FB542B] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI War Room & Empirical Valuation</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              IPL Auction Intelligence Hub
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl">
              Real-time franchise budget tracker, player forte identification, empirical price-to-performance valuation formula, and AI rival trade recommendations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Official Purse Cap</span>
              <span className="text-xl sm:text-2xl font-black text-white">₹120.0 Cr</span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Real Data Engine</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400">295k Balls</span>
            </div>
          </div>
        </div>
      </div>

      {/* Franchise Selector Tabs */}
      <div className="overflow-x-auto no-scrollbar pb-2">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-max">
          {franchises.map((f) => {
            const isSelected = selectedTeam === f.name || selectedTeam === f.short_name;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedTeam(f.name)}
                className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#FB542B] to-[#E0350B] text-white border-transparent shadow-lg shadow-orange-500/25 scale-102 ring-2 ring-[#FB542B]/40'
                    : 'clean-card text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <TeamLogo teamName={f.name} size="sm" />
                </div>
                <span>{f.short_name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}

      {teamData && !loading && (
        <div className="space-y-8">
          
          {/* Franchise Header & Purse Metrics Bar */}
          <div className="clean-card p-6 sm:p-7">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 p-2 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner">
                  <TeamLogo teamName={teamData.team_info.name} size="lg" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                      {teamData.team_info.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-xs" style={{ backgroundColor: teamData.team_info.primary_color }}>
                      {teamData.team_info.short_name}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>Captain: <strong className="text-slate-800 dark:text-slate-200">{teamData.team_info.captain}</strong></span>
                    <span>•</span>
                    <span>Venue: <strong className="text-slate-800 dark:text-slate-200">{teamData.team_info.home_venue}</strong></span>
                  </p>
                </div>
              </div>

              {/* 4 Financial & Composition KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Purse Spent</span>
                  <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">₹{teamData.team_info.total_spent_cr} Cr</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{((teamData.team_info.total_spent_cr / 120.0) * 100).toFixed(0)}% of ₹120 Cr</span>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Remaining Purse</span>
                  <span className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400">₹{teamData.team_info.remaining_purse_cr} Cr</span>
                  <span className="text-[10px] text-emerald-600/80 dark:text-emerald-500 block mt-0.5">Available for Auction</span>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Squad Size</span>
                  <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">{teamData.team_info.squad_size} Players</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Target: 18–25</span>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Overseas Slots</span>
                  <span className="text-lg sm:text-xl font-extrabold text-indigo-600 dark:text-indigo-400">{teamData.team_info.overseas_count} / {teamData.team_info.max_overseas}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{teamData.team_info.max_overseas - teamData.team_info.overseas_count} Slots Open</span>
                </div>
              </div>
            </div>

            {/* Valuation Formula Banner */}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-orange-900/10 border border-indigo-500/20 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-start space-x-3">
                <HelpCircle className="w-5 h-5 text-[#FB542B] shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                      {teamData.valuation_formula.formula_name}
                    </span>
                    <div className="flex items-center space-x-3 text-[11px] font-semibold">
                      <span className="text-emerald-500 flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        <span>Steal (≥125%)</span>
                      </span>
                      <span className="text-blue-500 flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                        <span>Fair (85-125%)</span>
                      </span>
                      <span className="text-amber-500 flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                        <span>Overpaid (&lt;85%)</span>
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs font-mono">
                    {teamData.valuation_formula.impact_equation}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs font-mono">
                    {teamData.valuation_formula.fair_value_equation} | {teamData.valuation_formula.vfm_equation}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sub Navigation: Roster & Valuation, Trade Simulator, Optimal XI */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('roster')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'roster'
                    ? 'bg-[#FB542B] text-white shadow-md shadow-orange-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Squad Roster & Valuation ({teamData.squad.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('trades')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'trades'
                    ? 'bg-[#FB542B] text-white shadow-md shadow-orange-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Trade Window & Deficits ({teamData.recommended_trades.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('xi')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'xi'
                    ? 'bg-[#FB542B] text-white shadow-md shadow-orange-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>AI Optimal Playing XI</span>
              </button>
            </div>
          </div>

          {/* TAB 1: SQUAD ROSTER & VALUATION */}
          {activeTab === 'roster' && (
            <div className="space-y-6">
              
              {/* Spend Chart and Player Spotlight */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Spend Allocation Donut */}
                <div className="clean-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <PieIcon className="w-4 h-4 text-[#FB542B]" />
                      <span>Spend by Role</span>
                    </h3>
                    <span className="text-xs text-slate-400">Total: ₹{teamData.team_info.total_spent_cr} Cr</span>
                  </div>
                  
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={teamData.spend_by_role}
                          dataKey="spent_cr"
                          nameKey="role"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                        >
                          {teamData.spend_by_role.map((entry) => (
                            <Cell key={entry.role} fill={ROLE_COLORS[entry.role] || '#64748B'} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => [`₹${Number(value).toFixed(2)} Cr`, 'Purse Spent']}
                          contentStyle={{ backgroundColor: '#0d111c', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Player Forte & Valuation Spotlight */}
                <div className="lg:col-span-2 clean-card p-6 flex flex-col justify-between">
                  {selectedPlayer ? (
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                              {selectedPlayer.player}
                            </span>
                            {selectedPlayer.is_overseas && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/30">
                                ✈️ Overseas
                              </span>
                            )}
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white" style={{ backgroundColor: ROLE_COLORS[selectedPlayer.role] || '#64748B' }}>
                              {selectedPlayer.role}
                            </span>
                          </div>
                          
                          {/* Forte Badge */}
                          <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-orange-500/10 border border-orange-500/30 text-[#FB542B] text-xs font-bold">
                            <Flame className="w-3.5 h-3.5" />
                            <span>Forte: {selectedPlayer.forte}</span>
                          </div>
                        </div>

                        {/* Price & Valuation Badge */}
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <span className="text-[11px] text-slate-400 font-semibold block">Auction Price</span>
                            <span className="text-lg font-black text-slate-900 dark:text-white">₹{selectedPlayer.price_cr} Cr</span>
                          </div>
                          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                          <div className="text-right">
                            <span className="text-[11px] text-slate-400 font-semibold block">Implied Fair Value</span>
                            <span className="text-lg font-black text-indigo-500">₹{selectedPlayer.fair_value_cr} Cr</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats & Empirical Phase Highlights */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                          <span className="text-[11px] text-slate-400 block font-semibold">Career Runs</span>
                          <span className="text-base font-extrabold text-slate-900 dark:text-white">{selectedPlayer.career_runs.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-500 block">SR: {selectedPlayer.strike_rate}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                          <span className="text-[11px] text-slate-400 block font-semibold">Career Wickets</span>
                          <span className="text-base font-extrabold text-slate-900 dark:text-white">{selectedPlayer.career_wickets}</span>
                          <span className="text-[10px] text-slate-500 block">Econ: {selectedPlayer.economy || '—'}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                          <span className="text-[11px] text-slate-400 block font-semibold">Death Phase Impact</span>
                          <span className="text-base font-extrabold text-[#FB542B]">
                            {selectedPlayer.death_sr > 0 ? `${selectedPlayer.death_sr} SR` : selectedPlayer.death_econ > 0 ? `${selectedPlayer.death_econ} Econ` : 'N/A'}
                          </span>
                          <span className="text-[10px] text-slate-500 block">Overs 16–20 empirical</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                          <span className="text-[11px] text-slate-400 block font-semibold">VFM % Index</span>
                          <span className={`text-base font-extrabold ${
                            selectedPlayer.vfm_index >= 125 ? 'text-emerald-500' : selectedPlayer.vfm_index >= 85 ? 'text-blue-500' : 'text-amber-500'
                          }`}>
                            {selectedPlayer.vfm_index}%
                          </span>
                          <span className="text-[10px] text-slate-500 block">{selectedPlayer.roi_status}</span>
                        </div>
                      </div>

                      {/* Formula Equating Calculation Card */}
                      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                          Empirical Valuation Equating Result:
                        </span>
                        <p className="text-slate-600 dark:text-slate-300">
                          Total Impact Score: <strong>{selectedPlayer.impact_score} pts</strong> computed from {selectedPlayer.career_runs} runs + {selectedPlayer.career_wickets} wkts + {selectedPlayer.player_of_match_awards} Player of Match awards + phase mastery. 
                          {selectedPlayer.vfm_index >= 125 
                            ? ' Delivers exceptional return over auction investment (Steal Buy).'
                            : selectedPlayer.vfm_index >= 85 
                              ? ' Return is commensurate with price paid (Fair Valuation).'
                              : ' Highly priced relative to historical delivery output (High-Risk Investment).'
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">Select a player from the squad below to inspect deep metrics</div>
                  )}
                </div>
              </div>

              {/* Squad Valuation Table */}
              <div className="clean-card overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Franchise Squad Valuation & Forte Matrix
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Click any player row to inspect radar and phase breakdowns
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                      <tr>
                        <th className="py-3 px-4">Player</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Empirical Forte</th>
                        <th className="py-3 px-4 text-right">Runs / SR</th>
                        <th className="py-3 px-4 text-right">Wkts / Econ</th>
                        <th className="py-3 px-4 text-right">Auction Cost</th>
                        <th className="py-3 px-4 text-right">Fair Value</th>
                        <th className="py-3 px-4 text-right">VFM %</th>
                        <th className="py-3 px-4 text-center">ROI Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {teamData.squad.map((p) => {
                        const isSelected = selectedPlayer?.player === p.player;
                        return (
                          <tr
                            key={p.player}
                            onClick={() => setSelectedPlayer(p)}
                            className={`cursor-pointer transition-colors duration-150 ${
                              isSelected
                                ? 'bg-orange-500/10 dark:bg-orange-500/15 font-semibold'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <span>{p.player}</span>
                                {p.is_overseas && (
                                  <span className="text-[10px] text-blue-500 font-bold">✈️</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: ROLE_COLORS[p.role] || '#64748B' }}>
                                {p.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="text-xs font-semibold text-[#FB542B]">
                                {p.forte}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <span className="font-bold">{p.career_runs}</span>
                              {p.strike_rate > 0 && <span className="text-slate-400 text-xs ml-1">({p.strike_rate})</span>}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <span className="font-bold">{p.career_wickets}</span>
                              {p.economy > 0 && <span className="text-slate-400 text-xs ml-1">({p.economy})</span>}
                            </td>
                            <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                              ₹{p.price_cr} Cr
                            </td>
                            <td className="py-3.5 px-4 text-right font-extrabold text-indigo-500 whitespace-nowrap">
                              ₹{p.fair_value_cr} Cr
                            </td>
                            <td className="py-3.5 px-4 text-right font-extrabold whitespace-nowrap">
                              <span className={p.vfm_index >= 125 ? 'text-emerald-500' : p.vfm_index >= 85 ? 'text-blue-500' : 'text-amber-500'}>
                                {p.vfm_index}%
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                p.roi_status.includes('Steal')
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                                  : p.roi_status.includes('Fair')
                                    ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
                                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                              }`}>
                                {p.roi_status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRADE WINDOW SIMULATOR & DEFICITS */}
          {activeTab === 'trades' && (
            <div className="space-y-6">
              
              {/* Franchise Deficit Diagnosis */}
              <div className="clean-card p-6 border-l-4 border-l-amber-500">
                <div className="flex items-center space-x-2.5 text-amber-500 font-bold text-sm mb-3">
                  <ShieldAlert className="w-5 h-5" />
                  <span>Franchise Tactical Deficit Diagnosis (Empirical Delivery Audit)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamData.team_deficits.map((d, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-start space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Trades from Other Franchises */}
              <div className="clean-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <ArrowRightLeft className="w-5 h-5 text-[#FB542B]" />
                      <span>Rival Franchise Target Acquisitions & Best Fits</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Data-driven trades designed to address roster bottlenecks using real player performance
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-500 text-xs font-bold">
                    Official Trade Window Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {teamData.recommended_trades.map((t, idx) => (
                    <div key={idx} className="clean-card p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-[#FB542B]/50 transition-all">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Current Team: {t.team}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            t.trade_feasibility === 'High' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' :
                            t.trade_feasibility === 'Medium' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30' :
                            'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                          }`}>
                            {t.trade_feasibility} Feasibility
                          </span>
                        </div>

                        <div className="mt-3">
                          <h4 className="text-xl font-black text-slate-900 dark:text-white">{t.target}</h4>
                          <span className="text-xs text-indigo-500 font-semibold">{t.role} • ₹{t.price_cr} Cr</span>
                        </div>

                        <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                            Projected Impact Gain
                          </span>
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {t.impact_gain}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] text-slate-400 font-semibold block">Proposed Trade Deal</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                          {t.swap_offer}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI OPTIMAL PLAYING XI ARCHITECT */}
          {activeTab === 'xi' && (
            <div className="space-y-6">
              
              <div className="clean-card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <Award className="w-5 h-5 text-[#FB542B]" />
                      <span>Empirical Optimal Playing XI</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Computed lineup respecting BCCI IPL constraints: max 4 overseas players, 1 wicketkeeper, and minimum 5 bowling options.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-bold">
                    <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                      ✓ 4 Overseas Limit Met
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/30">
                      ✓ Wicketkeeper Included
                    </span>
                  </div>
                </div>

                {/* XI Lineup Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {teamData.optimal_playing_xi.map((player, idx) => (
                    <div 
                      key={player.player}
                      className="clean-card p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:scale-101 transition-transform"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 font-black text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white">{player.player}</span>
                            {player.is_overseas && <span className="text-[10px] text-blue-500">✈️</span>}
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                            {player.role} • {player.forte}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-extrabold text-[#FB542B] block">
                          {player.impact_score} pts
                        </span>
                        <span className="text-[10px] text-slate-400">Impact</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Impact Player Sub */}
                {teamData.impact_player_sub && (
                  <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-indigo-500/10 border border-orange-500/30 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FB542B] text-white flex items-center justify-center font-black text-sm">
                        SUB
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#FB542B] block">
                          Designated Impact Player
                        </span>
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {teamData.impact_player_sub.player} ({teamData.impact_player_sub.role})
                        </span>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {teamData.impact_player_sub.forte}
                      </span>
                      <span className="text-[10px] text-slate-400">Tactical Substitution</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
