import { NextRequest, NextResponse } from 'next/server';
import { createBacktestSession } from '@/lib/backtestEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const totalMatches = body.totalMatches || 1000;
    const batchSize = body.batchSize || 250;

    const session = await createBacktestSession(totalMatches, batchSize);

    return NextResponse.json({
      success: true,
      session,
      message: `Backtest session created for ${totalMatches} historical matches (${Math.ceil(totalMatches / batchSize)} batches).`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
