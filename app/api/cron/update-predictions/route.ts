import { NextRequest, NextResponse } from 'next/server';
import { validateCronAuth } from '@/lib/cronAuth';
import { INITIAL_MATCHES } from '@/data/mockFootballData';
import { generateFullMatchPrediction } from '@/lib/prediction';

export async function GET(req: NextRequest) {
  if (!validateCronAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized cron execution' }, { status: 401 });
  }

  // Update predictions for scheduled fixtures using prediction engine
  const updated = INITIAL_MATCHES.map((m) => {
    const pred = generateFullMatchPrediction(m.homeTeam, m.awayTeam);
    return {
      matchId: m.id,
      prediction: pred,
    };
  });

  return NextResponse.json({
    success: true,
    job: 'update-predictions',
    updatedCount: updated.length,
    timestamp: new Date().toISOString(),
  });
}
