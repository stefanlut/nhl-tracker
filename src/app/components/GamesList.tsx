'use client';

import { NHLScheduleResponse } from '@/types/nhl';
import useSWR from 'swr';
import GameCard from './GameCard';
import { REFRESH_INTERVAL_SECONDS } from '@/constants';

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

  if (error) {
    return <div className="text-red-500">Failed to load games</div>;
  }

  if (isLoading || !data) {
    return <div className="text-gray-500">Loading...</div>;
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

  const todaysGames = data.gameWeek[0]?.games || [];

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
