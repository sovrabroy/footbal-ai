/**
 * Secure Server-Side Football API Client
 * Supports API-Football (v3.football.api-sports.io) and Football-Data.org (api.football-data.org)
 * Exclusively executes on Vercel serverless / server-side runtime.
 */

import { getCachedData, setCachedData, logApiUsage } from './apiCache';

const DEFAULT_API_FOOTBALL_URL = 'https://v3.football.api-sports.io';
const DEFAULT_FOOTBALL_DATA_URL = 'https://api.football-data.org/v4';

export interface FootballApiFetchOptions {
  ttlSeconds?: number;
  params?: Record<string, string | number>;
  apiKey?: string;
  provider?: 'api-football' | 'football-data';
  baseUrl?: string;
}

export async function fetchFromFootballApi<T = any>(
  endpoint: string,
  options: FootballApiFetchOptions = {}
): Promise<{ data: T | null; source: 'cache' | 'api-football' | 'football-data' | 'error'; error?: string; statusCode?: number }> {
  const provider = options.provider || 'api-football';
  const apiKey = options.apiKey || process.env.FOOTBALL_API_KEY || process.env.API_FOOTBALL_KEY || process.env.FOOTBALL_DATA_API_KEY;
  
  const baseUrl = options.baseUrl || 
    (provider === 'football-data' 
      ? (process.env.FOOTBALL_DATA_BASE_URL || DEFAULT_FOOTBALL_DATA_URL)
      : (process.env.FOOTBALL_API_BASE_URL || DEFAULT_API_FOOTBALL_URL));

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
  const cacheKey = `football_api:${provider}:${endpoint}:${queryString}:${apiKey ? apiKey.slice(-6) : 'none'}`;

  // 1. Check database/memory cache
  const cached = await getCachedData<T>(cacheKey);
  if (cached) {
    return { data: cached, source: provider };
  }

  // If no API key configured, return with clear guidance
  if (!apiKey) {
    return {
      data: null,
      source: 'error',
      error: 'Football API Key not configured. Please provide an API key in Admin Settings or set FOOTBALL_API_KEY in environment variables.',
      statusCode: 401,
    };
  }

  // 2. Fetch from third-party Football API
  const startTime = Date.now();
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'GoalPredict-AI/1.0',
    };

    if (provider === 'football-data') {
      headers['X-Auth-Token'] = apiKey;
    } else {
      headers['x-apisports-key'] = apiKey;
    }

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
      next: { revalidate: ttl },
    });

    const responseTime = Date.now() - startTime;
    const isOk = response.ok;

    if (!isOk) {
      const errorText = await response.text();
      let parsedError = errorText;
      try {
        const parsed = JSON.parse(errorText);
        parsedError = parsed.message || parsed.errors?.token || errorText;
      } catch {
        // use raw text
      }
      await logApiUsage(endpoint, response.status, responseTime, false, parsedError.slice(0, 200));
      return {
        data: null,
        source: 'error',
        error: `API returned HTTP ${response.status}: ${parsedError.slice(0, 150)}`,
        statusCode: response.status,
      };
    }

    const json = await response.json();

    // Check if API returned rate limit / account error in body (API-Football format)
    if (json.errors && typeof json.errors === 'object' && Object.keys(json.errors).length > 0) {
      if (!Array.isArray(json.errors) || json.errors.length > 0) {
        const errMsg = typeof json.errors === 'string' ? json.errors : JSON.stringify(json.errors);
        await logApiUsage(endpoint, 200, responseTime, false, errMsg.slice(0, 200));
        return { data: null, source: 'error', error: `API-Football notice: ${errMsg}`, statusCode: 400 };
      }
    }

    const responseData = (provider === 'football-data' ? json.matches || json : json.response || json) as T;

    // 3. Cache valid response
    if (responseData) {
      await setCachedData(cacheKey, responseData, ttl);
    }
    await logApiUsage(endpoint, 200, responseTime, true);

    return { data: responseData, source: provider };
  } catch (err: any) {
    const responseTime = Date.now() - startTime;
    await logApiUsage(endpoint, 500, responseTime, false, err?.message || 'Network error');
    return {
      data: null,
      source: 'error',
      error: err?.message || 'Failed to connect to football data API endpoint',
      statusCode: 500,
    };
  }
}
