import { NextRequest, NextResponse } from 'next/server';
import { runBacktestBatch } from '@/lib/backtestEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing backtest session id' }, { status: 400 });
    }

    const session = await runBacktestBatch(id);

    return NextResponse.json({
      success: true,
      session,
      completedBatch: session.currentBatch,
      progressPercent: Number(((session.processedMatches / session.totalMatches) * 100).toFixed(1)),
      isFinished: session.status === 'COMPLETED',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
