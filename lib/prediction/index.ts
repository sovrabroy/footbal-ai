/**
 * Unified Prediction Engine
 * Reusable server-side TypeScript engine compatible with Vercel serverless functions, cron jobs, and admin backtesting.
 */

export * from './elo';
export * from './poisson';
export * from './form';
export * from './attackDefense';
export * from './xg';
export * from './ensemble';
export * from './confidence';
export * from './calibration';

import { eloToProbabilities } from './elo';
import { calculatePoissonMatrix } from './poisson';
import { calculateWeightedForm } from './form';
import { calculateAttackDefenseStrength, computeExpectedLambda } from './attackDefense';
import { projectMatchXG } from './xg';
import { blendEnsembleModels, ModelWeights, DEFAULT_ENSEMBLE_WEIGHTS } from './ensemble';
import { evaluatePredictionConfidence } from './confidence';

export interface FullMatchPrediction {
  homeWinProbability: number;
  drawProbability: number;
  awayWinProbability: number;
  predictedHomeGoals: number;
  predictedAwayGoals: number;
  predictedTotalGoals: number;
  predictedScore: string;
  over15Probability: number;
  over25Probability: number;
  over35Probability: number;
  under25Probability: number;
  bttsProbability: number;
  confidence: number;
  confidenceTier: 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Extreme Volatility';
  valueBetDetected: boolean;
  expectedGoals: { home: number; away: number; total: number };
  topScores: Array<{ score: string; probability: number }>;
  modelBreakdown: {
    poisson: { homeWin: number; draw: number; awayWin: number };
    elo: { homeWin: number; draw: number; awayWin: number };
    xg: { homeWin: number; draw: number; awayWin: number };
  };
}

/**
 * Runs the full quantitative pipeline for an individual match
 */
