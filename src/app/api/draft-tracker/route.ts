import { NextResponse } from 'next/server';
import { LiveDraftResponse } from '@/types/nhl';

export async function GET() {
    try {
        // Fetch live draft tracker data from NHL API
        const response = await fetch(
            'https://api-web.nhle.com/v1/draft-tracker/picks/now',
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; NHL-Tracker/1.0)',
                    'Accept': 'application/json',
                },
                next: { revalidate: 30 }, // Cache for 30 seconds during live draft
            }
        );

        if (!response.ok) {
            console.error('Failed to fetch draft tracker data:', response.status);
            return NextResponse.json(
                { error: 'Failed to fetch draft tracker data' },
                { status: response.status }
            );
        }

        const data: LiveDraftResponse = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching draft tracker data:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
