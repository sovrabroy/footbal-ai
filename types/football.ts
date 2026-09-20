export type MatchStatus = 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';

export interface Player {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  jerseyNumber: number;
  isKeyPlayer: boolean;
  isAvailable: boolean;
  statusNotes?: string; // e.g. "Hamstring strain - Late fitness test"
  seasonGoals?: number;
  seasonAssists?: number;
  minutesPlayed?: number;
}

export interface TeamLineup {
  formation: string; // e.g. "4-3-3" or "4-2-3-1"
  startingXI: Player[];
  bench: Player[];
  tacticalStyle: 'High Press Possession' | 'Direct Counter-Attack' | 'Positional Play' | 'Low Block & Break';
}

export interface TacticalAnalysis {
  possessionAvg: number; // e.g. 58%
  shotsPerMatch: number; // e.g. 15.2
  shotsOnTargetPerMatch: number; // e.g. 5.8
  bigChancesCreatedPerMatch: number; // e.g. 2.9
  cornersPerMatch: number; // e.g. 6.4
  foulsPerMatch: number; // e.g. 10.2
  yellowCardsPerMatch: number; // e.g. 1.8
  passAccuracy: number; // e.g. 86%
}

export interface RestAndFatigue {
  daysSinceLastMatch: number;
  matchesLast7Days: number;
  matchesLast14Days: number;
  travelDistanceKm: number;
  fatigueRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  fatigueImpactDampener: number; // Multiplier e.g. 0.95 if heavily fatigued
}

export interface RefereeInfo {
  name: string;
  nationality: string;
  matchesOfficiated: number;
  avgYellowCardsPerMatch: number;
  avgRedCardsPerMatch: number;
  penaltyAwardRatePerMatch: number;
  homeBiasTendency: 'Slight Home' | 'Strict Neutral' | 'Leniency Toward Away';
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  code: string;
  logo: string;
  primaryColor: string;
  secondaryColor?: string;
  stadium: string;
  leagueId: string;
  leaguePosition: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  recentForm: ('W' | 'D' | 'L')[];
  recentMatchesDetailed?: {
    opponentId: string;
    opponentName: string;
    opponentRank: number;
    wasHome: boolean;
    scored: number;
    conceded: number;
    result: 'W' | 'D' | 'L';
    date: string;
  }[];
  homeRecord: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
  };
  awayRecord: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
  };
  cleanSheets: number;
  failedToScore?: number;
  firstHalfGoals?: number;
  secondHalfGoals?: number;
  attackStrengthRating: number; // 0 - 100
  defenseStrengthRating: number; // 0 - 100
  eloRating?: number; // e.g. 1820
  tactics?: TacticalAnalysis;
  lineup?: TeamLineup;
  keyAbsences?: Player[];
  restAndFatigue?: RestAndFatigue;
}

export interface League {
  id: string;
  name: string;
  country: string;
  code: string;
  logo: string;
  flag: string;
  season: string;
  totalMatches: number;
  accuracyRate: number; // Historical prediction accuracy %
  homeAdvantageFactor?: number; // League specific (e.g. 1.25)
  avgGoalsPerMatch?: number; // League average e.g. 2.85
}

export interface HeadToHeadMatch {
  id: string;
  date: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  winner: 'HOME' | 'DRAW' | 'AWAY';
  competition: string;
}

export interface HeadToHeadSummary {
  totalMatches: number;
  homeWins: number;
  draws: number;
  awayWins: number;
  homeGoalsTotal: number;
  awayGoalsTotal: number;
  bttsFrequencyPercent?: number;
  over25FrequencyPercent?: number;
  recentMatches: HeadToHeadMatch[];
}

export interface FactorContribution {
  name: string;
  weight: number;
  homeScore: number; // 0-100
  awayScore: number; // 0-100
  advantage: 'HOME' | 'DRAW' | 'AWAY';
  description: string;
}

export interface CorrectScoreProb {
  score: string;
  homeGoals: number;
  awayGoals: number;
  probability: number; // Percentage e.g. 14.2%
  fairOdds: number; // Decimal odds e.g. 7.04
}

export interface HtFtProb {
  code: '1/1' | '1/X' | '1/2' | 'X/1' | 'X/X' | 'X/2' | '2/1' | '2/X' | '2/2';
  name: string;
  probability: number;
}

export interface ModelConsensus {
  eloModel: { homeWin: number; draw: number; awayWin: number; weight: number };
  poissonModel: { homeWin: number; draw: number; awayWin: number; weight: number };
  formModel: { homeWin: number; draw: number; awayWin: number; weight: number };
  attackDefenseModel: { homeWin: number; draw: number; awayWin: number; weight: number };
  homeAwayModel: { homeWin: number; draw: number; awayWin: number; weight: number };
  xgModel: { homeWin: number; draw: number; awayWin: number; weight: number };
  machineLearningModel: { homeWin: number; draw: number; awayWin: number; weight: number };
}

