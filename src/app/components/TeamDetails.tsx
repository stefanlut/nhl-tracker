'use client';

import Image from 'next/image';
import { getTeamByCode } from '@/constants/teams';
import useSWR from 'swr';
import { REFRESH_INTERVAL_SECONDS } from '@/constants';
import { NHLPlayer } from '@/types/nhl';
import { useState, useMemo, useEffect, useCallback } from 'react';
import PlayerModal from './PlayerModal';
import StatBar from './StatBar';

interface TeamDetailsProps {
  teamCode: string;
  view: 'roster' | 'stats';
}

// Sort types for roster and player stats
type SortField = 'number' | 'name' | 'position' | 'age' | 'height' | 'weight' | 
                'gamesPlayed' | 'goals' | 'assists' | 'points' | 'plusMinus' | 
                'penaltyMinutes' | 'shots' | 'shootingPctg' | 'timeOnIce' |
                'wins' | 'goalsAgainst' | 'savePctg' | 'shutouts';
type SortDirection = 'asc' | 'desc';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function TeamDetails({ teamCode, view }: TeamDetailsProps) {
  const team = getTeamByCode(teamCode);
  
  // State for sorting roster
  const [sortField, setSortField] = useState<SortField>('number');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // State for player details modal
  const [selectedPlayer, setSelectedPlayer] = useState<NHLPlayer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for player stats view and game type
  const [statsView, setStatsView] = useState<'team' | 'player'>('team');
  const [gameType, setGameType] = useState<'regular' | 'playoff'>('regular');
  
  // API endpoints
  const rosterEndpoint = `/api/teams/${teamCode}/roster`;
  const teamStatsEndpoint = `/api/teams/${teamCode}/stats${gameType === 'playoff' ? '?playoffs=true' : ''}`;
  const playerStatsEndpoint = `/api/teams/${teamCode}/player-stats${gameType === 'playoff' ? '?playoffs=true' : ''}`;
  
  // Fetch team roster
  const { data: rosterData, error: rosterError, isLoading: isLoadingRoster } = useSWR(
    rosterEndpoint, 
    fetcher, 
    {
      refreshInterval: REFRESH_INTERVAL_SECONDS * 1000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  );
  
  // Fetch team stats
  const { data: teamStatsData, error: teamStatsError, isLoading: isLoadingTeamStats } = useSWR(
    view === 'stats' ? teamStatsEndpoint : null, 
    fetcher, 
    {
      refreshInterval: REFRESH_INTERVAL_SECONDS * 1000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  );
  
  // Fetch player stats
  const { data: playerStatsData, error: playerStatsError, isLoading: isLoadingPlayerStats } = useSWR(
    view === 'stats' ? playerStatsEndpoint : null, 
    fetcher, 
    {
      refreshInterval: REFRESH_INTERVAL_SECONDS * 1000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  );
  
  // Combine error and loading states
  const error = rosterError || (view === 'stats' && (teamStatsError || playerStatsError));
  const isLoading = isLoadingRoster || (view === 'stats' && (isLoadingTeamStats || isLoadingPlayerStats));
  
  // Get team logo URL
  const getTeamLogoUrl = (teamCode: string) => {
    return `https://assets.nhle.com/logos/nhl/svg/${teamCode}_dark.svg?v=2`;
  };

  // Handle sorting function
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // If same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If new field, set as the sort field with ascending direction
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get player stats by ID
  const getPlayerStatsById = useCallback((playerId: number) => {
    if (!playerStatsData?.playerStats?.playerBySeasonId) return null;
    return playerStatsData.playerStats.playerBySeasonId[playerId];
  }, [playerStatsData?.playerStats?.playerBySeasonId]);

  // Calculate age from birthdate
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    // Adjust age if birthday hasn't occurred yet this year
    if (
      today.getMonth() < birthDateObj.getMonth() || 
      (today.getMonth() === birthDateObj.getMonth() && today.getDate() < birthDateObj.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Sort players based on current sort field and direction
  const sortedRoster = useMemo(() => {
    if (!rosterData?.roster) return [];
    
    return [...rosterData.roster].sort((a: NHLPlayer, b: NHLPlayer) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      const aStats = getPlayerStatsById(a.id);
      const bStats = getPlayerStatsById(b.id);
      const aSkaterData = aStats?.skaterData;
      const bSkaterData = bStats?.skaterData;
      const aGoalieData = aStats?.goalieData;
      const bGoalieData = bStats?.goalieData;
      
      switch(sortField) {
        // Roster fields
        case 'number':
          return ((a.sweaterNumber || 0) - (b.sweaterNumber || 0)) * multiplier;
        case 'name':
          const aName = `${a.lastName?.default || ''} ${a.firstName?.default || ''}`;
          const bName = `${b.lastName?.default || ''} ${b.firstName?.default || ''}`;
          return aName.localeCompare(bName) * multiplier;
        case 'position':
          return (a.positionCode || '').localeCompare(b.positionCode || '') * multiplier;
        case 'age':
          const aAge = a.birthDate ? calculateAge(a.birthDate) : 0;
          const bAge = b.birthDate ? calculateAge(b.birthDate) : 0;
          return (aAge - bAge) * multiplier;
        case 'height':
          return (a.heightInInches - b.heightInInches) * multiplier;
        case 'weight':
          return (a.weightInPounds - b.weightInPounds) * multiplier;
        
        // Skater stats fields
        case 'gamesPlayed':
          const aGP = (aSkaterData?.gamesPlayed || aGoalieData?.gamesPlayed || 0);
          const bGP = (bSkaterData?.gamesPlayed || bGoalieData?.gamesPlayed || 0);
          return (aGP - bGP) * multiplier;
        case 'goals':
          return ((aSkaterData?.goals || 0) - (bSkaterData?.goals || 0)) * multiplier;
        case 'assists':
          return ((aSkaterData?.assists || 0) - (bSkaterData?.assists || 0)) * multiplier;
        case 'points':
          return ((aSkaterData?.points || 0) - (bSkaterData?.points || 0)) * multiplier;
        case 'plusMinus':
          return ((aSkaterData?.plusMinus || 0) - (bSkaterData?.plusMinus || 0)) * multiplier;
        case 'penaltyMinutes':
          return ((aSkaterData?.penaltyMinutes || 0) - (bSkaterData?.penaltyMinutes || 0)) * multiplier;
        case 'shots':
          return ((aSkaterData?.shots || 0) - (bSkaterData?.shots || 0)) * multiplier;
        case 'shootingPctg':
          return ((aSkaterData?.shootingPctg || 0) - (bSkaterData?.shootingPctg || 0)) * multiplier;
        
        // Goalie stats fields
        case 'wins':
          return ((aGoalieData?.wins || 0) - (bGoalieData?.wins || 0)) * multiplier;
        case 'goalsAgainst':
          return ((aGoalieData?.goalsAgainst || 0) - (bGoalieData?.goalsAgainst || 0)) * multiplier;
        case 'savePctg':
          return ((aGoalieData?.savePctg || 0) - (bGoalieData?.savePctg || 0)) * multiplier;
        case 'shutouts':
          return ((aGoalieData?.shutouts || 0) - (bGoalieData?.shutouts || 0)) * multiplier;
          
        default:
          return 0;
      }
    });
  }, [rosterData?.roster, sortField, sortDirection, getPlayerStatsById]);

  // Get sort indicator arrow
  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const hasTeamStats = teamStatsData?.teamStats && Object.keys(teamStatsData.teamStats).length > 0;

  // If team stats are empty and stats tab is selected, use player stats view
  useEffect(() => {
    if (view === 'stats' && !hasTeamStats) {
      setStatsView('player');
    }
  }, [view, hasTeamStats]);

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="mx-auto w-12 h-12 mb-4 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Failed to load {view} data</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          There was an error retrieving the data. Please try again later.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reload page
        </button>
      </div>
    );
  }

  if (isLoading || !rosterData) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 dark:border-blue-400"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading {view}...</p>
      </div>
    );
  }

  // Handle opening player details modal
  const openPlayerModal = (player: NHLPlayer) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col">
      {/* Player Details Modal */}
      <PlayerModal 
        player={selectedPlayer} 
        isOpen={isModalOpen} 
        closeModal={() => setIsModalOpen(false)} 
      />
      
      {/* Team Header */}
      <div className="flex items-center mb-6">
        <div className="w-16 h-16 relative mr-4">
          <Image
            src={getTeamLogoUrl(teamCode)}
            alt={`${team?.fullName || teamCode} logo`}
            fill
            className="object-contain"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{team?.fullName}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {view === 'roster' ? 'Current Roster' : 'Team Statistics'}
          </p>
        </div>
      </div>

      {/* Roster View */}
      {view === 'roster' && rosterData.roster && (
        <div className="overflow-x-auto">
          {rosterData.roster.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No roster data available for this team
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th 
                    scope="col"
                    onClick={() => handleSort('number')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    # Jersey {getSortIndicator('number')}
                  </th>
                  <th 
                    scope="col"
                    onClick={() => handleSort('name')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Player {getSortIndicator('name')}
                  </th>
                  <th 
                    scope="col"
                    onClick={() => handleSort('position')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Position {getSortIndicator('position')}
                  </th>
                  <th 
                    scope="col"
                    onClick={() => handleSort('age')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Age {getSortIndicator('age')}
                  </th>
                  <th 
                    scope="col"
                    onClick={() => handleSort('height')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Height {getSortIndicator('height')}
                  </th>
                  <th 
                    scope="col"
                    onClick={() => handleSort('weight')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Weight {getSortIndicator('weight')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Shoots/Catches
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedRoster.map((player: NHLPlayer) => (
                  <tr 
                    key={player.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => openPlayerModal(player)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200 font-medium">
                      {player.sweaterNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">
                      {player.firstName && player.lastName 
                        ? `${player.firstName.default} ${player.lastName.default}`
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">
                      {player.positionCode || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">
                      {player.birthDate ? calculateAge(player.birthDate) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">
                      {player.heightInInches ? `${Math.floor(player.heightInInches/12)}'${player.heightInInches % 12}"` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">
                      {player.weightInPounds ? `${player.weightInPounds} lbs` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">
                      {player.shootsCatches || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Team Stats View */}
      {view === 'stats' && (
        <div>
          {/* Stats Controls */}
          <div className="mb-6">
            <div className="flex flex-col space-y-4">
              {/* Game Type Toggle */}
              <div className="flex rounded-md shadow-sm w-full" role="group">
                <button
                  onClick={() => setGameType('regular')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md border ${
                    gameType === 'regular'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'
                  }`}
                >
                  Regular Season
                </button>
                <button
                  onClick={() => setGameType('playoff')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                    gameType === 'playoff'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'
                  }`}
                >
                  Playoffs
                </button>
              </div>

              {/* Stats View Toggle */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {hasTeamStats && (
                  <button
                    onClick={() => setStatsView('team')}
                    className={`flex-1 py-3 px-4 text-center font-medium ${
                      statsView === 'team' 
                        ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Team Statistics
                  </button>
                )}
                <button
                  onClick={() => setStatsView('player')}
                  className={`flex-1 py-3 px-4 text-center font-medium ${
                    statsView === 'player' 
                      ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {hasTeamStats ? 'Player Statistics' : 'Statistics'}
                </button>
              </div>
            </div>
          </div>

          {/* Team Stats View */}
          {statsView === 'team' && teamStatsData?.teamStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!teamStatsData.teamStats || Object.keys(teamStatsData.teamStats).length === 0 ? (
                <div className="col-span-2 p-6 text-center text-gray-500 dark:text-gray-400">
                  No statistics available for this team
                </div>
              ) : (
                <>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                      {gameType === 'regular' ? 'Regular Season' : 'Playoff'} Stats
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Games Played:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{teamStatsData.teamStats.gamesPlayed ?? 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Wins-Losses-OT:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {teamStatsData.teamStats.wins !== undefined && 
                           teamStatsData.teamStats.losses !== undefined && 
                           teamStatsData.teamStats.otLosses !== undefined
                            ? `${teamStatsData.teamStats.wins}-${teamStatsData.teamStats.losses}-${teamStatsData.teamStats.otLosses}`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Points:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{teamStatsData.teamStats.points ?? 'N/A'}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Goals For:</span>
                      </div>
                      {teamStatsData.teamStats.goalsFor ? (
                        <>
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{teamStatsData.teamStats.goalsFor}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Rank: <span className="font-medium text-blue-600 dark:text-blue-400">#{teamStatsData.teamStats.goalsForRank || 'N/A'}</span>
                            </span>
                          </div>
                          <StatBar value={teamStatsData.teamStats.goalsFor} maxValue={300} />
                        </>
                      ) : 'N/A'}
                      
                      <div className="flex justify-between mb-1 mt-3">
                        <span className="text-gray-600 dark:text-gray-400">Goals Against:</span>
                      </div>
                      {teamStatsData.teamStats.goalsAgainst ? (
                        <>
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{teamStatsData.teamStats.goalsAgainst}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Rank: <span className="font-medium text-blue-600 dark:text-blue-400">#{teamStatsData.teamStats.goalsAgainstRank || 'N/A'}</span>
                            </span>
                          </div>
                          <StatBar value={teamStatsData.teamStats.goalsAgainst} maxValue={300} />
                        </>
                      ) : 'N/A'}
                      
                      <div className="flex justify-between mb-1 mt-3">
                        <span className="text-gray-600 dark:text-gray-400">Power Play %:</span>
                      </div>
                      {teamStatsData.teamStats.powerPlayPct !== undefined ? (
                        <>
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {(teamStatsData.teamStats.powerPlayPct * 100).toFixed(1)}%
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Rank: <span className="font-medium text-blue-600 dark:text-blue-400">#{teamStatsData.teamStats.ppPctRank || 'N/A'}</span>
                            </span>
                          </div>
                          <StatBar value={teamStatsData.teamStats.powerPlayPct * 100} maxValue={100} greenScale={true} showAsPercentage={true} />
                        </>
                      ) : 'N/A'}
                      
                      <div className="flex justify-between mb-1 mt-3">
                        <span className="text-gray-600 dark:text-gray-400">Penalty Kill %:</span>
                      </div>
                      {teamStatsData.teamStats.penaltyKillPct !== undefined ? (
                        <>
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {(teamStatsData.teamStats.penaltyKillPct * 100).toFixed(1)}%
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Rank: <span className="font-medium text-blue-600 dark:text-blue-400">#{teamStatsData.teamStats.pkPctRank || 'N/A'}</span>
                            </span>
                          </div>
                          <StatBar value={teamStatsData.teamStats.penaltyKillPct * 100} maxValue={100} greenScale={true} showAsPercentage={true} />
                        </>
                      ) : 'N/A'}
                    </div>
                  </div>
                  
                  {/* Team Rankings */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">League Rankings</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Points Rank:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{teamStatsData.teamStats.pointsRank ?? 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Goals For Rank:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{teamStatsData.teamStats.goalsForRank ?? 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Goals Against Rank:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{teamStatsData.teamStats.goalsAgainstRank ?? 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">PP% Rank:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{teamStatsData.teamStats.ppPctRank ?? 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">PK% Rank:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{teamStatsData.teamStats.pkPctRank ?? 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Shots Per Game:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {teamStatsData.teamStats.shotsPerGame !== undefined 
                            ? teamStatsData.teamStats.shotsPerGame.toFixed(1)
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Shots Against Per Game:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {teamStatsData.teamStats.shotsAgainstPerGame !== undefined 
                            ? teamStatsData.teamStats.shotsAgainstPerGame.toFixed(1)
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Player Stats View */}
          {statsView === 'player' && (
            <div className="overflow-x-auto">
              {!rosterData.roster || rosterData.roster.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  No player data available for this team
                </div>
              ) : isLoadingPlayerStats ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 dark:border-blue-400"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading player stats...</p>
                </div>
              ) : (
                <>
                  {/* Skaters Stats Cards */}
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Skaters</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 md:hidden">Swipe to see more →</p>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button 
                        onClick={() => handleSort('points')}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                      >
                        Sort by Points {getSortIndicator('points')}
                      </button>
                      <button 
                        onClick={() => handleSort('goals')}
                        className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800"
                      >
                        Sort by Goals {getSortIndicator('goals')}
                      </button>
                    </div>
                  </div>
                  <div className="relative mb-8">
                    <div className="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 flex md:block overflow-x-auto gap-4 pb-4 md:pb-0 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                      {sortedRoster
                      .filter(player => player.positionCode !== 'G')
                      .map(player => {
                        const playerStats = getPlayerStatsById(player.id);
                        const skaterData = playerStats?.skaterData;
                        
                        // Calculate max values for StatBars based on team roster
                        const allSkaters = sortedRoster
                          .filter(p => p.positionCode !== 'G')
                          .map(p => getPlayerStatsById(p.id)?.skaterData)
                          .filter(Boolean);
                        
                        const maxGoals = Math.max(...allSkaters.map(s => s?.goals || 0), 1);
                        const maxAssists = Math.max(...allSkaters.map(s => s?.assists || 0), 1);
                        const maxPoints = Math.max(...allSkaters.map(s => s?.points || 0), 1);
                        const maxShots = Math.max(...allSkaters.map(s => s?.shots || 0), 1);
                        
                        return (
                          <div 
                            key={player.id} 
                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow cursor-pointer w-72 md:w-auto flex-shrink-0"
                            onClick={() => openPlayerModal(player)}
                          >
                            {/* Player Header */}
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    #{player.sweaterNumber || '-'}
                                  </span>
                                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                                    {player.positionCode || '-'}
                                  </span>
                                </div>
                                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mt-1">
                                  {player.firstName && player.lastName 
                                    ? `${player.firstName.default} ${player.lastName.default}`
                                    : 'N/A'}
                                </h4>
                              </div>
                              <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                                <div>GP: {skaterData?.gamesPlayed || 0}</div>
                                <div>PIM: {skaterData?.penaltyMinutes || 0}</div>
                              </div>
                            </div>

                            {/* Performance Stats with StatBars */}
                            <div className="space-y-3">
                              <div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Goals</div>
                                <StatBar 
                                  value={skaterData?.goals || 0} 
                                  maxValue={maxGoals} 
                                  greenScale={true} 
                                />
                              </div>
                              
                              <div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Assists</div>
                                <StatBar 
                                  value={skaterData?.assists || 0} 
                                  maxValue={maxAssists} 
                                  greenScale={true} 
                                />
                              </div>
                              
                              <div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Points</div>
                                <StatBar 
                                  value={skaterData?.points || 0} 
                                  maxValue={maxPoints} 
                                  greenScale={true} 
                                />
                              </div>
                              
                              <div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Shots on Goal</div>
                                <StatBar 
                                  value={skaterData?.shots || 0} 
                                  maxValue={maxShots} 
                                />
                              </div>
                              
                              <div className="flex justify-between items-center text-xs pt-2">
                                <span className="text-gray-600 dark:text-gray-400">
                                  S%: 
                                  <span className={`ml-1 font-medium ${
                                    (skaterData?.shootingPctg || 0) * 100 >= 15.0 ? 'text-green-600 dark:text-green-400' :
                                    (skaterData?.shootingPctg || 0) * 100 >= 12.0 ? 'text-green-600 dark:text-green-400' :
                                    (skaterData?.shootingPctg || 0) * 100 >= 8.0 ? 'text-yellow-600 dark:text-yellow-400' :
                                    'text-red-600 dark:text-red-400'
                                  }`}>
                                    {skaterData?.shootingPctg ? `${(skaterData.shootingPctg * 100).toFixed(1)}%` : '0.0%'}
                                  </span>
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  +/-: 
                                  <span className={`ml-1 font-medium ${
                                    (skaterData?.plusMinus || 0) > 0 ? 'text-green-600 dark:text-green-400' :
                                    (skaterData?.plusMinus || 0) < 0 ? 'text-red-600 dark:text-red-400' :
                                    'text-gray-600 dark:text-gray-400'
                                  }`}>
                                    {skaterData?.plusMinus > 0 ? `+${skaterData.plusMinus}` : skaterData?.plusMinus || 0}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                    })}
                    </div>
                    {/* Mobile scroll indicator */}
                    <div className="md:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none"></div>
                  </div>
                  
                  {/* Goalies Stats Cards */}
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Goalies</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 md:hidden">Swipe to see more →</p>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button 
                        onClick={() => handleSort('wins')}
                        className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800"
                      >
                        Sort by Wins {getSortIndicator('wins')}
                      </button>
                      <button 
                        onClick={() => handleSort('savePctg')}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                      >
                        Sort by SV% {getSortIndicator('savePctg')}
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="md:grid md:grid-cols-2 md:gap-4 flex md:block overflow-x-auto gap-4 pb-4 md:pb-0 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                      {sortedRoster
                      .filter(player => player.positionCode === 'G')
                      .map(player => {
                        const playerStats = getPlayerStatsById(player.id);
                        const goalieData = playerStats?.goalieData;
                        
                        return (
                          <div 
                            key={player.id} 
                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow cursor-pointer w-72 md:w-auto flex-shrink-0"
                            onClick={() => openPlayerModal(player)}
                          >
                            {/* Goalie Header */}
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    #{player.sweaterNumber || '-'}
                                  </span>
                                  <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
                                    G
                                  </span>
                                </div>
                                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mt-1">
                                  {player.firstName && player.lastName 
                                    ? `${player.firstName.default} ${player.lastName.default}`
                                    : 'N/A'}
                                </h4>
                              </div>
                              <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                                <div>GP: {goalieData?.gamesPlayed || 0}</div>
                                <div>Record: {goalieData?.wins || 0}-{goalieData?.losses || 0}-{goalieData?.otLosses || 0}</div>
                              </div>
                            </div>

                            {/* Performance Stats with StatBars */}
                            <div className="space-y-3">
                              <div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Win Rate</div>
                                <StatBar 
                                  value={goalieData?.gamesPlayed ? (goalieData.wins / goalieData.gamesPlayed) * 100 : 0} 
                                  maxValue={100} 
                                  greenScale={true} 
                                  showAsPercentage={true}
                                />
                              </div>
                              
                              <div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Save Percentage</div>
                                <StatBar 
                                  value={(goalieData?.savePctg || 0) * 100} 
                                  maxValue={100} 
                                  greenScale={true} 
                                  showAsPercentage={true}
                                  customThresholds={{ excellent: 92.0, good: 90.0, poor: 88.0 }}
                                />
                              </div>
                              
                              <div className="flex justify-between items-center text-xs pt-2">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Shutouts: 
                                  <span className="ml-1 font-medium text-gray-800 dark:text-gray-200">
                                    {goalieData?.shutouts || 0}
                                  </span>
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  GAA: 
                                  <span className={`ml-1 font-medium ${
                                    (goalieData?.goalsAgainstAverage || 0) <= 2.5 ? 'text-green-600 dark:text-green-400' :
                                    (goalieData?.goalsAgainstAverage || 0) <= 3.0 ? 'text-yellow-600 dark:text-yellow-400' :
                                    'text-red-600 dark:text-red-400'
                                  }`}>
                                    {goalieData?.goalsAgainstAverage ? goalieData.goalsAgainstAverage.toFixed(2) : '0.00'}
                                  </span>
                                </span>
                              </div>
                              
                              <div className="flex justify-center text-xs">
                                <span className="text-gray-600 dark:text-gray-400">
                                  SV%: 
                                  <span className={`ml-1 font-medium ${
                                    (goalieData?.savePctg || 0) * 100 >= 92.0 ? 'text-green-600 dark:text-green-400' :
                                    (goalieData?.savePctg || 0) * 100 >= 90.0 ? 'text-green-600 dark:text-green-400' :
                                    (goalieData?.savePctg || 0) * 100 >= 88.0 ? 'text-yellow-600 dark:text-yellow-400' :
                                    'text-red-600 dark:text-red-400'
                                  }`}>
                                    {goalieData?.savePctg ? goalieData.savePctg.toFixed(3) : '.000'}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                    })}
                    </div>
                    {/* Mobile scroll indicator */}
                    <div className="md:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none"></div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
