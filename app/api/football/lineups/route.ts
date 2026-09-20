import { NextRequest, NextResponse } from 'next/server';
import { fetchFromFootballApi } from '@/lib/footballApiClient';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const fixtureId = url.searchParams.get('fixture');

  if (!fixtureId) {
    return NextResponse.json({
      success: false,
      error: 'Missing fixture ID parameter',
    }, { status: 400 });
  }

  const { data, source, error } = await fetchFromFootballApi<any[]>('fixtures/lineups', {
    params: { fixture: fixtureId },
    ttlSeconds: 1800, // 30 mins
  });

  return NextResponse.json({
    success: true,
    source,
    lineups: data || [],
    message: error,
  });
}
