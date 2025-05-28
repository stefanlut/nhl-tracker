import { NHLScheduleResponse } from "@/types/nhl";
import Link from "next/link";
import GameCard from "../components/GameCard";
import { REFRESH_INTERVAL_SECONDS } from "@/constants";

async function getWeeklyGames() {
  const res = await fetch("https://api-web.nhle.com/v1/schedule/now", {
    next: { revalidate: REFRESH_INTERVAL_SECONDS },
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });
  
  if (!res.ok) {
    console.error('Failed to fetch:', res.status, res.statusText);
    throw new Error("Failed to fetch NHL games");
  }
  
  return res.json() as Promise<NHLScheduleResponse>;
}

export default async function WeeklySchedule() {
  const schedule = await getWeeklyGames();
  
  // Debug the full game data
  console.log('Game data:', JSON.stringify(schedule.gameWeek[0]?.games[0], null, 2));
  console.log('Schedule dates:', schedule.gameWeek.map(day => ({
    rawDate: day.date,
    parsedDate: new Date(day.date),
    games: day.games.map(game => ({
      id: game.id,
      startTime: game.startTimeUTC,
      parsedStartTime: new Date(game.startTimeUTC)
    }))
  })));

  // Sort the game week by actual date
  const sortedGameWeek = [...schedule.gameWeek].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
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
        
        {sortedGameWeek.map((day) => (
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
