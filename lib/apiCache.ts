/**
 * Database & Memory Backed API Cache and Usage Tracker
 * Follows the Vercel Serverless caching and API rate limit management requirements.
 */

import { getDbPool, markDbUnhealthy } from './db';

// Fallback in-memory cache for serverless environments without active PostgreSQL
interface MemoryCacheEntry {
  data: any;
  expiresAt: number;
}
const memoryCache = new Map<string, MemoryCacheEntry>();

// Fallback in-memory API usage log
export interface ApiUsageLog {
  id: string;
  timestamp: string;
  endpoint: string;
  status: number;
  responseTime: number;
  success: boolean;
  error?: string;
  provider: string;
}
const memoryUsageLogs: ApiUsageLog[] = [];

/**
 * Retrieves cached response if valid
 */
export async function getCachedData<T = any>(cacheKey: string): Promise<T | null> {
  const pool = getDbPool();
  if (pool) {
    try {
      const res = await pool.query(
        'SELECT data, expires_at FROM api_cache WHERE cache_key = $1 AND expires_at > NOW()',
        [cacheKey]
      );
      if (res.rows.length > 0) {
        return res.rows[0].data as T;
      }
    } catch (err: any) {
      markDbUnhealthy(err);
    }
  }

  const memEntry = memoryCache.get(cacheKey);
  if (memEntry && memEntry.expiresAt > Date.now()) {
    return memEntry.data as T;
  }

  return null;
}

/**
 * Sets cached data with specified TTL (in seconds)
 */
export async function setCachedData(cacheKey: string, data: any, ttlSeconds: number = 300): Promise<void> {
  const expiresAtMs = Date.now() + ttlSeconds * 1000;
  const expiresAtDate = new Date(expiresAtMs);

  // Store in memory
  memoryCache.set(cacheKey, { data, expiresAt: expiresAtMs });

  // Store in PostgreSQL if configured and healthy
  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO api_cache (cache_key, data, expires_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (cache_key)
         DO UPDATE SET data = $2, expires_at = $3, created_at = NOW()`,
        [cacheKey, JSON.stringify(data), expiresAtDate]
      );
    } catch (err: any) {
      markDbUnhealthy(err);
    }
  }
}

/**
 * Logs API usage to database or in-memory analytics table
 */
export async function logApiUsage(
  endpoint: string,
  status: number,
  responseTime: number,
  success: boolean,
  error?: string,
  provider: string = 'api-football'
): Promise<void> {
  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO api_usage_logs (endpoint, status, response_time, success, error, provider)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [endpoint, status, responseTime, success, error || null, provider]
      );
    } catch (err: any) {
      markDbUnhealthy(err);
    }
  }

  // Memory fallback
  memoryUsageLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    endpoint,
    status,
    responseTime,
    success,
    error,
    provider,
  });

  if (memoryUsageLogs.length > 500) {
    memoryUsageLogs.pop();
  }
}

/**
 * Fetches recent API usage analytics for the admin dashboard
 */
export async function getApiUsageSummary(): Promise<{
  totalCallsToday: number;
  successRate: number;
  avgResponseTimeMs: number;
  recentLogs: ApiUsageLog[];
}> {
  const pool = getDbPool();
  if (pool) {
    try {
      const statsRes = await pool.query(`
        SELECT 
          COUNT(*) as total_calls,
          AVG(CASE WHEN success THEN 1 ELSE 0 END) * 100 as success_rate,
          AVG(response_time) as avg_response_time
        FROM api_usage_logs
        WHERE timestamp > NOW() - INTERVAL '24 hours'
      `);

      const logsRes = await pool.query(`
        SELECT id::text, timestamp::text, endpoint, status, response_time as "responseTime", success, error, provider
        FROM api_usage_logs
        ORDER BY timestamp DESC
        LIMIT 50
      `);

      const row = statsRes.rows[0] || {};
      return {
        totalCallsToday: parseInt(row.total_calls || '0', 10),
        successRate: Number(parseFloat(row.success_rate || '100').toFixed(1)),
        avgResponseTimeMs: Math.round(parseFloat(row.avg_response_time || '180')),
        recentLogs: logsRes.rows || [],
      };
    } catch (err: any) {
      markDbUnhealthy(err);
    }
  }

  const total = memoryUsageLogs.length;
  const successes = memoryUsageLogs.filter((l) => l.success).length;
  const avgTime = total > 0 ? memoryUsageLogs.reduce((a, b) => a + b.responseTime, 0) / total : 145;

  return {
    totalCallsToday: total,
    successRate: total > 0 ? Number(((successes / total) * 100).toFixed(1)) : 100,
    avgResponseTimeMs: Math.round(avgTime),
    recentLogs: memoryUsageLogs.slice(0, 50),
  };
}
