import { DraftRanking } from '@/types/nhl';

interface DraftPlayerCardProps {
  player: DraftRanking;
  rank: number;
}

export default function DraftPlayerCard({ player, rank }: DraftPlayerCardProps) {
  const heightFeet = Math.floor(player.heightInInches / 12);
  const heightInches = player.heightInInches % 12;
  const height = `${heightFeet}'${heightInches}"`;
  
  const age = new Date().getFullYear() - new Date(player.birthDate).getFullYear();
  
  const getPositionColor = (position: string) => {
    switch (position) {
      case 'C': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'LW':
      case 'RW': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'D': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'G': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getRankDisplay = (rank: number) => {
    if (rank <= 3) {
      return (
        <div className="flex items-center">
          <span className={`text-2xl font-bold ${
            rank === 1 ? 'text-yellow-500' : 
            rank === 2 ? 'text-gray-400' : 
            'text-amber-600'
          }`}>
            #{rank}
          </span>
          {rank === 1 && <span className="ml-1 text-yellow-500">🏆</span>}
          {rank === 2 && <span className="ml-1 text-gray-400">🥈</span>}
          {rank === 3 && <span className="ml-1 text-amber-600">🥉</span>}
        </div>
      );
    }
    return <span className="text-xl font-bold text-gray-700 dark:text-gray-300">#{rank}</span>;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {getRankDisplay(rank)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {player.firstName} {player.lastName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(player.positionCode)}`}>
                  {player.positionCode}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {player.shootsCatches === 'L' ? 'Left' : 'Right'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Team:</span> {player.lastAmateurClub}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">League:</span> {player.lastAmateurLeague}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Age:</span> {age}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Height:</span> {height}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Weight:</span> {player.weightInPounds} lbs
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">From:</span> {player.birthCity}, {player.birthStateProvince ? `${player.birthStateProvince}, ` : ''}{player.birthCountry}
              </p>
            </div>
          </div>
          
          {player.midtermRank && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Midterm Rank:</span> #{player.midtermRank}
                {player.midtermRank !== rank && (
                  <span className={`ml-2 text-xs ${
                    player.midtermRank > rank ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ({player.midtermRank > rank ? '+' : ''}{rank - player.midtermRank})
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
