import { NextRequest, NextResponse } from 'next/server';
import { fetchFromFootballApi } from '@/lib/footballApiClient';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const h2h = url.searchParams.get('h2h') || '33-34'; // Team1-Team2
  const last = url.searchParams.get('last') || '10';

  const { data, source, error } = await fetchFromFootballApi<any[]>('fixtures/headtohead', {
    params: { h2h, last },
    ttlSeconds: 86400,
  });

  return NextResponse.json({
    success: true,
    source,
    h2h: data || [],
    message: error,
  });
}
