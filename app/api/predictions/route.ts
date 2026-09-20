import { NextRequest, NextResponse } from 'next/server';
import { generateFullMatchPrediction } from '@/lib/prediction';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { homeTeam, awayTeam, leagueContext, customWeights } = body;

    if (!homeTeam?.name || !awayTeam?.name) {
      return NextResponse.json({
        success: false,
        error: 'Missing homeTeam or awayTeam data in request body',
      }, { status: 400 });
    }

    const prediction = generateFullMatchPrediction(
      homeTeam,
      awayTeam,
      leagueContext,
      customWeights
    );

    return NextResponse.json({
      success: true,
      prediction,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message || 'Prediction generation failed',
    }, { status: 500 });
  }
}
