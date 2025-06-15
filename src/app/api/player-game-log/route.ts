import { NextRequest, NextResponse } from 'next/server';
import { PlayerGameLogResponse } from '@/types/nhl';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');

    if (!playerId) {
        return NextResponse.json(
            { error: 'Player ID is required' },
            { status: 400 }
        );
    }

    try {
        // Fetch player game log from NHL API
        const response = await fetch(
            `https://api-web.nhle.com/v1/player/${playerId}/game-log/now`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; NHL-Tracker/1.0)',
                },
                next: { revalidate: 30 }, // Cache for 30 seconds during live games
            }
        );

        if (!response.ok) {
            console.error(`Failed to fetch player game log for player ${playerId}:`, response.status);
            return NextResponse.json(
                { error: 'Failed to fetch player game log' },
                { status: response.status }
            );
        }

        const data: PlayerGameLogResponse = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching player game log:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
