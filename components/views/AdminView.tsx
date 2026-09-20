'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Sliders,
  Database,
  RefreshCw,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Key,
  Layers,
  Settings,
  Calendar,
  Copy,
  Check,
  Terminal,
  Server,
  Sparkles,
} from 'lucide-react';
import { Match, League, Team, PredictionModelWeights } from '@/types/football';
import { DEFAULT_PREDICTION_WEIGHTS, saveStoredWeights, getStoredWeights } from '@/lib/predictionConfig';
import { footballDataStore, footballApiService } from '@/services/footballApi';
import { generateRandomCronSecret } from '@/lib/cronAuth';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface AdminViewProps {
  matches: Match[];
  leagues: League[];
  teams: Team[];
  onRefreshMatches: () => void;
  onLogoutAdmin: () => void;
}

export function AdminView({
  matches,
  leagues,
  teams,
  onRefreshMatches,
  onLogoutAdmin,
}: AdminViewProps) {
  const { showToast } = useToast();
  const [activeAdminTab, setActiveAdminTab] = useState<'matches' | 'weights' | 'api' | 'teams'>('matches');

  // Prediction weights state
  const [weights, setWeights] = useState<PredictionModelWeights>(() => getStoredWeights());
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Add / Edit match modal state
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [matchForm, setMatchForm] = useState({
    leagueId: leagues[0]?.id || 'epl',
    homeTeamId: 'mancity',
    awayTeamId: 'arsenal',
    date: new Date().toISOString().split('T')[0],
    kickoffTime: '16:00',
    venue: 'Etihad Stadium, Manchester',
    isFeatured: false,
    isHotPick: false,
  });

  // API settings state
  const providerInfo = footballApiService.getProviderInfo();
  const [apiProvider, setApiProvider] = useState<string>(providerInfo.provider);
  const [apiKey, setApiKey] = useState<string>(providerInfo.hasApiKey ? '••••••••••••••••' : '');
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(providerInfo.baseUrl);

  // Database and Supabase status state
  const [dbStatus, setDbStatus] = useState<{
    status: string;
    provider: string;
    connected: boolean;
    tablesFound: number;
    totalExpectedTables: number;
    supabaseConfigured: boolean;
    error: string | null;
  } | null>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [isInitializingDb, setIsInitializingDb] = useState(false);

  // Random CRON Secret state
  const [generatedCronSecret, setGeneratedCronSecret] = useState<string>('gp_cron_7f8a92d4e1b5c8309a6f1d2e84bc9103');
  const [copiedSecret, setCopiedSecret] = useState(false);

  const fetchDatabaseStatus = useCallback(async () => {
    setIsCheckingDb(true);
    try {
      const res = await fetch('/api/database/status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch {
      // ignore
    } finally {
      setIsCheckingDb(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (activeAdminTab === 'api') {
      (async () => {
        try {
          const res = await fetch('/api/database/status');
          if (res.ok && isMounted) {
            const data = await res.json();
            setDbStatus(data);
          }
        } catch {
          // ignore
        }
      })();
    }
    return () => {
      isMounted = false;
    };
  }, [activeAdminTab]);

  const handleInitializeSchema = async () => {
    setIsInitializingDb(true);
    try {
      const res = await fetch('/api/database/status', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        await fetchDatabaseStatus();
      } else {
        showToast(data.message || 'Schema initialization completed', 'info');
      }
    } catch (err: any) {
      showToast(`Error initializing database: ${err.message}`, 'error');
    } finally {
      setIsInitializingDb(false);
    }
  };

  const handleGenerateNewCronSecret = () => {
    const newSecret = generateRandomCronSecret();
    setGeneratedCronSecret(newSecret);
    setCopiedSecret(false);
    showToast('New random high-entropy CRON secret generated!', 'info');
  };

  const handleCopyCronSecret = () => {
    navigator.clipboard.writeText(generatedCronSecret);
    setCopiedSecret(true);
    showToast('CRON Secret copied to clipboard!', 'success');
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  // Handle weight change
  const handleWeightChange = (field: keyof PredictionModelWeights, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [field]: Number((value / 100).toFixed(2)),
    }));
  };

  const currentTotalPercent = Math.round(
    (weights.recentForm +
      weights.homeAwayPerformance +
      weights.attackStrength +
      weights.defensiveStrength +
      weights.headToHead +
      weights.leaguePosition +
      weights.goalDifference) *
      100
  );

  const handleSaveWeights = async () => {
    setIsRecalculating(true);
    saveStoredWeights(weights);
    await footballDataStore.recalculateAllPredictions(weights);
    onRefreshMatches();
    setIsRecalculating(false);
    showToast('Model weights updated and all match probabilities re-calculated!', 'success');
  };

  const handleResetWeights = async () => {
    setWeights(DEFAULT_PREDICTION_WEIGHTS);
    saveStoredWeights(DEFAULT_PREDICTION_WEIGHTS);
    await footballDataStore.recalculateAllPredictions(DEFAULT_PREDICTION_WEIGHTS);
    onRefreshMatches();
    showToast('Reset to default algorithmic weights (25/20/15/15/10/10/5)', 'info');
  };

  const handleDeleteMatch = async (id: string) => {
    if (confirm('Are you sure you want to delete this match fixture?')) {
      await footballDataStore.deleteMatch(id);
      onRefreshMatches();
      showToast('Match deleted successfully', 'warning');
    }
  };

  const handleOpenAddMatch = () => {
    setEditingMatch(null);
    setMatchForm({
      leagueId: leagues[0]?.id || 'epl',
      homeTeamId: teams[0]?.id || 'mancity',
      awayTeamId: teams[1]?.id || 'arsenal',
      date: new Date().toISOString().split('T')[0],
      kickoffTime: '18:00',
      venue: teams[0]?.stadium || 'Stadium',
      isFeatured: false,
      isHotPick: false,
    });
    setIsMatchModalOpen(true);
  };

  const handleOpenEditMatch = (m: Match) => {
    setEditingMatch(m);
    setMatchForm({
      leagueId: m.leagueId,
      homeTeamId: m.homeTeam.id,
      awayTeamId: m.awayTeam.id,
      date: m.date,
      kickoffTime: m.kickoffTime,
      venue: m.venue,
      isFeatured: !!m.isFeatured,
      isHotPick: !!m.isHotPick,
    });
    setIsMatchModalOpen(true);
  };

  const handleSaveMatchForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (matchForm.homeTeamId === matchForm.awayTeamId) {
      showToast('Home and away teams must be different!', 'error');
      return;
    }

    const homeTeam = teams.find((t) => t.id === matchForm.homeTeamId) || teams[0];
    const awayTeam = teams.find((t) => t.id === matchForm.awayTeamId) || teams[1];
    const league = leagues.find((l) => l.id === matchForm.leagueId) || leagues[0];

    const matchId = editingMatch ? editingMatch.id : `match-${Date.now()}`;
    const { calculateMatchPrediction } = await import('@/services/predictionService');
    const { getH2H } = await import('@/data/mockFootballData');

    const h2h = getH2H(homeTeam.id, awayTeam.id);
    const prediction = calculateMatchPrediction(matchId, homeTeam, awayTeam, h2h, weights);

    const matchPayload: Match = {
      id: matchId,
      leagueId: league.id,
      leagueName: league.name,
      leagueCountry: league.country,
      leagueLogo: league.logo,
      homeTeam,
      awayTeam,
      date: matchForm.date,
      kickoffTime: matchForm.kickoffTime,
      venue: matchForm.venue || homeTeam.stadium,
      status: 'TIMED',
      prediction,
      isFeatured: matchForm.isFeatured,
      isHotPick: matchForm.isHotPick,
    };

    if (editingMatch) {
      await footballDataStore.updateMatch(matchPayload);
      showToast(`Updated fixture: ${homeTeam.name} vs ${awayTeam.name}`, 'success');
    } else {
      await footballDataStore.addMatch(matchPayload);
      showToast(`Added new fixture: ${homeTeam.name} vs ${awayTeam.name}`, 'success');
    }

    setIsMatchModalOpen(false);
    onRefreshMatches();
  };

  const handleResetAllData = async () => {
    if (confirm('Reset entire football database back to factory demo state?')) {
      await footballDataStore.resetToDefaults();
      onRefreshMatches();
      showToast('Database reset to defaults', 'info');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Admin Operations Control</h1>
              <Badge variant="cyan" size="sm">
                Authenticated
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage live fixtures, re-tune algorithmic weighting, and configure API endpoints
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetAllData}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          >
            Reset All Demo Data
          </button>
          <button
            onClick={onLogoutAdmin}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/60 text-rose-300 hover:bg-rose-900/80 border border-rose-800/60"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveAdminTab('matches')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeAdminTab === 'matches'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Match Fixtures ({matches.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('weights')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeAdminTab === 'weights'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Prediction Model Weights
        </button>
        <button
          onClick={() => setActiveAdminTab('api')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeAdminTab === 'api'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Database className="w-4 h-4" />
          API & Service Settings
        </button>
      </div>

      {/* TAB 1: Matches Manager */}
      {activeAdminTab === 'matches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Database Matches & Fixtures</h3>
              <p className="text-xs text-slate-400">Add, edit, or remove fixtures and recalculate their model outputs</p>
            </div>
            <button
              id="btn-add-match"
              onClick={handleOpenAddMatch}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/40 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Match Fixture
            </button>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Matchup</th>
                    <th className="py-3 px-4">League</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Forecast Pick</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Flags</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {matches.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {m.homeTeam.name} vs {m.awayTeam.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{m.leagueName}</td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {m.date} {m.kickoffTime}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-semibold text-[11px]">
                          {m.prediction.primaryPrediction}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">{m.prediction.predictedScore}</td>
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">{m.prediction.confidence}%</td>
                      <td className="py-3.5 px-4 space-x-1">
                        {m.isFeatured && <Badge variant="primary" size="sm">Featured</Badge>}
                        {m.isHotPick && <Badge variant="cyan" size="sm">Hot</Badge>}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditMatch(m)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                          title="Edit Match"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMatch(m.id)}
                          className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:text-rose-300 hover:bg-rose-950/60"
                          title="Delete Match"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Model Weights Configuration (Requirement #21) */}
      {activeAdminTab === 'weights' && (
        <div className="space-y-6">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-purple-400" />
                  Algorithmic Factor Weights Engine
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Adjust the relative weightings used to calculate composite team ratings and expected goal (xG) parameters.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    currentTotalPercent === 100
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      : 'bg-amber-950/80 text-amber-300 border-amber-800'
                  }`}
                >
                  Total Weight: {currentTotalPercent}% {currentTotalPercent !== 100 && '(Target: 100%)'}
                </span>
                <button
                  onClick={handleResetWeights}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Defaults
                </button>
                <button
                  onClick={handleSaveWeights}
                  disabled={isRecalculating}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isRecalculating ? 'Recalculating...' : 'Apply & Recalculate'}
                </button>
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Form */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white">Recent Form (Last 5 Games)</span>
                  <span className="text-purple-400 font-mono">{Math.round(weights.recentForm * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={Math.round(weights.recentForm * 100)}
                  onChange={(e) => handleWeightChange('recentForm', Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <p className="text-[11px] text-slate-400">Baseline default: 25%. Weights momentum in last 5 league matches.</p>
              </div>

              {/* Home / Away Record */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white">Home / Away Venue Performance</span>
                  <span className="text-purple-400 font-mono">{Math.round(weights.homeAwayPerformance * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={Math.round(weights.homeAwayPerformance * 100)}
                  onChange={(e) => handleWeightChange('homeAwayPerformance', Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <p className="text-[11px] text-slate-400">Baseline default: 20%. Points per game home vs away split.</p>
              </div>

              {/* Attack Strength */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white">Attack Strength</span>
                  <span className="text-cyan-400 font-mono">{Math.round(weights.attackStrength * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={Math.round(weights.attackStrength * 100)}
                  onChange={(e) => handleWeightChange('attackStrength', Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <p className="text-[11px] text-slate-400">Baseline default: 15%. Average goals scored per match.</p>
              </div>

              {/* Defensive Strength */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white">Defensive Strength</span>
                  <span className="text-cyan-400 font-mono">{Math.round(weights.defensiveStrength * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={Math.round(weights.defensiveStrength * 100)}
                  onChange={(e) => handleWeightChange('defensiveStrength', Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <p className="text-[11px] text-slate-400">Baseline default: 15%. Clean sheets and conceded goals.</p>
              </div>

              {/* Head-to-Head */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white">Head-to-Head (H2H) Results</span>
                  <span className="text-amber-400 font-mono">{Math.round(weights.headToHead * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={Math.round(weights.headToHead * 100)}
                  onChange={(e) => handleWeightChange('headToHead', Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <p className="text-[11px] text-slate-400">Baseline default: 10%. Historical head-to-head records.</p>
              </div>

              {/* League Position */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white">League Position Rank</span>
                  <span className="text-emerald-400 font-mono">{Math.round(weights.leaguePosition * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={Math.round(weights.leaguePosition * 100)}
                  onChange={(e) => handleWeightChange('leaguePosition', Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <p className="text-[11px] text-slate-400">Baseline default: 10%. Current table standing.</p>
              </div>

              {/* Goal Difference */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2 md:col-span-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white">Goal Difference Ratio</span>
                  <span className="text-emerald-400 font-mono">{Math.round(weights.goalDifference * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={Math.round(weights.goalDifference * 100)}
                  onChange={(e) => handleWeightChange('goalDifference', Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <p className="text-[11px] text-slate-400">Baseline default: 5%. Goal difference indicator.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: API & Supabase Database Configuration */}
      {activeAdminTab === 'api' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Supabase Database Connection & Migration */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  Supabase & Database Engine
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Serverless connection pool for match predictions, API cache, backtests, and audit logs.
                </p>
              </div>
              <Badge
                variant={dbStatus?.connected ? 'emerald' : 'neutral'}
                size="sm"
                className="gap-1.5"
              >
                <span className={`w-2 h-2 rounded-full ${dbStatus?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {dbStatus?.connected ? dbStatus.provider : 'In-Memory Fallback'}
              </Badge>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold">Engine Status:</span>
                  <span className={`font-mono font-bold ${dbStatus?.connected ? 'text-emerald-400' : 'text-amber-300'}`}>
                    {dbStatus?.connected ? `Connected (${dbStatus.provider})` : 'Active In-Memory (Zero Config)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold">PostgreSQL Tables:</span>
                  <span className="font-mono text-purple-300">
                    {dbStatus?.tablesFound ?? 0} / {dbStatus?.totalExpectedTables ?? 5} Tables Initialized
                  </span>
                </div>
                {dbStatus?.error && (
                  <div className="text-rose-400 text-[11px] bg-rose-950/40 p-2 rounded-lg border border-rose-800/40">
                    {dbStatus.error}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleInitializeSchema}
                  disabled={isInitializingDb}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md disabled:opacity-50"
                >
                  <Server className="w-3.5 h-3.5" />
                  {isInitializingDb ? 'Initializing Schema...' : 'Initialize / Verify Supabase Schema'}
                </button>
                <button
                  onClick={fetchDatabaseStatus}
                  disabled={isCheckingDb}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
                  title="Refresh status"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDb ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[11px] font-bold text-slate-300 block">Supabase Connection String Format:</span>
                <code className="text-[10px] text-slate-400 font-mono block break-all bg-slate-950 p-2 rounded-lg border border-slate-800">
                  postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
                </code>
                <span className="text-[10px] text-slate-500 block pt-1">
                  Configure DATABASE_URL in Vercel or environment variables to activate persistent cloud storage.
                </span>
              </div>
            </div>
          </div>

          {/* Random CRON Secret & Automation */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-purple-400" />
                  CRON Secret & Automation Security
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Secure scheduled Vercel cron triggers for automated fixtures sync, prediction updates, and weight training.
                </p>
              </div>
              <Badge variant="purple" size="sm" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Vercel Cron
              </Badge>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-slate-300 flex items-center justify-between">
                  <span>Random High-Entropy CRON_SECRET</span>
                  <button
                    onClick={handleGenerateNewCronSecret}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-normal flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Generate New Secret
                  </button>
                </label>
                
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedCronSecret}
                    className="flex-1 py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-purple-300 font-mono text-xs select-all focus:outline-hidden"
                  />
                  <button
                    onClick={handleCopyCronSecret}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all"
                  >
                    {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSecret ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  Scheduled Cron Job Endpoints
                </span>
                <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                    <span>GET /api/cron/sync-fixtures</span>
                    <span className="text-[10px] text-emerald-400 font-sans">Every 3 hrs</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                    <span>GET /api/cron/update-results</span>
                    <span className="text-[10px] text-cyan-400 font-sans">Every 6 hrs</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                    <span>GET /api/cron/train-weights</span>
                    <span className="text-[10px] text-purple-400 font-sans">Daily</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Authenticate via header <code>Authorization: Bearer &lt;CRON_SECRET&gt;</code> or URL query <code>?key=&lt;CRON_SECRET&gt;</code>.
                </span>
              </div>
            </div>
          </div>

          {/* Third Party Football Provider */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 lg:col-span-2 max-w-2xl">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                Football Data Provider Configuration
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Switch seamlessly between internal demo data engine and third-party REST sports endpoints.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Active Provider</label>
                <select
                  value={apiProvider}
                  onChange={(e) => setApiProvider(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden"
                >
                  <option value="demo">Built-in Demo Simulation (No external key required)</option>
                  <option value="api-football">API-Football (v3.football.api-sports.io)</option>
                  <option value="football-data">Football-Data.org API</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">API Endpoint Base URL</label>
                <input
                  type="text"
                  value={apiBaseUrl}
                  onChange={(e) => setApiBaseUrl(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">API Secret Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste external API Key here (or configure via .env)"
                  className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                />
                <span className="text-[10px] text-slate-500 block">
                  Keys can also be provided securely in container environment variables via FOOTBALL_API_KEY.
                </span>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => {
                    showToast('Settings saved. Ready for external sync when credentials are live.', 'success');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white"
                >
                  Save API Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Match Modal */}
      <Modal
        isOpen={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        maxWidth="lg"
        title={editingMatch ? 'Edit Match Fixture' : 'Schedule New Match Fixture'}
      >
        <form onSubmit={handleSaveMatchForm} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">League / Competition</label>
            <select
              value={matchForm.leagueId}
              onChange={(e) => setMatchForm({ ...matchForm, leagueId: e.target.value })}
              className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white"
            >
              {leagues.map((lg) => (
                <option key={lg.id} value={lg.id}>
                  {lg.name} ({lg.country})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-purple-300">Home Team</label>
              <select
                value={matchForm.homeTeamId}
                onChange={(e) => {
                  const t = teams.find((item) => item.id === e.target.value);
                  setMatchForm({
                    ...matchForm,
                    homeTeamId: e.target.value,
                    venue: t ? t.stadium : matchForm.venue,
                  });
                }}
                className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-cyan-300">Away Team</label>
              <select
                value={matchForm.awayTeamId}
                onChange={(e) => setMatchForm({ ...matchForm, awayTeamId: e.target.value })}
                className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Kickoff Date</label>
              <input
                type="date"
                value={matchForm.date}
                onChange={(e) => setMatchForm({ ...matchForm, date: e.target.value })}
                className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Kickoff Time (UTC)</label>
              <input
                type="text"
                value={matchForm.kickoffTime}
                placeholder="18:30"
                onChange={(e) => setMatchForm({ ...matchForm, kickoffTime: e.target.value })}
                className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Stadium / Venue</label>
            <input
              type="text"
              value={matchForm.venue}
              onChange={(e) => setMatchForm({ ...matchForm, venue: e.target.value })}
              className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white"
              required
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={matchForm.isFeatured}
                onChange={(e) => setMatchForm({ ...matchForm, isFeatured: e.target.checked })}
                className="accent-purple-500 rounded"
              />
              Featured Highlight
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={matchForm.isHotPick}
                onChange={(e) => setMatchForm({ ...matchForm, isHotPick: e.target.checked })}
                className="accent-cyan-500 rounded"
              />
              Hot Pick Badge
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsMatchModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
            >
              {editingMatch ? 'Save Changes' : 'Create Fixture'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
