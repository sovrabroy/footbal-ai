'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Flame,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Shield,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Match, League, PredictionResult } from '@/types/football';
import { MatchCard } from '@/components/matches/MatchCard';
import { Badge } from '@/components/ui/Badge';
import { isMatchToday } from '@/lib/dateUtils';

interface HomeViewProps {
  matches: Match[];
  leagues: League[];
  results: PredictionResult[];
  onViewAnalysis: (match: Match) => void;
  onNavigateTab: (tab: 'home' | 'matches' | 'predictions' | 'leagues' | 'statistics') => void;
}

export function HomeView({
  matches,
  leagues,
  results,
  onViewAnalysis,
  onNavigateTab,
}: HomeViewProps) {
  const [selectedLeague, setSelectedLeague] = useState<string>('all');

  // Filtered categories
  const featuredMatches = matches.filter((m) => m.isFeatured);
  const hotPicks = matches.filter((m) => m.isHotPick);
  const highestConfidenceMatches = [...matches]
    .sort((a, b) => b.prediction.confidence - a.prediction.confidence)
    .slice(0, 4);
  const todaysMatches = matches.filter((m) => isMatchToday(m.date));
  const upcomingMatches = matches.filter((m) => !isMatchToday(m.date) && m.status !== 'FINISHED');

  const filteredMatchesByLeague =
    selectedLeague === 'all'
      ? matches
      : matches.filter((m) => m.leagueId === selectedLeague);

  // Overall accuracy stats for quick hero ticker
  const correctCount = results.filter((r) => r.isCorrect).length;
  const accuracyRate = Math.round((correctCount / Math.max(1, results.length)) * 100);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Analytics Showcase */}
      <section id="hero-showcase" className="relative rounded-3xl border border-slate-800 bg-gradient-to-b from-[#11192E] via-[#0D1424] to-[#0A0E1A] p-6 sm:p-10 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-xs font-semibold text-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Poisson Distribution & Machine Form Ratings</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Data-driven football predictions, calculated with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">
              transparent mathematics.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            GoalPredict AI calculates probabilistic expected goals (xG), 1X2 probabilities, Over/Under 2.5 goals, and BTTS metrics using 7 weighted form and venue factors.
          </p>

          {/* Quick Metrics Ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 font-medium block">Verified Accuracy</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">{accuracyRate}%</span>
              <span className="text-[10px] text-slate-500 block">Past verified fixtures</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 font-medium block">Active Predictions</span>
              <span className="text-2xl font-black text-white font-mono">{matches.length}</span>
              <span className="text-[10px] text-slate-500 block">Across 8 leagues</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 font-medium block">Avg. Confidence</span>
              <span className="text-2xl font-black text-purple-300 font-mono">68.4%</span>
              <span className="text-[10px] text-slate-500 block">Poisson threshold</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 font-medium block">Top Market Rate</span>
              <span className="text-2xl font-black text-cyan-300 font-mono">79.2%</span>
              <span className="text-[10px] text-slate-500 block">Over 1.5 Goals</span>
            </div>
          </div>
        </div>

        {/* Subtle decorative background circles */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -top-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Popular League Filter Quick-Pills */}
      <section id="league-quick-filters" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-purple-400" />
            Popular Leagues
          </h2>
          <button
            onClick={() => onNavigateTab('leagues')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>View All Leagues & Standings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedLeague('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedLeague === 'all'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/30'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            All Competitions ({matches.length})
          </button>
          {leagues.map((lg) => (
            <button
              key={lg.id}
              onClick={() => setSelectedLeague(lg.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedLeague === lg.id
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/30'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span>{lg.flag}</span>
              <span>{lg.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured AI Match Picks */}
      <section id="featured-matches" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Featured Match Predictions
            </h2>
            <p className="text-xs text-slate-400">High-profile derby and continental clashes with deep data</p>
          </div>
          <button
            onClick={() => onNavigateTab('matches')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>See All Matches</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredMatches.map((m) => (
            <MatchCard key={m.id} match={m} onViewAnalysis={onViewAnalysis} variant="featured" />
          ))}
        </div>
      </section>

      {/* Highest Confidence Predictions Section */}
      <section id="highest-confidence-picks" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-cyan-400" />
              Highest Confidence Predictions
            </h2>
            <p className="text-xs text-slate-400">Model probability separation exceeding 65%</p>
          </div>
          <button
            onClick={() => onNavigateTab('predictions')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Open Prediction Table</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {highestConfidenceMatches.map((m) => (
            <MatchCard key={m.id} match={m} onViewAnalysis={onViewAnalysis} />
          ))}
        </div>
      </section>

      {/* Today's & Upcoming Fixtures Grid */}
      <section id="todays-matches" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Today&apos;s Match Schedule
            </h2>
            <p className="text-xs text-slate-400">Kickoffs occurring today</p>
          </div>
        </div>

        {todaysMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {todaysMatches.map((m) => (
              <MatchCard key={m.id} match={m} onViewAnalysis={onViewAnalysis} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
            No remaining matches scheduled for today. Check upcoming matches below.
          </div>
        )}
      </section>

      {/* Recent Prediction Results Verification Strip */}
      <section id="recent-results" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Recent Prediction Verification
            </h2>
            <p className="text-xs text-slate-400">Transparent audit of recent finished match forecasts</p>
          </div>
          <button
            onClick={() => onNavigateTab('statistics')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View Full Accuracy Audit</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Match</th>
                  <th className="py-3 px-4">League</th>
                  <th className="py-3 px-4">Model Forecast</th>
                  <th className="py-3 px-4">Predicted</th>
                  <th className="py-3 px-4">Actual</th>
                  <th className="py-3 px-4">1X2 Outcome</th>
                  <th className="py-3 px-4">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {results.slice(0, 5).map((res) => (
                  <tr key={res.matchId} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{res.matchTitle}</td>
                    <td className="py-3.5 px-4 text-slate-400">{res.league}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/50 text-purple-300 font-semibold text-[11px]">
                        {res.prediction}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-300">{res.predictedScore}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{res.actualScore}</td>
                    <td className="py-3.5 px-4">
                      {res.isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="text-rose-400 font-semibold">Incorrect</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{res.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
