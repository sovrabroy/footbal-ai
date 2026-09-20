/**
 * Expected Goals (xG) Modeling Module
 * Projects match expected goals based on shots, shot quality, dangerous attacks, and historical xG differential.
 */

export interface TeamXGMetrics {
  shotsPerMatch: number;
  shotsOnTargetPerMatch: number;
  boxTouchesPerMatch: number;
  historicalXgFor: number;
  historicalXgAgainst: number;
  xgOverperformance: number; // actual goals - xG
}

export interface ProjectedMatchXG {
  homeXG: number;
  awayXG: number;
  totalXG: number;
  homeShotVolume: number;
  awayShotVolume: number;
  xgDifferential: number; // homeXG - awayXG
}

/**
 * Projects Expected Goals (xG) for upcoming matchup
 */
export function projectMatchXG(
  homeMetrics: Partial<TeamXGMetrics>,
  awayMetrics: Partial<TeamXGMetrics>,
  homeAdvantageMultiplier: number = 1.12
): ProjectedMatchXG {
  const homeShots = homeMetrics.shotsPerMatch || 13.5;
  const homeSoT = homeMetrics.shotsOnTargetPerMatch || 4.8;
  const homeHistXG = homeMetrics.historicalXgFor || 1.6;

  const awayShots = awayMetrics.shotsPerMatch || 11.2;
  const awaySoT = awayMetrics.shotsOnTargetPerMatch || 3.9;
  const awayHistXG = awayMetrics.historicalXgFor || 1.2;

  const awayDefXG = awayMetrics.historicalXgAgainst || 1.35;
  const homeDefXG = homeMetrics.historicalXgAgainst || 1.15;

  // Shot quality weighting: xG per shot ~ 0.10, per SoT ~ 0.32
  const homeBaseXG = (homeHistXG * 0.45) + (awayDefXG * 0.35) + (homeSoT * 0.18);
  const awayBaseXG = (awayHistXG * 0.45) + (homeDefXG * 0.35) + (awaySoT * 0.18);

  const homeXG = Number(Math.max(0.3, homeBaseXG * homeAdvantageMultiplier).toFixed(2));
  const awayXG = Number(Math.max(0.2, awayBaseXG * (1 / (homeAdvantageMultiplier * 0.95))).toFixed(2));

  return {
    homeXG,
    awayXG,
    totalXG: Number((homeXG + awayXG).toFixed(2)),
    homeShotVolume: Math.round(homeShots * homeAdvantageMultiplier),
    awayShotVolume: Math.round(awayShots * 0.92),
    xgDifferential: Number((homeXG - awayXG).toFixed(2)),
  };
}
