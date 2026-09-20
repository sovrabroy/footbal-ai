import { NextRequest, NextResponse } from 'next/server';
import { validateCronAuth } from '@/lib/cronAuth';
import { fetchFromFootballApi } from '@/lib/footballApiClient';

export async function GET(req: NextRequest) {
  if (!validateCronAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized cron execution' }, { status: 401 });
  }

  // Sync major leagues standings (EPL, La Liga, Serie A, Bundesliga, Ligue 1)
  const majorLeagueIds = ['39', '140', '135', '78', '61'];
  const results = [];

  for (const league of majorLeagueIds) {
    const res = await fetchFromFootballApi('standings', {
      params: { league, season: '2024' },
      ttlSeconds: 7200,
    });
    results.push({ league, source: res.source });
  }

  return NextResponse.json({
    success: true,
    job: 'sync-standings',
    syncedLeagues: results,
    timestamp: new Date().toISOString(),
  });
}
