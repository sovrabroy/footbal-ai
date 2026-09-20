import { NextRequest, NextResponse } from 'next/server';
import { fetchFromFootballApi } from '@/lib/footballApiClient';
import { INITIAL_MATCHES } from '@/data/mockFootballData';
import { getTodayDateString } from '@/lib/dateUtils';
import { calculateMatchPrediction } from '@/services/predictionService';
import { Match, Team } from '@/types/football';
import { getDbPool } from '@/lib/db';

function hashCode(str: string): number {
  let hash = 0;
  if (!str) return 12345;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function transformApiFootballFixture(f: any): Match {
  const fixtureId = `api-${f.fixture?.id || Math.random().toString(36).substring(2, 9)}`;
  const home = f.teams?.home || { id: 1, name: 'Home Team', logo: '' };
  const away = f.teams?.away || { id: 2, name: 'Away Team', logo: '' };
  const leagueData = f.league || { id: 39, name: 'League', country: 'Europe', logo: '' };

  const dateStr = (f.fixture?.date || '').split('T')[0] || getTodayDateString();
  const timeStr = (f.fixture?.date || '').split('T')[1]?.substring(0, 5) || '15:00';

  const homeHash = hashCode(home.name);
  const awayHash = hashCode(away.name);

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
  ];

  const homeTeam: Team = {
    id: `team-${home.id}`,
    name: home.name,
    shortName: home.name.substring(0, 14),
    code: home.name.substring(0, 3).toUpperCase(),
    logo: home.logo || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=128&auto=format&fit=crop&q=80',
    primaryColor: '#7C3AED',
    stadium: f.fixture?.venue?.name || 'Home Stadium',
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
    recentForm: formPatterns[homeHash % formPatterns.length],
    homeRecord: { played: 8, won: 4, drawn: 2, lost: 2, goalsFor: 12, goalsAgainst: 6 },
    awayRecord: { played: 7, won: 2, drawn: 2, lost: 3, goalsFor: 8, goalsAgainst: 9 },
    cleanSheets: 4 + (homeHash % 5),
    attackStrengthRating: homeAttack,
    defenseStrengthRating: homeDefense,
    eloRating: 1500 + (homeHash % 400),
  };

  const awayTeam: Team = {
    id: `team-${away.id}`,
    name: away.name,
    shortName: away.name.substring(0, 14),
    code: away.name.substring(0, 3).toUpperCase(),
    logo: away.logo || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=128&auto=format&fit=crop&q=80',
    primaryColor: '#06B6D4',
    stadium: f.fixture?.venue?.name || 'Away Stadium',
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
    recentForm: formPatterns[awayHash % formPatterns.length],
    homeRecord: { played: 7, won: 3, drawn: 2, lost: 2, goalsFor: 9, goalsAgainst: 7 },
    awayRecord: { played: 8, won: 2, drawn: 2, lost: 4, goalsFor: 7, goalsAgainst: 11 },
    cleanSheets: 3 + (awayHash % 4),
    attackStrengthRating: awayAttack,
    defenseStrengthRating: awayDefense,
    eloRating: 1480 + (awayHash % 380),
  };

  const prediction = calculateMatchPrediction(fixtureId, homeTeam, awayTeam);

  let status: Match['status'] = 'TIMED';
  const apiStatus = f.fixture?.status?.short;
  if (apiStatus === 'FT' || apiStatus === 'AET' || apiStatus === 'PEN') {
    status = 'FINISHED';
  } else if (['1H', '2H', 'HT', 'ET', 'LIVE', 'IN_PLAY'].includes(apiStatus)) {
    status = 'IN_PLAY';
  } else if (apiStatus === 'PST' || apiStatus === 'CANC') {
    status = 'POSTPONED';
  }

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
    venue: f.fixture?.venue?.name ? `${f.fixture.venue.name}, ${f.fixture.venue.city || ''}` : 'Designated Stadium',
    referee: f.fixture?.referee || 'Official Referee',
    status,
    homeScore: f.goals?.home ?? (status === 'FINISHED' ? (f.score?.fulltime?.home ?? 1) : undefined),
    awayScore: f.goals?.away ?? (status === 'FINISHED' ? (f.score?.fulltime?.away ?? 0) : undefined),
    prediction,
    isFeatured: prediction.confidence >= 70,
    isHotPick: prediction.confidence >= 66,
  };
}

