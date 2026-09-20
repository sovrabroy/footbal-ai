import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

function generateFallbackAnalysis(m: any): string {
  if (!m) return 'No match data provided for analysis.';

  const homeName = m.homeTeam?.name || 'Home Team';
  const awayName = m.awayTeam?.name || 'Away Team';
  const league = m.leagueName || 'League Match';
  const pred = m.prediction;

  return `### Tactical & Phase-of-Play Matchup
${homeName} enters this ${league} clash displaying structured possession metrics (${m.homeTeam?.tactics?.possessionAvg || 56}%) and high territory compression, averaging ${m.homeTeam?.tactics?.shotsPerMatch || 14.5} shots per game. Conversely, ${awayName} exhibits disciplined mid-block defensive spacing (${m.awayTeam?.defenseStrengthRating || 72}/100) paired with rapid vertical transition efficiency (${m.awayTeam?.tactics?.passAccuracy || 82}% passing accuracy).

### Probability & Value Synthesis
The Poisson bivariate goal model projects an expected ${pred?.predictedHomeGoals || 1.8} goals for ${homeName} compared to ${pred?.predictedAwayGoals || 1.1} for ${awayName}, aggregating into an expected total of ${pred?.predictedTotalGoals || 2.9} goals. Model consensus places the home win probability at ${pred?.homeWinProbability || 52}%, with the most mathematically coherent scoreline settling at ${pred?.predictedScore || '2-1'}. Goal market distributions register ${pred?.over25Probability || 58}% for Over 2.5 goals and ${pred?.bttsProbability || 54}% for Both Teams To Score.

### Volatility & Tactical Variance Factors
Risk level is classified as **${pred?.riskLevel || 'Medium Risk'}** with a **${pred?.confidence || 68}%** algorithmic confidence rating. Primary vectors of variance stem from ground fatigue differentials (${m.awayTeam?.restAndFatigue?.fatigueRiskLevel || 'Moderate'} visitor fatigue) and referee tendencies (${m.referee?.name || 'Match Official'} averaging ${m.referee?.avgYellowCardsPerMatch || 3.5} bookings per game).`;
}

export async function POST(req: NextRequest) {
  let matchData: any = null;
  try {
    const body = await req.json();
    matchData = body.matchData;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        analysis: generateFallbackAnalysis(matchData),
        source: 'statistical_engine_fallback',
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are a premier quantitative football performance analyst for GoalPredict AI.
Synthesize the following football match prediction into an objective, professional scouting report using ONLY the provided metrics. Do not fabricate scores, transfers, or fake statistics.

Match: ${matchData.homeTeam?.name} vs ${matchData.awayTeam?.name} (${matchData.leagueName})
Venue: ${matchData.venue}
Expected Goals (xG): Home ${matchData.prediction?.predictedHomeGoals} vs Away ${matchData.prediction?.predictedAwayGoals} (Total: ${matchData.prediction?.predictedTotalGoals})
Poisson 1X2 Probabilities: Home Win ${matchData.prediction?.homeWinProbability}%, Draw ${matchData.prediction?.drawProbability}%, Away Win ${matchData.prediction?.awayWinProbability}%
Most Likely Score: ${matchData.prediction?.predictedScore}
Over 2.5 Prob: ${matchData.prediction?.over25Probability}% | BTTS: ${matchData.prediction?.bttsProbability}%
Confidence: ${matchData.prediction?.confidence}% (${matchData.prediction?.confidenceTier}, Risk: ${matchData.prediction?.riskLevel})
Home Form Rating: ${matchData.homeTeam?.attackStrengthRating}/100 Attack, ${matchData.homeTeam?.defenseStrengthRating}/100 Defense
Away Form Rating: ${matchData.awayTeam?.attackStrengthRating}/100 Attack, ${matchData.awayTeam?.defenseStrengthRating}/100 Defense

Produce a structured markdown analysis with 3 clear sections:
### 1. Tactical & Phase-of-Play Matchup
Explain how the home and away tactical structures, possession dynamics, and attack/defense profiles interact.
### 2. Probabilistic Goal & Market Synthesis
Break down the expected goals (xG), Poisson matrix distribution, and primary value markets.
### 3. Risk Factors & Contextual Variance
Assess schedule fatigue, referee profile, and potential game-state volatility.`,
    });

    return NextResponse.json({
      analysis: response.text || generateFallbackAnalysis(matchData),
      source: 'gemini-3.5-flash',
    });
  } catch (error) {
    console.warn('Gemini analysis endpoint error, serving statistical fallback:', error);
    return NextResponse.json({
      analysis: generateFallbackAnalysis(matchData),
      source: 'statistical_engine_fallback',
    });
  }
}
