/**
 * Poisson and Dixon-Coles Goal Probability Module
 * Computes exact scoreline distribution matrices and 1X2 market probabilities.
 */

/**
 * Standard Poisson probability P(k events given lambda) = (lambda^k * e^-lambda) / k!
 */
export function poissonProbability(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  if (k < 0) return 0;

  let factorial = 1;
  for (let i = 2; i <= k; i++) {
    factorial *= i;
  }

  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial;
}

/**
 * Dixon-Coles low-score correlation adjustment factor tau(x, y, lambda, mu, rho)
 */
export function dixonColesTau(x: number, y: number, lambda: number, mu: number, rho: number = -0.06): number {
  if (x === 0 && y === 0) {
    return 1 - (lambda * mu * rho);
  } else if (x === 0 && y === 1) {
    return 1 + (lambda * rho);
  } else if (x === 1 && y === 0) {
    return 1 + (mu * rho);
  } else if (x === 1 && y === 1) {
    return 1 - rho;
  }
  return 1;
}

export interface PoissonMatrixResult {
  matrix: number[][]; // [homeGoals][awayGoals]
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  over15Prob: number;
  over25Prob: number;
  over35Prob: number;
  under25Prob: number;
  bttsYesProb: number;
  bttsNoProb: number;
  mostLikelyScore: { home: number; away: number; probability: number };
  topScores: Array<{ score: string; probability: number }>;
}

/**
 * Generates an 8x8 scoreline probability matrix using Dixon-Coles adjusted Poisson
 */
export function calculatePoissonMatrix(lambdaHome: number, lambdaAway: number, maxGoals: number = 7, rho: number = -0.04): PoissonMatrixResult {
  const matrix: number[][] = [];
  let homeWinProb = 0;
  let drawProb = 0;
  let awayWinProb = 0;
  let over15Prob = 0;
  let over25Prob = 0;
  let over35Prob = 0;
  let bttsYesProb = 0;

  let maxProb = 0;
  let mostLikely = { home: 1, away: 0, probability: 0 };
  const allScores: Array<{ score: string; probability: number }> = [];

  for (let h = 0; h <= maxGoals; h++) {
    matrix[h] = [];
    const pHome = poissonProbability(lambdaHome, h);

    for (let a = 0; a <= maxGoals; a++) {
      const pAway = poissonProbability(lambdaAway, a);
      const tau = dixonColesTau(h, a, lambdaHome, lambdaAway, rho);
      const cellProb = Math.max(0, pHome * pAway * tau);

      matrix[h][a] = cellProb;

      // Market summations
      if (h > a) homeWinProb += cellProb;
      else if (h === a) drawProb += cellProb;
      else awayWinProb += cellProb;

      const totalGoals = h + a;
      if (totalGoals > 1.5) over15Prob += cellProb;
      if (totalGoals > 2.5) over25Prob += cellProb;
      if (totalGoals > 3.5) over35Prob += cellProb;
      if (h > 0 && a > 0) bttsYesProb += cellProb;

      if (cellProb > maxProb) {
        maxProb = cellProb;
        mostLikely = { home: h, away: a, probability: cellProb };
      }

      allScores.push({ score: `${h}-${a}`, probability: cellProb });
    }
  }

  // Normalize total sum to 1.0
  const totalSum = homeWinProb + drawProb + awayWinProb || 1;
  const normHome = homeWinProb / totalSum;
  const normDraw = drawProb / totalSum;
  const normAway = awayWinProb / totalSum;

  allScores.sort((a, b) => b.probability - a.probability);

  return {
    matrix,
    homeWinProb: Number((normHome * 100).toFixed(1)),
    drawProb: Number((normDraw * 100).toFixed(1)),
    awayWinProb: Number((normAway * 100).toFixed(1)),
    over15Prob: Number((Math.min(0.98, over15Prob / totalSum) * 100).toFixed(1)),
    over25Prob: Number((Math.min(0.95, over25Prob / totalSum) * 100).toFixed(1)),
    over35Prob: Number((Math.min(0.90, over35Prob / totalSum) * 100).toFixed(1)),
    under25Prob: Number(((1 - over25Prob / totalSum) * 100).toFixed(1)),
    bttsYesProb: Number((Math.min(0.95, bttsYesProb / totalSum) * 100).toFixed(1)),
    bttsNoProb: Number(((1 - bttsYesProb / totalSum) * 100).toFixed(1)),
    mostLikelyScore: {
      home: mostLikely.home,
      away: mostLikely.away,
      probability: Number((mostLikely.probability * 100).toFixed(1)),
    },
    topScores: allScores.slice(0, 5).map((s) => ({
      score: s.score,
      probability: Number(((s.probability / totalSum) * 100).toFixed(1)),
    })),
  };
}
