import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
 
export async function POST() {
  // Revalidate both daily and weekly schedules
  revalidateTag('daily-schedule');
  revalidateTag('weekly-schedule');
  
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