export interface MarketOddsComparison {
  bookmakerOdds: {
    homeWin: number;
    draw: number;
    awayWin: number;
    over25: number;
    under25: number;
  };
  marketImpliedProb: {
    homeWin: number;
    draw: number;
    awayWin: number;
    over25: number;
    under25: number;
  };
  modelEdge: {
    homeWin: number; // Positive means model sees value vs bookmaker
    draw: number;
    awayWin: number;
    over25: number;
    under25: number;
  };
}

export interface Prediction {
  matchId: string;
  homeWinProbability: number; // 0 - 100
  drawProbability: number;     // 0 - 100
  awayWinProbability: number;     // 0 - 100
  predictedHomeGoals: number;  // Expected Home Goals (xG)
  predictedAwayGoals: number;  // Expected Away Goals (xG)
  predictedTotalGoals: number; // Expected Total Goals
  predictedScore: string; // "2 - 1"
  mostLikelyScore: string; // Alias matching requirement
  confidence: number; // 0 - 100
  confidenceTier: 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
  primaryPrediction: 'Home Win' | 'Draw' | 'Away Win';
  over05Probability: number;
  under05Probability: number;
  over15Probability: number;
  under15Probability: number;
  over25Probability: number;
  under25Probability: number;
  over35Probability: number;
  under35Probability: number;
  underProbabilities: {
    under05: number;
    under15: number;
    under25: number;
    under35: number;
  };
  bttsProbability: number; // Both teams to score
  bttsNoProbability: number;
  cleanSheetProbabilities: {
    homeCleanSheet: number;
    awayCleanSheet: number;
  };
  doubleChance: {
    homeOrDraw: number; // 1X
    homeOrAway: number; // 12
    drawOrAway: number; // X2
  };
  firstHalfPrediction: {
    homeWin: number;
    draw: number;
    awayWin: number;
    predictedScore: string;
  };
  htFtProbabilities: HtFtProb[];
  correctScoreProbabilities: CorrectScoreProb[];
  dataQualityScore: number; // 0 - 100
  modelConsensus: ModelConsensus;
  marketComparison?: MarketOddsComparison;
  factorContributions: FactorContribution[];
  explanation: string;
  generatedAt: string;
  modelAlgorithmVersion: string;
}

export interface Match {
  id: string;
  leagueId: string;
  leagueName: string;
  leagueCountry: string;
  leagueLogo: string;
  homeTeam: Team;
  awayTeam: Team;
  date: string; // YYYY-MM-DD
  kickoffTime: string; // HH:mm UTC
  venue: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  prediction: Prediction;
  referee?: RefereeInfo;
  matchContext?: {
    matchType: 'League' | 'Domestic Cup' | 'Continental' | 'Derby Match' | 'Relegation Battle' | 'Title Decider';
    importance: 'Critical' | 'High' | 'Standard';
    description: string;
  };
  isFeatured?: boolean;
  isHotPick?: boolean;
}

export interface PredictionResult {
  matchId: string;
  matchTitle: string;
  date: string;
  league: string;
  prediction: string;
  confidence: number;
  predictedScore: string;
  actualScore: string;
  isCorrect: boolean;
  market: '1X2' | 'OVER_25' | 'BTTS' | 'CORRECT_SCORE';
  over25Correct?: boolean;
  bttsCorrect?: boolean;
  scoreCorrect?: boolean;
  brierScore?: number;
  logLoss?: number;
}

export interface StandingRow {
  position: number;
  teamId: string;
  teamName: string;
  teamLogo: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export interface TopScorer {
  rank: number;
  playerName: string;
  teamName: string;
  teamLogo: string;
  goals: number;
  assists: number;
  matches: number;
}

export interface PredictionModelWeights {
  recentForm: number;        // e.g. 0.25
  homeAwayPerformance: number; // e.g. 0.20
  attackStrength: number;     // e.g. 0.15
  defensiveStrength: number;  // e.g. 0.15
  headToHead: number;         // e.g. 0.10
  leaguePosition: number;     // e.g. 0.10
  goalDifference: number;     // e.g. 0.05
  eloModelWeight?: number;    // e.g. 0.20
  poissonWeight?: number;     // e.g. 0.25
  xgWeight?: number;          // e.g. 0.15
  mlEnsembleWeight?: number;  // e.g. 0.10
}

export interface AdminSettings {
  apiProvider: 'demo' | 'api-football' | 'football-data';
  apiKey: string;
  apiBaseUrl: string;
  autoRefreshIntervalMinutes: number;
  cacheEnabled: boolean;
  activeModelWeights: PredictionModelWeights;
}
