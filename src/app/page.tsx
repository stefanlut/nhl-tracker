import GamesList from "./components/GamesList";
import Link from "next/link";
import { Suspense } from "react";
import RefreshTimer from "./components/RefreshTimer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 px-4 sm:px-6 lg:px-8">
      <main className="container mx-auto max-w-4xl flex flex-col items-center">
        <div className="w-full flex flex-col items-center gap-2 mb-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100">
            NHL Games Today
          </h1>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/weekly"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Full Week Schedule
            </Link>
            <Link 
              href="/teams"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Teams
            </Link>
            <Link 
              href="/draft"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Draft Rankings
            </Link>
            <Link 
              href="/draft-live"
              className="text-orange-600 dark:text-orange-400 hover:underline font-medium"
            >
              🔴 Live Draft Tracker
            </Link>
          </div>
          <Suspense fallback={null}>
            <RefreshTimer type="daily" />
          </Suspense>
        </div>
        <GamesList type="daily" />
      </main>
    </div>
  );
}
