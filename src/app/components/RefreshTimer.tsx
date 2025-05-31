'use client';
import { useEffect, useState, useMemo } from 'react';
import { REFRESH_INTERVAL_SECONDS, NO_GAMES_REFRESH_INTERVAL_SECONDS } from '@/constants';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface RefreshTimerProps {
  type?: 'daily' | 'weekly';
}

export default function RefreshTimer({ type = 'daily' }: RefreshTimerProps) {
    // Get data to determine if we should use reduced refresh
    const { data, isLoading } = useSWR(`/api/games?type=${type}`, fetcher, {
        refreshInterval: 0, // Don't auto-refresh this request, just get initial data
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    // Determine appropriate refresh interval
    const refreshInterval = useMemo(() => {
        if (type === 'weekly') return REFRESH_INTERVAL_SECONDS;
        if (!data) return REFRESH_INTERVAL_SECONDS; // Default to 30s while loading
        
        const today = new Date().toISOString().split('T')[0];
        const todaysGameDay = data.gameWeek?.find((day: any) => day.date === today);
        const hasGamesToday = (todaysGameDay?.games.length || 0) > 0;
        
        return hasGamesToday ? REFRESH_INTERVAL_SECONDS : NO_GAMES_REFRESH_INTERVAL_SECONDS;
    }, [data, type]);

    const [secondsLeft, setSecondsLeft] = useState(refreshInterval);

    // Don't start timer until data is loaded for daily type
    const shouldStartTimer = type === 'weekly' || !isLoading;

    useEffect(() => {
        // Reset timer when refresh interval changes
        setSecondsLeft(refreshInterval);
    }, [refreshInterval]);

    useEffect(() => {
        if (!shouldStartTimer) return;
        
        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    // Use a full page refresh for static exports
                    window.location.reload();
                    return refreshInterval;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [refreshInterval, shouldStartTimer]);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    
    // Determine refresh mode for display
    const isReducedRefresh = refreshInterval === NO_GAMES_REFRESH_INTERVAL_SECONDS;
    const refreshModeText = isReducedRefresh ? 'reduced refresh (no games today)' : 'normal refresh';

    // Show loading state for daily type until data loads
    if (type === 'daily' && isLoading) {
        return (
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Loading refresh schedule...</span>
            </div>
        );
    }

    return (
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>
                Refreshing in {minutes}:{seconds.toString().padStart(2, '0')} ({refreshModeText})
            </span>
        </div>
    );
}
