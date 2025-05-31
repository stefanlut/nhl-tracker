'use client';
import { useEffect, useState, useMemo, useRef } from 'react';
import { REFRESH_INTERVAL_SECONDS, NO_GAMES_REFRESH_INTERVAL_SECONDS } from '@/constants';
import { NHLScheduleResponse } from '@/types/nhl';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface RefreshTimerProps {
  type?: 'daily' | 'weekly';
}

export default function RefreshTimer({ type = 'daily' }: RefreshTimerProps) {
    // Only fetch data for daily type to determine refresh interval
    const shouldFetchData = type === 'daily';
    
    const { data, isLoading } = useSWR<NHLScheduleResponse>(
        shouldFetchData ? `/api/games?type=${type}` : null, 
        fetcher, 
        {
            refreshInterval: 0, // Don't auto-refresh this request, just get initial data
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    );

    // Determine appropriate refresh interval based on games today
    const currentRefreshInterval = useMemo(() => {
        // Weekly type uses longer refresh interval (6 hours like no-games days)
        if (type === 'weekly') return NO_GAMES_REFRESH_INTERVAL_SECONDS;
        
        // Daily type: check for games today when data is available
        if (!data) return null; // Don't determine interval until we have data
        
        const today = new Date().toISOString().split('T')[0];
        const todaysGameDay = data.gameWeek?.find((day) => day.date === today);
        const hasGamesToday = (todaysGameDay?.games.length || 0) > 0;
        
        return hasGamesToday ? REFRESH_INTERVAL_SECONDS : NO_GAMES_REFRESH_INTERVAL_SECONDS;
    }, [data, type]);

    const [secondsLeft, setSecondsLeft] = useState(REFRESH_INTERVAL_SECONDS);
    const [hasInitialized, setHasInitialized] = useState(false);
    const [hasRestoredFromStorage, setHasRestoredFromStorage] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Determine if we should start the timer
    const shouldStartTimer = type === 'weekly' || (!isLoading && currentRefreshInterval !== null);

    // Restore from localStorage on component mount (only once)
    useEffect(() => {
        const storageKey = `refreshTimer_${type}`;
        
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const { timestamp, secondsLeft: storedSeconds } = JSON.parse(stored);
                const elapsed = Math.floor((Date.now() - timestamp) / 1000);
                const remaining = Math.max(0, storedSeconds - elapsed);
                
                if (remaining > 0) {
                    setSecondsLeft(remaining);
                    setHasRestoredFromStorage(true);
                } else {
                    // Timer expired, clear the expired localStorage entry to prevent refresh loops
                    localStorage.removeItem(storageKey);
                    
                    // Add safety check to prevent rapid refresh loops
                    const lastRefreshKey = `lastRefresh_${type}`;
                    const lastRefresh = localStorage.getItem(lastRefreshKey);
                    const now = Date.now();
                    
                    if (lastRefresh) {
                        const timeSinceLastRefresh = now - parseInt(lastRefresh);
                        if (timeSinceLastRefresh < 5000) { // Less than 5 seconds since last refresh
                            setHasInitialized(true);
                            return;
                        }
                    }
                    
                    // Record this refresh time
                    localStorage.setItem(lastRefreshKey, now.toString());
                    
                    // Timer expired, trigger refresh
                    window.location.reload();
                    return;
                }
            } else {
                console.log(`[RefreshTimer] No stored timer found for ${type}`);
            }
        } catch (error) {
            console.warn('Could not restore timer state:', error);
        }
        
        setHasInitialized(true);
    }, [type]); // Only depend on type, not currentRefreshInterval

    // Separate effect to handle when refresh interval becomes available
    useEffect(() => {
        if (hasInitialized && currentRefreshInterval !== null) {
            // Only set timer to current interval if we haven't restored from storage
            // or if the stored interval doesn't match the expected interval
            const storageKey = `refreshTimer_${type}`;
            try {
                const stored = localStorage.getItem(storageKey);
                if (stored) {
                    const { interval: storedInterval } = JSON.parse(stored);
                    if (storedInterval !== currentRefreshInterval) {
                        // Interval changed (e.g., games started/ended), reset timer
                        setSecondsLeft(currentRefreshInterval);
                        setHasRestoredFromStorage(false);
                    }
                } else if (!hasRestoredFromStorage) {
                    // No stored state and we haven't restored, use current interval
                    setSecondsLeft(currentRefreshInterval);
                }
            } catch {
                // Error reading storage, use current interval only if not restored
                if (!hasRestoredFromStorage) {
                    setSecondsLeft(currentRefreshInterval);
                }
            }
        }
    }, [hasInitialized, currentRefreshInterval, type, hasRestoredFromStorage]);

    // Main timer effect
    useEffect(() => {
        // Don't start timer until we've initialized and have proper conditions
        if (!hasInitialized || !shouldStartTimer) {
            return;
        }

        // Clear any existing timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        const refreshInterval = currentRefreshInterval || REFRESH_INTERVAL_SECONDS;
        
        // Safety check: ensure refresh interval is valid
        if (refreshInterval <= 0) {
            console.warn('Invalid refresh interval:', refreshInterval);
            return;
        }
        
        // Safety check: ensure secondsLeft is valid
        if (secondsLeft <= 0) {
            console.warn('Invalid secondsLeft:', secondsLeft);
            setSecondsLeft(refreshInterval);
            return;
        }

        // Start the countdown
        timerRef.current = setInterval(() => {
            setSecondsLeft(prev => {
                const newValue = prev - 1;
                
                if (newValue <= 0) {
                    // Clear the timer before triggering refresh to prevent loops
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                    
                    // Add a small delay to ensure cleanup
                    setTimeout(() => {
                        window.location.reload();
                    }, 100);
                    
                    return refreshInterval;
                }

                // Save to localStorage
                const storageKey = `refreshTimer_${type}`;
                try {
                    localStorage.setItem(storageKey, JSON.stringify({
                        timestamp: Date.now(),
                        interval: refreshInterval,
                        secondsLeft: newValue
                    }));
                } catch (error) {
                    console.warn('Could not save timer state:', error);
                }

                return newValue;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [hasInitialized, shouldStartTimer, currentRefreshInterval, type]); // eslint-disable-line react-hooks/exhaustive-deps

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    
    // Determine refresh mode for display
    const displayInterval = currentRefreshInterval || REFRESH_INTERVAL_SECONDS;
    const isReducedRefresh = displayInterval === NO_GAMES_REFRESH_INTERVAL_SECONDS;
    const refreshModeText = type === 'weekly' 
        ? 'weekly schedule refresh' 
        : isReducedRefresh 
            ? 'reduced refresh (no games today)' 
            : 'normal refresh';

    // Show loading state only for daily type until data loads and we've initialized
    if (type === 'daily' && (isLoading || !hasInitialized)) {
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
