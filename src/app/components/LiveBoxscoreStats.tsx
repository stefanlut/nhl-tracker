'use client';

import { useState } from 'react';
import { BoxscoreResponse, BoxscorePlayerStats } from '@/types/nhl';
import useSWR from 'swr';

interface LiveBoxscoreStatsProps {
    gameId: number;
    awayTeamAbbrev: string;
    homeTeamAbbrev: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LiveBoxscoreStats({ gameId, awayTeamAbbrev, homeTeamAbbrev }: LiveBoxscoreStatsProps) {
    const [selectedTeam, setSelectedTeam] = useState<'away' | 'home'>('away');
    const [isExpanded, setIsExpanded] = useState(false);

    // Fetch boxscore data
    const { data: boxscoreData, error: boxscoreError, mutate } = useSWR<BoxscoreResponse>(
        isExpanded ? `/api/boxscore?gameId=${gameId}` : null,
        fetcher,
        { 
            refreshInterval: isExpanded ? 30000 : 0, // Refresh every 30 seconds when expanded
            errorRetryCount: 3,
            errorRetryInterval: 5000
        }
    );

    if (!isExpanded) {
        return (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setIsExpanded(true)}
                    className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    View Live Boxscore Stats
                </button>
            </div>
        );
    }

    const currentTeam = selectedTeam === 'away' ? boxscoreData?.awayTeam : boxscoreData?.homeTeam;
    const currentTeamStats = selectedTeam === 'away' ? boxscoreData?.playerByGameStats?.awayTeam : boxscoreData?.playerByGameStats?.homeTeam;
    const isLoading = !boxscoreData && !boxscoreError;

    // Get top performers (players with points or significant ice time)
    const getTopPerformers = (players: BoxscorePlayerStats[] | undefined, position: string) => {
        if (!players || !Array.isArray(players)) {
            return [];
        }
        
        return players
            .filter(p => p && p.position === position || (position === 'skater' && p && p.position !== 'G'))
            .sort((a, b) => {
                // Sort by points first, then by ice time
                const pointsDiff = (b.points || 0) - (a.points || 0);
                if (pointsDiff !== 0) return pointsDiff;
                
                // Convert TOI to seconds for comparison
                const aSeconds = toiToSeconds(a.toi || '0:00');
                const bSeconds = toiToSeconds(b.toi || '0:00');
                return bSeconds - aSeconds;
            })
            .slice(0, position === 'G' ? 2 : 8); // Show top 8 skaters, top 2 goalies
    };

    const toiToSeconds = (toi: string): number => {
        if (!toi || typeof toi !== 'string') return 0;
        const parts = toi.split(':');
        if (parts.length !== 2) return 0;
        const [minutes, seconds] = parts.map(Number);
        return (minutes || 0) * 60 + (seconds || 0);
    };

    const formatToi = (toi: string): string => {
        if (!toi || typeof toi !== 'string') return '0:00';
        const parts = toi.split(':');
        if (parts.length !== 2) return '0:00';
        const [minutes, seconds] = parts;
        return `${minutes}:${seconds?.padStart(2, '0') || '00'}`;
    };

    return (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Live Boxscore
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => mutate()}
                        disabled={isLoading}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
                        title="Refresh boxscore"
                    >
                        <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Game Status */}
            {boxscoreData && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            Period {boxscoreData.periodDescriptor?.number || '?'} • {boxscoreData.clock?.timeRemaining || 'N/A'}
                        </span>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-600 dark:text-gray-400">
                                SOG: {boxscoreData.awayTeam?.abbrev || '?'} {boxscoreData.awayTeam?.sog || 0} - {boxscoreData.homeTeam?.sog || 0} {boxscoreData.homeTeam?.abbrev || '?'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Team Selector */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setSelectedTeam('away')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        selectedTeam === 'away'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                    {awayTeamAbbrev} {boxscoreData ? `(${boxscoreData.awayTeam?.score || 0})` : ''}
                </button>
                <button
                    onClick={() => setSelectedTeam('home')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        selectedTeam === 'home'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                    {homeTeamAbbrev} {boxscoreData ? `(${boxscoreData.homeTeam?.score || 0})` : ''}
                </button>
            </div>

            {/* Player Stats */}
            {boxscoreError ? (
                <div className="text-center py-4 text-red-500 dark:text-red-400 text-sm">
                    <div className="space-y-2">
                        <div>Failed to load boxscore data</div>
                        <button 
                            onClick={() => mutate()}
                            className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            ) : !boxscoreData ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                    <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Loading boxscore...
                    </div>
                </div>
            ) : currentTeam && currentTeamStats ? (
                <div className="space-y-4">
                    {/* Skaters */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                            Top Performers
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {getTopPerformers([...(currentTeamStats?.forwards || []), ...(currentTeamStats?.defense || [])], 'skater').map((player) => (
                                <div key={player.playerId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                #{player.sweaterNumber || '?'}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                                {player.name?.default || 'Unknown Player'}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {player.position || '?'} • {formatToi(player.toi || '0:00')} TOI
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {player.goals || 0}G {player.assists || 0}A ({player.points || 0}P)
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <span>{player.sog || 0} SOG</span>
                                            {(player.plusMinus || 0) !== 0 && (
                                                <span className={(player.plusMinus || 0) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                    {(player.plusMinus || 0) > 0 ? '+' : ''}{player.plusMinus || 0}
                                                </span>
                                            )}
                                            {(player.hits || 0) > 0 && <span>{player.hits} hits</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Goalies */}
                    {currentTeamStats?.goalies && Array.isArray(currentTeamStats.goalies) && currentTeamStats.goalies.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                Goalies
                            </h4>
                            <div className="space-y-2">
                                {currentTeamStats.goalies.map((goalie) => (
                                    <div key={goalie.playerId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    #{goalie.sweaterNumber || '?'}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                                    {goalie.name?.default || 'Unknown Goalie'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {goalie.position || 'G'} • {formatToi(goalie.toi || '0:00')} TOI
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {goalie.decision || 'N/A'} • {goalie.goalsAgainst || 0}GA
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {goalie.shotsAgainst || 0} SA • {((goalie.savePctg || 0) * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                    No team data available
                </div>
            )}
        </div>
    );
}
