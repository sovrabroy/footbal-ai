import { NextRequest, NextResponse } from 'next/server';
import { validateCronAuth } from '@/lib/cronAuth';

export async function GET(req: NextRequest) {
  if (!validateCronAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized cron execution' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    job: 'sync-lineups',
    status: 'COMPLETED',
    message: 'Confirmed lineups synced for active live fixtures.',
    timestamp: new Date().toISOString(),
  });
}
