import { Player, TeamLineup } from '@/types/football';

// Rich player database for key European squads
const PLAYER_DATABASE: Record<string, Player[]> = {
  mancity: [
    { id: 'mc_1', name: 'Ederson', position: 'GK', jerseyNumber: 31, isKeyPlayer: true, isAvailable: true, minutesPlayed: 1890 },
    { id: 'mc_2', name: 'Kyle Walker', position: 'DEF', jerseyNumber: 2, isKeyPlayer: false, isAvailable: true, minutesPlayed: 1240 },
    { id: 'mc_3', name: 'Rúben Dias', position: 'DEF', jerseyNumber: 3, isKeyPlayer: true, isAvailable: true, minutesPlayed: 1980 },
    { id: 'mc_4', name: 'Josko Gvardiol', position: 'DEF', jerseyNumber: 24, isKeyPlayer: true, isAvailable: true, minutesPlayed: 1750 },
    { id: 'mc_5', name: 'Rodri', position: 'MID', jerseyNumber: 16, isKeyPlayer: true, isAvailable: false, statusNotes: 'ACL recovery - out for season', seasonGoals: 3, seasonAssists: 5 },
    { id: 'mc_6', name: 'Kevin De Bruyne', position: 'MID', jerseyNumber: 17, isKeyPlayer: true, isAvailable: true, seasonGoals: 4, seasonAssists: 9, minutesPlayed: 1120 },
    { id: 'mc_7', name: 'Bernardo Silva', position: 'MID', jerseyNumber: 20, isKeyPlayer: true, isAvailable: true, seasonGoals: 6, seasonAssists: 5, minutesPlayed: 1820 },
    { id: 'mc_8', name: 'Phil Foden', position: 'MID', jerseyNumber: 47, isKeyPlayer: true, isAvailable: true, seasonGoals: 11, seasonAssists: 7, minutesPlayed: 1910 },
    { id: 'mc_9', name: 'Erling Haaland', position: 'FWD', jerseyNumber: 9, isKeyPlayer: true, isAvailable: true, seasonGoals: 22, seasonAssists: 3, minutesPlayed: 2050 },
    { id: 'mc_10', name: 'Jérémy Doku', position: 'FWD', jerseyNumber: 11, isKeyPlayer: false, isAvailable: true, seasonGoals: 4, seasonAssists: 6 },
    { id: 'mc_11', name: 'Savinho', position: 'FWD', jerseyNumber: 26, isKeyPlayer: false, isAvailable: true, seasonGoals: 3, seasonAssists: 5 },
  ],
  arsenal: [
    { id: 'ars_1', name: 'David Raya', position: 'GK', jerseyNumber: 22, isKeyPlayer: true, isAvailable: true, minutesPlayed: 2070 },
    { id: 'ars_2', name: 'Ben White', position: 'DEF', jerseyNumber: 4, isKeyPlayer: true, isAvailable: true, minutesPlayed: 1680 },
    { id: 'ars_3', name: 'William Saliba', position: 'DEF', jerseyNumber: 2, isKeyPlayer: true, isAvailable: true, minutesPlayed: 2160 },
    { id: 'ars_4', name: 'Gabriel Magalhães', position: 'DEF', jerseyNumber: 6, isKeyPlayer: true, isAvailable: true, minutesPlayed: 2100, seasonGoals: 3 },
    { id: 'ars_5', name: 'Jurriën Timber', position: 'DEF', jerseyNumber: 12, isKeyPlayer: false, isAvailable: true, minutesPlayed: 1420 },
    { id: 'ars_6', name: 'Declan Rice', position: 'MID', jerseyNumber: 41, isKeyPlayer: true, isAvailable: true, seasonGoals: 4, seasonAssists: 6, minutesPlayed: 2050 },
    { id: 'ars_7', name: 'Martin Ødegaard', position: 'MID', jerseyNumber: 8, isKeyPlayer: true, isAvailable: true, seasonGoals: 7, seasonAssists: 8, minutesPlayed: 1780 },
    { id: 'ars_8', name: 'Thomas Partey', position: 'MID', jerseyNumber: 5, isKeyPlayer: false, isAvailable: true, minutesPlayed: 1640 },
    { id: 'ars_9', name: 'Bukayo Saka', position: 'FWD', jerseyNumber: 7, isKeyPlayer: true, isAvailable: true, seasonGoals: 12, seasonAssists: 11, minutesPlayed: 1980 },
    { id: 'ars_10', name: 'Kai Havertz', position: 'FWD', jerseyNumber: 29, isKeyPlayer: true, isAvailable: true, seasonGoals: 10, seasonAssists: 4, minutesPlayed: 1890 },
    { id: 'ars_11', name: 'Gabriel Martinelli', position: 'FWD', jerseyNumber: 11, isKeyPlayer: false, isAvailable: true, seasonGoals: 6, seasonAssists: 4 },
  ],
  realmadrid: [
    { id: 'rm_1', name: 'Thibaut Courtois', position: 'GK', jerseyNumber: 1, isKeyPlayer: true, isAvailable: true, minutesPlayed: 1800 },
    { id: 'rm_2', name: 'Antonio Rüdiger', position: 'DEF', jerseyNumber: 22, isKeyPlayer: true, isAvailable: true, minutesPlayed: 2100 },
    { id: 'rm_3', name: 'Éder Militão', position: 'DEF', jerseyNumber: 3, isKeyPlayer: true, isAvailable: false, statusNotes: 'Cruciate ligament injury', minutesPlayed: 890 },
    { id: 'rm_4', name: 'Dani Carvajal', position: 'DEF', jerseyNumber: 2, isKeyPlayer: true, isAvailable: false, statusNotes: 'Knee injury - undergoing rehab' },
    { id: 'rm_5', name: 'Federico Valverde', position: 'MID', jerseyNumber: 8, isKeyPlayer: true, isAvailable: true, seasonGoals: 5, seasonAssists: 4, minutesPlayed: 2150 },
    { id: 'rm_6', name: 'Aurélien Tchouaméni', position: 'MID', jerseyNumber: 14, isKeyPlayer: true, isAvailable: true, minutesPlayed: 1720 },
    { id: 'rm_7', name: 'Jude Bellingham', position: 'MID', jerseyNumber: 5, isKeyPlayer: true, isAvailable: true, seasonGoals: 9, seasonAssists: 7, minutesPlayed: 1940 },
    { id: 'rm_8', name: 'Rodrygo', position: 'FWD', jerseyNumber: 11, isKeyPlayer: true, isAvailable: true, seasonGoals: 7, seasonAssists: 5 },
    { id: 'rm_9', name: 'Kylian Mbappé', position: 'FWD', jerseyNumber: 9, isKeyPlayer: true, isAvailable: true, seasonGoals: 19, seasonAssists: 4, minutesPlayed: 2020 },
    { id: 'rm_10', name: 'Vinícius Júnior', position: 'FWD', jerseyNumber: 7, isKeyPlayer: true, isAvailable: true, seasonGoals: 14, seasonAssists: 8, minutesPlayed: 1900 },
  ],
  barcelona: [
    { id: 'fcb_1', name: 'Iñaki Peña', position: 'GK', jerseyNumber: 13, isKeyPlayer: false, isAvailable: true, minutesPlayed: 1450 },
    { id: 'fcb_2', name: 'Marc-André ter Stegen', position: 'GK', jerseyNumber: 1, isKeyPlayer: true, isAvailable: false, statusNotes: 'Patellar tendon recovery' },
    { id: 'fcb_3', name: 'Pau Cubarsí', position: 'DEF', jerseyNumber: 2, isKeyPlayer: true, isAvailable: true, minutesPlayed: 1950 },
    { id: 'fcb_4', name: 'Iñigo Martínez', position: 'DEF', jerseyNumber: 5, isKeyPlayer: true, isAvailable: true, minutesPlayed: 1820 },
    { id: 'fcb_5', name: 'Alejandro Balde', position: 'DEF', jerseyNumber: 3, isKeyPlayer: true, isAvailable: true, minutesPlayed: 1740 },
    { id: 'fcb_6', name: 'Pedri', position: 'MID', jerseyNumber: 8, isKeyPlayer: true, isAvailable: true, seasonGoals: 5, seasonAssists: 6, minutesPlayed: 1890 },
    { id: 'fcb_7', name: 'Marc Casadó', position: 'MID', jerseyNumber: 17, isKeyPlayer: false, isAvailable: true, minutesPlayed: 1620 },
    { id: 'fcb_8', name: 'Dani Olmo', position: 'MID', jerseyNumber: 20, isKeyPlayer: true, isAvailable: true, seasonGoals: 7, seasonAssists: 4, minutesPlayed: 1120 },
    { id: 'fcb_9', name: 'Lamine Yamal', position: 'FWD', jerseyNumber: 19, isKeyPlayer: true, isAvailable: true, seasonGoals: 8, seasonAssists: 12, minutesPlayed: 1960 },
    { id: 'fcb_10', name: 'Robert Lewandowski', position: 'FWD', jerseyNumber: 9, isKeyPlayer: true, isAvailable: true, seasonGoals: 21, seasonAssists: 3, minutesPlayed: 2010 },
    { id: 'fcb_11', name: 'Raphinha', position: 'FWD', jerseyNumber: 11, isKeyPlayer: true, isAvailable: true, seasonGoals: 13, seasonAssists: 10, minutesPlayed: 1940 },
  ],
};

