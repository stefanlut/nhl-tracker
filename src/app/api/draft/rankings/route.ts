import { NextResponse } from 'next/server';
import type { DraftRankingsResponse } from '@/types/nhl';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'north-american-skater';
    
    // Map category keys to their corresponding category IDs
    const categoryMap: Record<string, number> = {
      'north-american-skater': 1,
      'international-skater': 2,
      'north-american-goalie': 3,
      'international-goalie': 4
    };
    
    const categoryId = categoryMap[category] || 1;
    
    // Use the correct NHL API endpoint format: /v1/draft/rankings/{season}/{prospect_category}
    // Season is in YYYY format, prospect_category is the numeric ID
    const currentYear = new Date().getFullYear();
    const draftYear = currentYear; // Current draft year
    const apiUrl = `https://api-web.nhle.com/v1/draft/rankings/${draftYear}/${categoryId}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch draft rankings: ${response.status}`);
    }
    
    const data: DraftRankingsResponse = await response.json();
    
    // Filter out rankings without a finalRank (unranked players)
    const rankedPlayers = data.rankings.filter(player => player.finalRank !== undefined);
    
    // Sort by finalRank to ensure proper order
    rankedPlayers.sort((a, b) => a.finalRank - b.finalRank);
    
    return NextResponse.json({
      ...data,
      rankings: rankedPlayers
    });
  } catch (error) {
    console.error('Error fetching draft rankings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draft rankings' },
      { status: 500 }
    );
  }
}
