import { NextRequest, NextResponse } from 'next/server';
import { fetchFromFootballApi } from '@/lib/footballApiClient';
import { INITIAL_MATCHES } from '@/data/mockFootballData';
import { getTodayDateString } from '@/lib/dateUtils';
import { calculateMatchPrediction } from '@/services/predictionService';
import { Match, Team } from '@/types/football';

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function transformApiFixtureToMatch(f: any): Match {
  const fixtureId = `api-${f.fixture.id}`;
  const home = f.teams.home;
  const away = f.teams.away;
  const leagueData = f.league;

  const dateStr = (f.fixture.date || '').split('T')[0] || getTodayDateString();
  const timeStr = (f.fixture.date || '').split('T')[1]?.substring(0, 5) || '15:00';

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
    shortName: home.name.substring(0, 12),
    code: home.name.substring(0, 3).toUpperCase(),
    logo: home.logo || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=128&auto=format&fit=crop&q=80',
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
    shortName: away.name.substring(0, 12),
    code: away.name.substring(0, 3).toUpperCase(),
    logo: away.logo || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=128&auto=format&fit=crop&q=80',
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
  const apiStatus = f.fixture.status?.short;
  if (apiStatus === 'FT' || apiStatus === 'AET' || apiStatus === 'PEN') {
    status = 'FINISHED';
  } else if (apiStatus === '1H' || apiStatus === '2H' || apiStatus === 'HT' || apiStatus === 'ET' || apiStatus === 'LIVE') {
    status = 'IN_PLAY';
  } else if (apiStatus === 'PST') {
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
    venue: f.fixture.venue?.name ? `${f.fixture.venue.name}, ${f.fixture.venue.city || ''}` : 'National Stadium',
    referee: f.fixture.referee || 'Designated Match Official',
    status,
    homeScore: f.goals?.home ?? (status === 'FINISHED' ? (f.score?.fulltime?.home ?? 1) : undefined),
    awayScore: f.goals?.away ?? (status === 'FINISHED' ? (f.score?.fulltime?.away ?? 0) : undefined),
    prediction,
    isFeatured: prediction.confidence >= 70,
    isHotPick: prediction.confidence >= 66,
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const dateParam = url.searchParams.get('date') || getTodayDateString();
  const leagueParam = url.searchParams.get('league');

  const { data, source, error } = await fetchFromFootballApi<any[]>('fixtures', {
    params: {
      date: dateParam,
      ...(leagueParam ? { league: leagueParam } : {}),
    },
    ttlSeconds: 900,
  });

  if (!data || !Array.isArray(data) || data.length === 0) {
    return NextResponse.json({
      success: true,
      source: 'baseline',
      date: dateParam,
      matches: INITIAL_MATCHES,
      total: INITIAL_MATCHES.length,
      message: error || 'Displaying baseline dataset.',
    });
  }

  const matches = data.slice(0, 36).map(transformApiFixtureToMatch);

  return NextResponse.json({
    success: true,
    source,
    date: dateParam,
    matches,
    total: matches.length,
  });
}
