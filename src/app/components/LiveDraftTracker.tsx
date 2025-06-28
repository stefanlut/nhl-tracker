'use client';

import { useState } from 'react';
import { LiveDraftResponse, DraftPick } from '@/types/nhl';
import Image from 'next/image';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LiveDraftTracker() {
    const [selectedView, setSelectedView] = useState<'recent' | 'upcoming' | 'clock'>('recent');

    // Fetch live draft data
    const { data: draftData, error: draftError, mutate } = useSWR<LiveDraftResponse>(
        '/api/draft-tracker',
        fetcher,
        { 
            refreshInterval: 15000, // Refresh every 15 seconds during draft
            errorRetryCount: 3,
            errorRetryInterval: 5000
        }
    );

    const isLoading = !draftData && !draftError;
    const isDraftActive = draftData?.state === 'liveDay1' || draftData?.state === 'liveDay2';

    // Get recent picks (confirmed picks)
    const recentPicks = draftData?.picks?.filter(pick => pick.state === 'confirmed') || [];
    
    // Get upcoming picks (open picks)
    const upcomingPicks = draftData?.picks?.filter(pick => pick.state === 'open') || [];
    
    // Get pick on the clock
    const onClockPick = draftData?.picks?.find(pick => pick.state === 'onTheClock');

    // Format time for display
    const formatTime = (timeString?: string) => {
        if (!timeString) return 'N/A';
        try {
            return new Date(timeString).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/New_York'
            });
        } catch {
            return timeString;
        }
    };

    // Render draft pick card
    const renderPickCard = (pick: DraftPick, showTime: boolean = true) => {
        return (
            <div key={`${pick.overallPick}`} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <Image
                                src={pick.teamLogoDark}
                                alt={`${pick.teamFullName.default} logo`}
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        </div>
                        <div>
                            <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                Round {draftData?.round}, Pick {pick.pickInRound}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                #{pick.overallPick} overall • {pick.teamFullName.default}
                            </div>
                            {pick.tradedFrom && (
                                <div className="text-xs text-blue-600 dark:text-blue-400">
                                    (via {pick.tradedFrom.teamFullName.default})
                                </div>
                            )}
                        </div>
                    </div>
                    {showTime && pick.pickTime && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(pick.pickTime)}
                        </div>
                    )}
                </div>

                {pick.state === 'confirmed' && pick.firstName && pick.lastName ? (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                        <div className="flex items-start gap-3">
                            <div className="flex-1">
                                <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                                    {pick.firstName.default} {pick.lastName.default}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                    {pick.positionCode && `${pick.positionCode}`}
                                    {pick.prospect?.shoots && ` • ${pick.prospect.shoots}`}
                                    {pick.prospect?.height && ` • ${pick.prospect.height}`}
                                    {pick.prospect?.weight && `, ${pick.prospect.weight} lbs`}
                                </div>
                                {pick.prospect?.amateurClub && pick.prospect?.amateurLeague && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {pick.prospect.amateurClub.default} ({pick.prospect.amateurLeague.default})
                                    </div>
                                )}
                                {pick.prospect?.birthCity && pick.prospect?.birthCountry && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {pick.prospect.birthCity.default}, {pick.prospect.birthCountry}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : pick.state === 'onTheClock' ? (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                            </span>
                            <span className="font-medium">ON THE CLOCK</span>
                            {pick.timeOnClock && (
                                <span className="text-sm">({pick.timeOnClock})</span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Pick upcoming...
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (draftError) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 px-4 sm:px-6 lg:px-8">
                <main className="container mx-auto max-w-6xl">
                    <div className="text-center py-12">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            NHL Draft Tracker
                        </h1>
                        <div className="text-red-600 dark:text-red-400">
                            <p className="mb-4">Failed to load draft data</p>
                            <button 
                                onClick={() => mutate()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 px-4 sm:px-6 lg:px-8">
                <main className="container mx-auto max-w-6xl">
                    <div className="text-center py-12">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
                            NHL Draft Tracker
                        </h1>
                        <div className="flex items-center justify-center gap-3 text-gray-500 dark:text-gray-400">
                            <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Loading draft data...</span>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 px-4 sm:px-6 lg:px-8">
            <main className="container mx-auto max-w-6xl">
                <div className="flex flex-col items-center gap-4 mb-8">
                    <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100">
                        NHL Draft Tracker 2025
                    </h1>
                    
                    {/* Draft Status */}
                    <div className="flex items-center gap-4 text-sm">
                        <div className={`px-3 py-1 rounded-full font-medium ${
                            isDraftActive
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                                : draftData?.state === 'completed'
                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                        }`}>
                            {isDraftActive ? 'LIVE' :
                             draftData?.state === 'completed' ? 'COMPLETED' : 
                             draftData?.state === 'upcoming' ? 'UPCOMING' : draftData?.state?.toUpperCase()}
                        </div>
                        
                        {isDraftActive && draftData?.round && (
                            <div className="text-gray-600 dark:text-gray-400">
                                Round {draftData.round}
                            </div>
                        )}
                        
                        {onClockPick && (
                            <div className="text-orange-600 dark:text-orange-400 font-medium">
                                {onClockPick.teamFullName.default} on the clock
                            </div>
                        )}
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={() => mutate()}
                        className="flex items-center gap-2 px-3 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                {/* View Selector */}
                <div className="flex justify-center gap-2 mb-6">
                    <button
                        onClick={() => setSelectedView('recent')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedView === 'recent'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        Recent Picks ({recentPicks.length})
                    </button>
                    <button
                        onClick={() => setSelectedView('upcoming')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedView === 'upcoming'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        Upcoming Picks ({upcomingPicks.length})
                    </button>
                    {onClockPick && (
                        <button
                            onClick={() => setSelectedView('clock')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedView === 'clock'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            On The Clock
                        </button>
                    )}
                </div>

                {/* Draft Picks Display */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {selectedView === 'recent' && recentPicks.slice(0, 12).map(pick => 
                        renderPickCard(pick, true)
                    )}
                    
                    {selectedView === 'upcoming' && upcomingPicks.slice(0, 12).map(pick => 
                        renderPickCard(pick, false)
                    )}
                    
                    {selectedView === 'clock' && onClockPick && (
                        <div className="col-span-full">
                            <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                                <div className="text-center">
                                    <h2 className="text-xl font-bold text-orange-800 dark:text-orange-200 mb-2">
                                        ON THE CLOCK
                                    </h2>
                                    <div className="text-lg text-orange-700 dark:text-orange-300">
                                        {onClockPick.teamFullName.default}
                                    </div>
                                    <div className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                                        Round {draftData?.round}, Pick {onClockPick.pickInRound} (#{onClockPick.overallPick} overall)
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* No Data Message */}
                {((selectedView === 'recent' && recentPicks.length === 0) ||
                  (selectedView === 'upcoming' && upcomingPicks.length === 0)) && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <p>No {selectedView} picks available</p>
                    </div>
                )}
            </main>
        </div>
    );
}
