import { NHLGame } from '@/types/nhl';
import Image from 'next/image';

interface GameCardProps {
    game: NHLGame;
}

export default function GameCard({ game }: GameCardProps) {
    const gameTime = new Date(game.startTimeUTC).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    
    // Enhanced game state handling
    const isLive = game.gameState === 'LIVE' || game.gameState === 'CRIT' || game.gameState === 'PROG';
    const isFinal = game.gameState === 'FINAL' || game.gameState === 'OFF';
    const isPregame = game.gameState === 'PRE' || game.gameState === 'FUT';
    
    // Get game status text
    const getGameStatus = () => {
        if (isLive) return 'LIVE';
        if (isFinal) return 'Final';
        if (isPregame) return gameTime;
        return gameTime; // default to game time for unknown states
    };

    // Function to get the logo URL based on team ID
    const getTeamLogoUrl = (teamId: number) => {
        // Using the NHL API's image CDN with team abbreviation
        const teamAbbrMap: { [key: number]: string } = {
            1: 'NJD', 2: 'NYI', 3: 'NYR', 4: 'PHI', 5: 'PIT',
            6: 'BOS', 7: 'BUF', 8: 'MTL', 9: 'OTT', 10: 'TOR',
            12: 'CAR', 13: 'FLA', 14: 'TBL', 15: 'WSH', 16: 'CHI',
            17: 'DET', 18: 'NSH', 19: 'STL', 20: 'CGY', 21: 'COL',
            22: 'EDM', 23: 'VAN', 24: 'ANA', 25: 'DAL', 26: 'LAK',
            28: 'SJS', 29: 'CBJ', 30: 'MIN', 52: 'WPG', 53: 'ARI',
            54: 'VGK', 55: 'SEA'
        };
        const teamAbbr = teamAbbrMap[teamId] || '';
        return `https://assets.nhle.com/logos/nhl/svg/${teamAbbr}_dark.svg?v=2`;
    };
    
    const awayTeamName = game.awayTeam?.placeName?.default || 'Away Team';
    const homeTeamName = game.homeTeam?.placeName?.default || 'Home Team';
    const venueName = game.venue?.default || 'TBD';

    return (
        <div className="w-full max-w-2xl p-6 mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <span className={`text-sm px-2 py-1 rounded-full font-medium ${
                        isLive ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                        isFinal ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                    }`}>
                        {getGameStatus()}
                    </span>
                    {isLive && (
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
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
