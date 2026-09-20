'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header, ActiveTab } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { MatchDetailModal } from '@/components/matches/MatchDetailModal';
import { HomeView } from '@/components/views/HomeView';
import { MatchesView } from '@/components/views/MatchesView';
import { PredictionsView } from '@/components/views/PredictionsView';
import { LeaguesView } from '@/components/views/LeaguesView';
import { StatisticsView } from '@/components/views/StatisticsView';
import { AdminView } from '@/components/views/AdminView';
import { AboutView } from '@/components/views/AboutView';
import { Modal } from '@/components/ui/Modal';
import { Lock, Sparkles, Key, CheckCircle2 } from 'lucide-react';
import { Match, League, Team, PredictionResult } from '@/types/football';
import { footballDataStore, footballApiService } from '@/services/footballApi';
import { teamService } from '@/services/teamService';
import { leagueService } from '@/services/leagueService';
import { getStoredWeights } from '@/lib/predictionConfig';

function MainApp() {
  const { showToast } = useToast();

  // Active view state
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [searchQuery, setSearchQuery] = useState('');

  // Data states initialized from in-memory store with lazy initializers
  const [matches, setMatches] = useState<Match[]>(() => footballDataStore.getMatchesSync());
  const [leagues, setLeagues] = useState<League[]>(() => leagueService.getAllLeaguesSync());
  const [teams, setTeams] = useState<Team[]>(() => teamService.getAllTeamsSync());
  const [results, setResults] = useState<PredictionResult[]>(() => footballDataStore.getHistoricalResultsSync());

  // Selected Match for full detail modal
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Live fixtures synchronization state
  const [fixturesSource, setFixturesSource] = useState<'api-football' | 'baseline'>('baseline');
  const [isLoadingFixtures, setIsLoadingFixtures] = useState(false);

  // Fetch real matches from /api/fixtures on mount
  const handleRefreshLiveFixtures = useCallback(async () => {
    setIsLoadingFixtures(true);
    try {
      const result = await footballApiService.fetchMatches();
      if (result.matches && result.matches.length > 0) {
        setMatches([...result.matches]);
        const src = result.source === 'api-football' ? 'api-football' : 'baseline';
        setFixturesSource(src);
        if (src === 'api-football') {
          showToast(`Synced ${result.total} real fixtures for today!`, 'success');
        } else {
          showToast(`Loaded ${result.total} match fixtures`, 'info');
        }
      }
    } catch (err) {
      console.warn('Failed to sync live fixtures:', err);
    } finally {
      setIsLoadingFixtures(false);
    }
  }, [showToast]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialFixtures() {
      setIsLoadingFixtures(true);
      try {
        const stored = footballDataStore.loadStoredData();
        if (isMounted && stored.matches && stored.matches.length > 0) {
          setMatches(stored.matches);
        }
        if (isMounted && stored.results && stored.results.length > 0) {
          setResults(stored.results);
        }

        const result = await footballApiService.fetchMatches();
        if (isMounted && result.matches && result.matches.length > 0) {
          setMatches([...result.matches]);
          const src = result.source === 'api-football' ? 'api-football' : 'baseline';
          setFixturesSource(src);
        }
      } catch (err) {
        console.warn('Failed to load initial fixtures:', err);
      } finally {
        if (isMounted) {
          setIsLoadingFixtures(false);
        }
      }
    }

    loadInitialFixtures();

    return () => {
      isMounted = false;
    };
  }, []);

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminError, setAdminError] = useState('');

  // Reload data on admin updates
  const handleRefreshData = useCallback(async () => {
    await handleRefreshLiveFixtures();
    const fetchedResults = await footballApiService.getPredictionResults();
    setResults([...fetchedResults]);
  }, [handleRefreshLiveFixtures]);

  // Open match analysis
  const handleViewAnalysis = (match: Match) => {
    setSelectedMatch(match);
    setIsDetailModalOpen(true);
  };

  // Switch navigation tabs
  const handleSelectTab = (tab: ActiveTab) => {
    if (tab === 'admin' && !isAdminAuthenticated) {
      setIsAdminLoginModalOpen(true);
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quick Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin pass for demo control is "admin123" or empty submission for demo convenience
    if (adminPasswordInput === 'admin123' || adminPasswordInput.toLowerCase() === 'admin' || adminPasswordInput === '') {
      setIsAdminAuthenticated(true);
      setIsAdminLoginModalOpen(false);
      setAdminPasswordInput('');
      setAdminError('');
      setActiveTab('admin');
      showToast('Welcome to GoalPredict AI Admin Panel', 'success');
    } else {
      setAdminError('Invalid passcode. Use "admin123" or click Quick Access.');
    }
  };

  const handleQuickDemoAdminLogin = () => {
    setIsAdminAuthenticated(true);
    setIsAdminLoginModalOpen(false);
    setAdminError('');
    setActiveTab('admin');
    showToast('Admin Session Activated (Demo Access)', 'success');
  };

  const handleLogoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setActiveTab('home');
    showToast('Signed out of admin panel', 'info');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] text-slate-100 font-sans selection:bg-purple-600 selection:text-white">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        isAdmin={isAdminAuthenticated}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        fixturesSource={fixturesSource}
        isLoadingFixtures={isLoadingFixtures}
        onRefreshFixtures={handleRefreshLiveFixtures}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'home' && (
          <HomeView
            matches={matches}
            leagues={leagues}
            results={results}
            onViewAnalysis={handleViewAnalysis}
            onNavigateTab={handleSelectTab}
          />
        )}

        {activeTab === 'matches' && (
          <MatchesView
            matches={matches}
            leagues={leagues}
            onViewAnalysis={handleViewAnalysis}
          />
        )}

        {activeTab === 'predictions' && (
          <PredictionsView
            matches={matches}
            onViewAnalysis={handleViewAnalysis}
          />
        )}

        {activeTab === 'leagues' && (
          <LeaguesView
            leagues={leagues}
            matches={matches}
            onViewAnalysis={handleViewAnalysis}
          />
        )}

        {activeTab === 'statistics' && (
          <StatisticsView results={results} />
        )}

        {activeTab === 'about' && (
          <AboutView onExploreMatches={() => handleSelectTab('matches')} />
        )}

        {activeTab === 'admin' && (
          <AdminView
            matches={matches}
            leagues={leagues}
            teams={teams}
            onRefreshMatches={handleRefreshData}
            onLogoutAdmin={handleLogoutAdmin}
          />
        )}
      </main>

      {/* Full Match Statistical Detail Modal */}
      <MatchDetailModal
        match={selectedMatch}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

      {/* Admin Authentication Modal */}
      <Modal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        maxWidth="sm"
        title="Admin Dashboard Access"
        subtitle="Authenticate to manage fixtures, tune Poisson factor weights, and configure APIs."
      >
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="p-3 bg-purple-950/40 border border-purple-800/40 rounded-xl text-xs text-purple-200 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Secured Admin Environment</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Default demonstration passcode is <code className="text-purple-300 font-bold">admin123</code>.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">Enter Admin Passcode</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="admin123"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-purple-500"
                autoFocus
              />
            </div>
            {adminError && <p className="text-rose-400 text-[11px] font-medium">{adminError}</p>}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-950/50 transition-colors"
            >
              Sign In to Admin
            </button>
            <button
              type="button"
              onClick={handleQuickDemoAdminLogin}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition-colors"
            >
              Quick Demo Access
            </button>
          </div>
        </form>
      </Modal>

      {/* Global Footer */}
      <Footer onNavigateTab={handleSelectTab} />
    </div>
  );
}

export default function HomePage() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
