import { NextRequest, NextResponse } from 'next/server';
import { fetchFromFootballApi } from '@/lib/footballApiClient';
import { LEAGUES } from '@/data/mockFootballData';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const currentOnly = url.searchParams.get('current') || 'true';

  const { data, source, error } = await fetchFromFootballApi<any[]>('leagues', {
    params: { current: currentOnly },
    ttlSeconds: 86400,
  });

  if (!data || !Array.isArray(data) || data.length === 0) {
    return NextResponse.json({
      success: true,
      source: 'baseline',
      leagues: LEAGUES,
      total: LEAGUES.length,
      message: error || 'Displaying baseline leagues.',
    });
  }

  return NextResponse.json({
    success: true,
    source,
    leagues: data,
    total: data.length,
  });
}
