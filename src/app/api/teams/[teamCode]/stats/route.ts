import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamCode: string }> }
) {
  const { teamCode } = await params;
  
  if (!teamCode || typeof teamCode !== 'string' || teamCode.length !== 3) {
    return NextResponse.json(
      { error: 'Invalid team code. Must be a 3-letter code.' },
      { status: 400 }
    );
  }
  
  try {
    const season = "20242025";
    const searchParams = new URL(request.url).searchParams;
    const isPlayoffs = searchParams.get('playoffs') === 'true';
    const gameType = isPlayoffs ? "3" : "2"; // 2 for regular season, 3 for playoffs
    
    const response = await fetch(`https://api-web.nhle.com/v1/club-stats/${teamCode}/${season}/${gameType}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      // Handle specific HTTP errors
      if (response.status === 404) {
        return NextResponse.json({ teamStats: {} }, {
          headers: { 'Cache-Control': 'no-store, max-age=0' }
        });
      }
      
      throw new Error(`Failed to fetch stats for team ${teamCode} with status: ${response.status}`);
    }

    const data = await response.json();
    const teamStats = data.teamStats || {};

    return NextResponse.json({ teamStats }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error) {
    console.error(`Error fetching stats for team ${teamCode}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch team stats for ${teamCode}`, teamStats: {} },
      { status: 500 }
    );
  }
}
