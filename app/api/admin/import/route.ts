import { NextRequest, NextResponse } from 'next/server';

interface ImportRecord {
  league: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let records: ImportRecord[] = [];

    if (contentType.includes('application/json')) {
      const body = await req.json();
      const rawList = Array.isArray(body) ? body : body.records || [];
      records = rawList.map((item: any) => ({
        league: String(item.league || item.League || 'General'),
        date: String(item.date || item.Date || ''),
        homeTeam: String(item.homeTeam || item.HomeTeam || item.home_team || ''),
        awayTeam: String(item.awayTeam || item.AwayTeam || item.away_team || ''),
        homeScore: parseInt(item.homeScore ?? item.HomeScore ?? item.FTHG ?? '0', 10),
        awayScore: parseInt(item.awayScore ?? item.AwayScore ?? item.FTAG ?? '0', 10),
      }));
    } else {
      // Parse CSV
      const text = await req.text();
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length > 1) {
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        const homeIdx = headers.findIndex((h) => h.includes('home') && !h.includes('score'));
        const awayIdx = headers.findIndex((h) => h.includes('away') && !h.includes('score'));
        const dateIdx = headers.findIndex((h) => h.includes('date'));
        const leagueIdx = headers.findIndex((h) => h.includes('league') || h.includes('div'));
        const hScoreIdx = headers.findIndex((h) => h === 'fthg' || h.includes('homescore') || h === 'h_score');
        const aScoreIdx = headers.findIndex((h) => h === 'ftag' || h.includes('awayscore') || h === 'a_score');

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 4) {
            records.push({
              league: leagueIdx >= 0 ? cols[leagueIdx] : 'Imported League',
              date: dateIdx >= 0 ? cols[dateIdx] : new Date().toISOString().split('T')[0],
              homeTeam: homeIdx >= 0 ? cols[homeIdx] : cols[1] || 'Home Team',
              awayTeam: awayIdx >= 0 ? cols[awayIdx] : cols[2] || 'Away Team',
              homeScore: hScoreIdx >= 0 ? parseInt(cols[hScoreIdx] || '0', 10) : 0,
              awayScore: aScoreIdx >= 0 ? parseInt(cols[aScoreIdx] || '0', 10) : 0,
            });
          }
        }
      }
    }

    // Validation & deduplication
    const seen = new Set<string>();
    const validRecords: ImportRecord[] = [];
    const invalidCount = { count: 0 };

    for (const r of records) {
      if (!r.homeTeam || !r.awayTeam || isNaN(r.homeScore) || isNaN(r.awayScore)) {
        invalidCount.count++;
        continue;
      }
      const dedupKey = `${r.date}_${r.homeTeam.toLowerCase()}_${r.awayTeam.toLowerCase()}`;
      if (seen.has(dedupKey)) {
        continue;
      }
      seen.add(dedupKey);
      validRecords.push(r);
    }

    return NextResponse.json({
      success: true,
      importedCount: validRecords.length,
      skippedDuplicates: records.length - validRecords.length - invalidCount.count,
      invalidCount: invalidCount.count,
      sample: validRecords.slice(0, 3),
      message: `Successfully validated and processed ${validRecords.length} historical match records.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
