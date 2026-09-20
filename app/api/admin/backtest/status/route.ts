import { NextRequest, NextResponse } from 'next/server';
import { getBacktestSession } from '@/lib/backtestEngine';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing session id' }, { status: 400 });
  }

  const session = await getBacktestSession(id);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, session });
}
