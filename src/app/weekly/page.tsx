import { NHLScheduleResponse } from "@/types/nhl";
import Link from "next/link";
import GameCard from "../components/GameCard";
import { REFRESH_INTERVAL_SECONDS } from "@/constants";
import { getWeekDates } from "@/utils/dates";

async function getWeeklyGames() {
  const { monday } = getWeekDates();
  
  // Use the date-based endpoint to get the full week of games
  const res = await fetch(`https://api-web.nhle.com/v1/schedule/${monday}`, {
    next: { 
      revalidate: REFRESH_INTERVAL_SECONDS,
      tags: ['weekly-schedule']
    },
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
  
  if (!res.ok) {
    console.error('Failed to fetch:', res.status, res.statusText);
    throw new Error("Failed to fetch NHL games");
  }
  
  const data = await res.json() as NHLScheduleResponse;
  
  // The API now returns the full week automatically, but let's ensure we have entries for every day
  const dates = [];
  const current = new Date(monday);
  
  // Create array for 7 days starting from Monday
  for (let i = 0; i < 7; i++) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  // Map the dates to gamedays, including empty days
  const fullWeek = dates.map(date => {
    const gameDay = data.gameWeek.find(day => day.date === date);
    return {
      date,
      games: gameDay ? gameDay.games : []
    };
  });

  return fullWeek;
}

export default async function WeeklySchedule() {
  const weekSchedule = await getWeeklyGames();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <main className="container mx-auto max-w-6xl flex flex-col items-center">
        <div className="w-full flex flex-col items-center gap-2 mb-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100">
            NHL Weekly Schedule
          </h1>
          <Link 
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Today&apos;s Games
          </Link>
        </div>
        
        {weekSchedule.map((day) => (
          <div key={day.date} className="w-full mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300 text-center">
              {new Date(day.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                timeZone: 'UTC'  // Ensure consistent date handling
              })}
            </h2>
            <div className="space-y-4 flex flex-col items-center">
              {day.games.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No games scheduled</p>
              ) : (
                day.games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))
              )}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
