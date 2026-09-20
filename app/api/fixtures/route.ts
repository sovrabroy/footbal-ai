import { NextRequest, NextResponse } from 'next/server';
import { Match, Team, League } from '@/types/football';
import { calculateMatchPrediction } from '@/services/predictionService';
import { getTodayDateString, getTomorrowDateString } from '@/lib/dateUtils';
import { INITIAL_MATCHES, LEAGUES } from '@/data/mockFootballData';

// Cache in server memory for 15 minutes to save user's daily quota (100 req/day)
interface FixtureCache {
  timestamp: number;
  data: Match[];
  source: 'api-football' | 'baseline';
  rateLimitRemaining?: string | null;
}

let cachedFixtures: Record<string, FixtureCache> = {};

// Helper to hash string to deterministic number (for mock stats when real team stats aren't queried to save quota)
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Convert an API-Sports fixture into our rich GoalPredict AI Match structure
function transformApiFixtureToMatch(f: any): Match {
  const fixtureId = `api-${f.fixture.id}`;
  const home = f.teams.home;
  const away = f.teams.away;
  const leagueData = f.league;

  const dateStr = (f.fixture.date || '').split('T')[0] || getTodayDateString();
  const timeStr = (f.fixture.date || '').split('T')[1]?.substring(0, 5) || '15:00';

  const homeHash = hashCode(home.name);
  const awayHash = hashCode(away.name);

  // Derive realistic ratings based on team hash and league tier
  const homeAttack = 55 + (homeHash % 40);
  const homeDefense = 55 + ((homeHash >> 2) % 40);
  const awayAttack = 50 + (awayHash % 40);
  const awayDefense = 50 + ((awayHash >> 2) % 40);

  const homeRank = 1 + (homeHash % 18);
  const awayRank = 1 + (awayHash % 18);

  const formPatterns: ('W' | 'D' | 'L')[][] = [
    ['W', 'W', 'D', 'W', 'L'],
    ['W', 'D', 'W', 'W', 'W'],
    ['D', 'W', 'L', 'W', 'D'],
    ['L', 'W', 'D', 'L', 'W'],
    ['W', 'L', 'W', 'D', 'W'],
    ['D', 'D', 'W', 'L', 'W'],
  ];

  const homeForm = formPatterns[homeHash % formPatterns.length];
  const awayForm = formPatterns[awayHash % formPatterns.length];

  const homeTeam: Team = {
    id: `team-${home.id}`,
    name: home.name,
    shortName: home.name.substring(0, 12),
    code: home.name.substring(0, 3).toUpperCase(),
    logo: home.logo || `https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=128&auto=format&fit=crop&q=80`,
    primaryColor: '#7C3AED',
    stadium: f.fixture.venue?.name || 'Home Stadium',
    leagueId: `league-${leagueData.id}`,
    leaguePosition: homeRank,
    played: 15 + (homeHash % 15),
    won: 6 + (homeHash % 12),
    drawn: 3 + (homeHash % 6),
    lost: 3 + (homeHash % 8),
    goalsFor: 22 + (homeHash % 25),
    goalsAgainst: 14 + (homeHash % 20),
    goalDifference: 8,
    points: 24 + (homeHash % 30),
    recentForm: homeForm,
    homeRecord: {
      played: 8,
      won: 4 + (homeHash % 4),
      drawn: 2,
      lost: 2,
      goalsFor: 12 + (homeHash % 10),
      goalsAgainst: 6 + (homeHash % 6),
    },
    awayRecord: {
      played: 7,
      won: 2 + (awayHash % 4),
      drawn: 2,
      lost: 3,
      goalsFor: 8 + (awayHash % 8),
      goalsAgainst: 9 + (awayHash % 8),
    },
    cleanSheets: 4 + (homeHash % 5),
    attackStrengthRating: homeAttack,
    defenseStrengthRating: homeDefense,
    eloRating: 1500 + (homeHash % 400),
  };

  const awayTeam: Team = {
    id: `team-${away.id}`,
    name: away.name,
    shortName: away.name.substring(0, 12),
    code: away.name.substring(0, 3).toUpperCase(),
    logo: away.logo || `https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=128&auto=format&fit=crop&q=80`,
    primaryColor: '#06B6D4',
    stadium: f.fixture.venue?.name || 'Away Stadium',
    leagueId: `league-${leagueData.id}`,
    leaguePosition: awayRank,
    played: 15 + (awayHash % 15),
    won: 5 + (awayHash % 11),
    drawn: 4 + (awayHash % 5),
    lost: 4 + (awayHash % 8),
    goalsFor: 19 + (awayHash % 22),
    goalsAgainst: 16 + (awayHash % 18),
    goalDifference: 3,
    points: 20 + (awayHash % 28),
    recentForm: awayForm,
    homeRecord: {
      played: 7,
      won: 3,
      drawn: 2,
      lost: 2,
      goalsFor: 9,
      goalsAgainst: 7,
    },
    awayRecord: {
      played: 8,
      won: 2 + (awayHash % 3),
      drawn: 2,
      lost: 4,
      goalsFor: 7 + (awayHash % 6),
      goalsAgainst: 11 + (awayHash % 6),
    },
    cleanSheets: 3 + (awayHash % 4),
    attackStrengthRating: awayAttack,
    defenseStrengthRating: awayDefense,
    eloRating: 1480 + (awayHash % 380),
  };

  // Run our predictive engine
  const prediction = calculateMatchPrediction(fixtureId, homeTeam, awayTeam);

  // Determine status
  let status: Match['status'] = 'TIMED';
  const apiStatus = f.fixture.status?.short;
  if (apiStatus === 'FT' || apiStatus === 'AET' || apiStatus === 'PEN') {
    status = 'FINISHED';
  } else if (apiStatus === '1H' || apiStatus === '2H' || apiStatus === 'HT' || apiStatus === 'ET' || apiStatus === 'LIVE') {
    status = 'IN_PLAY';
  } else if (apiStatus === 'PST') {
    status = 'POSTPONED';
  } else if (apiStatus === 'CANC') {
    status = 'CANCELLED';
  }

  const isHotPick = prediction.confidence >= 66 || (homeRank <= 4 && awayRank <= 4);
  const isFeatured = prediction.confidence >= 70 || isHotPick;

  return {
    id: fixtureId,
    leagueId: `league-${leagueData.id}`,
    leagueName: `${leagueData.country ? `${leagueData.country}: ` : ''}${leagueData.name}`,
    leagueCountry: leagueData.country || 'International',
    leagueLogo: leagueData.logo || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=128&auto=format&fit=crop&q=80',
    homeTeam,
    awayTeam,
    date: dateStr,
    kickoffTime: timeStr,
    venue: f.fixture.venue?.name ? `${f.fixture.venue.name}, ${f.fixture.venue.city || ''}` : 'National Stadium',
    referee: f.fixture.referee || 'Designated Match Official',
    status,
    homeScore: f.goals?.home ?? (status === 'FINISHED' ? (f.score?.fulltime?.home ?? 1) : undefined),
    awayScore: f.goals?.away ?? (status === 'FINISHED' ? (f.score?.fulltime?.away ?? 0) : undefined),
    prediction,
    isFeatured,
    isHotPick,
    matchContext: {
      matchType: 'League',
      importance: 'High',
      description: 'Regular league fixture with critical standings impact.',
    },
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const dateParam = url.searchParams.get('date') || getTodayDateString();
  const tmrwStr = getTomorrowDateString();

  const apiKey =
    process.env.FOOTBALL_API_KEY ||
    process.env.API_FOOTBALL_KEY ||
    process.env.NEXT_PUBLIC_FOOTBALL_API_KEY ||
    '';

  const baseUrl = process.env.FOOTBALL_API_BASE_URL || 'https://v3.football.api-sports.io';

  // Check cache for this date
  const cacheKey = `fixtures_${dateParam}`;
  const now = Date.now();
  if (cachedFixtures[cacheKey] && now - cachedFixtures[cacheKey].timestamp < 15 * 60 * 1000) {
    return NextResponse.json({
      success: true,
      source: cachedFixtures[cacheKey].source,
      date: dateParam,
      cached: true,
      matches: cachedFixtures[cacheKey].data,
      total: cachedFixtures[cacheKey].data.length,
      rateLimitRemaining: cachedFixtures[cacheKey].rateLimitRemaining,
    });
  }

  // If no API key is set, return curated initial matches
  if (!apiKey || apiKey === 'YOUR_API_KEY') {
    return NextResponse.json({
      success: true,
      source: 'baseline',
      date: dateParam,
      matches: INITIAL_MATCHES,
      total: INITIAL_MATCHES.length,
      message: 'No API-Football key configured. Displaying curated baseline matches.',
    });
  }

  try {
    // Fetch today's real fixtures from API-Sports
    const response = await fetch(`${baseUrl}/fixtures?date=${dateParam}`, {
      headers: {
        'x-apisports-key': apiKey,
      },
      next: { revalidate: 900 }, // 15 min cache
    });

    const rateLimitRemaining = response.headers.get('x-ratelimit-requests-remaining');

    if (!response.ok) {
      console.warn(`API-Sports responded with status ${response.status}`);
      return NextResponse.json({
        success: true,
        source: 'baseline',
        date: dateParam,
        matches: INITIAL_MATCHES,
        total: INITIAL_MATCHES.length,
        error: `API responded with ${response.status}`,
      });
    }

    const data = await response.json();

    if (data.errors && Object.keys(data.errors).length > 0) {
      console.warn('API-Sports returned error:', data.errors);
      return NextResponse.json({
        success: true,
        source: 'baseline',
        date: dateParam,
        matches: INITIAL_MATCHES,
        total: INITIAL_MATCHES.length,
        error: JSON.stringify(data.errors),
      });
    }

    const rawFixtures: any[] = data.response || [];

    if (rawFixtures.length === 0) {
      return NextResponse.json({
        success: true,
        source: 'baseline',
        date: dateParam,
        matches: INITIAL_MATCHES,
        total: INITIAL_MATCHES.length,
        message: 'No fixtures found for selected date in API-Football. Displaying baseline fixtures.',
      });
    }

    // Select a diverse, high-interest slice of matches
    // Priority: Upcoming / Live matches first, then popular countries/leagues
    const prioritizedFixtures = [...rawFixtures].sort((a, b) => {
      // Prioritize LIVE, NS (Not started)
      const aLive = a.fixture.status.short === 'LIVE' || a.fixture.status.short === '1H' || a.fixture.status.short === '2H' ? 3 : 0;
      const bLive = b.fixture.status.short === 'LIVE' || b.fixture.status.short === '1H' || b.fixture.status.short === '2H' ? 3 : 0;
      const aNS = a.fixture.status.short === 'NS' ? 2 : 0;
      const bNS = b.fixture.status.short === 'NS' ? 2 : 0;

      const aPriority = aLive || aNS;
      const bPriority = bLive || bNS;

      return bPriority - aPriority;
    });

    // Take top 30-40 matches to keep payload light and fast
    const selectedFixtures = prioritizedFixtures.slice(0, 36);

    const transformedMatches: Match[] = selectedFixtures.map(transformApiFixtureToMatch);

    // Save to cache
    cachedFixtures[cacheKey] = {
      timestamp: now,
      data: transformedMatches,
      source: 'api-football',
      rateLimitRemaining,
    };

    return NextResponse.json({
      success: true,
      source: 'api-football',
      date: dateParam,
      cached: false,
      matches: transformedMatches,
      total: transformedMatches.length,
      totalRawInApi: rawFixtures.length,
      rateLimitRemaining,
    });
  } catch (error: any) {
    console.error('Error fetching API-Sports fixtures:', error);
    return NextResponse.json({
      success: true,
      source: 'baseline',
      date: dateParam,
      matches: INITIAL_MATCHES,
      total: INITIAL_MATCHES.length,
      error: error?.message || 'Network error',
    });
  }
}
