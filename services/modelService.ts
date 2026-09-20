import { PredictionModelWeights, ModelConsensus } from '@/types/football';
import { DEFAULT_PREDICTION_WEIGHTS, MODEL_VERSION, getStoredWeights, saveStoredWeights } from '@/lib/predictionConfig';
import { footballDataStore } from './footballApi';

export interface ModelMetadata {
  version: string;
  name: string;
  description: string;
  subModels: {
    id: string;
    name: string;
    description: string;
    defaultWeight: number;
  }[];
  lastTrainedDate: string;
}

export const modelService = {
  /**
   * Get metadata describing the prediction engine architecture
   */
  getModelMetadata(): ModelMetadata {
    return {
      version: MODEL_VERSION,
      name: 'GoalPredict Multi-Factor Poisson & Dynamic Rating Engine',
      description:
        'A hybrid probabilistic simulation framework that models team expected goals (xG) using exponential time-decay form, venue-specific strength ratings, and bivariate Poisson distribution matrices.',
      subModels: [
        {
          id: 'poisson',
          name: 'Bivariate Poisson Goal Model',
          description: 'Calculates discrete probabilities for all 0-6 scoreline combinations from expected goals.',
          defaultWeight: 0.25,
        },
        {
          id: 'form',
          name: 'Exponential Time-Decay Form Rating',
          description: 'Weights recent matches with decay factor, scaling recent momentum higher than older fixtures.',
          defaultWeight: 0.25,
        },
        {
          id: 'venue',
          name: 'Home / Away Venue Performance Split',
          description: 'Accounts for ground-specific PPG and dynamic league home advantage factors.',
          defaultWeight: 0.20,
        },
        {
          id: 'strength',
          name: 'Attack / Defense Ratio Model',
          description: 'Compares offensive creation index against opponent defensive resistance.',
          defaultWeight: 0.15,
        },
        {
          id: 'h2h',
          name: 'Historical Head-to-Head Model',
          description: 'Analyzes direct matchups with moderate weighting to avoid historical distortion.',
          defaultWeight: 0.10,
        },
        {
          id: 'table',
          name: 'League Standing & Goal Difference Index',
          description: 'Macro positioning metrics normalized across the division.',
          defaultWeight: 0.05,
        },
      ],
      lastTrainedDate: '2026-03-15',
    };
  },

  /**
   * Get currently active model weights
   */
  getActiveWeights(): PredictionModelWeights {
    return getStoredWeights();
  },

  /**
   * Update model weights and trigger platform-wide recalculation
   */
  async updateWeights(newWeights: PredictionModelWeights): Promise<void> {
    saveStoredWeights(newWeights);
    await footballDataStore.recalculateAllPredictions(newWeights);
  },

  /**
   * Reset weights back to calibrated default values
   */
  async resetToDefaults(): Promise<PredictionModelWeights> {
    saveStoredWeights(DEFAULT_PREDICTION_WEIGHTS);
    await footballDataStore.recalculateAllPredictions(DEFAULT_PREDICTION_WEIGHTS);
    return DEFAULT_PREDICTION_WEIGHTS;
  },

  /**
   * Normalize an arbitrary weight configuration so the sum equals 1.00
   */
  normalizeWeights(weights: PredictionModelWeights): PredictionModelWeights {
    const total =
      weights.recentForm +
      weights.homeAwayPerformance +
      weights.attackStrength +
      weights.defensiveStrength +
      weights.headToHead +
      weights.leaguePosition +
      weights.goalDifference;

    if (total === 0) return DEFAULT_PREDICTION_WEIGHTS;

    return {
      recentForm: Number((weights.recentForm / total).toFixed(2)),
      homeAwayPerformance: Number((weights.homeAwayPerformance / total).toFixed(2)),
      attackStrength: Number((weights.attackStrength / total).toFixed(2)),
      defensiveStrength: Number((weights.defensiveStrength / total).toFixed(2)),
      headToHead: Number((weights.headToHead / total).toFixed(2)),
      leaguePosition: Number((weights.leaguePosition / total).toFixed(2)),
      goalDifference: Number((weights.goalDifference / total).toFixed(2)),
    };
  },
};