export function generateFullMatchPrediction(
  homeTeam: {
    name: string;
    eloRating?: number;
    attackRating?: number;
    defenseRating?: number;
    goalsScoredAvg?: number;
    goalsConcededAvg?: number;
    shotsPerMatch?: number;
    shotsOnTarget?: number;
    recentMatches?: Array<{ result: 'W' | 'D' | 'L'; goalsScored: number; goalsConceded: number; isHome: boolean }>;
  },
  awayTeam: {
    name: string;
    eloRating?: number;
    attackRating?: number;
    defenseRating?: number;
    goalsScoredAvg?: number;
    goalsConcededAvg?: number;
    shotsPerMatch?: number;
    shotsOnTarget?: number;
    recentMatches?: Array<{ result: 'W' | 'D' | 'L'; goalsScored: number; goalsConceded: number; isHome: boolean }>;
  },
  leagueContext?: {
    avgGoals?: number;
    homeAdvantage?: number;
  },
  customWeights?: ModelWeights
): FullMatchPrediction {
  const avgGoals = leagueContext?.avgGoals || 1.45;
  const homeAdv = leagueContext?.homeAdvantage || 1.15;

  // 1. Attack / Defense Profiles
  const homeAttDef = calculateAttackDefenseStrength(
    homeTeam.goalsScoredAvg || ((homeTeam.attackRating || 75) / 50),
    homeTeam.goalsConcededAvg || (((100 - (homeTeam.defenseRating || 70)) / 50) + 0.4),
    avgGoals,
    true
  );

  const awayAttDef = calculateAttackDefenseStrength(
    awayTeam.goalsScoredAvg || ((awayTeam.attackRating || 70) / 50),
    awayTeam.goalsConcededAvg || (((100 - (awayTeam.defenseRating || 68)) / 50) + 0.4),
    avgGoals,
    false
  );

  // 2. Expected Goals (xG) & Lambdas
  const lambdaHome = computeExpectedLambda(homeAttDef, awayAttDef, avgGoals, homeAdv);
  const lambdaAway = computeExpectedLambda(awayAttDef, homeAttDef, avgGoals, 1.0 / (homeAdv * 0.95));

  const xgProjection = projectMatchXG(
    {
      shotsPerMatch: homeTeam.shotsPerMatch,
      shotsOnTargetPerMatch: homeTeam.shotsOnTarget,
      historicalXgFor: lambdaHome,
    },
    {
      shotsPerMatch: awayTeam.shotsPerMatch,
      shotsOnTargetPerMatch: awayTeam.shotsOnTarget,
      historicalXgFor: lambdaAway,
    },
    homeAdv
  );

  // 3. Poisson Matrix
  const poissonResult = calculatePoissonMatrix(lambdaHome, lambdaAway);

  // 4. Elo Modeling
  const homeElo = homeTeam.eloRating || 1700;
  const awayElo = awayTeam.eloRating || 1650;
  const eloProbs = eloToProbabilities(homeElo, awayElo, 65);
  const eloProbPercentages = {
    homeWin: Number((eloProbs.homeWinProb * 100).toFixed(1)),
    draw: Number((eloProbs.drawProb * 100).toFixed(1)),
    awayWin: Number((eloProbs.awayWinProb * 100).toFixed(1)),
  };

  // 5. Form Modeling
  const homeForm = calculateWeightedForm(homeTeam.recentMatches || []);
  const awayForm = calculateWeightedForm(awayTeam.recentMatches || []);
  const formDiff = (homeForm.formRating - awayForm.formRating) / 100;
  const formProbs = {
    homeWin: Number(Math.max(10, Math.min(80, 45 + (formDiff * 25))).toFixed(1)),
    draw: 27.0,
    awayWin: Number(Math.max(10, Math.min(80, 28 - (formDiff * 25))).toFixed(1)),
  };

  // 6. xG Probabilities
  const xgDiff = xgProjection.xgDifferential;
  const xgProbs = {
    homeWin: Number(Math.max(10, Math.min(85, 42 + (xgDiff * 18))).toFixed(1)),
    draw: 26.0,
    awayWin: Number(Math.max(10, Math.min(85, 32 - (xgDiff * 18))).toFixed(1)),
  };

  // 7. Ensemble Synthesis
  const ensemble = blendEnsembleModels(
    {
      poissonProbs: {
        homeWin: poissonResult.homeWinProb,
        draw: poissonResult.drawProb,
        awayWin: poissonResult.awayWinProb,
      },
      eloProbs: eloProbPercentages,
      formProbs,
      xgProbs,
    },
    customWeights || DEFAULT_ENSEMBLE_WEIGHTS
  );

  // 8. Confidence Assessment
  const topProb = Math.max(ensemble.homeWinProbability, ensemble.drawProbability, ensemble.awayWinProbability);
  const confidence = evaluatePredictionConfidence(topProb, ensemble.modelAgreementScore, 10);

  return {
    homeWinProbability: ensemble.homeWinProbability,
    drawProbability: ensemble.drawProbability,
    awayWinProbability: ensemble.awayWinProbability,
    predictedHomeGoals: lambdaHome,
    predictedAwayGoals: lambdaAway,
    predictedTotalGoals: Number((lambdaHome + lambdaAway).toFixed(1)),
    predictedScore: `${poissonResult.mostLikelyScore.home}-${poissonResult.mostLikelyScore.away}`,
    over15Probability: poissonResult.over15Prob,
    over25Probability: poissonResult.over25Prob,
    over35Probability: poissonResult.over35Prob,
    under25Probability: poissonResult.under25Prob,
    bttsProbability: poissonResult.bttsYesProb,
    confidence: confidence.confidenceScore,
    confidenceTier: confidence.confidenceTier,
    riskLevel: confidence.riskLevel,
    valueBetDetected: confidence.valueBetDetected,
    expectedGoals: {
      home: xgProjection.homeXG,
      away: xgProjection.awayXG,
      total: xgProjection.totalXG,
    },
    topScores: poissonResult.topScores,
    modelBreakdown: {
      poisson: {
        homeWin: poissonResult.homeWinProb,
        draw: poissonResult.drawProb,
        awayWin: poissonResult.awayWinProb,
      },
      elo: eloProbPercentages,
      xg: xgProbs,
    },
  };
}
