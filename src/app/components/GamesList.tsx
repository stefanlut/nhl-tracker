'use client';

import { NHLScheduleResponse } from '@/types/nhl';
import useSWR from 'swr';
import GameCard from './GameCard';
import { REFRESH_INTERVAL_SECONDS, NO_GAMES_REFRESH_INTERVAL_SECONDS } from '@/constants';
import { useMemo } from 'react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface GamesListProps {
  type?: 'weekly' | 'daily';
}

export default function GamesList({ type = 'daily' }: GamesListProps) {
  const { data, error, isLoading } = useSWR<NHLScheduleResponse>(
    `/api/games?type=${type}`,
    fetcher,
    {
      refreshInterval: REFRESH_INTERVAL_SECONDS * 1000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  );

  // For daily view, dynamically adjust refresh interval based on game availability
  const shouldUseReducedRefresh = useMemo(() => {
    if (type === 'weekly' || !data) return false;
    
    const today = new Date().toISOString().split('T')[0];
    const todaysGameDay = data.gameWeek.find(day => day.date === today);
    const hasGamesToday = (todaysGameDay?.games.length || 0) > 0;
    
    return !hasGamesToday;
  }, [data, type]);

  // Create a second SWR instance with reduced refresh when no games today
  const { data: dataReduced } = useSWR<NHLScheduleResponse>(
    shouldUseReducedRefresh ? `/api/games?type=${type}&reduced=true` : null,
    fetcher,
    {
      refreshInterval: NO_GAMES_REFRESH_INTERVAL_SECONDS * 1000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  );

  // Use reduced refresh data when available, otherwise use normal data
  const finalData = (shouldUseReducedRefresh && dataReduced) ? dataReduced : data;
  
  // Log refresh mode for debugging
  useMemo(() => {
    if (type === 'daily' && finalData) {
      const today = new Date().toISOString().split('T')[0];
      const todaysGameDay = finalData.gameWeek.find(day => day.date === today);
      const hasGamesToday = (todaysGameDay?.games.length || 0) > 0;
      console.log(`🔄 Refresh mode: ${hasGamesToday ? 'Normal (30s)' : 'Reduced (6h)'} - Games today: ${hasGamesToday}`);
    }
  }, [finalData, type]);

  if (error) {
    return (
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow text-center">
        <div className="mx-auto w-12 h-12 mb-4 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Failed to load games</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          There was an error retrieving the games data. Please try again later.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reload
        </button>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 dark:border-blue-400"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading games...</p>
      </div>
    );
  }

  if (type === 'weekly') {
    return (
      <>
        {data.gameWeek.map((day) => (
          <div key={day.date} className="w-full mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300 text-center">
              {new Date(day.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC'
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
      </>
    );
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Find today's games in the response
  const todaysGameDay = data.gameWeek.find(day => day.date === today);
  const todaysGames = todaysGameDay?.games || [];

  return (
    <>
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
    </>
  );
}
