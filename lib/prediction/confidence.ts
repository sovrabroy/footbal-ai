/**
 * Confidence & Risk Scoring Module
 * Evaluates prediction uncertainty, margin of safety, and value opportunities.
 */

export type ConfidenceTier = 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
export type RiskLevel = 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Extreme Volatility';

export interface ConfidenceAssessment {
  confidenceScore: number; // 0 - 100
  confidenceTier: ConfidenceTier;
  riskLevel: RiskLevel;
  valueBetDetected: boolean;
  valueEdge: number; // e.g. +8.5% edge over implied market odds
  recommendation: string;
}

/**
 * Assesses model confidence and classifies risk based on model agreement, data depth, and variance
 */
export function evaluatePredictionConfidence(
  topProbability: number,
  modelAgreementScore: number,
  sampleSizeMatches: number = 10,
  marketOdds?: number
): ConfidenceAssessment {
  // Base confidence derived from dominance of highest probability and model consensus
  const dominanceFactor = Math.min(40, (topProbability - 33.3) * 1.0);
  const consensusFactor = modelAgreementScore * 0.45;
  const sampleFactor = Math.min(15, sampleSizeMatches * 1.5);

  const rawConfidence = Math.round(dominanceFactor + consensusFactor + sampleFactor);
  const confidenceScore = Math.min(96, Math.max(35, rawConfidence));

  let confidenceTier: ConfidenceTier = 'MEDIUM';
  if (confidenceScore >= 78) confidenceTier = 'VERY_HIGH';
  else if (confidenceScore >= 66) confidenceTier = 'HIGH';
  else if (confidenceScore <= 48) confidenceTier = 'LOW';

  let riskLevel: RiskLevel = 'Medium Risk';
  if (confidenceScore >= 78) riskLevel = 'Low Risk';
  else if (confidenceScore >= 62) riskLevel = 'Medium Risk';
  else if (confidenceScore >= 45) riskLevel = 'High Risk';
  else riskLevel = 'Extreme Volatility';

  // Value bet detection: model probability vs implied bookmaker probability
  let valueBetDetected = false;
  let valueEdge = 0;
  if (marketOdds && marketOdds > 1.0) {
    const impliedProb = (1 / marketOdds) * 100;
    valueEdge = Number((topProbability - impliedProb).toFixed(1));
    if (valueEdge >= 5.0) {
      valueBetDetected = true;
    }
  }

  let recommendation = 'Standard Match Projections';
  if (valueBetDetected) {
    recommendation = `High Value Opportunity (+${valueEdge}% statistical edge)`;
  } else if (confidenceTier === 'VERY_HIGH') {
    recommendation = 'Strong Model Consensus (Prime Pick)';
  } else if (confidenceTier === 'LOW') {
    recommendation = 'High Variance Expected - Proceed with Caution';
  }

  return {
    confidenceScore,
    confidenceTier,
    riskLevel,
    valueBetDetected,
    valueEdge,
    recommendation,
  };
}
