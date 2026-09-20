import { NextRequest, NextResponse } from 'next/server';
import { validateCronAuth } from '@/lib/cronAuth';
import { HISTORICAL_RESULTS } from '@/data/mockFootballData';
import { calculateBrierScore } from '@/lib/prediction/calibration';

export async function GET(req: NextRequest) {
  if (!validateCronAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized cron execution' }, { status: 401 });
  }

  // Calculate overall performance metrics
  const brierData = HISTORICAL_RESULTS.map((r) => {
    const isHome = r.prediction.toLowerCase().includes('home');
    const isAway = r.prediction.toLowerCase().includes('away');
    const isDraw = r.prediction.toLowerCase().includes('draw');

    const scores = r.actualScore.split('-').map((s) => parseInt(s.trim(), 10));
    const h = scores[0] ?? 0;
    const a = scores[1] ?? 0;
    const actualOutcome: '1' | 'X' | '2' = h > a ? '1' : h < a ? '2' : 'X';

    return {
      homeWinProb: isHome ? 60 : 20,
      drawProb: isDraw ? 40 : 25,
      awayWinProb: isAway ? 60 : 20,
      actualOutcome,
    };
  });

  const brierScore = calculateBrierScore(brierData);
  const correctCount = HISTORICAL_RESULTS.filter((r) => r.isCorrect).length;
  const accuracy = Number(((correctCount / HISTORICAL_RESULTS.length) * 100).toFixed(1));

  return NextResponse.json({
    success: true,
    job: 'update-results',
    evaluatedMatches: HISTORICAL_RESULTS.length,
    accuracy,
    brierScore,
    timestamp: new Date().toISOString(),
  });
}
