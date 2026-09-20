import { Match, MatchStatus, PredictionModelWeights } from '@/types/football';
import { footballDataStore } from './footballApi';
import { calculateMatchPrediction } from './predictionService';
import { getH2H } from '@/data/mockFootballData';

export const matchService = {
  /**
   * Get all matches currently tracked
   */
  async getAllMatches(): Promise<Match[]> {
    return footballDataStore.getMatches();
  },

  getAllMatchesSync(): Match[] {
    return footballDataStore.getMatchesSync();
  },

  /**
   * Get match by unique ID with full enriched data
   */
  async getMatchById(id: string): Promise<Match | null> {
    const matches = await this.getAllMatches();
    return matches.find((m) => m.id === id) || null;
  },

  getMatchByIdSync(id: string): Match | null {
    const matches = this.getAllMatchesSync();
    return matches.find((m) => m.id === id) || null;
  },

  /**
   * Get upcoming matches filtered by league
   */
  async getMatchesByLeague(leagueId: string): Promise<Match[]> {
    const matches = await this.getAllMatches();
    if (leagueId === 'all') return matches;
    return matches.filter((m) => m.leagueId === leagueId);
  },

  /**
   * Get matches by date string (YYYY-MM-DD)
   */
  async getMatchesByDate(dateStr: string): Promise<Match[]> {
    const matches = await this.getAllMatches();
    return matches.filter((m) => m.date === dateStr);
  },

  /**
   * Get featured matches and hot picks
   */
  async getFeaturedMatches(): Promise<Match[]> {
    const matches = await this.getAllMatches();
    return matches.filter((m) => m.isFeatured);
  },

  async getHotPicks(): Promise<Match[]> {
    const matches = await this.getAllMatches();
    return matches.filter((m) => m.isHotPick);
  },

  /**
   * Get high-confidence predictions (e.g. >= 70%)
   */
  async getHighConfidenceMatches(threshold: number = 70): Promise<Match[]> {
    const matches = await this.getAllMatches();
    return matches.filter((m) => m.prediction.confidence >= threshold);
  },

  /**
   * Add a new match to the system and calculate its prediction
   */
  async addMatch(
    newMatchData: Omit<Match, 'id' | 'prediction'>,
    weights?: PredictionModelWeights
  ): Promise<Match> {
    const id = `match_${Date.now()}`;
    const h2h = getH2H(newMatchData.homeTeam.id, newMatchData.awayTeam.id);
    const prediction = calculateMatchPrediction(
      id,
      newMatchData.homeTeam,
      newMatchData.awayTeam,
      h2h,
      weights,
      undefined,
      newMatchData.referee
    );

    const match: Match = {
      ...newMatchData,
      id,
      prediction,
    };

    return footballDataStore.addMatch(match);
  },

  /**
   * Update an existing match
   */
  async updateMatch(match: Match): Promise<Match> {
    return footballDataStore.updateMatch(match);
  },

  /**
   * Delete a match
   */
  async deleteMatch(id: string): Promise<boolean> {
    return footballDataStore.deleteMatch(id);
  },
};
