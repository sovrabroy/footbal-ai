/**
 * Secure Server-Side Football API Client
 * Exclusively executes on Vercel serverless / server-side runtime.
 * Never leaks FOOTBALL_API_KEY to browser bundle.
 */

import { getCachedData, setCachedData, logApiUsage } from './apiCache';

const DEFAULT_BASE_URL = 'https://v3.football.api-sports.io';

export interface FootballApiFetchOptions {
  ttlSeconds?: number;
  params?: Record<string, string | number>;
}

export async function fetchFromFootballApi<T = any>(
  endpoint: string,
  options: FootballApiFetchOptions = {}
): Promise<{ data: T | null; source: 'cache' | 'api-football' | 'error'; error?: string }> {
  const apiKey = process.env.FOOTBALL_API_KEY || process.env.API_FOOTBALL_KEY;
  const baseUrl = process.env.FOOTBALL_API_BASE_URL || DEFAULT_BASE_URL;
  const ttl = options.ttlSeconds ?? 600; // 10 minutes default cache

  // Build query string
  const queryParams = new URLSearchParams();
  if (options.params) {
    Object.entries(options.params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        queryParams.append(k, String(v));
      }
    });
  }
  const queryString = queryParams.toString();
  const fullUrl = `${baseUrl}/${endpoint}${queryString ? `?${queryString}` : ''}`;
  const cacheKey = `football_api:${endpoint}:${queryString}`;

  // 1. Check database/memory cache
  const cached = await getCachedData<T>(cacheKey);
  if (cached) {
    return { data: cached, source: 'cache' };
  }

  // If no API key configured, return without hitting external service
  if (!apiKey) {
    return { data: null, source: 'error', error: 'FOOTBALL_API_KEY not configured on server' };
  }

  // 2. Fetch from API-Football
  const startTime = Date.now();
  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'x-apisports-key': apiKey,
        'Accept': 'application/json',
      },
      next: { revalidate: ttl },
    });

    const responseTime = Date.now() - startTime;
    const isOk = response.ok;

    if (!isOk) {
      const errorText = await response.text();
      await logApiUsage(endpoint, response.status, responseTime, false, errorText.slice(0, 200));
      return { data: null, source: 'error', error: `API-Football returned HTTP ${response.status}` };
    }

    const json = await response.json();

    // Check if API returned rate limit / errors in payload
    if (json.errors && Object.keys(json.errors).length > 0 && !(Array.isArray(json.errors) && json.errors.length === 0)) {
      const errMsg = JSON.stringify(json.errors);
      await logApiUsage(endpoint, 200, responseTime, false, errMsg.slice(0, 200));
      return { data: null, source: 'error', error: errMsg };
    }

    // 3. Cache valid response
    await setCachedData(cacheKey, json.response || json, ttl);
    await logApiUsage(endpoint, 200, responseTime, true);

    return { data: (json.response || json) as T, source: 'api-football' };
  } catch (err: any) {
    const responseTime = Date.now() - startTime;
    await logApiUsage(endpoint, 500, responseTime, false, err?.message || 'Network error');
    return { data: null, source: 'error', error: err?.message || 'Failed to connect to API-Football' };
  }
}
