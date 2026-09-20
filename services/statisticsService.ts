import { Team, League, StandingRow, TopScorer } from '@/types/football';
import { footballDataStore } from './footballApi';

export const statisticsService = {
  /**
   * Get standings for a given league
   */
  async getStandings(leagueId: string): Promise<StandingRow[]> {
    return footballDataStore.getStandings(leagueId);
  },

  getStandingsSync(leagueId: string): StandingRow[] {
    return footballDataStore.getStandingsSync(leagueId);
  },

  /**
   * Get top scorers for a league
   */
  async getTopScorers(leagueId: string): Promise<TopScorer[]> {
    return footballDataStore.getTopScorers(leagueId);
  },

  getTopScorersSync(leagueId: string): TopScorer[] {
    return footballDataStore.getTopScorersSync(leagueId);
  },

  /**
   * Calculate league-wide aggregated metrics
   */
  getLeagueMacroStats(league: League, teams: Team[]) {
    const leagueTeams = teams.filter((t) => t.leagueId === league.id);
    if (leagueTeams.length === 0) {
      return {
        avgGoalsPerMatch: 2.78,
        homeWinRate: 46,
        drawRate: 25,
        awayWinRate: 29,
        bttsRate: 54,
        over25Rate: 53,
      };
    }

    const totalGoals = leagueTeams.reduce((sum, t) => sum + t.goalsFor, 0);
    const totalPlayed = leagueTeams.reduce((sum, t) => sum + t.played, 0) / 2;
    const avgGoals = Number((totalGoals / Math.max(1, totalPlayed)).toFixed(2));

    const totalHomeWins = leagueTeams.reduce((sum, t) => sum + t.homeRecord.won, 0);
    const totalHomeDraws = leagueTeams.reduce((sum, t) => sum + t.homeRecord.drawn, 0);
    const totalHomeLosses = leagueTeams.reduce((sum, t) => sum + t.homeRecord.lost, 0);
    const totalHomeMatches = totalHomeWins + totalHomeDraws + totalHomeLosses;

    return {
      avgGoalsPerMatch: avgGoals || 2.82,
      homeWinRate: Math.round((totalHomeWins / Math.max(1, totalHomeMatches)) * 100) || 45,
      drawRate: Math.round((totalHomeDraws / Math.max(1, totalHomeMatches)) * 100) || 26,
      awayWinRate: Math.round((totalHomeLosses / Math.max(1, totalHomeMatches)) * 100) || 29,
      bttsRate: 53,
      over25Rate: 54,
    };
  },

  /**
   * Get team trend metrics
   */
  getTeamTrendMetrics(team: Team) {
    const ppg = ((team.won * 3 + team.drawn) / Math.max(1, team.played)).toFixed(2);
    const homePPG = (
      (team.homeRecord.won * 3 + team.homeRecord.drawn) /
      Math.max(1, team.homeRecord.played)
    ).toFixed(2);
    const awayPPG = (
      (team.awayRecord.won * 3 + team.awayRecord.drawn) /
      Math.max(1, team.awayRecord.played)
    ).toFixed(2);

    const goalDiffPerMatch = (team.goalDifference / Math.max(1, team.played)).toFixed(2);
    const cleanSheetRate = Math.round((team.cleanSheets / Math.max(1, team.played)) * 100);

    return {
      ppg,
      homePPG,
      awayPPG,
      goalDiffPerMatch,
      cleanSheetRate,
      winRate: Math.round((team.won / Math.max(1, team.played)) * 100),
      drawRate: Math.round((team.drawn / Math.max(1, team.played)) * 100),
      lossRate: Math.round((team.lost / Math.max(1, team.played)) * 100),
    };
  },
};
