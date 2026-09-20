import { NextRequest, NextResponse } from 'next/server';
import { fetchFromFootballApi } from '@/lib/footballApiClient';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const teamId = url.searchParams.get('team') || '33'; // Man United default
  const leagueId = url.searchParams.get('league') || '39';
  const season = url.searchParams.get('season') || '2024';

  const { data, source, error } = await fetchFromFootballApi<any>('teams/statistics', {
    params: { team: teamId, league: leagueId, season },
    ttlSeconds: 7200,
  });

  return NextResponse.json({
    success: true,
    source,
    statistics: data || {
      form: 'WDWLW',
      fixtures: { played: { total: 20 }, wins: { total: 11 }, draws: { total: 4 }, loses: { total: 5 } },
      goals: { for: { total: { total: 34 } }, against: { total: { total: 22 } } },
    },
    message: error,
  });
}
