import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { MatchesPage } from './pages/MatchesPage';
import { PlayersPage } from './pages/PlayersPage';
import { TeamsPage } from './pages/TeamsPage';
import { BattingPage } from './pages/BattingPage';
import { BowlingPage } from './pages/BowlingPage';
import { HeadToHeadPage } from './pages/HeadToHeadPage';
import { QualityReportPage } from './pages/QualityReportPage';
import { AuctionPage } from './pages/AuctionPage';
import { fetchStatus } from './services/api';
import type { StatusResponse } from './types';
import { ThemeProvider } from './context/ThemeContext';

export function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [status, setStatus] = useState<StatusResponse | null>(null);

  useEffect(() => {
    fetchStatus()
      .then((res) => setStatus(res))
      .catch((err) => console.error(err));
  }, []);

  const handleSelectPlayer = () => {
    setActiveTab('players');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080A10] flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Header Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} status={status} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <DashboardPage onSelectPlayer={handleSelectPlayer} />}
        {activeTab === 'auction' && <AuctionPage />}
        {activeTab === 'matches' && <MatchesPage />}
        {activeTab === 'players' && <PlayersPage />}
        {activeTab === 'teams' && <TeamsPage />}
        {activeTab === 'batting' && <BattingPage />}
        {activeTab === 'bowling' && <BowlingPage />}
        {activeTab === 'h2h' && <HeadToHeadPage />}
        {activeTab === 'quality' && <QualityReportPage />}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#0a0d17] border-t border-slate-200 dark:border-slate-800 py-8 mt-12 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="font-extrabold text-sm text-slate-800 dark:text-white">
              IPL<span className="text-[#FB542B]">.</span>Analytics
            </span>
            <span className="text-[10px] bg-[#FB542B]/10 text-[#FB542B] px-2 py-0.5 rounded-full font-bold border border-[#FB542B]/30">
              AI Squad War Room
            </span>
          </div>
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Comprehensive Cricket Data Engine (2008–2026) • Inspired by Brave UI
          </p>
          <p className="mt-1 text-slate-400 dark:text-slate-500 font-mono text-[11px]">
            1,243 matches • 295,732 deliveries • 809 players • 10 IPL Franchises • 100% Real Scraped Data
          </p>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
