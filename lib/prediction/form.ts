/**
 * Team Form & Momentum Module
 * Calculates exponential decay weighted form ratings and momentum trends.
 */

export interface FormResult {
  formRating: number; // 0 - 100
  momentumSlope: number; // Positive = improving, negative = declining
  pointsPerGame: number;
  goalsScoredAvg: number;
  goalsConcededAvg: number;
  cleanSheetPct: number;
  recentFormString: string; // e.g. "W-W-D-W-L"
}

/**
 * Calculates decay-weighted form from last N match outcomes
 * Recent matches have higher exponential weight.
 */
export function calculateWeightedForm(
  outcomes: Array<{ result: 'W' | 'D' | 'L'; goalsScored: number; goalsConceded: number; isHome: boolean }>,
  decayFactor: number = 0.85
): FormResult {
  if (!outcomes || outcomes.length === 0) {
    return {
      formRating: 50,
      momentumSlope: 0,
      pointsPerGame: 1.33,
      goalsScoredAvg: 1.2,
      goalsConcededAvg: 1.2,
      cleanSheetPct: 20,
      recentFormString: 'D-D-D-D-D',
    };
  }

  let totalWeight = 0;
  let weightedPoints = 0;
  let totalScored = 0;
  let totalConceded = 0;
  let cleanSheets = 0;
  const recentScores: number[] = [];

  outcomes.forEach((match, idx) => {
    // idx 0 is most recent
    const weight = Math.pow(decayFactor, idx);
    totalWeight += weight;

    let pts = match.result === 'W' ? 3 : match.result === 'D' ? 1 : 0;
    // Slight home/away handicap
    if (!match.isHome && match.result === 'W') pts += 0.5; // Away win bonus

    weightedPoints += pts * weight;
    totalScored += match.goalsScored;
    totalConceded += match.goalsConceded;
    if (match.goalsConceded === 0) cleanSheets++;
    recentScores.push(pts);
  });

  const n = outcomes.length;
  const avgPts = weightedPoints / (totalWeight * 3.5); // normalized 0 - 1
  const formRating = Math.min(99, Math.max(15, Math.round(avgPts * 100)));

  // Momentum trend: difference between recent 3 games vs older games
  const recent3 = recentScores.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, n);
  const older = recentScores.slice(3).reduce((a, b) => a + b, 0) / Math.max(1, n - 3);
  const momentumSlope = Number((recent3 - older).toFixed(2));

  return {
    formRating,
    momentumSlope,
    pointsPerGame: Number((outcomes.reduce((acc, m) => acc + (m.result === 'W' ? 3 : m.result === 'D' ? 1 : 0), 0) / n).toFixed(2)),
    goalsScoredAvg: Number((totalScored / n).toFixed(2)),
    goalsConcededAvg: Number((totalConceded / n).toFixed(2)),
    cleanSheetPct: Math.round((cleanSheets / n) * 100),
    recentFormString: outcomes.slice(0, 5).map((m) => m.result).join('-'),
  };
}
