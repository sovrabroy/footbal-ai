import { NextRequest, NextResponse } from 'next/server';
import { fetchFromFootballApi } from '@/lib/footballApiClient';
import { TEAMS } from '@/data/mockFootballData';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const leagueParam = url.searchParams.get('league') || '39'; // EPL default
  const seasonParam = url.searchParams.get('season') || '2024';

  const { data, source, error } = await fetchFromFootballApi<any[]>('teams', {
    params: { league: leagueParam, season: seasonParam },
    ttlSeconds: 86400, // 24h cache
  });

  if (!data || !Array.isArray(data) || data.length === 0) {
    const teamsList = Object.values(TEAMS);
    return NextResponse.json({
      success: true,
      source: 'baseline',
      teams: teamsList,
      total: teamsList.length,
      message: error || 'Displaying baseline teams.',
    });
  }

  return NextResponse.json({
    success: true,
    source,
    teams: data,
    total: data.length,
  });
}
