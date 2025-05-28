import GameCard from "./components/GameCard";
import RefreshTimer from "./components/RefreshTimer";
import { NHLScheduleResponse } from "@/types/nhl";
import { REFRESH_INTERVAL_SECONDS } from "@/constants";
import { Suspense } from "react";
import Link from "next/link";

async function getNHLGames() {
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
  
  const data = await res.json();
  console.log('NHL API Response:', JSON.stringify(data, null, 2));
  return data as NHLScheduleResponse;
}

export default async function Home() {
  const schedule = await getNHLGames();
  const todaysGames = schedule.gameWeek[0]?.games || [];
  console.log('Today\'s games:', JSON.stringify(todaysGames, null, 2));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <main className="container mx-auto max-w-4xl flex flex-col items-center">
        <div className="w-full flex flex-col items-center gap-2 mb-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100">
            NHL Games Today
          </h1>
          <Link 
            href="/weekly"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Full Week Schedule
          </Link>
          <Suspense fallback={null}>
            <RefreshTimer />
          </Suspense>
        </div>
        {todaysGames.length === 0 ? (
          <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-center text-gray-600 dark:text-gray-400">
              No games scheduled for today
            </p>
          </div>
        ) : (
          <div className="w-full space-y-4 flex flex-col items-center">
            {todaysGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
