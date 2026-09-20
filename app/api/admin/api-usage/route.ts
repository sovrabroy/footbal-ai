import { NextRequest, NextResponse } from 'next/server';
import { getApiUsageSummary } from '@/lib/apiCache';

export async function GET(req: NextRequest) {
  try {
    const summary = await getApiUsageSummary();
    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
