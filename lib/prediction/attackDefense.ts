/**
 * Attack & Defense Strength Rating Module
 * Measures normalized offensive potency and defensive solidity relative to league averages.
 */

export interface AttackDefenseProfile {
  attackStrength: number; // e.g. 1.25 (25% above league avg)
  defenseStrength: number; // e.g. 0.80 (concedes 20% less than league avg)
  attackRating100: number; // 0-100 scale for UI
  defenseRating100: number; // 0-100 scale for UI
}

/**
 * Calculates Attack and Defense Strength ratios relative to league baseline
 */
export function calculateAttackDefenseStrength(
  teamGoalsForPerMatch: number,
  teamGoalsAgainstPerMatch: number,
  leagueAvgGoalsForPerMatch: number = 1.45,
  isHome: boolean = true
): AttackDefenseProfile {
  const baseLeague = Math.max(0.5, leagueAvgGoalsForPerMatch);
  
  // Attack ratio: team goals scored vs league average
  const rawAttack = (teamGoalsForPerMatch || 1.2) / baseLeague;
  const attackStrength = Number(Math.max(0.3, Math.min(2.8, rawAttack)).toFixed(3));

  // Defense ratio: team goals conceded vs league average (lower is better defense)
  const rawDefense = (teamGoalsAgainstPerMatch || 1.2) / baseLeague;
  const defenseStrength = Number(Math.max(0.3, Math.min(2.8, rawDefense)).toFixed(3));

  // 100-point normalized ratings
  const attackRating100 = Math.round(Math.min(99, Math.max(20, (attackStrength / 1.8) * 100)));
  const defenseRating100 = Math.round(Math.min(99, Math.max(20, ((2.0 - defenseStrength) / 1.7) * 100)));

  return {
    attackStrength,
    defenseStrength,
    attackRating100,
    defenseRating100,
  };
}

/**
 * Calculates raw expected goal parameter (lambda) for a team
 */
export function computeExpectedLambda(
  teamAttack: AttackDefenseProfile,
  opponentDefense: AttackDefenseProfile,
  leagueAvgGoals: number = 1.45,
  homeAdvantageFactor: number = 1.15
): number {
  const lambda = teamAttack.attackStrength * opponentDefense.defenseStrength * leagueAvgGoals * homeAdvantageFactor;
  return Number(Math.max(0.2, Math.min(5.0, lambda)).toFixed(2));
}
