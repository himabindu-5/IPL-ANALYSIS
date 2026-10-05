import React from 'react';
import { Activity, Trophy, Users, Shield, Zap, Target, Search, CheckCircle2, Database } from 'lucide-react';
import type { StatusResponse } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  status: StatusResponse | null;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, status }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'matches', label: 'Matches & Seasons', icon: Trophy },
    { id: 'players', label: 'Player Directory', icon: Users },
    { id: 'teams', label: 'Team Analysis', icon: Shield },
    { id: 'batting', label: 'Batting Analytics', icon: Zap },
    { id: 'bowling', label: 'Bowling Analytics', icon: Target },
    { id: 'h2h', label: 'Head-to-Head', icon: Search },
    { id: 'quality', label: 'Data Quality & Audit', icon: CheckCircle2 },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & App Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">IPL Insights</span>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                  2008–2026
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Complete Indian Premier League Historical Analytics
              </p>
            </div>
          </div>

          {/* Database Connection Badge */}
          <div className="hidden lg:flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700">
            <Database className={`w-3.5 h-3.5 ${status?.database_mode === 'postgresql' ? 'text-emerald-500' : 'text-amber-500'}`} />
            <span>DB: <strong className="capitalize">{status?.database_mode || 'Loading...'}</strong></span>
            {status?.database_mode === 'postgresql' ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                Local SQLite Fallback
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto no-scrollbar py-2 border-t border-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
