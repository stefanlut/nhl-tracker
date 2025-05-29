'use client';
import { useEffect, useState } from 'react';
import { REFRESH_INTERVAL_SECONDS } from '@/constants';

export default function RefreshTimer() {
    const [secondsLeft, setSecondsLeft] = useState(REFRESH_INTERVAL_SECONDS);

    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    // Use a full page refresh for static exports
                    window.location.reload();
                    return REFRESH_INTERVAL_SECONDS;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    return (
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>
                Refreshing in {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
        </div>
    );
}
