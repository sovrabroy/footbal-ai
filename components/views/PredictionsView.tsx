'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Filter,
  ArrowUpDown,
  Search,
  ChevronRight,
  Sparkles,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { Match } from '@/types/football';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { isMatchToday, isMatchTomorrow, formatMatchDateLabel } from '@/lib/dateUtils';

interface PredictionsViewProps {
  matches: Match[];
  onViewAnalysis: (match: Match) => void;
}

export function PredictionsView({ matches, onViewAnalysis }: PredictionsViewProps) {
  const [search, setSearch] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'Home Win' | 'Draw' | 'Away Win'>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [marketFilter, setMarketFilter] = useState<'all' | 'over25' | 'btts'>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'date' | 'over25'>('confidence');

  const filteredPredictions = useMemo(() => {
    return matches
      .filter((m) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchesSearch =
            m.homeTeam.name.toLowerCase().includes(q) ||
            m.awayTeam.name.toLowerCase().includes(q) ||
            m.leagueName.toLowerCase().includes(q);
          if (!matchesSearch) return false;
        }

        // 1X2 Outcome filter
        if (outcomeFilter !== 'all' && m.prediction.primaryPrediction !== outcomeFilter) {
          return false;
        }

        // Confidence filter
        if (confidenceFilter === 'high' && m.prediction.confidence < 70) return false;
        if (confidenceFilter === 'medium' && (m.prediction.confidence < 58 || m.prediction.confidence >= 70)) return false;
        if (confidenceFilter === 'low' && m.prediction.confidence >= 58) return false;

        // Market Filter
        if (marketFilter === 'over25' && m.prediction.over25Probability < 55) return false;
        if (marketFilter === 'btts' && m.prediction.bttsProbability < 55) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'confidence') return b.prediction.confidence - a.prediction.confidence;
        if (sortBy === 'over25') return b.prediction.over25Probability - a.prediction.over25Probability;
        return a.date.localeCompare(b.date);
      });
  }, [matches, search, outcomeFilter, confidenceFilter, marketFilter, sortBy]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-purple-400" />
            AI Statistical Predictions Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete database of algorithmic probabilities across 1X2, Over/Under, and BTTS markets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="cyan" size="md">
            {filteredPredictions.length} Active Predictions
          </Badge>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search match or competition..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/70 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-1.5 px-3 bg-slate-900 border border-slate-700/70 rounded-xl text-xs text-white focus:outline-hidden"
            >
              <option value="confidence">Confidence (Highest)</option>
              <option value="over25">Over 2.5 Probability</option>
              <option value="date">Kickoff Date</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Buttons Row */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => {
              setOutcomeFilter('all');
              setConfidenceFilter('all');
              setMarketFilter('all');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              outcomeFilter === 'all' && confidenceFilter === 'all' && marketFilter === 'all'
                ? 'bg-purple-600 text-white border-purple-500'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            All Markets
          </button>

          {/* Outcome filters */}
          <button
            onClick={() => setOutcomeFilter(outcomeFilter === 'Home Win' ? 'all' : 'Home Win')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              outcomeFilter === 'Home Win'
                ? 'bg-purple-600 text-white border-purple-500'
                : 'bg-slate-900 text-purple-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            Home Win
          </button>
          <button
            onClick={() => setOutcomeFilter(outcomeFilter === 'Draw' ? 'all' : 'Draw')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              outcomeFilter === 'Draw'
                ? 'bg-purple-600 text-white border-purple-500'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            Draw
          </button>
          <button
            onClick={() => setOutcomeFilter(outcomeFilter === 'Away Win' ? 'all' : 'Away Win')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              outcomeFilter === 'Away Win'
                ? 'bg-purple-600 text-white border-purple-500'
                : 'bg-slate-900 text-cyan-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            Away Win
          </button>

          {/* Market filters */}
          <button
            onClick={() => setMarketFilter(marketFilter === 'over25' ? 'all' : 'over25')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              marketFilter === 'over25'
                ? 'bg-cyan-600 text-white border-cyan-500'
                : 'bg-slate-900 text-cyan-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            Over 2.5 Goals (≥55%)
          </button>
          <button
            onClick={() => setMarketFilter(marketFilter === 'btts' ? 'all' : 'btts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              marketFilter === 'btts'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-900 text-emerald-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            BTTS Yes (≥55%)
          </button>

          {/* Confidence filters */}
          <button
            onClick={() => setConfidenceFilter(confidenceFilter === 'high' ? 'all' : 'high')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              confidenceFilter === 'high'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-900 text-emerald-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            High Confidence (≥70%)
          </button>
        </div>
      </div>

      {/* Predictions Master Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Match & League</th>
                <th className="py-3.5 px-4">Date / Time</th>
                <th className="py-3.5 px-4">Model Prediction</th>
                <th className="py-3.5 px-4">Confidence</th>
                <th className="py-3.5 px-4 text-center">Predicted Score</th>
                <th className="py-3.5 px-4">Over 2.5</th>
                <th className="py-3.5 px-4">BTTS</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredPredictions.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => onViewAnalysis(m)}
                >
                  {/* Match & League */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1 shrink-0">
                        <img
                          src={m.homeTeam.logo}
                          alt={m.homeTeam.name}
                          className="w-6 h-6 object-contain rounded-full bg-slate-800 p-0.5 border border-slate-700"
                        />
                        <img
                          src={m.awayTeam.logo}
                          alt={m.awayTeam.name}
                          className="w-6 h-6 object-contain rounded-full bg-slate-800 p-0.5 border border-slate-700"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-purple-300 transition-colors">
                          {m.homeTeam.name} vs {m.awayTeam.name}
                        </div>
                        <div className="text-[11px] text-slate-400">{m.leagueName}</div>
                      </div>
                    </div>
                  </td>

                  {/* Date & Time */}
                  <td className="py-4 px-4 text-slate-400" suppressHydrationWarning>
                    <div className="flex items-center gap-1.5" suppressHydrationWarning>
                      {isMatchToday(m.date) ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950/70 border border-emerald-500/40 text-emerald-400" suppressHydrationWarning>
                          Today
                        </span>
                      ) : isMatchTomorrow(m.date) ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-950/50 border border-purple-500/30 text-purple-300" suppressHydrationWarning>
                          Tomorrow
                        </span>
                      ) : null}
                      <span className="text-xs font-mono">{m.date}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{m.kickoffTime} UTC</div>
                  </td>

                  {/* Prediction Pill */}
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/70 border border-purple-800/50 text-purple-300 font-bold text-xs">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      {m.prediction.primaryPrediction}
                    </span>
                  </td>

                  {/* Confidence */}
                  <td className="py-4 px-4">
                    <div className="w-28 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Rating</span>
                        <span
                          className={`font-bold ${
                            m.prediction.confidence >= 70 ? 'text-emerald-400' : 'text-purple-300'
                          }`}
                        >
                          {m.prediction.confidence}%
                        </span>
                      </div>
                      <ProgressBar
                        value={m.prediction.confidence}
                        showValue={false}
                        color={m.prediction.confidence >= 70 ? 'emerald' : 'purple'}
                        size="sm"
                      />
                    </div>
                  </td>

                  {/* Predicted Score */}
                  <td className="py-4 px-4 text-center">
                    <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-white">
                      {m.prediction.predictedScore}
                    </span>
                  </td>

                  {/* Over 2.5 */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-300">{m.prediction.over25Probability}%</span>
                      {m.prediction.over25Probability >= 60 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold">
                          Yes
                        </span>
                      )}
                    </div>
                  </td>

                  {/* BTTS */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-300">{m.prediction.bttsProbability}%</span>
                      {m.prediction.bttsProbability >= 55 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold">
                          Yes
                        </span>
                      )}
                    </div>
                  </td>

                  {/* CTA */}
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewAnalysis(m);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-purple-600 text-slate-300 hover:text-white border border-slate-700 hover:border-purple-600 transition-colors"
                    >
                      <span>Analysis</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
