/**
 * GoalPredict AI - Relational Database Schema & Domain Entity Models
 * Designed for PostgreSQL / Cloud SQL / Supabase / Prisma / Drizzle ORM
 * 
 * Supports all 14 core entities with strict referential integrity, foreign key relationships,
 * and statistical indices for high-performance match simulation queries.
 */

export interface DbUser {
  id: string;
  email: string;
  role: 'admin' | 'analyst' | 'subscriber' | 'viewer';
  name: string;
  passwordHash?: string;
  preferredLeagues: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DbLeague {
  id: string;
  name: string;
  country: string;
  code: string; // e.g. "PL", "PD", "SA", "BL1"
  logoUrl: string;
  flagUrl: string;
  currentSeason: string;
  homeAdvantageFactor: number; // League-specific home advantage (e.g. 1.18 in EPL, 1.25 in Serie A)
  totalMatchesTracked: number;
  historicalAccuracy1X2: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbTeam {
  id: string;
  leagueId: string; // FK -> DbLeague.id
  name: string;
  shortName: string;
  code: string;
  stadiumName: string;
  stadiumCapacity: number;
  logoUrl: string;
  primaryColor: string;
  secondaryColor?: string;
  currentEloRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbPlayer {
  id: string;
  teamId: string; // FK -> DbTeam.id
  name: string;
  jerseyNumber: number;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  nationality: string;
  importanceRating: number; // 1 - 10 (weight on team performance if missing)
  isStartingXI: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbPlayerStatistics {
  id: string;
  playerId: string; // FK -> DbPlayer.id
  season: string;
  appearances: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  expectedGoals: number;
  expectedAssists: number;
  yellowCards: number;
  redCards: number;
  shotsPer90: number;
  keyPassesPer90: number;
  updatedAt: string;
}

export interface DbTeamStatistics {
  id: string;
  teamId: string; // FK -> DbTeam.id
  leagueId: string; // FK -> DbLeague.id
  season: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  goalDifference: number;
  cleanSheets: number;
  failedToScore: number;
  firstHalfGoalsScored: number;
  firstHalfGoalsConceded: number;
  homeWins: number;
  homeDraws: number;
  homeLosses: number;
  awayWins: number;
  awayDraws: number;
  awayLosses: number;
  avgPossession: number; // %
  avgShotsOnTarget: number;
  avgXgFor: number;
  avgXgAgainst: number;
  updatedAt: string;
}

export interface DbHeadToHead {
  id: string;
  homeTeamId: string; // FK -> DbTeam.id
  awayTeamId: string; // FK -> DbTeam.id
  matchDate: string;
  competition: string;
  homeScore: number;
  awayScore: number;
  homeXg?: number;
  awayXg?: number;
  winner: 'HOME' | 'DRAW' | 'AWAY';
  over25: boolean;
  btts: boolean;
  createdAt: string;
}

export interface DbMatch {
  id: string;
  leagueId: string; // FK -> DbLeague.id
  homeTeamId: string; // FK -> DbTeam.id
  awayTeamId: string; // FK -> DbTeam.id
  season: string;
  matchday: number;
  kickoffTime: string;
  venue: string;
  refereeName?: string;
  status: 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
  homeScore?: number;
  awayScore?: number;
  homeHalftimeScore?: number;
  awayHalftimeScore?: number;
  homeXg?: number;
  awayXg?: number;
  dataQualityScore: number; // 0 - 100 based on completeness
  createdAt: string;
  updatedAt: string;
}

export interface DbInjury {
  id: string;
  matchId: string; // FK -> DbMatch.id
  teamId: string; // FK -> DbTeam.id
  playerId: string; // FK -> DbPlayer.id
  status: 'OUT' | 'DOUBTFUL' | 'SUSPENDED';
  injuryType: string;
  expectedReturnDate?: string;
  tacticalImpactScore: number; // 0 - 100
  createdAt: string;
}

export interface DbLineup {
  id: string;
  matchId: string; // FK -> DbMatch.id
  teamId: string; // FK -> DbTeam.id
  formation: string; // e.g. "4-3-3", "4-2-3-1", "3-5-2"
  isConfirmed: boolean;
  startingPlayerIds: string[]; // FK -> DbPlayer.id array
  benchPlayerIds: string[];
  tacticalStyle: 'possession' | 'counter_attack' | 'high_press' | 'low_block';
  createdAt: string;
}

export interface DbPrediction {
  id: string;
  matchId: string; // FK -> DbMatch.id
  modelRunId: string; // FK -> DbModelRun.id
  homeWinProbability: number;
  drawProbability: number;
  awayWinProbability: number;
  expectedHomeGoals: number;
  expectedAwayGoals: number;
  expectedTotalGoals: number;
  over05Prob: number;
  under05Prob: number;
  over15Prob: number;
  under15Prob: number;
  over25Prob: number;
  under25Prob: number;
  over35Prob: number;
  under35Prob: number;
  bttsYesProb: number;
  bttsNoProb: number;
  homeCleanSheetProb: number;
  awayCleanSheetProb: number;
  doubleChance1X: number;
  doubleChance12: number;
  doubleChanceX2: number;
  mostLikelyScore: string;
  confidenceScore: number; // 0 - 100
  confidenceTier: 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  dataQualityScore: number;
  explanation: string;
  marketImpliedHomeOdds?: number;
  marketModelEdgeHome?: number;
  createdAt: string;
}

export interface DbPredictionResult {
  id: string;
  predictionId: string; // FK -> DbPrediction.id
  matchId: string; // FK -> DbMatch.id
  actualHomeScore: number;
  actualAwayScore: number;
  actualWinner: 'HOME' | 'DRAW' | 'AWAY';
  was1X2Correct: boolean;
  wasOver25Correct: boolean;
  wasBttsCorrect: boolean;
  wasScoreCorrect: boolean;
  brierScoreContribution: number;
  logLossContribution: number;
  createdAt: string;
}

export interface DbModelRun {
  id: string;
  modelVersion: string;
  runType: 'LIVE' | 'BACKTEST';
  weightsConfig: {
    recentForm: number;
    homeAwayPerformance: number;
    attackStrength: number;
    defensiveStrength: number;
    headToHead: number;
    leaguePosition: number;
    goalDifference: number;
    eloRating?: number;
    xgModel?: number;
    mlModel?: number;
  };
  totalMatchesProcessed: number;
  startedAt: string;
  completedAt: string;
}

export interface DbModelPerformance {
  id: string;
  modelRunId: string; // FK -> DbModelRun.id
  leagueId?: string; // FK -> DbLeague.id or null for global
  market: '1X2' | 'OVER_25' | 'BTTS' | 'CORRECT_SCORE' | 'ALL';
  sampleSize: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  brierScore: number;
  logLoss: number;
  calibrationError: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}
