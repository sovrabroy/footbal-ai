'use client';

import React, { useState, useMemo } from 'react';
import { Search, Calendar, Filter, SlidersHorizontal, Trophy, Clock, ChevronDown, RotateCcw } from 'lucide-react';
import { Match, League } from '@/types/football';
import { MatchCard } from '@/components/matches/MatchCard';
import { Badge } from '@/components/ui/Badge';
import { isMatchToday, isMatchTomorrow, getTodayDateString, getDateOffsetString } from '@/lib/dateUtils';

interface MatchesViewProps {
  matches: Match[];
  leagues: League[];
  onViewAnalysis: (match: Match) => void;
}

export function MatchesView({ matches, leagues, onViewAnalysis }: MatchesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'week' | 'custom'>('all');
  const [customDate, setCustomDate] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [confidenceTier, setConfidenceTier] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const todayStr = getTodayDateString();
  const weekLaterStr = getDateOffsetString(7);

  const todayCount = useMemo(() => matches.filter((m) => isMatchToday(m.date)).length, [matches]);
  const tomorrowCount = useMemo(() => matches.filter((m) => isMatchTomorrow(m.date)).length, [matches]);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // 1. Search filter (team name or league name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          m.homeTeam.name.toLowerCase().includes(q) ||
          m.awayTeam.name.toLowerCase().includes(q) ||
          m.leagueName.toLowerCase().includes(q) ||
          m.venue.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // 2. League filter
      if (selectedLeague !== 'all' && m.leagueId !== selectedLeague) {
        return false;
      }

      // 3. Date filter
      if (dateFilter === 'today' && !isMatchToday(m.date)) return false;
      if (dateFilter === 'tomorrow' && !isMatchTomorrow(m.date)) return false;
      if (dateFilter === 'week' && (m.status === 'FINISHED' || m.date < todayStr || m.date > weekLaterStr)) return false;
      if (dateFilter === 'custom' && customDate && m.date !== customDate) return false;

      // 4. Confidence filter
      if (confidenceTier === 'high' && m.prediction.confidence < 70) return false;
      if (confidenceTier === 'medium' && (m.prediction.confidence < 58 || m.prediction.confidence >= 70)) return false;
      if (confidenceTier === 'low' && m.prediction.confidence >= 58) return false;

      return true;
    });
  }, [matches, searchQuery, selectedLeague, dateFilter, customDate, confidenceTier, todayStr, weekLaterStr]);

  const resetFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
    setCustomDate('');
    setSelectedLeague('all');
    setConfidenceTier('all');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Football Fixtures & Match Predictions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse upcoming matches, live statistical models, and expected goals analysis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-white">{filteredMatches.length}</strong> of {matches.length} matches
          </span>
          {(searchQuery || selectedLeague !== 'all' || dateFilter !== 'all' || confidenceTier !== 'all') && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-semibold ml-2 px-2 py-1 rounded bg-slate-900 border border-slate-800"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
        {/* Top Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="match-search-input"
            type="text"
            placeholder="Search teams (e.g., Manchester City, Real Madrid) or leagues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/70 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Date Segment Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Match Date
            </label>
            <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setDateFilter('all')}
                className={`py-1.5 rounded-lg font-medium transition-all ${
                  dateFilter === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDateFilter('today')}
                className={`py-1.5 rounded-lg font-medium transition-all ${
                  dateFilter === 'today' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Today ({todayCount})
              </button>
              <button
                onClick={() => setDateFilter('tomorrow')}
                className={`py-1.5 rounded-lg font-medium transition-all ${
                  dateFilter === 'tomorrow' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tmrw ({tomorrowCount})
              </button>
              <button
                onClick={() => setDateFilter('week')}
                className={`py-1.5 rounded-lg font-medium transition-all ${
                  dateFilter === 'week' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Week
              </button>
            </div>
          </div>

          {/* League Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              League / Competition
            </label>
            <select
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="w-full py-2 px-3 bg-slate-900 border border-slate-700/70 rounded-xl text-xs text-white focus:outline-hidden focus:border-purple-500"
            >
              <option value="all">All Leagues ({leagues.length})</option>
              {leagues.map((lg) => (
                <option key={lg.id} value={lg.id}>
                  {lg.name} ({lg.country})
                </option>
              ))}
            </select>
          </div>

          {/* Confidence Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Model Confidence
            </label>
            <select
              value={confidenceTier}
              onChange={(e) => setConfidenceTier(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-900 border border-slate-700/70 rounded-xl text-xs text-white focus:outline-hidden focus:border-purple-500"
            >
              <option value="all">All Confidence Levels</option>
              <option value="high">High Confidence (≥ 70%)</option>
              <option value="medium">Medium Confidence (58% - 69%)</option>
              <option value="low">Low Confidence (&lt; 58%)</option>
            </select>
          </div>

          {/* Custom Date Picker */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Specific Date
            </label>
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                if (e.target.value) setDateFilter('custom');
              }}
              className="w-full py-1.5 px-3 bg-slate-900 border border-slate-700/70 rounded-xl text-xs text-white focus:outline-hidden focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Match Results Grid */}
      {filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onViewAnalysis={onViewAnalysis}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No matches match your filter criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, clearing date constraints, or switching to &ldquo;All Leagues&rdquo;.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-500 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
