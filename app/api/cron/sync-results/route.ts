import { NextRequest, NextResponse } from 'next/server';
import { validateCronAuth } from '@/lib/cronAuth';
import { fetchFromFootballApi } from '@/lib/footballApiClient';
import { getDateOffsetString } from '@/lib/dateUtils';
import { getDbPool } from '@/lib/db';

export async function GET(req: NextRequest) {
  if (!validateCronAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized cron execution' }, { status: 401 });
  }

  const yesterday = getDateOffsetString(-1);

  const result = await fetchFromFootballApi('fixtures', {
    params: { date: yesterday, status: 'FT' },
    ttlSeconds: 3600,
  });

  const count = Array.isArray(result.data) ? result.data.length : 0;

  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO sync_logs (job_type, status, records_processed, details)
         VALUES ($1, $2, $3, $4)`,
        ['sync-results', 'SUCCESS', count, JSON.stringify({ date: yesterday, count })]
      );
    } catch (e) {}
  }

  return NextResponse.json({
    success: true,
    job: 'sync-results',
    dateSynced: yesterday,
    matchesProcessed: count,
    timestamp: new Date().toISOString(),
  });
}
