import { NextRequest, NextResponse } from 'next/server';
import { fetchFromFootballApi } from '@/lib/footballApiClient';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const fixtureId = url.searchParams.get('fixture');
  const leagueId = url.searchParams.get('league') || '39';
  const season = url.searchParams.get('season') || '2024';

  const { data, source, error } = await fetchFromFootballApi<any[]>('injuries', {
    params: fixtureId ? { fixture: fixtureId } : { league: leagueId, season },
    ttlSeconds: 3600,
  });

  return NextResponse.json({
    success: true,
    source,
    injuries: data || [],
    message: error,
  });
}
