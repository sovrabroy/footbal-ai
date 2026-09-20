import { Team, HeadToHeadSummary } from '@/types/football';
import { TEAMS, getH2H } from '@/data/mockFootballData';
import { footballDataStore } from '@/services/footballApi';

export const teamService = {
  getAllTeamsSync(): Team[] {
    return Object.values(TEAMS);
  },

  async getAllTeams(): Promise<Team[]> {
    return footballDataStore.getTeams();
  },

  async getTeamById(id: string): Promise<Team | undefined> {
    const teams = await footballDataStore.getTeams();
    return teams.find((t) => t.id === id) || TEAMS[id];
  },

  async getHeadToHead(homeTeamId: string, awayTeamId: string): Promise<HeadToHeadSummary> {
    return getH2H(homeTeamId, awayTeamId);
  },
};
