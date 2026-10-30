import React, { useState } from 'react';
import { 
  Activity, Trophy, Users, Shield, Zap, Target, Search, CheckCircle2, Database, 
  Menu, X, Sun, Moon, Flame, Sparkles
} from 'lucide-react';
import type { StatusResponse } from '../types';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  status: StatusResponse | null;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, status }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'auction', label: 'Auction Intelligence', icon: Sparkles, badge: 'AI War Room', highlight: true },
    { id: 'matches', label: 'Matches & Seasons', icon: Trophy },
    { id: 'players', label: 'Player Directory', icon: Users },
    { id: 'teams', label: 'Team Analysis', icon: Shield },
    { id: 'batting', label: 'Batting Analytics', icon: Zap },
    { id: 'bowling', label: 'Bowling Analytics', icon: Target },
    { id: 'h2h', label: 'Head-to-Head', icon: Search },
    { id: 'quality', label: 'Data Quality & Audit', icon: CheckCircle2 },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-[#0a0d17]/90 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & App Title */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group select-none" 
            onClick={() => handleTabClick('dashboard')}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FB542B] to-[#434FCF] p-[2px] shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0a0d17] rounded-[14px] flex items-center justify-center text-white">
                <Trophy className="w-5 h-5 text-[#FB542B]" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  IPL<span className="text-[#FB542B]">.</span>Analytics
                </span>
                <span className="bg-[#FB542B]/10 text-[#FB542B] dark:text-[#FB542B] text-[11px] font-bold px-2 py-0.5 rounded-full border border-[#FB542B]/30">
                  2008–2026
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Empirical Cricket Intelligence & AI Valuation
              </p>
            </div>
          </div>

          {/* Right Header Actions: Theme Switcher, DB badge, Mobile Hamburger */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* 3-Mode Theme Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-full border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <button
                onClick={() => setTheme('light')}
                title="Light Mode"
                className={`p-1.5 rounded-full text-xs transition-all ${
                  theme === 'light' 
                    ? 'bg-white text-amber-500 shadow-xs' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                title="Dark Mode"
                className={`p-1.5 rounded-full text-xs transition-all ${
                  theme === 'dark' 
                    ? 'bg-slate-700 text-indigo-300 shadow-xs' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('brave')}
                title="Brave Cyber Mode"
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[11px] font-bold transition-all ${
                  theme === 'brave' 
                    ? 'bg-gradient-to-r from-[#FB542B] to-[#434FCF] text-white shadow-md shadow-orange-500/20' 
                    : 'text-slate-400 hover:text-[#FB542B]'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Brave</span>
              </button>
            </div>

            {/* Database Connection Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700/60 text-xs font-medium text-slate-600 dark:text-slate-300">
              <Database className={`w-3.5 h-3.5 ${status?.database_mode === 'postgresql' ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span className="capitalize">{status?.database_mode || 'DB'}</span>
              <span className={`w-2 h-2 rounded-full ${status?.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-hidden transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-[#FB542B]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Tab Navigation Bar */}
        <nav className="hidden md:flex space-x-1 overflow-x-auto no-scrollbar py-2 border-t border-slate-100 dark:border-slate-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? tab.highlight 
                      ? 'bg-gradient-to-r from-[#FB542B] to-[#E0350B] text-white shadow-md shadow-orange-500/25 ring-2 ring-[#FB542B]/30'
                      : 'bg-[#434FCF] text-white shadow-sm ring-2 ring-[#434FCF]/30'
                    : tab.highlight
                      ? 'text-[#FB542B] bg-[#FB542B]/10 hover:bg-[#FB542B]/20 border border-[#FB542B]/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.highlight ? 'text-[#FB542B]' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && !isActive && (
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-[#FB542B] text-white font-extrabold animate-pulse">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d111c] px-4 pt-3 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1">
            Analytics Navigation
          </div>
          <div className="grid grid-cols-1 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? tab.highlight
                        ? 'bg-gradient-to-r from-[#FB542B] to-[#E0350B] text-white shadow-md'
                        : 'bg-[#434FCF] text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.highlight ? 'text-[#FB542B]' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#FB542B]/10 text-[#FB542B] border border-[#FB542B]/30'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-2">
              <Database className="w-3.5 h-3.5 text-[#FB542B]" />
              <span>DB: <strong className="capitalize">{status?.database_mode || 'SQLite'}</strong></span>
            </div>
            <div className="text-[11px] font-medium text-emerald-500 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
              <span>100% Real Scraped Data</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
