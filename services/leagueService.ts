import { League, StandingRow, TopScorer, Match } from '@/types/football';
import { LEAGUES, STANDINGS_DATA, TOP_SCORERS } from '@/data/mockFootballData';
import { footballDataStore } from '@/services/footballApi';

export const leagueService = {
  getAllLeaguesSync(): League[] {
    return [...LEAGUES];
  },

  async getAllLeagues(): Promise<League[]> {
    return footballDataStore.getLeagues();
  },

  async getLeagueById(id: string): Promise<League | undefined> {
    const leagues = await footballDataStore.getLeagues();
    return leagues.find((l) => l.id === id) || LEAGUES.find((l) => l.id === id);
  },

  async getStandings(leagueId: string): Promise<StandingRow[]> {
    return STANDINGS_DATA[leagueId] || STANDINGS_DATA['epl'];
  },

  async getTopScorers(leagueId: string): Promise<TopScorer[]> {
    return TOP_SCORERS[leagueId] || TOP_SCORERS['epl'];
  },

  async getLeagueMatches(leagueId: string): Promise<Match[]> {
    const matches = await footballDataStore.getMatches();
    return matches.filter((m) => m.leagueId === leagueId);
  },
};