export const playerService = {
  /**
   * Get all registered players for a team
   */
  getPlayersByTeam(teamId: string): Player[] {
    if (PLAYER_DATABASE[teamId]) {
      return PLAYER_DATABASE[teamId];
    }
    // Fallback realistic squad generation
    return [
      { id: `${teamId}_1`, name: 'Starting Goalkeeper', position: 'GK', jerseyNumber: 1, isKeyPlayer: true, isAvailable: true },
      { id: `${teamId}_2`, name: 'Center Back (L)', position: 'DEF', jerseyNumber: 4, isKeyPlayer: true, isAvailable: true },
      { id: `${teamId}_3`, name: 'Center Back (R)', position: 'DEF', jerseyNumber: 5, isKeyPlayer: true, isAvailable: true },
      { id: `${teamId}_4`, name: 'Full Back (R)', position: 'DEF', jerseyNumber: 2, isKeyPlayer: false, isAvailable: true },
      { id: `${teamId}_5`, name: 'Full Back (L)', position: 'DEF', jerseyNumber: 3, isKeyPlayer: false, isAvailable: true },
      { id: `${teamId}_6`, name: 'Central Midfielder', position: 'MID', jerseyNumber: 6, isKeyPlayer: true, isAvailable: true },
      { id: `${teamId}_7`, name: 'Playmaker', position: 'MID', jerseyNumber: 8, isKeyPlayer: true, isAvailable: true, seasonGoals: 4, seasonAssists: 6 },
      { id: `${teamId}_8`, name: 'Winger (R)', position: 'MID', jerseyNumber: 7, isKeyPlayer: true, isAvailable: true, seasonGoals: 6, seasonAssists: 5 },
      { id: `${teamId}_9`, name: 'Winger (L)', position: 'MID', jerseyNumber: 11, isKeyPlayer: false, isAvailable: true, seasonGoals: 5, seasonAssists: 3 },
      { id: `${teamId}_10`, name: 'Striker', position: 'FWD', jerseyNumber: 9, isKeyPlayer: true, isAvailable: true, seasonGoals: 12, seasonAssists: 2 },
      { id: `${teamId}_11`, name: 'Attacking Forward', position: 'FWD', jerseyNumber: 10, isKeyPlayer: true, isAvailable: true, seasonGoals: 8, seasonAssists: 4 },
    ];
  },

  /**
   * Get unavailable / injured players for a team
   */
  getInjuredPlayers(teamId: string): Player[] {
    const players = this.getPlayersByTeam(teamId);
    return players.filter((p) => !p.isAvailable);
  },

  /**
   * Calculate tactical impact of missing players on team expected goals
   */
  calculateInjuryImpact(teamId: string): { xgDampener: number; defenseImpact: number; missingKeyCount: number } {
    const injured = this.getInjuredPlayers(teamId);
    const missingKeys = injured.filter((p) => p.isKeyPlayer);

    let xgDampener = 1.0;
    let defenseImpact = 1.0;

    missingKeys.forEach((p) => {
      if (p.position === 'FWD') xgDampener -= 0.08;
      if (p.position === 'MID') xgDampener -= 0.05;
      if (p.position === 'DEF' || p.position === 'GK') defenseImpact += 0.07;
    });

    return {
      xgDampener: Math.max(0.75, Number(xgDampener.toFixed(2))),
      defenseImpact: Math.min(1.3, Number(defenseImpact.toFixed(2))),
      missingKeyCount: missingKeys.length,
    };
  },

  /**
   * Construct expected lineup for a team
   */
  getExpectedLineup(teamId: string): TeamLineup {
    const players = this.getPlayersByTeam(teamId);
    const available = players.filter((p) => p.isAvailable);
    const startingXI = available.slice(0, 11);
    const bench = available.slice(11);

    return {
      formation: '4-3-3',
      startingXI,
      bench,
      tacticalStyle: 'High Press Possession',
    };
  },
};