function transformFootballDataMatch(m: any): Match {
  const fixtureId = `fd-${m.id || Math.random().toString(36).substring(2, 9)}`;
  const home = m.homeTeam || { id: 1, name: 'Home Team', crest: '' };
  const away = m.awayTeam || { id: 2, name: 'Away Team', crest: '' };
  const comp = m.competition || { id: 2021, name: 'Premier League', area: { name: 'England' } };

  const dateStr = (m.utcDate || '').split('T')[0] || getTodayDateString();
  const timeStr = (m.utcDate || '').split('T')[1]?.substring(0, 5) || '15:00';

  const homeHash = hashCode(home.name);
  const awayHash = hashCode(away.name);

  const homeTeam: Team = {
    id: `team-${home.id}`,
    name: home.name,
    shortName: home.shortName || home.name.substring(0, 14),
    code: home.tla || home.name.substring(0, 3).toUpperCase(),
    logo: home.crest || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=128&auto=format&fit=crop&q=80',
    primaryColor: '#7C3AED',
    stadium: 'Home Stadium',
    leagueId: `league-${comp.id}`,
    leaguePosition: 1 + (homeHash % 18),
    played: 16,
    won: 7,
    drawn: 4,
    lost: 5,
    goalsFor: 24,
    goalsAgainst: 16,
    goalDifference: 8,
    points: 25,
    recentForm: ['W', 'D', 'W', 'W', 'L'],
    homeRecord: { played: 8, won: 5, drawn: 2, lost: 1, goalsFor: 15, goalsAgainst: 7 },
    awayRecord: { played: 8, won: 2, drawn: 2, lost: 4, goalsFor: 9, goalsAgainst: 9 },
    cleanSheets: 5,
    attackStrengthRating: 65 + (homeHash % 30),
    defenseStrengthRating: 60 + (homeHash % 30),
    eloRating: 1550 + (homeHash % 350),
  };

  const awayTeam: Team = {
    id: `team-${away.id}`,
    name: away.name,
    shortName: away.shortName || away.name.substring(0, 14),
    code: away.tla || away.name.substring(0, 3).toUpperCase(),
    logo: away.crest || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=128&auto=format&fit=crop&q=80',
    primaryColor: '#06B6D4',
    stadium: 'Away Stadium',
    leagueId: `league-${comp.id}`,
    leaguePosition: 1 + (awayHash % 18),
    played: 16,
    won: 6,
    drawn: 4,
    lost: 6,
    goalsFor: 20,
    goalsAgainst: 18,
    goalDifference: 2,
    points: 22,
    recentForm: ['D', 'W', 'L', 'W', 'D'],
    homeRecord: { played: 8, won: 4, drawn: 2, lost: 2, goalsFor: 11, goalsAgainst: 8 },
    awayRecord: { played: 8, won: 2, drawn: 2, lost: 4, goalsFor: 9, goalsAgainst: 10 },
    cleanSheets: 4,
    attackStrengthRating: 60 + (awayHash % 30),
    defenseStrengthRating: 58 + (awayHash % 30),
    eloRating: 1500 + (awayHash % 350),
  };

  const prediction = calculateMatchPrediction(fixtureId, homeTeam, awayTeam);

  let status: Match['status'] = 'TIMED';
  if (m.status === 'FINISHED') status = 'FINISHED';
  else if (['IN_PLAY', 'PAUSED'].includes(m.status)) status = 'IN_PLAY';
  else if (m.status === 'POSTPONED' || m.status === 'CANCELLED') status = 'POSTPONED';

  return {
    id: fixtureId,
    leagueId: `league-${comp.id}`,
    leagueName: `${comp.area?.name ? `${comp.area.name}: ` : ''}${comp.name}`,
    leagueCountry: comp.area?.name || 'Europe',
    leagueLogo: comp.emblem || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=128&auto=format&fit=crop&q=80',
    homeTeam,
    awayTeam,
    date: dateStr,
    kickoffTime: timeStr,
    venue: 'Match Stadium',
    status,
    homeScore: m.score?.fullTime?.home ?? (status === 'FINISHED' ? 1 : undefined),
    awayScore: m.score?.fullTime?.away ?? (status === 'FINISHED' ? 0 : undefined),
    prediction,
    isFeatured: prediction.confidence >= 70,
    isHotPick: prediction.confidence >= 66,
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const dateParam = url.searchParams.get('date') || getTodayDateString();
  const leagueParam = url.searchParams.get('league');
  const modeParam = url.searchParams.get('mode') || 'auto'; // 'live' | 'auto' | 'demo'
  const customKey = req.headers.get('x-football-api-key') || url.searchParams.get('key') || undefined;
  const customProvider = (req.headers.get('x-football-provider') || url.searchParams.get('provider') || 'api-football') as 'api-football' | 'football-data';

  // 1. If explicit demo mode requested
  if (modeParam === 'demo') {
    return NextResponse.json({
      success: true,
      source: 'baseline',
      date: dateParam,
      matches: INITIAL_MATCHES,
      total: INITIAL_MATCHES.length,
      message: 'Demo dataset loaded.',
    });
  }

  // 2. Fetch from third-party API
  const endpoint = customProvider === 'football-data' ? 'matches' : 'fixtures';
  const params: Record<string, string | number> = {
    date: dateParam,
    ...(leagueParam ? { league: leagueParam } : {}),
  };

  const { data, source, error, statusCode } = await fetchFromFootballApi<any[]>(endpoint, {
    params,
    apiKey: customKey,
    provider: customProvider,
    ttlSeconds: 600,
  });

  // If live mode explicitly requested and API failed, return the exact error
  if (modeParam === 'live' && (source === 'error' || !data || data.length === 0)) {
    return NextResponse.json({
      success: false,
      source: 'error',
      date: dateParam,
      error: error || `No live fixtures found from ${customProvider} for date ${dateParam}.`,
      statusCode: statusCode || 404,
      matches: [],
      total: 0,
    }, { status: 200 });
  }

  // If data returned from external API
  if (data && Array.isArray(data) && data.length > 0) {
    const matches: Match[] = customProvider === 'football-data'
      ? data.slice(0, 50).map(transformFootballDataMatch)
      : data.slice(0, 50).map(transformApiFootballFixture);

    // Persist predictions to database asynchronously if pool is active
    const pool = getDbPool();
    if (pool && matches.length > 0) {
      Promise.all(matches.slice(0, 20).map(async (m) => {
        try {
          await pool.query(
            `INSERT INTO match_predictions 
             (match_id, league_id, home_team_id, away_team_id, match_date, prediction_data)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (match_id) DO UPDATE
             SET prediction_data = $6, updated_at = CURRENT_TIMESTAMP`,
            [m.id, m.leagueId, m.homeTeam.id, m.awayTeam.id, m.date, JSON.stringify(m)]
          );
        } catch {
          // ignore background persist error
        }
      })).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      source,
      provider: customProvider,
      date: dateParam,
      matches,
      total: matches.length,
    });
  }

  // Fallback if auto mode: return baseline only if no live error was thrown with key
  if (customKey && source === 'error') {
    return NextResponse.json({
      success: false,
      source: 'error',
      date: dateParam,
      error: error || 'Failed to authenticate with provided API key.',
      matches: [],
      total: 0,
    });
  }

  return NextResponse.json({
    success: true,
    source: 'baseline',
    date: dateParam,
    matches: INITIAL_MATCHES,
    total: INITIAL_MATCHES.length,
    message: error || 'Displaying baseline dataset.',
  });
}
