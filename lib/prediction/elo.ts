/**
 * Elo Rating Calculation Module
 * Provides standard and goal-difference adjusted Elo ratings for football teams.
 */

export interface EloConfig {
  kFactor: number;
  homeAdvantageElo: number;
}

export const DEFAULT_ELO_CONFIG: EloConfig = {
  kFactor: 32,
  homeAdvantageElo: 65,
};

/**
 * Calculates win probability from Elo difference
 */
export function getEloExpectedOutcome(ratingA: number, ratingB: number, isHomeA: boolean = false, homeAdvantage: number = 65): number {
  const adjustedA = isHomeA ? ratingA + homeAdvantage : ratingA;
  const diff = adjustedA - ratingB;
  return 1 / (1 + Math.pow(10, -diff / 400));
}

/**
 * Updates Elo ratings based on match result
 */
export function calculateUpdatedElo(
  homeRating: number,
  awayRating: number,
  homeGoals: number,
  awayGoals: number,
  config: EloConfig = DEFAULT_ELO_CONFIG
): { newHomeRating: number; newAwayRating: number; eloDelta: number } {
  const expectedHome = getEloExpectedOutcome(homeRating, awayRating, true, config.homeAdvantageElo);
  
  let actualHome = 0.5; // Draw
  if (homeGoals > awayGoals) actualHome = 1.0;
  else if (homeGoals < awayGoals) actualHome = 0.0;

  // Margin of victory multiplier
  const goalDiff = Math.abs(homeGoals - awayGoals);
  const movMultiplier = goalDiff <= 1 ? 1.0 : goalDiff === 2 ? 1.5 : (11 + goalDiff) / 8;

  const eloDelta = Math.round(config.kFactor * movMultiplier * (actualHome - expectedHome));

  return {
    newHomeRating: homeRating + eloDelta,
    newAwayRating: awayRating - eloDelta,
    eloDelta,
  };
}

/**
 * Derives 1X2 probabilities from Elo difference
 */
export function eloToProbabilities(homeRating: number, awayRating: number, homeAdvantage: number = 65): {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
} {
  const expHome = getEloExpectedOutcome(homeRating, awayRating, true, homeAdvantage);
  
  // Empirical draw probability estimation based on team parity
  const ratingGap = Math.abs((homeRating + homeAdvantage) - awayRating);
  const baseDrawProb = Math.max(0.18, 0.28 - (ratingGap / 2000));
  
  const remainingProb = 1 - baseDrawProb;
  const homeWinProb = Math.min(0.85, Math.max(0.08, expHome * remainingProb + 0.05));
  const awayWinProb = Math.min(0.85, Math.max(0.08, (1 - expHome) * remainingProb - 0.05));
  const drawProb = Math.max(0.12, 1 - (homeWinProb + awayWinProb));

  const total = homeWinProb + drawProb + awayWinProb;
  return {
    homeWinProb: Number((homeWinProb / total).toFixed(4)),
    drawProb: Number((drawProb / total).toFixed(4)),
    awayWinProb: Number((awayWinProb / total).toFixed(4)),
  };
}
