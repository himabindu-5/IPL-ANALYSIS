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
import { fetchStatus } from './services/api';
import type { StatusResponse } from './types';

export function App() {
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* Top Header Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} status={status} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <DashboardPage onSelectPlayer={handleSelectPlayer} />}
        {activeTab === 'matches' && <MatchesPage />}
        {activeTab === 'players' && <PlayersPage />}
        {activeTab === 'teams' && <TeamsPage />}
        {activeTab === 'batting' && <BattingPage />}
        {activeTab === 'bowling' && <BowlingPage />}
        {activeTab === 'h2h' && <HeadToHeadPage />}
        {activeTab === 'quality' && <QualityReportPage />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-700">
            IPL Analytics Platform • Comprehensive Cricket Data Engine (2008–2026)
          </p>
          <p className="mt-1 text-slate-400">
            Dataset: 1,243 matches • 295,732 deliveries • 809 players • 27,909 aliases
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
