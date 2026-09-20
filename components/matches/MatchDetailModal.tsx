'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Activity,
  Shield,
  TrendingUp,
  Sliders,
  Sparkles,
  Info,
  CheckCircle2,
  PieChart as PieIcon,
  Layers,
  Users,
  AlertTriangle,
  Scale,
  Percent,
  Compass,
  Zap,
  ChevronRight,
  Flame,
  FileText,
  Loader2,
} from 'lucide-react';
import { Match, HeadToHeadSummary, Player, TeamLineup } from '@/types/football';
import { getH2H } from '@/data/mockFootballData';
import { isMatchToday, isMatchTomorrow, formatMatchDateLabel } from '@/lib/dateUtils';
import { playerService } from '@/services/playerService';
import { Modal } from '@/components/ui/Modal';
import { Badge, FormPill } from '@/components/ui/Badge';
import { ProgressBar, TripleProbBar } from '@/components/ui/ProgressBar';
import { PREDICTION_DISCLAIMER } from '@/lib/predictionConfig';

interface MatchDetailModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MatchDetailModal({ match, isOpen, onClose }: MatchDetailModalProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'markets' | 'form' | 'lineups' | 'h2h' | 'consensus'
  >('overview');

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (!match || !isOpen) {
      return;
    }

    const fetchAnalysis = async () => {
      try {
        const res = await fetch('/api/gemini/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matchData: match }),
        });
        const data = await res.json();
        if (isMounted) {
          setAiAnalysis(data.analysis || match.prediction.explanation);
          setLoadingAi(false);
        }
      } catch {
        if (isMounted) {
          setAiAnalysis(match.prediction.explanation);
          setLoadingAi(false);
        }
      }
    };

    fetchAnalysis();

    return () => {
      isMounted = false;
    };
  }, [match, isOpen]);

  if (!match) return null;

  const { homeTeam, awayTeam, prediction, leagueName, date, kickoffTime, venue, referee, matchContext } = match;
  const h2h: HeadToHeadSummary = getH2H(homeTeam.id, awayTeam.id);

  const homePlayers: Player[] = playerService.getPlayersByTeam(homeTeam.id);
  const awayPlayers: Player[] = playerService.getPlayersByTeam(awayTeam.id);
  const homeLineup: TeamLineup = playerService.getExpectedLineup(homeTeam.id);
  const awayLineup: TeamLineup = playerService.getExpectedLineup(awayTeam.id);

  const isToday = isMatchToday(date);
  const isTomorrow = isMatchTomorrow(date);
  const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : formatMatchDateLabel(date);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="5xl"
      title={
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Trophy className="w-4 h-4 text-purple-400" />
          <span>{leagueName}</span>
          <span>•</span>
          <span className="text-slate-400 text-xs">Statistical Match Analysis & Probability Engine</span>
        </div>
      }
      subtitle={`Kickoff: ${dateLabel} (${date}) at ${kickoffTime} UTC • ${venue}`}
    >
      {/* Top Match Showcase Card */}
      <div className="relative rounded-2xl border border-slate-700/80 bg-gradient-to-b from-[#131C35] to-[#0D1322] p-6 overflow-hidden shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-6">
          {/* Home Team Column */}
          <div className="md:col-span-3 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 p-2.5 flex items-center justify-center shrink-0 shadow-lg">
              <img
                src={homeTeam.logo}
                alt={homeTeam.name}
                className="w-11 h-11 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Home</div>
              <h2 className="text-xl font-black text-white leading-tight">{homeTeam.name}</h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                <span>Rank #{homeTeam.leaguePosition}</span>
                <span>•</span>
                <span>{homeTeam.points} pts</span>
                <span>•</span>
                <span className="font-mono text-purple-300 font-semibold">{homeTeam.won}W-{homeTeam.drawn}D-{homeTeam.lost}L</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {homeTeam.recentForm.map((r, idx) => (
                  <FormPill key={idx} result={r} />
                ))}
              </div>
            </div>
          </div>

          {/* Center Predicted Score & Confidence */}
          <div className="md:col-span-1 flex flex-col items-center justify-center text-center py-2 md:py-0 border-y md:border-y-0 md:border-x border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Model Score</span>
            <div className="text-2xl font-black font-mono text-purple-300 mt-0.5 tracking-wider bg-slate-900/90 px-3.5 py-1 rounded-xl border border-purple-500/30">
              {prediction.predictedScore}
            </div>
            <div className="mt-2 text-[11px] font-semibold text-emerald-400">
              {prediction.confidence}% Conf.
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 font-medium px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              {prediction.riskLevel}
            </span>
          </div>

          {/* Away Team Column */}
          <div className="md:col-span-3 flex items-center justify-end gap-4 text-right">
            <div>
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Away</div>
              <h2 className="text-xl font-black text-white leading-tight">{awayTeam.name}</h2>
              <div className="flex items-center justify-end gap-2 mt-1 text-xs text-slate-400">
                <span className="font-mono text-cyan-300 font-semibold">{awayTeam.won}W-{awayTeam.drawn}D-{awayTeam.lost}L</span>
                <span>•</span>
                <span>{awayTeam.points} pts</span>
                <span>•</span>
                <span>Rank #{awayTeam.leaguePosition}</span>
              </div>
              <div className="flex items-center justify-end gap-1 mt-2">
                {awayTeam.recentForm.map((r, idx) => (
                  <FormPill key={idx} result={r} />
                ))}
              </div>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 p-2.5 flex items-center justify-center shrink-0 shadow-lg">
              <img
                src={awayTeam.logo}
                alt={awayTeam.name}
                className="w-11 h-11 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>

        {/* Stadium, xG & Data Quality Strip */}
        <div className="mt-5 pt-3 border-t border-slate-800/90 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-purple-400" />
            <span>{venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Expected Goals (xG): <strong className="text-slate-200">{prediction.predictedHomeGoals}</strong> vs <strong className="text-slate-200">{prediction.predictedAwayGoals}</strong> (Total: <strong className="text-purple-300">{prediction.predictedTotalGoals}</strong>)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono">
              Data Quality: {prediction.dataQualityScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Primary Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Match Overview & AI Scout', icon: Sparkles },
          { id: 'markets', label: 'All Probability Markets', icon: Percent },
          { id: 'form', label: 'Team Comparison & Form', icon: TrendingUp },
          { id: 'lineups', label: 'Expected Lineups & Tactics', icon: Users },
          { id: 'h2h', label: 'Head-to-Head & Referee', icon: Trophy },
          { id: 'consensus', label: 'Model Consensus & Engine', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Match Overview & AI Scout */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Primary 1X2 Probabilities Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-sm font-bold text-white">Full-Time 1X2 Probabilities</h4>
                <p className="text-xs text-slate-400">Poisson discrete matrix distribution normalized for venue advantage</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="md">
                  Model Pick: {prediction.primaryPrediction} ({prediction.confidence}% Conf)
                </Badge>
                <Badge variant={prediction.riskLevel === 'Low Risk' ? 'emerald' : prediction.riskLevel === 'Medium Risk' ? 'amber' : 'rose'} size="md">
                  {prediction.riskLevel}
                </Badge>
              </div>
            </div>

            <TripleProbBar
              homeProb={prediction.homeWinProbability}
              drawProb={prediction.drawProbability}
              awayProb={prediction.awayWinProbability}
              homeLabel={`${homeTeam.shortName} Win`}
              drawLabel="Draw"
              awayLabel={`${awayTeam.shortName} Win`}
            />
          </div>

          {/* Quick Stats Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-400 block font-medium">Most Likely Score</span>
              <span className="text-xl font-bold font-mono text-purple-300 mt-1 block">{prediction.mostLikelyScore}</span>
              <span className="text-[10px] text-slate-500">Highest matrix probability</span>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-400 block font-medium">Over 2.5 Goals</span>
              <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">{prediction.over25Probability}%</span>
              <span className="text-[10px] text-slate-500">Under: {prediction.under25Probability}%</span>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-400 block font-medium">Both Teams To Score</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">{prediction.bttsProbability}%</span>
              <span className="text-[10px] text-slate-500">BTTS No: {prediction.bttsNoProbability}%</span>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-400 block font-medium">First Half Result</span>
              <span className="text-xl font-bold font-mono text-amber-300 mt-1 block">{prediction.firstHalfPrediction.predictedScore}</span>
              <span className="text-[10px] text-slate-500">Draw HT: {prediction.firstHalfPrediction.draw}%</span>
            </div>
          </div>

          {/* AI Quantitative Scouting Report */}
          <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-cyan-950/40 border border-purple-900/50 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">AI Analyst Match Scouting Report</h4>
                  <p className="text-[11px] text-slate-400">Quantitative match synthesis grounded in 40+ statistical indicators</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/70 border border-purple-500/30 text-purple-300">
                Live Analysis
              </span>
            </div>

            {loadingAi ? (
              <div className="flex items-center gap-3 py-6 justify-center text-slate-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span>Generating deep tactical analysis from match model metrics...</span>
              </div>
            ) : (
              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line space-y-2">
                {aiAnalysis}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: All Probability Markets */}
      {activeTab === 'markets' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Over / Under Goals Progression */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white">Goal Totals Over / Under Probabilities</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Over 0.5 */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Over 0.5 Goals</span>
                  <span className="text-purple-300">{prediction.over05Probability}%</span>
                </div>
                <ProgressBar value={prediction.over05Probability} color="purple" showValue={false} size="sm" />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Over: {prediction.over05Probability}%</span>
                  <span>Under: {prediction.under05Probability}%</span>
                </div>
              </div>
              {/* Over 1.5 */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Over 1.5 Goals</span>
                  <span className="text-cyan-400">{prediction.over15Probability}%</span>
                </div>
                <ProgressBar value={prediction.over15Probability} color="cyan" showValue={false} size="sm" />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Over: {prediction.over15Probability}%</span>
                  <span>Under: {prediction.under15Probability}%</span>
                </div>
              </div>
              {/* Over 2.5 */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Over 2.5 Goals</span>
                  <span className="text-emerald-400">{prediction.over25Probability}%</span>
                </div>
                <ProgressBar value={prediction.over25Probability} color="emerald" showValue={false} size="sm" />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Over: {prediction.over25Probability}%</span>
                  <span>Under: {prediction.under25Probability}%</span>
                </div>
              </div>
              {/* Over 3.5 */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Over 3.5 Goals</span>
                  <span className="text-amber-400">{prediction.over35Probability}%</span>
                </div>
                <ProgressBar value={prediction.over35Probability} color="amber" showValue={false} size="sm" />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Over: {prediction.over35Probability}%</span>
                  <span>Under: {prediction.under35Probability}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clean Sheets & BTTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-white">Clean Sheet Probabilities</h4>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{homeTeam.name} Clean Sheet</span>
                    <span className="text-purple-300 font-bold">{prediction.cleanSheetProbabilities.homeCleanSheet}%</span>
                  </div>
                  <ProgressBar value={prediction.cleanSheetProbabilities.homeCleanSheet} color="purple" showValue={false} size="sm" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{awayTeam.name} Clean Sheet</span>
                    <span className="text-cyan-400 font-bold">{prediction.cleanSheetProbabilities.awayCleanSheet}%</span>
                  </div>
                  <ProgressBar value={prediction.cleanSheetProbabilities.awayCleanSheet} color="cyan" showValue={false} size="sm" />
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-white">Double Chance (DC) Probabilities</h4>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-mono block">1X (Home or Draw)</span>
                  <span className="text-lg font-bold text-white mt-1 block">{prediction.doubleChance.homeOrDraw}%</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-mono block">12 (Home or Away)</span>
                  <span className="text-lg font-bold text-white mt-1 block">{prediction.doubleChance.homeOrAway}%</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-mono block">X2 (Draw or Away)</span>
                  <span className="text-lg font-bold text-white mt-1 block">{prediction.doubleChance.drawOrAway}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Half Time / Full Time (HT/FT) Matrix */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Half Time / Full Time (HT/FT) Joint Probabilities</h4>
                <p className="text-xs text-slate-400">9-outcome transition matrix between 45&apos; and 90&apos;</p>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
              {prediction.htFtProbabilities.map((htft) => (
                <div key={htft.code} className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg text-center">
                  <span className="text-[10px] text-purple-300 font-mono font-bold block">{htft.code}</span>
                  <span className="text-xs font-black text-white mt-1 block">{htft.probability}%</span>
                  <span className="text-[9px] text-slate-500 block truncate">{htft.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Correct Score Matrix Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Correct Score Probability Matrix</h4>
                <p className="text-xs text-slate-400">Calculated via bivariate Poisson joint probability density function</p>
              </div>
              <span className="text-xs text-purple-300 font-mono">Most Likely: {prediction.predictedScore}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
              {prediction.correctScoreProbabilities.slice(0, 16).map((cs) => (
                <div
                  key={cs.score}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    cs.score === prediction.predictedScore
                      ? 'bg-purple-900/30 border-purple-500/60 ring-1 ring-purple-500/30'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <span className="text-xs font-mono font-bold text-white block">{cs.score}</span>
                  <span className="text-xs font-black text-cyan-400 mt-0.5 block">{cs.probability}%</span>
                  <span className="text-[9px] text-slate-500 block font-mono">Odds {cs.fairOdds}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Market Comparison & Model Edge */}
          {prediction.marketComparison && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Market Odds Comparison & Model Edge</h4>
                  <p className="text-xs text-slate-400">Model theoretical probability vs Bookmaker implied market probability</p>
                </div>
                <span className="text-[10px] text-amber-400 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
                  Statistical Edge ≠ Guaranteed Profit
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Home Win</span>
                  <span className="text-xs text-slate-300 block mt-1">Odds {prediction.marketComparison.bookmakerOdds.homeWin}</span>
                  <span className={`text-xs font-bold mt-1 block ${prediction.marketComparison.modelEdge.homeWin >= 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {prediction.marketComparison.modelEdge.homeWin >= 0 ? `+${prediction.marketComparison.modelEdge.homeWin}% Edge` : `${prediction.marketComparison.modelEdge.homeWin}%`}
                  </span>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Draw</span>
                  <span className="text-xs text-slate-300 block mt-1">Odds {prediction.marketComparison.bookmakerOdds.draw}</span>
                  <span className={`text-xs font-bold mt-1 block ${prediction.marketComparison.modelEdge.draw >= 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {prediction.marketComparison.modelEdge.draw >= 0 ? `+${prediction.marketComparison.modelEdge.draw}% Edge` : `${prediction.marketComparison.modelEdge.draw}%`}
                  </span>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Away Win</span>
                  <span className="text-xs text-slate-300 block mt-1">Odds {prediction.marketComparison.bookmakerOdds.awayWin}</span>
                  <span className={`text-xs font-bold mt-1 block ${prediction.marketComparison.modelEdge.awayWin >= 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {prediction.marketComparison.modelEdge.awayWin >= 0 ? `+${prediction.marketComparison.modelEdge.awayWin}% Edge` : `${prediction.marketComparison.modelEdge.awayWin}%`}
                  </span>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Over 2.5</span>
                  <span className="text-xs text-slate-300 block mt-1">Odds {prediction.marketComparison.bookmakerOdds.over25}</span>
                  <span className={`text-xs font-bold mt-1 block ${prediction.marketComparison.modelEdge.over25 >= 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {prediction.marketComparison.modelEdge.over25 >= 0 ? `+${prediction.marketComparison.modelEdge.over25}% Edge` : `${prediction.marketComparison.modelEdge.over25}%`}
                  </span>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Under 2.5</span>
                  <span className="text-xs text-slate-300 block mt-1">Odds {prediction.marketComparison.bookmakerOdds.under25}</span>
                  <span className={`text-xs font-bold mt-1 block ${prediction.marketComparison.modelEdge.under25 >= 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {prediction.marketComparison.modelEdge.under25 >= 0 ? `+${prediction.marketComparison.modelEdge.under25}% Edge` : `${prediction.marketComparison.modelEdge.under25}%`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Team Comparison & Form */}
      {activeTab === 'form' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Home Team Form Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={homeTeam.logo} alt={homeTeam.name} className="w-6 h-6 object-contain" />
                  <h4 className="font-bold text-sm text-white">{homeTeam.name}</h4>
                </div>
                <Badge variant="purple" size="sm">Home</Badge>
              </div>

              {/* Form Pills */}
              <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400">Last 5 Matches (Time-Decayed):</span>
                <div className="flex items-center gap-1.5">
                  {homeTeam.recentForm.map((r, i) => (
                    <FormPill key={i} result={r} />
                  ))}
                </div>
              </div>

              {/* Form Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">Goals Scored</span>
                  <span className="text-base font-bold text-white">{homeTeam.goalsFor}</span>
                  <span className="text-[10px] text-slate-500 block">({(homeTeam.goalsFor / Math.max(1, homeTeam.played)).toFixed(1)} / game)</span>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">Goals Conceded</span>
                  <span className="text-base font-bold text-rose-400">{homeTeam.goalsAgainst}</span>
                  <span className="text-[10px] text-slate-500 block">({(homeTeam.goalsAgainst / Math.max(1, homeTeam.played)).toFixed(1)} / game)</span>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">Clean Sheets</span>
                  <span className="text-base font-bold text-emerald-400">{homeTeam.cleanSheets}</span>
                  <span className="text-[10px] text-slate-500 block">in {homeTeam.played} matches</span>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">Home Record</span>
                  <span className="text-base font-bold text-purple-300">
                    {homeTeam.homeRecord.won}W - {homeTeam.homeRecord.drawn}D - {homeTeam.homeRecord.lost}L
                  </span>
                  <span className="text-[10px] text-slate-500 block">GF: {homeTeam.homeRecord.goalsFor} | GA: {homeTeam.homeRecord.goalsAgainst}</span>
                </div>
              </div>

              {/* Attack & Defense Strength */}
              <div className="space-y-2 pt-1">
                <ProgressBar value={homeTeam.attackStrengthRating} label="Attack Strength Rating" color="purple" size="sm" />
                <ProgressBar value={homeTeam.defenseStrengthRating} label="Defense Strength Rating" color="cyan" size="sm" />
              </div>

              {/* Rest & Fatigue */}
              {homeTeam.restAndFatigue && (
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs flex justify-between items-center">
                  <span className="text-slate-400">Rest & Fatigue:</span>
                  <span className="text-slate-200">
                    {homeTeam.restAndFatigue.daysSinceLastMatch} days rest • {homeTeam.restAndFatigue.fatigueRiskLevel} Fatigue
                  </span>
                </div>
              )}
            </div>

            {/* Away Team Form Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={awayTeam.logo} alt={awayTeam.name} className="w-6 h-6 object-contain" />
                  <h4 className="font-bold text-sm text-white">{awayTeam.name}</h4>
                </div>
                <Badge variant="cyan" size="sm">Away</Badge>
              </div>

              {/* Form Pills */}
              <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400">Last 5 Matches (Time-Decayed):</span>
                <div className="flex items-center gap-1.5">
                  {awayTeam.recentForm.map((r, i) => (
                    <FormPill key={i} result={r} />
                  ))}
                </div>
              </div>

              {/* Form Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">Goals Scored</span>
                  <span className="text-base font-bold text-white">{awayTeam.goalsFor}</span>
                  <span className="text-[10px] text-slate-500 block">({(awayTeam.goalsFor / Math.max(1, awayTeam.played)).toFixed(1)} / game)</span>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">Goals Conceded</span>
                  <span className="text-base font-bold text-rose-400">{awayTeam.goalsAgainst}</span>
                  <span className="text-[10px] text-slate-500 block">({(awayTeam.goalsAgainst / Math.max(1, awayTeam.played)).toFixed(1)} / game)</span>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">Clean Sheets</span>
                  <span className="text-base font-bold text-emerald-400">{awayTeam.cleanSheets}</span>
                  <span className="text-[10px] text-slate-500 block">in {awayTeam.played} matches</span>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">Away Record</span>
                  <span className="text-base font-bold text-cyan-300">
                    {awayTeam.awayRecord.won}W - {awayTeam.awayRecord.drawn}D - {awayTeam.awayRecord.lost}L
                  </span>
                  <span className="text-[10px] text-slate-500 block">GF: {awayTeam.awayRecord.goalsFor} | GA: {awayTeam.awayRecord.goalsAgainst}</span>
                </div>
              </div>

              {/* Attack & Defense Strength */}
              <div className="space-y-2 pt-1">
                <ProgressBar value={awayTeam.attackStrengthRating} label="Attack Strength Rating" color="purple" size="sm" />
                <ProgressBar value={awayTeam.defenseStrengthRating} label="Defense Strength Rating" color="cyan" size="sm" />
              </div>

              {/* Rest & Fatigue */}
              {awayTeam.restAndFatigue && (
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs flex justify-between items-center">
                  <span className="text-slate-400">Rest & Fatigue:</span>
                  <span className="text-slate-200">
                    {awayTeam.restAndFatigue.daysSinceLastMatch} days rest • {awayTeam.restAndFatigue.travelDistanceKm}km travel
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Lineups & Tactics */}
      {activeTab === 'lineups' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Tactical Profiles Comparison */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white">Tactical Analysis & In-Possession Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between items-center font-bold text-purple-300 border-b border-slate-800 pb-2">
                  <span>{homeTeam.name}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-purple-950 border border-purple-800">4-3-3 High Press</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Average Possession:</span>
                  <span className="font-mono font-bold text-white">{homeTeam.tactics?.possessionAvg || 58}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Shots per Match:</span>
                  <span className="font-mono font-bold text-white">{homeTeam.tactics?.shotsPerMatch || 15.4} (5.8 on target)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Big Chances Created / Game:</span>
                  <span className="font-mono font-bold text-white">{homeTeam.tactics?.bigChancesCreatedPerMatch || 2.9}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Passing Accuracy:</span>
                  <span className="font-mono font-bold text-white">{homeTeam.tactics?.passAccuracy || 87}%</span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between items-center font-bold text-cyan-300 border-b border-slate-800 pb-2">
                  <span>{awayTeam.name}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">4-2-3-1 Counter Attack</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Average Possession:</span>
                  <span className="font-mono font-bold text-white">{awayTeam.tactics?.possessionAvg || 52}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Shots per Match:</span>
                  <span className="font-mono font-bold text-white">{awayTeam.tactics?.shotsPerMatch || 13.2} (4.6 on target)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Big Chances Created / Game:</span>
                  <span className="font-mono font-bold text-white">{awayTeam.tactics?.bigChancesCreatedPerMatch || 2.1}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Passing Accuracy:</span>
                  <span className="font-mono font-bold text-white">{awayTeam.tactics?.passAccuracy || 82}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Expected Lineups Starting XI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Home Starting XI */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">{homeTeam.name} Projected XI</h4>
                <span className="text-[10px] text-slate-400 font-mono">Formation: 4-3-3</span>
              </div>
              <div className="divide-y divide-slate-800/60 text-xs">
                {homePlayers.slice(0, 11).map((p) => (
                  <div key={p.id} className="py-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-[10px] font-mono text-slate-400">#{p.jerseyNumber}</span>
                      <span className="text-slate-200 font-medium">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">{p.position}</span>
                      {p.isAvailable ? (
                        <span className="text-[10px] text-emerald-400">Available</span>
                      ) : (
                        <span className="text-[10px] text-rose-400 font-semibold">{p.statusNotes || 'Injured'}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Away Starting XI */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">{awayTeam.name} Projected XI</h4>
                <span className="text-[10px] text-slate-400 font-mono">Formation: 4-3-3</span>
              </div>
              <div className="divide-y divide-slate-800/60 text-xs">
                {awayPlayers.slice(0, 11).map((p) => (
                  <div key={p.id} className="py-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-[10px] font-mono text-slate-400">#{p.jerseyNumber}</span>
                      <span className="text-slate-200 font-medium">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">{p.position}</span>
                      {p.isAvailable ? (
                        <span className="text-[10px] text-emerald-400">Available</span>
                      ) : (
                        <span className="text-[10px] text-rose-400 font-semibold">{p.statusNotes || 'Injured'}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Head to Head & Referee */}
      {activeTab === 'h2h' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Summary Metric Counters */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Historical H2H Record ({h2h.totalMatches} Matches Analyzed)
            </h4>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
                <span className="text-xs text-purple-400 font-medium">{homeTeam.name} Wins</span>
                <div className="text-2xl font-black text-white mt-1">{h2h.homeWins}</div>
                <span className="text-[11px] text-slate-400">{Math.round((h2h.homeWins / Math.max(1, h2h.totalMatches)) * 100)}%</span>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
                <span className="text-xs text-slate-400 font-medium">Draws</span>
                <div className="text-2xl font-black text-slate-200 mt-1">{h2h.draws}</div>
                <span className="text-[11px] text-slate-400">{Math.round((h2h.draws / Math.max(1, h2h.totalMatches)) * 100)}%</span>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
                <span className="text-xs text-cyan-400 font-medium">{awayTeam.name} Wins</span>
                <div className="text-2xl font-black text-white mt-1">{h2h.awayWins}</div>
                <span className="text-[11px] text-slate-400">{Math.round((h2h.awayWins / Math.max(1, h2h.totalMatches)) * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Past Meetings Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/40 text-xs font-bold text-slate-300 uppercase tracking-wider">
              Recent Encounters
            </div>
            <div className="divide-y divide-slate-800/70">
              {h2h.recentMatches.map((m) => (
                <div key={m.id} className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-slate-800/30 transition-colors">
                  <div className="w-24 text-slate-500 font-mono text-[11px]">{m.date}</div>
                  <div className="flex-1 flex items-center justify-center gap-3">
                    <span className={`font-semibold ${m.winner === 'HOME' ? 'text-purple-300 font-bold' : 'text-slate-300'}`}>
                      {m.homeTeamName}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-slate-950 font-mono font-bold text-white border border-slate-800">
                      {m.homeScore} - {m.awayScore}
                    </span>
                    <span className={`font-semibold ${m.winner === 'AWAY' ? 'text-cyan-300 font-bold' : 'text-slate-300'}`}>
                      {m.awayTeamName}
                    </span>
                  </div>
                  <div className="w-24 text-right">
                    <span className="text-[11px] text-slate-400">{m.competition}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Referee & Context Card */}
          {referee && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-white">Match Official & Contextual Volatility</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Referee</span>
                  <span className="text-white font-bold block mt-0.5">{referee.name} ({referee.nationality})</span>
                  <span className="text-[10px] text-slate-500">{referee.matchesOfficiated} matches officiated this term</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Disciplinary Average</span>
                  <span className="text-amber-400 font-bold block mt-0.5">{referee.avgYellowCardsPerMatch} Yellows / match</span>
                  <span className="text-[10px] text-slate-500">{referee.avgRedCardsPerMatch} reds / match</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Penalty Frequency</span>
                  <span className="text-cyan-300 font-bold block mt-0.5">{referee.penaltyAwardRatePerMatch} Penalties / match</span>
                  <span className="text-[10px] text-slate-500">Bias: {referee.homeBiasTendency}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: Model Consensus & Weights */}
      {activeTab === 'consensus' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Ensemble Model Consensus Breakdown */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-white">Ensemble Prediction Model Consensus</h4>
              <p className="text-xs text-slate-400">
                Independent probabilistic outputs from all 7 sub-models comprising the GoalPredict AI prediction engine.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { name: 'Bivariate Poisson Goal Matrix', stats: prediction.modelConsensus.poissonModel },
                { name: 'Dynamic Elo Rating Model', stats: prediction.modelConsensus.eloModel },
                { name: 'Exponential Form Decay Model', stats: prediction.modelConsensus.formModel },
                { name: 'Attack / Defense Ratio Index', stats: prediction.modelConsensus.attackDefenseModel },
                { name: 'Home / Away Venue Performance Split', stats: prediction.modelConsensus.homeAwayModel },
                { name: 'Expected Goals (xG) Regression Model', stats: prediction.modelConsensus.xgModel },
                { name: 'Machine Learning Ensemble Simulation', stats: prediction.modelConsensus.machineLearningModel },
              ].map((sub, idx) => (
                <div key={idx} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-bold text-slate-200 block">{sub.name}</span>
                    <span className="text-[10px] text-slate-400">Sub-model weight: {sub.stats.weight}%</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-purple-300">1: {sub.stats.homeWin}%</span>
                    <span className="text-slate-400">X: {sub.stats.draw}%</span>
                    <span className="text-cyan-300">2: {sub.stats.awayWin}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Factor Contributions */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white">Active Factor Weights in Engine</h4>
            <div className="space-y-3">
              {prediction.factorContributions.map((fc, idx) => (
                <div key={idx} className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{fc.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-purple-300 font-mono">
                        Weight: {fc.weight}%
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-semibold ${
                        fc.advantage === 'HOME'
                          ? 'text-purple-400'
                          : fc.advantage === 'AWAY'
                          ? 'text-cyan-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {fc.advantage === 'HOME'
                        ? `${homeTeam.shortName} Edge`
                        : fc.advantage === 'AWAY'
                        ? `${awayTeam.shortName} Edge`
                        : 'Neutral'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <ProgressBar value={fc.homeScore} label={homeTeam.shortName} color="purple" size="sm" />
                    <ProgressBar value={fc.awayScore} label={awayTeam.shortName} color="cyan" size="sm" />
                  </div>
                  <p className="text-[11px] text-slate-400 pt-0.5">{fc.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Statistical Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-900/30 text-[11px] text-slate-400 flex items-start gap-2.5 mt-4">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p>{PREDICTION_DISCLAIMER}</p>
      </div>
    </Modal>
  );
}
