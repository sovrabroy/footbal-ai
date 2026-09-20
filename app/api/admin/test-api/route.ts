import { NextRequest, NextResponse } from 'next/server';
import { fetchFromFootballApi } from '@/lib/footballApiClient';
import { getTodayDateString } from '@/lib/dateUtils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const apiKey = body.apiKey || req.headers.get('x-football-api-key') || process.env.FOOTBALL_API_KEY;
    const provider = (body.provider || req.headers.get('x-football-provider') || 'api-football') as 'api-football' | 'football-data';
    const baseUrl = body.baseUrl || undefined;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'No API key provided. Please enter your API key to test the connection.',
      }, { status: 400 });
    }

    const today = getTodayDateString();
    const endpoint = provider === 'football-data' ? 'matches' : 'fixtures';
    const params = provider === 'football-data' ? { date: today } : { date: today };

    const startTime = Date.now();
    const result = await fetchFromFootballApi(endpoint, {
      apiKey,
      provider,
      baseUrl,
      params,
      ttlSeconds: 10, // Short TTL for test
    });
    const latency = Date.now() - startTime;

    if (result.source === 'error' || !result.data) {
      return NextResponse.json({
        success: false,
        provider,
        latencyMs: latency,
        error: result.error || 'Failed to authenticate with external API endpoint',
        statusCode: result.statusCode || 500,
      }, { status: 200 });
    }

    const fixturesCount = Array.isArray(result.data) ? result.data.length : 0;

    return NextResponse.json({
      success: true,
      provider,
      latencyMs: latency,
      message: `Connection successful! Fetched ${fixturesCount} real matches for ${today}.`,
      matchesFound: fixturesCount,
      sampleFixture: fixturesCount > 0 ? result.data[0] : null,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Server error while testing API connection',
    }, { status: 500 });
  }
}
