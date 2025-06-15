import { NextRequest, NextResponse } from 'next/server';
import { BoxscoreResponse } from '@/types/nhl';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
        return NextResponse.json(
            { error: 'Game ID is required' },
            { status: 400 }
        );
    }

    try {
        // Fetch boxscore from NHL API
        const response = await fetch(
            `https://api-web.nhle.com/v1/gamecenter/${gameId}/boxscore`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; NHL-Tracker/1.0)',
                    'Accept': 'application/json',
                },
                next: { revalidate: 30 }, // Cache for 30 seconds during live games
            }
        );

        if (!response.ok) {
            console.error(`Failed to fetch boxscore for game ${gameId}:`, response.status);
            return NextResponse.json(
                { error: 'Failed to fetch boxscore' },
                { status: response.status }
            );
        }

        const data: BoxscoreResponse = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching boxscore:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
