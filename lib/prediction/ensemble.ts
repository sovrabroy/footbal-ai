/**
 * Model Ensemble Synthesis Module
 * Blends Poisson, Elo, Form, Attack/Defense, and xG sub-models into a unified probabilistic outcome.
 */

export interface ModelWeights {
  poissonWeight: number;
  eloWeight: number;
  formWeight: number;
  xgWeight: number;
  h2hWeight: number;
}

export const DEFAULT_ENSEMBLE_WEIGHTS: ModelWeights = {
  poissonWeight: 0.35,
  eloWeight: 0.25,
  formWeight: 0.20,
  xgWeight: 0.15,
  h2hWeight: 0.05,
};

export interface EnsembleInputs {
  poissonProbs: { homeWin: number; draw: number; awayWin: number };
  eloProbs: { homeWin: number; draw: number; awayWin: number };
  formProbs: { homeWin: number; draw: number; awayWin: number };
  xgProbs: { homeWin: number; draw: number; awayWin: number };
  h2hProbs?: { homeWin: number; draw: number; awayWin: number };
}

export interface EnsembleOutput {
  homeWinProbability: number; // 0 - 100
  drawProbability: number;    // 0 - 100
  awayWinProbability: number;    // 0 - 100
  dominantOutcome: '1' | 'X' | '2';
  modelAgreementScore: number; // 0 - 100 measure of how aligned the submodels are
}

/**
 * Computes weighted ensemble probabilities
 */
export function blendEnsembleModels(
  inputs: EnsembleInputs,
  weights: ModelWeights = DEFAULT_ENSEMBLE_WEIGHTS
): EnsembleOutput {
  const totalWeight =
    weights.poissonWeight +
    weights.eloWeight +
    weights.formWeight +
    weights.xgWeight +
    (inputs.h2hProbs ? weights.h2hWeight : 0);

  const wP = weights.poissonWeight / totalWeight;
  const wE = weights.eloWeight / totalWeight;
  const wF = weights.formWeight / totalWeight;
  const wX = weights.xgWeight / totalWeight;
  const wH = inputs.h2hProbs ? weights.h2hWeight / totalWeight : 0;

  const h2h = inputs.h2hProbs || { homeWin: 33, draw: 34, awayWin: 33 };

  const rawHome =
    inputs.poissonProbs.homeWin * wP +
    inputs.eloProbs.homeWin * wE +
    inputs.formProbs.homeWin * wF +
    inputs.xgProbs.homeWin * wX +
    h2h.homeWin * wH;

  const rawDraw =
    inputs.poissonProbs.draw * wP +
    inputs.eloProbs.draw * wE +
    inputs.formProbs.draw * wF +
    inputs.xgProbs.draw * wX +
    h2h.draw * wH;

  const rawAway =
    inputs.poissonProbs.awayWin * wP +
    inputs.eloProbs.awayWin * wE +
    inputs.formProbs.awayWin * wF +
    inputs.xgProbs.awayWin * wX +
    h2h.awayWin * wH;

  const sum = rawHome + rawDraw + rawAway || 100;
  const homeWinProbability = Number(((rawHome / sum) * 100).toFixed(1));
  const drawProbability = Number(((rawDraw / sum) * 100).toFixed(1));
  const awayWinProbability = Number(((rawAway / sum) * 100).toFixed(1));

  let dominantOutcome: '1' | 'X' | '2' = '1';
  if (drawProbability > homeWinProbability && drawProbability > awayWinProbability) {
    dominantOutcome = 'X';
  } else if (awayWinProbability > homeWinProbability) {
    dominantOutcome = '2';
  }

  // Calculate variance / agreement across models for home win
  const homeProbs = [inputs.poissonProbs.homeWin, inputs.eloProbs.homeWin, inputs.formProbs.homeWin, inputs.xgProbs.homeWin];
  const meanHome = homeProbs.reduce((a, b) => a + b, 0) / homeProbs.length;
  const variance = homeProbs.reduce((acc, p) => acc + Math.pow(p - meanHome, 2), 0) / homeProbs.length;
  const stdDev = Math.sqrt(variance);
  const modelAgreementScore = Math.max(20, Math.min(99, Math.round(100 - (stdDev * 2.5))));

  return {
    homeWinProbability,
    drawProbability,
    awayWinProbability,
    dominantOutcome,
    modelAgreementScore,
  };
}
