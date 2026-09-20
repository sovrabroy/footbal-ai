/**
 * Supabase & PostgreSQL Database Connection Pool
 * Supports Supabase Postgres (Direct & Transaction Pooler), Neon, Vercel Postgres, and standard PostgreSQL.
 * Includes circuit-breaker health tracking and graceful in-memory fallback.
 */

import { Pool } from 'pg';

let globalPool: Pool | null = null;
let isPoolUnhealthy = false;
let lastUnhealthyTimestamp = 0;
let lastHealthError: string | null = null;
const HEALTH_COOLDOWN_MS = 30000; // 30 seconds cooldown before retrying connection after DNS/network failure

export function getDbConnectionString(): string | null {
  const conn =
    process.env.SUPABASE_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    null;

  if (!conn || conn.trim() === '' || conn.includes('[password]') || conn.includes('[project-ref]')) {
    return null;
  }
  return conn.trim();
}

export function markDbUnhealthy(error?: any): void {
  isPoolUnhealthy = true;
  lastUnhealthyTimestamp = Date.now();
  if (error) {
    lastHealthError = typeof error === 'string' ? error : error?.message || 'Database connection error';
  }
}

export function resetDbHealth(): void {
  isPoolUnhealthy = false;
  lastUnhealthyTimestamp = 0;
  lastHealthError = null;
  if (globalPool) {
    try {
      globalPool.end().catch(() => {});
    } catch {
      // ignore
    }
    globalPool = null;
  }
}

export function getDbPool(options: { force?: boolean } = {}): Pool | null {
  const connectionString = getDbConnectionString();
  if (!connectionString) {
    return null;
  }

  // If in circuit-breaker cooldown and not forced, return null to use fast in-memory fallback
  if (isPoolUnhealthy && !options.force) {
    if (Date.now() - lastUnhealthyTimestamp < HEALTH_COOLDOWN_MS) {
      return null;
    }
    // Cooldown passed, allow retry
    isPoolUnhealthy = false;
  }

  if (!globalPool) {
    const isSupabase = connectionString.includes('supabase');
    try {
      globalPool = new Pool({
        connectionString,
        ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
        max: isSupabase ? 10 : 8,
        idleTimeoutMillis: 20000,
        connectionTimeoutMillis: 5000, // 5s fast timeout
      });

      // Handle idle client errors so they never crash Node.js process
      globalPool.on('error', (err) => {
        markDbUnhealthy(err);
      });
    } catch (err: any) {
      markDbUnhealthy(err);
      return null;
    }
  }

  return globalPool;
}

export function getDatabaseProvider(): 'supabase' | 'postgres' | 'memory' {
  const conn = getDbConnectionString();
  if (!conn) return 'memory';
  if (conn.includes('supabase')) return 'supabase';
  return 'postgres';
}

export function getDbHealthStatus(): { isHealthy: boolean; lastError: string | null } {
  const conn = getDbConnectionString();
  if (!conn) {
    return { isHealthy: true, lastError: null };
  }
  const isCooldown = isPoolUnhealthy && (Date.now() - lastUnhealthyTimestamp < HEALTH_COOLDOWN_MS);
  return {
    isHealthy: !isCooldown,
    lastError: isCooldown ? lastHealthError : null,
  };
}

/**
 * Initializes required database tables if PostgreSQL is connected
 */
export async function initializeDatabaseSchema(): Promise<boolean> {
  const pool = getDbPool({ force: true });
  if (!pool) return false;

  try {
    const client = await pool.connect();
    try {
      await client.query(`
        -- API Cache table for API-Football responses
        CREATE TABLE IF NOT EXISTS api_cache (
          cache_key VARCHAR(255) PRIMARY KEY,
          data JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL
        );

        -- API Rate Limit & Usage Tracker
        CREATE TABLE IF NOT EXISTS api_usage_logs (
          id SERIAL PRIMARY KEY,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          endpoint VARCHAR(255) NOT NULL,
          status INTEGER NOT NULL,
          response_time INTEGER NOT NULL,
          success BOOLEAN NOT NULL,
          error TEXT,
          provider VARCHAR(64) DEFAULT 'api-football'
        );

        -- Data Synchronization Logs
        CREATE TABLE IF NOT EXISTS sync_logs (
          id SERIAL PRIMARY KEY,
          job_type VARCHAR(64) NOT NULL,
          status VARCHAR(32) NOT NULL,
          records_processed INTEGER DEFAULT 0,
          details JSONB,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Backtesting Sessions
        CREATE TABLE IF NOT EXISTS backtests (
          id VARCHAR(64) PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          status VARCHAR(32) NOT NULL,
          total_matches INTEGER NOT NULL,
          processed_matches INTEGER NOT NULL,
          current_batch INTEGER NOT NULL,
          batch_size INTEGER NOT NULL,
          accuracy NUMERIC(5, 2),
          brier_score NUMERIC(6, 4),
          roi NUMERIC(6, 2),
          results JSONB
        );

        -- Predictions store
        CREATE TABLE IF NOT EXISTS match_predictions (
          match_id VARCHAR(64) PRIMARY KEY,
          league_id VARCHAR(64),
          match_date VARCHAR(32),
          home_team VARCHAR(128),
          away_team VARCHAR(128),
          prediction_data JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      isPoolUnhealthy = false;
      lastHealthError = null;
      return true;
    } finally {
      client.release();
    }
  } catch (err: any) {
    markDbUnhealthy(err);
    return false;
  }
}
