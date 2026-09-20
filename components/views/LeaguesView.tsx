'use client';

import React, { useState } from 'react';
import { Trophy, Users, Award, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import { League, Match } from '@/types/football';
import { STANDINGS_DATA, TOP_SCORERS } from '@/data/mockFootballData';
import { MatchCard } from '@/components/matches/MatchCard';
import { Badge, FormPill } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface LeaguesViewProps {
  leagues: League[];
  matches: Match[];
  onViewAnalysis: (match: Match) => void;
}

export function LeaguesView({ leagues, matches, onViewAnalysis }: LeaguesViewProps) {
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>(leagues[0]?.id || 'epl');

  const currentLeague = leagues.find((l) => l.id === selectedLeagueId) || leagues[0];
  const standings = STANDINGS_DATA[currentLeague.id] || STANDINGS_DATA['epl'];
  const topScorers = TOP_SCORERS[currentLeague.id] || TOP_SCORERS['epl'];
  const leagueMatches = matches.filter((m) => m.leagueId === currentLeague.id);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Trophy className="w-7 h-7 text-purple-400" />
          Competitions, Standings & League Models
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Explore team tables, top scorers, prediction success rates, and upcoming league clashes
        </p>
      </div>

      {/* League Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {leagues.map((lg) => {
          const isSelected = lg.id === currentLeague.id;
          return (
            <button
              key={lg.id}
              onClick={() => setSelectedLeagueId(lg.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-950/40'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span className="text-base">{lg.flag}</span>
              <span>{lg.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950/60 font-mono text-purple-200">
                {lg.accuracyRate}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Current League Hero Summary Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-[#121A33] via-[#0E1528] to-[#0A0E1A] p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{currentLeague.flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white">{currentLeague.name}</h2>
                <Badge variant="cyan" size="sm">
                  {currentLeague.country}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Season {currentLeague.season} • {currentLeague.totalMatches} Season Fixtures
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-700/60 rounded-xl p-3">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Model Accuracy</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">{currentLeague.accuracyRate}%</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Scheduled</span>
              <span className="text-xl font-bold text-purple-300 font-mono">{leagueMatches.length} Matches</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Standings Table (2 cols) & Top Scorers / Upcoming (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Standings Table (2 columns on desktop) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              League Standings
            </h3>
            <span className="text-xs text-slate-400">Matchday Form & Goal Difference</span>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-3 text-center">#</th>
                    <th className="py-3 px-4">Club</th>
                    <th className="py-3 px-2 text-center">P</th>
                    <th className="py-3 px-2 text-center">W</th>
                    <th className="py-3 px-2 text-center">D</th>
                    <th className="py-3 px-2 text-center">L</th>
                    <th className="py-3 px-2 text-center">GD</th>
                    <th className="py-3 px-3 text-center font-bold text-white">Pts</th>
                    <th className="py-3 px-4 text-right">Recent Form</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {standings.map((row) => (
                    <tr key={row.teamId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 text-center font-bold font-mono text-slate-400">
                        <span
                          className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] ${
                            row.position <= 4 ? 'bg-purple-950 text-purple-300 border border-purple-800/60' : ''
                          }`}
                        >
                          {row.position}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={row.teamLogo}
                            alt={row.teamName}
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span className="font-bold text-white">{row.teamName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-slate-400">{row.played}</td>
                      <td className="py-3 px-2 text-center font-mono text-slate-300">{row.won}</td>
                      <td className="py-3 px-2 text-center font-mono text-slate-300">{row.drawn}</td>
                      <td className="py-3 px-2 text-center font-mono text-slate-300">{row.lost}</td>
                      <td className="py-3 px-2 text-center font-mono">
                        <span className={row.goalDifference >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-white text-sm bg-slate-900/50">
                        {row.points}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 justify-end">
                          {row.form.map((f, idx) => (
                            <FormPill key={idx} result={f} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Top Scorers & League Fixtures */}
        <div className="space-y-6">
          {/* Top Scorers Card */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Golden Boot Leaders
            </h3>

            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/70 shadow-xl">
              {topScorers.map((scorer) => (
                <div key={scorer.playerName} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-5 font-bold font-mono text-slate-500">#{scorer.rank}</span>
                    <div>
                      <h4 className="font-bold text-white">{scorer.playerName}</h4>
                      <span className="text-[11px] text-slate-400">{scorer.teamName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-amber-400">{scorer.goals} Goals</span>
                    <span className="text-[10px] text-slate-500 block">{scorer.assists} assists ({scorer.matches} app)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* League Upcoming Match Picks */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Scheduled {currentLeague.name} Matches
            </h3>

            {leagueMatches.length > 0 ? (
              <div className="space-y-3">
                {leagueMatches.slice(0, 2).map((m) => (
                  <MatchCard key={m.id} match={m} onViewAnalysis={onViewAnalysis} />
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center text-xs text-slate-400">
                No active upcoming matches in this competition for the current cycle.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
