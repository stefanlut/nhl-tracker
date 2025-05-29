import { NHLScheduleResponse } from '@/types/nhl';
import { NextResponse } from 'next/server';

// This ensures the route is always dynamic and fetches fresh data
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  
  const url = type === 'weekly' 
    ? `https://api-web.nhle.com/v1/schedule/${getMonday()}`
    : 'https://api-web.nhle.com/v1/schedule/now';
    
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    },
    cache: 'no-store'
  });
  
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }

  const data: NHLScheduleResponse = await res.json();
  return NextResponse.json(data);
}

function getMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}
