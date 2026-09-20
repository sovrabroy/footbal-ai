import { NextRequest, NextResponse } from 'next/server';
import { fetchFromFootballApi } from '@/lib/footballApiClient';
import { EPL_STANDINGS } from '@/data/mockFootballData';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const leagueParam = url.searchParams.get('league') || '39';
  const seasonParam = url.searchParams.get('season') || '2024';

  const { data, source, error } = await fetchFromFootballApi<any[]>('standings', {
    params: { league: leagueParam, season: seasonParam },
    ttlSeconds: 3600,
  });

  if (!data || !Array.isArray(data) || data.length === 0) {
    return NextResponse.json({
      success: true,
      source: 'baseline',
      standings: EPL_STANDINGS,
      total: EPL_STANDINGS.length,
      message: error || 'Displaying baseline standings.',
    });
  }

  return NextResponse.json({
    success: true,
    source,
    standings: data,
  });
}
