'use client';

import React from 'react';
import {
  Sparkles,
  Sliders,
  ShieldCheck,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  Database,
  ArrowRight,
} from 'lucide-react';
import { PREDICTION_DISCLAIMER, MODEL_VERSION } from '@/lib/predictionConfig';

interface AboutViewProps {
  onExploreMatches: () => void;
}

export function AboutView({ onExploreMatches }: AboutViewProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40 text-xs font-semibold text-purple-300 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>GoalPredict AI Mathematical Framework {MODEL_VERSION}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          How GoalPredict AI Calculates Football Predictions
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl">
          A statistical prediction system utilizing weighted Poisson distribution, composite team ratings, and venue-specific expected goals (xG).
        </p>
      </div>

      {/* Core Principle 1: Poisson Model */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-300">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">The Poisson Expected Goals Formulation</h2>
            <span className="text-xs text-purple-400 font-mono">P(k; λ) = (λ^k · e^(-λ)) / k!</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Football scores can be statistically approximated through discrete Poisson probability distributions.
          By estimating the home team&apos;s expected goals (<strong className="text-purple-300">λ_home</strong>) and away team&apos;s expected goals (<strong className="text-cyan-300">λ_away</strong>), the engine computes an exact joint scoreline probability matrix for all outcomes from 0-0 up to 6-6.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-xs space-y-1">
            <span className="font-bold text-white block">1. 1X2 Probabilities</span>
            <p className="text-slate-400">
              Aggregated summation of all matrix combinations where home &gt; away (1), home = away (X), or away &gt; home (2).
            </p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-xs space-y-1">
            <span className="font-bold text-white block">2. Over / Under Goals</span>
            <p className="text-slate-400">
              Calculated by summing joint score probabilities where total goals (home + away) exceed thresholds (1.5, 2.5, 3.5).
            </p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-xs space-y-1">
            <span className="font-bold text-white block">3. Both Teams To Score (BTTS)</span>
            <p className="text-slate-400">
              Derived from the product of probability that both teams score at least 1 goal: (1 - P(0 goals)).
            </p>
          </div>
        </div>
      </div>

      {/* Core Principle 2: Factor Weights */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-300">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">7-Factor Algorithmic Weighting Structure</h2>
            <p className="text-xs text-slate-400">Transparent parameters used to compute composite ratings</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-purple-950 text-purple-300 font-bold flex items-center justify-center text-[10px]">1</span>
              <div>
                <span className="font-bold text-white">Recent Match Form (Last 5 Games)</span>
                <span className="text-[11px] text-slate-400 block">Momentum analysis: 3 pts for Win, 1 pt for Draw, 0 for Loss</span>
              </div>
            </div>
            <span className="font-mono font-bold text-purple-300 text-sm">25%</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-purple-950 text-purple-300 font-bold flex items-center justify-center text-[10px]">2</span>
              <div>
                <span className="font-bold text-white">Home / Away Venue Performance</span>
                <span className="text-[11px] text-slate-400 block">Specific home points-per-game vs away points-per-game split</span>
              </div>
            </div>
            <span className="font-mono font-bold text-purple-300 text-sm">20%</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-purple-950 text-purple-300 font-bold flex items-center justify-center text-[10px]">3</span>
              <div>
                <span className="font-bold text-white">Attacking Strength</span>
                <span className="text-[11px] text-slate-400 block">Average goals scored per match relative to league benchmark</span>
              </div>
            </div>
            <span className="font-mono font-bold text-cyan-300 text-sm">15%</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-purple-950 text-purple-300 font-bold flex items-center justify-center text-[10px]">4</span>
              <div>
                <span className="font-bold text-white">Defensive Strength & Clean Sheets</span>
                <span className="text-[11px] text-slate-400 block">Goals conceded rate and defensive resistance index</span>
              </div>
            </div>
            <span className="font-mono font-bold text-cyan-300 text-sm">15%</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-purple-950 text-purple-300 font-bold flex items-center justify-center text-[10px]">5</span>
              <div>
                <span className="font-bold text-white">Head-to-Head (H2H) Historical Matchups</span>
                <span className="text-[11px] text-slate-400 block">Past 5-10 direct meetings and psychological advantage</span>
              </div>
            </div>
            <span className="font-mono font-bold text-amber-300 text-sm">10%</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-purple-950 text-purple-300 font-bold flex items-center justify-center text-[10px]">6</span>
              <div>
                <span className="font-bold text-white">Current League Table Standings</span>
                <span className="text-[11px] text-slate-400 block">Position delta and competitive motivation factor</span>
              </div>
            </div>
            <span className="font-mono font-bold text-emerald-300 text-sm">10%</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-purple-950 text-purple-300 font-bold flex items-center justify-center text-[10px]">7</span>
              <div>
                <span className="font-bold text-white">Goal Difference Ratio</span>
                <span className="text-[11px] text-slate-400 block">True net quality indicator over complete match sample</span>
              </div>
            </div>
            <span className="font-mono font-bold text-emerald-300 text-sm">5%</span>
          </div>
        </div>
      </div>

      {/* Mandatory Regulatory & Risk Disclaimer Box */}
      <div className="rounded-2xl border border-amber-900/40 bg-gradient-to-r from-amber-950/30 to-slate-900 p-6 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>Important Statistical Disclaimer</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {PREDICTION_DISCLAIMER}
        </p>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={onExploreMatches}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xl shadow-purple-950/50 transition-colors"
        >
          <span>Explore Live Match Predictions</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
