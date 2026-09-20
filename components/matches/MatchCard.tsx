import React from 'react';
import { Calendar, Clock, ChevronRight, Shield, Flame } from 'lucide-react';
import { Match } from '@/types/football';
import { Badge, FormPill } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { isMatchToday, isMatchTomorrow, formatMatchDateLabel } from '@/lib/dateUtils';

interface MatchCardProps {
  match: Match;
  onViewAnalysis: (match: Match) => void;
  variant?: 'standard' | 'compact' | 'featured';
}

export function MatchCard({ match, onViewAnalysis, variant = 'standard' }: MatchCardProps) {
  const { homeTeam, awayTeam, prediction, leagueName, date, kickoffTime, isFeatured, isHotPick } = match;

  const getPredictionColor = (pred: string) => {
    if (pred.includes('Home')) return 'purple';
    if (pred.includes('Away')) return 'cyan';
    return 'neutral';
  };

  const isToday = isMatchToday(date);
  const isTomorrow = isMatchTomorrow(date);
  const dateLabel = formatMatchDateLabel(date);

  return (
    <div
      id={`match-card-${match.id}`}
      className={`group relative rounded-2xl border transition-all duration-300 bg-[#0F172A]/90 hover:bg-[#131D36] ${
        isFeatured
          ? 'border-purple-500/40 shadow-lg shadow-purple-950/20'
          : 'border-slate-800 hover:border-slate-700'
      } p-5 flex flex-col justify-between`}
    >
      {/* Top Meta Bar */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800/80 text-xs" suppressHydrationWarning>
          <div className="flex items-center gap-2 text-slate-400" suppressHydrationWarning>
            <span className="font-semibold text-slate-300">{leagueName}</span>
            <span>•</span>
            {isToday ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full" suppressHydrationWarning>
                <Calendar className="w-3 h-3 text-emerald-400" />
                Today
              </span>
            ) : isTomorrow ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-purple-300 bg-purple-950/50 border border-purple-500/30 px-2 py-0.5 rounded-full" suppressHydrationWarning>
                <Calendar className="w-3 h-3 text-purple-300" />
                Tomorrow
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-slate-400" suppressHydrationWarning>
                <Calendar className="w-3.5 h-3.5" />
                {dateLabel}
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] text-slate-400" suppressHydrationWarning>
              <Clock className="w-3.5 h-3.5" />
              {kickoffTime}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isHotPick && (
              <Badge variant="cyan" size="sm" className="gap-1">
                <Flame className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                Hot Pick
              </Badge>
            )}
            {isFeatured && (
              <Badge variant="primary" size="sm">
                Featured
              </Badge>
            )}
          </div>
        </div>

        {/* Teams Matchup Header */}
        <div className="grid grid-cols-7 items-center gap-2 my-2">
          {/* Home Team */}
          <div className="col-span-3 flex flex-col items-center sm:items-start text-center sm:text-left space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 p-1.5 flex items-center justify-center shrink-0 shadow-inner">
                {/* Fallback to team initial or logo image */}
                <img
                  src={homeTeam.logo}
                  alt={homeTeam.name}
                  className="w-7 h-7 object-contain"
                  onError={(e) => {
                    // Fallback to shield
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 group-hover:text-white transition-colors leading-tight">
                  {homeTeam.name}
                </h3>
                <span className="text-[11px] text-slate-400">Pos: #{homeTeam.leaguePosition}</span>
              </div>
            </div>

            {/* Home Recent Form */}
            <div className="flex items-center gap-1 pt-1" title="Last 5 matches form">
              {homeTeam.recentForm.slice(0, 5).map((res, i) => (
                <FormPill key={i} result={res} />
              ))}
            </div>
          </div>

          {/* Center VS & Score prediction */}
          <div className="col-span-1 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">VS</span>
            <div className="mt-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-purple-300">
              {prediction.predictedScore}
            </div>
          </div>

          {/* Away Team */}
          <div className="col-span-3 flex flex-col items-center sm:items-end text-center sm:text-right space-y-2">
            <div className="flex items-center gap-2.5 flex-row-reverse sm:flex-row">
              <div className="text-right">
                <h3 className="font-bold text-sm text-slate-100 group-hover:text-white transition-colors leading-tight">
                  {awayTeam.name}
                </h3>
                <span className="text-[11px] text-slate-400">Pos: #{awayTeam.leaguePosition}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 p-1.5 flex items-center justify-center shrink-0 shadow-inner">
                <img
                  src={awayTeam.logo}
                  alt={awayTeam.name}
                  className="w-7 h-7 object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>

            {/* Away Recent Form */}
            <div className="flex items-center gap-1 pt-1 justify-end" title="Last 5 matches form">
              {awayTeam.recentForm.slice(0, 5).map((res, i) => (
                <FormPill key={i} result={res} />
              ))}
            </div>
          </div>
        </div>

        {/* Prediction Summary Strip */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 bg-slate-900/40 rounded-xl p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Model Pick:</span>
              <Badge variant={getPredictionColor(prediction.primaryPrediction)} size="md">
                {prediction.primaryPrediction}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-slate-400">Confidence:</span>
              <span className={prediction.confidence >= 70 ? 'text-emerald-400' : 'text-purple-300'}>
                {prediction.confidence}%
              </span>
            </div>
          </div>

          {/* Micro Probability Visualizer */}
          <ProgressBar
            value={prediction.confidence}
            showValue={false}
            color={prediction.confidence >= 70 ? 'emerald' : 'purple'}
            size="sm"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span>
              1X2 Prob: <strong className="text-slate-200">{prediction.homeWinProbability}% - {prediction.drawProbability}% - {prediction.awayWinProbability}%</strong>
            </span>
            <span>
              Over 2.5: <strong className="text-slate-200">{prediction.over25Probability}%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 truncate max-w-[170px]" title={match.venue}>
          🏟️ {match.venue.split(',')[0]}
        </span>
        <button
          id={`btn-analysis-${match.id}`}
          onClick={() => onViewAnalysis(match)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-600/20 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 hover:border-purple-600 transition-all duration-200 group/btn"
        >
          <span>View Analysis</span>
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
