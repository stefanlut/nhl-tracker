import { NHLGame } from '@/types/nhl';
import Image from 'next/image';

interface GameCardProps {
    game: NHLGame;
}

export default function GameCard({ game }: GameCardProps) {
    const gameTime = new Date(game.startTimeUTC).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true
    }).toLowerCase();
    
    // Enhanced game state handling
    const isLive = game.gameState === 'LIVE' || game.gameState === 'CRIT' || game.gameState === 'PROG';
    const isFinal = game.gameState === 'FINAL' || game.gameState === 'OFF';
    const isPregame = game.gameState === 'PRE' || game.gameState === 'FUT';
    
    // Get game status text
    const getGameStatus = () => {
        if (isLive) {
            const period = game.periodDescriptor;
            const clock = game.clock;
            
            let statusText = 'LIVE';
            
            if (period) {
                const periodText = period.periodType === 'REG' 
                    ? `P${period.number}` 
                    : period.periodType === 'OT' 
                        ? 'OT' 
                        : 'SO';
                statusText = `${statusText} · ${periodText}`;
                
                if (clock?.timeRemaining && clock.timeRemaining !== 'undefined') {
                    statusText = `${statusText} · ${clock.timeRemaining}`;
                }
            }
            return statusText;
        }
        if (isFinal) return 'Final';
        if (isPregame) return (
            <span title="Time shown in your local timezone">
                {gameTime}
            </span>
        );
        return (
            <span title="Time shown in your local timezone">
                {gameTime}
            </span>
        );
    };

    // Get playoff series status text
    const getSeriesStatusText = () => {
        if (!game.seriesStatus) return null;

        const { 
            seriesTitle, 
            topSeedTeamAbbrev, 
            bottomSeedTeamAbbrev,
            topSeedWins, 
            bottomSeedWins,
            gameNumberOfSeries,
            neededToWin
        } = game.seriesStatus;

        // Determine which team is home and which is away for this game
        
        // Get the series leader text
        const seriesLeader = () => {
            if (topSeedWins === bottomSeedWins) return "Series tied";
            const leadingTeam = topSeedWins > bottomSeedWins ? topSeedTeamAbbrev : bottomSeedTeamAbbrev;
            const leadingWins = Math.max(topSeedWins, bottomSeedWins);
            if (leadingWins === neededToWin) return `${leadingTeam} wins series`;
            return `${leadingTeam} leads`;
        };

        // Always show the higher number first in the series score
        const seriesScore = topSeedWins > bottomSeedWins
            ? `${topSeedWins}-${bottomSeedWins}`
            : `${bottomSeedWins}-${topSeedWins}`;

        return {
            title: seriesTitle,
            gameNumber: gameNumberOfSeries,
            seriesScore,
            status: seriesLeader()
        };
    };

    // Function to get team abbreviation from ID
    const getTeamAbbr = (teamId: number): string => {
        const teamAbbrMap: { [key: number]: string } = {
            1: 'NJD', 2: 'NYI', 3: 'NYR', 4: 'PHI', 5: 'PIT',
            6: 'BOS', 7: 'BUF', 8: 'MTL', 9: 'OTT', 10: 'TOR',
            12: 'CAR', 13: 'FLA', 14: 'TBL', 15: 'WSH', 16: 'CHI',
            17: 'DET', 18: 'NSH', 19: 'STL', 20: 'CGY', 21: 'COL',
            22: 'EDM', 23: 'VAN', 24: 'ANA', 25: 'DAL', 26: 'LAK',
            28: 'SJS', 29: 'CBJ', 30: 'MIN', 52: 'WPG', 53: 'ARI',
            54: 'VGK', 55: 'SEA'
        };
        return teamAbbrMap[teamId] || '';
    };

    // Get logo URL using the same abbreviation logic
    const getTeamLogoUrl = (teamId: number) => {
        const teamAbbr = getTeamAbbr(teamId);
        return `https://assets.nhle.com/logos/nhl/svg/${teamAbbr}_dark.svg?v=2`;
    };
    
    const awayTeamName = game.awayTeam?.placeName?.default || 'Away Team';
    const homeTeamName = game.homeTeam?.placeName?.default || 'Home Team';
    const venueName = game.venue?.default || 'TBD';

    const seriesStatus = getSeriesStatusText();

    return (
        <div className="w-full max-w-2xl p-6 mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-wrap justify-between items-center mb-4">
                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <div className="flex items-center gap-2">
                        <span className={`text-sm md:text-base px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${
                            isLive ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                            isFinal ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                        }`}>
                            {getGameStatus()}
                        </span>
                        {isLive && (
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                        )}
                    </div>
                    {seriesStatus && (
                        <div className="flex items-center">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 border-l border-gray-300 dark:border-gray-600">
                                {seriesStatus.title} · Game {seriesStatus.gameNumber} · {seriesStatus.status} {seriesStatus.seriesScore}
                            </span>
                        </div>
                    )}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {venueName}
                </span>
            </div>
            <div className="flex justify-between items-center">
                <div className="flex-1 space-y-5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                <Image
                                    src={getTeamLogoUrl(game.awayTeam.id)}
                                    alt={`${awayTeamName} logo`}
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <span className="font-semibold text-xl">{awayTeamName}</span>
                        </div>
                        <span className="text-3xl font-bold">{game.awayTeam.score}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                <Image
                                    src={getTeamLogoUrl(game.homeTeam.id)}
                                    alt={`${homeTeamName} logo`}
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <span className="font-semibold text-xl">{homeTeamName}</span>
                        </div>
                        <span className="text-3xl font-bold">{game.homeTeam.score}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
