import { NextResponse } from 'next/server';
import { getDbPool, getDatabaseProvider, initializeDatabaseSchema, resetDbHealth, markDbUnhealthy } from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  const provider = getDatabaseProvider();
  const pool = getDbPool({ force: true });
  const supabaseConfigured = isSupabaseConfigured();

  let connected = false;
  let error: string | null = null;
  let tablesCount = 0;

  if (pool) {
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('api_cache', 'api_usage_logs', 'sync_logs', 'backtests', 'match_predictions');
        `);
        tablesCount = res.rows.length;
        connected = true;
        resetDbHealth();
      } finally {
        client.release();
      }
    } catch (err: any) {
      error = err?.message || 'Database connection error';
      markDbUnhealthy(err);
    }
  }

  return NextResponse.json({
    status: connected ? 'connected' : pool ? 'error' : 'in-memory-fallback',
    provider: supabaseConfigured || provider === 'supabase' ? 'Supabase' : provider === 'postgres' ? 'PostgreSQL' : 'In-Memory State',
    connected,
    tablesFound: tablesCount,
    totalExpectedTables: 5,
    supabaseConfigured,
    error,
    timestamp: new Date().toISOString(),
  });
}

export async function POST() {
  resetDbHealth();
  const success = await initializeDatabaseSchema();
  return NextResponse.json({
    success,
    message: success
      ? 'Database schema initialized successfully in Supabase/PostgreSQL.'
      : 'Schema initialization skipped (unreachable database host or no DATABASE_URL configured). Running in in-memory mode.',
  });
}
