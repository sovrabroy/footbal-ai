import { NextRequest, NextResponse } from 'next/server';
import { validateCronAuth } from '@/lib/cronAuth';
import { fetchFromFootballApi } from '@/lib/footballApiClient';

export async function GET(req: NextRequest) {
  if (!validateCronAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized cron execution' }, { status: 401 });
  }

  const res = await fetchFromFootballApi('injuries', {
    params: { league: '39', season: '2024' },
    ttlSeconds: 3600,
  });

  return NextResponse.json({
    success: true,
    job: 'sync-injuries',
    injuriesProcessed: Array.isArray(res.data) ? res.data.length : 0,
    source: res.source,
    timestamp: new Date().toISOString(),
  });
}
