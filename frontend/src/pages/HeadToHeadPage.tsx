import React, { useEffect, useState } from 'react';
import { Swords, Zap, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { fetchHeadToHead, fetchTeams } from '../services/api';
import type { HeadToHeadResponse } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { TeamLogo } from '../components/TeamLogo';

export const HeadToHeadPage: React.FC = () => {
  const [teamsList, setTeamsList] = useState<string[]>([]);
  const [team1, setTeam1] = useState('Chennai Super Kings');
  const [team2, setTeam2] = useState('Mumbai Indians');
  const [data, setData] = useState<HeadToHeadResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTeams = async () => {
    try {
      const res = await fetchTeams();
      setTeamsList(res.teams);
    } catch (err) {
      console.error(err);
    }
  };

  const loadH2H = async () => {
    if (!team1 || !team2 || team1 === team2) {
      setError('Please select two different teams for comparison');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetchHeadToHead(team1, team2);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load head-to-head data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    loadH2H();
  }, [team1, team2]);

  const handleSwap = () => {
    const temp = team1;
    setTeam1(team2);
    setTeam2(temp);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Team Selection Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Swords className="w-5 h-5 text-indigo-600" />
            Head-to-Head Team Comparison & Rivalry Insights
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Compare historical records, match victories, highest scores, and best bowling performances between any two franchises
          </p>
        </div>

        {/* Team Selectors with TeamLogos */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Team 1</label>
            <div className="flex items-center space-x-2 bg-white border border-slate-300 p-1.5 rounded-xl">
              <TeamLogo teamName={team1} size="md" />
              <select
                value={team1}
                onChange={(e) => setTeam1(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {teamsList.map((t) => (
                  <option key={t} value={t} disabled={t === team2}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSwap}
            className="p-2.5 rounded-xl bg-white border border-slate-300 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-all font-bold text-xs"
            title="Swap Teams"
          >
            VS ⇄
          </button>

          <div className="flex-1 w-full">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Team 2</label>
            <div className="flex items-center space-x-2 bg-white border border-slate-300 p-1.5 rounded-xl">
              <TeamLogo teamName={team2} size="md" />
              <select
                value={team2}
                onChange={(e) => setTeam2(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {teamsList.map((t) => (
                  <option key={t} value={t} disabled={t === team1}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Calculating head-to-head statistics..." />
      ) : data && (
        <div className="space-y-6">
          
          {/* Main Rivalry Summary Banner with Logos */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800">
            <div className="text-center text-xs font-bold uppercase tracking-wider text-indigo-400 mb-4">Rivalry Overview</div>
            
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
              
              {/* Team 1 Card */}
              <div className="flex flex-col items-center text-center">
                <TeamLogo teamName={data.team1} size="xl" className="mb-2" />
                <div className="text-3xl font-black text-indigo-400">{data.summary.team1_wins}</div>
                <div className="text-sm font-bold text-slate-200 mt-1">{data.team1} Wins</div>
              </div>

              {/* Total Matches Badge */}
              <div className="px-5 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                <div className="text-xs text-slate-400 font-semibold uppercase">Total Encounters</div>
                <div className="text-2xl font-black text-white mt-0.5">{data.summary.total_matches}</div>
              </div>

              {/* Team 2 Card */}
              <div className="flex flex-col items-center text-center">
                <TeamLogo teamName={data.team2} size="xl" className="mb-2" />
                <div className="text-3xl font-black text-emerald-400">{data.summary.team2_wins}</div>
                <div className="text-sm font-bold text-slate-200 mt-1">{data.team2} Wins</div>
              </div>
            </div>
          </div>

          {/* Key Individual Match Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Highest Score */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
              {data.highest_individual_score ? (
                <TeamLogo teamName={data.highest_individual_score.batting_team} size="lg" />
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl text-amber-600">
                  <Zap className="w-6 h-6" />
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Highest Individual Score</span>
                {data.highest_individual_score ? (
                  <div>
                    <div className="text-lg font-black text-slate-900">
                      {data.highest_individual_score.runs} <span className="text-xs font-normal text-slate-500">runs ({data.highest_individual_score.balls} balls)</span>
                    </div>
                    <div className="text-xs font-semibold text-indigo-600">{data.highest_individual_score.batter} ({data.highest_individual_score.batting_team})</div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 font-italic">No individual score data available</div>
                )}
              </div>
            </div>

            {/* Best Bowling */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Best Bowling Performance</span>
                {data.best_bowling_figures ? (
                  <div>
                    <div className="text-lg font-black text-slate-900">
                      {data.best_bowling_figures.wickets} <span className="text-xs font-normal text-slate-500">wickets for {data.best_bowling_figures.runs} runs</span>
                    </div>
                    <div className="text-xs font-semibold text-emerald-600">{data.best_bowling_figures.bowler}</div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 font-italic">No bowling figures available</div>
                )}
              </div>
            </div>
          </div>

          {/* Charts Row: Season Breakdown & Win Distribution Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Season-by-Season Win Breakdown Chart */}
            {data.season_breakdown.length > 0 && (
              <div className="clean-card p-5 lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Season-by-Season H2H Wins Breakdown</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <TeamLogo teamName={data.team1} size="sm" />
                      <span>{data.team1}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <TeamLogo teamName={data.team2} size="sm" />
                      <span>{data.team2}</span>
                    </div>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.season_breakdown}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                      <XAxis dataKey="season" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="team1_wins" fill="#FB542B" radius={[4, 4, 0, 0]} name={`${data.team1} Wins`} />
                      <Bar dataKey="team2_wins" fill="#434FCF" radius={[4, 4, 0, 0]} name={`${data.team2} Wins`} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Win Share Donut Chart */}
            <div className="clean-card p-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Overall Rivalry Win Share</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">Dominance percentage across all matches</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: data.team1, value: data.summary.team1_wins, color: '#FB542B' },
                        { name: data.team2, value: data.summary.team2_wins, color: '#434FCF' },
                        ...(data.summary.no_results > 0 ? [{ name: 'No Result / Tie', value: data.summary.no_results, color: '#64748B' }] : [])
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      <Cell fill="#FB542B" />
                      <Cell fill="#434FCF" />
                      {data.summary.no_results > 0 && <Cell fill="#64748B" />}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} Wins`, 'Matches']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Encounters History Table with TeamLogos */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 font-bold text-sm text-slate-900">
              Complete Encounter History ({data.matches.length} Matches)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Season</th>
                    <th className="p-3">Venue</th>
                    <th className="p-3">Toss Winner</th>
                    <th className="p-3">Match Winner</th>
                    <th className="p-3">Player of Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {data.matches.map((m) => (
                    <tr key={m.match_id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{m.date}</td>
                      <td className="p-3">{m.season}</td>
                      <td className="p-3 text-slate-600">{m.venue}, {m.city}</td>
                      <td className="p-3 text-slate-600">{m.toss_winner} ({m.toss_decision})</td>
                      <td className="p-3">
                        {m.winner ? (
                          <div className="flex items-center space-x-2">
                            <TeamLogo teamName={m.winner} size="sm" />
                            <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${m.winner === data.team1 ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>
                              {m.winner}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-italic">No Result</span>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{m.player_of_match || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
