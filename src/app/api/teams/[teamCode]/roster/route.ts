import { NextRequest, NextResponse } from 'next/server';
import { NHLRoster } from '@/types/nhl';

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
    const response = await fetch(`https://api-web.nhle.com/v1/roster/${teamCode}/current`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      // Handle specific HTTP errors
      if (response.status === 404) {
        return NextResponse.json({ roster: [] }, {
          headers: { 'Cache-Control': 'no-store, max-age=0' }
        });
      }
      
      throw new Error(`Failed to fetch roster for team ${teamCode} with status: ${response.status}`);
    }

    const data = await response.json() as NHLRoster;
    const allPlayers = [
      ...(data.forwards || []),
      ...(data.defensemen || []),
      ...(data.goalies || [])
    ];

    return NextResponse.json({ roster: allPlayers }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error) {
    console.error(`Error fetching roster for team ${teamCode}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch roster data for team ${teamCode}`, roster: [] },
      { status: 500 }
    );
  }
}
