/**
 * Probability Calibration & Brier Score Optimization Module
 * Applies Platt scaling / isotonic regression adjustment to raw probabilities.
 */

/**
 * Platt scaling calibration: P_calibrated = 1 / (1 + exp(A * logit(p) + B))
 */
export function calibrateProbability(rawProb0to100: number, a: number = 0.95, b: number = 0.02): number {
  const p = Math.max(0.01, Math.min(0.99, rawProb0to100 / 100));
  const logit = Math.log(p / (1 - p));
  const calibrated = 1 / (1 + Math.exp(-(a * logit + b)));
  return Number((calibrated * 100).toFixed(1));
}

/**
 * Calculates Multi-class Brier Score for backtesting
 * Brier = (1/N) * sum((p_i - o_i)^2)
 * Range: 0.0 (perfect) to 2.0 (worst)
 */
export function calculateBrierScore(
  predictions: Array<{
    homeWinProb: number;
    drawProb: number;
    awayWinProb: number;
    actualOutcome: '1' | 'X' | '2';
  }>
): number {
  if (!predictions || predictions.length === 0) return 0;

  let totalScore = 0;
  for (const p of predictions) {
    const pH = p.homeWinProb / 100;
    const pD = p.drawProb / 100;
    const pA = p.awayWinProb / 100;

    const oH = p.actualOutcome === '1' ? 1 : 0;
    const oD = p.actualOutcome === 'X' ? 1 : 0;
    const oA = p.actualOutcome === '2' ? 1 : 0;

    const itemScore = Math.pow(pH - oH, 2) + Math.pow(pD - oD, 2) + Math.pow(pA - oA, 2);
    totalScore += itemScore;
  }

  return Number((totalScore / predictions.length).toFixed(4));
}
