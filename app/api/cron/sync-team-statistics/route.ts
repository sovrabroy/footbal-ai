import { NextRequest, NextResponse } from 'next/server';
import { validateCronAuth } from '@/lib/cronAuth';
import { fetchFromFootballApi } from '@/lib/footballApiClient';

export async function GET(req: NextRequest) {
  if (!validateCronAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized cron execution' }, { status: 401 });
  }

  // Sync team stats for premier league teams
  const sampleTeams = ['33', '34', '40', '50']; // Man Utd, Newcastle, Liverpool, Man City
  const statsSynced = [];

  for (const team of sampleTeams) {
    const res = await fetchFromFootballApi('teams/statistics', {
      params: { team, league: '39', season: '2024' },
      ttlSeconds: 86400,
    });
    statsSynced.push({ team, source: res.source });
  }

  return NextResponse.json({
    success: true,
    job: 'sync-team-statistics',
    statsSynced,
    timestamp: new Date().toISOString(),
  });
}
