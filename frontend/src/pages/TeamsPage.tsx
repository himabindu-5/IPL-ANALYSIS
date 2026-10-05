import React, { useEffect, useState } from 'react';
import { Shield, ChevronRight } from 'lucide-react';
import { fetchTeams, fetchTeamProfile } from '../services/api';
import type { TeamsListResponse, TeamProfile } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { TeamLogo } from '../components/TeamLogo';

export const TeamsPage: React.FC = () => {
  const [data, setData] = useState<TeamsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teamProfile, setTeamProfile] = useState<TeamProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const res = await fetchTeams();
      setData(res);
      if (res.teams.length > 0) {
        openTeamProfile(res.teams[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openTeamProfile = async (teamName: string) => {
    setSelectedTeam(teamName);
    setProfileLoading(true);
    try {
      const profile = await fetchTeamProfile(teamName);
      setTeamProfile(profile);
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  if (loading || !data) return <LoadingSpinner message="Loading team statistics..." />;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          Franchise & Team Analytics
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Comprehensive season records, win percentages, and match results across all 19 IPL franchises
        </p>
      </div>

      {/* Main Grid: Team Selector + Active Team Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Team List Cards */}
        <div className="space-y-3 max-h-[800px] overflow-y-auto pr-1">
          {data.overview.map((t) => {
            const winRate = t.matches > 0 ? ((t.wins / t.matches) * 100).toFixed(1) : '0';
            const isSelected = selectedTeam === t.team;
            return (
              <div
                key={t.team}
                onClick={() => openTeamProfile(t.team)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <TeamLogo teamName={t.team} size="md" />
                    <h3 className="font-extrabold text-sm line-clamp-1">{t.team}</h3>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className={`text-[10px] uppercase font-semibold block ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>Matches</span>
                    <span className="font-black text-sm">{t.matches}</span>
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase font-semibold block ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>Wins</span>
                    <span className="font-black text-sm">{t.wins}</span>
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase font-semibold block ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>Win %</span>
                    <span className="font-black text-sm">{winRate}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Team Profile */}
        <div className="lg:col-span-2 space-y-6">
          {profileLoading || !teamProfile ? (
            <LoadingSpinner message="Fetching franchise profile..." />
          ) : (
            <div className="space-y-6">
              
              {/* Franchise Banner with Team Logo */}
              <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800">
                <div className="flex items-center space-x-4">
                  <TeamLogo teamName={teamProfile.team_name} size="xl" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">IPL Franchise Profile</span>
                    <h2 className="text-2xl font-black tracking-tight mt-0.5">{teamProfile.team_name}</h2>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Total Matches</span>
                    <div className="text-xl font-black mt-0.5">{teamProfile.overall?.matches || 0}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Total Wins</span>
                    <div className="text-xl font-black text-emerald-400 mt-0.5">{teamProfile.overall?.wins || 0}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Total Losses</span>
                    <div className="text-xl font-black text-rose-400 mt-0.5">{teamProfile.overall?.losses || 0}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Ties / No Result</span>
                    <div className="text-xl font-black text-amber-400 mt-0.5">{teamProfile.overall?.no_result_or_tie || 0}</div>
                  </div>
                </div>
              </div>

              {/* Season-by-Season Performance Table */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Season-by-Season Track Record</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Season</th>
                        <th className="p-3 text-right">Matches</th>
                        <th className="p-3 text-right">Wins</th>
                        <th className="p-3 text-right">Losses</th>
                        <th className="p-3 text-right">No Result</th>
                        <th className="p-3 text-right">Win %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {teamProfile.seasons.map((s, idx) => {
                        const wr = s.matches > 0 ? ((s.wins / s.matches) * 100).toFixed(1) : '0';
                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-900">{s.season}</td>
                            <td className="p-3 text-right text-slate-700">{s.matches}</td>
                            <td className="p-3 text-right font-bold text-emerald-600">{s.wins}</td>
                            <td className="p-3 text-right text-rose-600">{s.losses}</td>
                            <td className="p-3 text-right text-slate-500">{s.no_result_or_tie}</td>
                            <td className="p-3 text-right font-extrabold text-slate-900">{wr}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Franchise Top Batters */}
              {teamProfile.top_batters.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <TeamLogo teamName={teamProfile.team_name} size="sm" />
                    <span>All-Time Top Batters for {teamProfile.team_name}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {teamProfile.top_batters.map((b, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{b.batter}</div>
                          <div className="text-[11px] text-slate-500">{b.matches} matches played</div>
                        </div>
                        <div className="text-right">
                          <div className="font-extrabold text-indigo-600 text-sm">{b.total_runs.toLocaleString()} runs</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

    </div>
  );
};
