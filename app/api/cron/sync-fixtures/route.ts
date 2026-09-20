import { NextRequest, NextResponse } from 'next/server';
import { validateCronAuth } from '@/lib/cronAuth';
import { fetchFromFootballApi } from '@/lib/footballApiClient';
import { getTodayDateString, getTomorrowDateString } from '@/lib/dateUtils';
import { getDbPool } from '@/lib/db';

export async function GET(req: NextRequest) {
  if (!validateCronAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized cron execution' }, { status: 401 });
  }

  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  // Fetch today & tomorrow fixtures from API-Football
  const todayResult = await fetchFromFootballApi('fixtures', {
    params: { date: today },
    ttlSeconds: 600,
  });

  const tomorrowResult = await fetchFromFootballApi('fixtures', {
    params: { date: tomorrow },
    ttlSeconds: 1200,
  });

  const recordsCount = (Array.isArray(todayResult.data) ? todayResult.data.length : 0) +
                       (Array.isArray(tomorrowResult.data) ? tomorrowResult.data.length : 0);

  // Log to database if connected
  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO sync_logs (job_type, status, records_processed, details)
         VALUES ($1, $2, $3, $4)`,
        ['sync-fixtures', 'SUCCESS', recordsCount, JSON.stringify({ today, tomorrow, source: todayResult.source })]
      );
    } catch (e) {
      console.warn('Sync log error:', e);
    }
  }

  return NextResponse.json({
    success: true,
    job: 'sync-fixtures',
    timestamp: new Date().toISOString(),
    recordsProcessed: recordsCount,
    todaySource: todayResult.source,
    tomorrowSource: tomorrowResult.source,
  });
}
