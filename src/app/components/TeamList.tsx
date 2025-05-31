'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { NHL_TEAMS } from '@/constants/teams';

interface TeamListProps {
  selectedTeam: string | null;
  onSelectTeam: (teamCode: string) => void;
}

export default function TeamList({ selectedTeam, onSelectTeam }: TeamListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTeams, setFilteredTeams] = useState(NHL_TEAMS);
  const [isFiltering, setIsFiltering] = useState(false);
  
  // Filter teams based on search with debounce
  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setFilteredTeams(
        NHL_TEAMS.filter(team =>
          team.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setIsFiltering(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Function to get team logo URL
  const getTeamLogoUrl = (teamCode: string) => {
    return `https://assets.nhle.com/logos/nhl/svg/${teamCode}_dark.svg?v=2`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search box */}
      <div className="mb-4">
        <input
          type="text"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="Search teams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Teams list container with scroll indicator */}
      <div className="relative flex-1">
        {/* Teams list */}
        <div 
          className="overflow-y-auto h-full max-h-80 md:max-h-none"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgb(156 163 175) transparent'
          }}
        >
          {isFiltering ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 dark:border-blue-400"></div>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No teams found matching &quot;{searchTerm}&quot;
            </div>
          ) : (
            <ul className="space-y-2">
              {filteredTeams.map((team) => (
                <li key={team.id}>
                  <button
                    className={`w-full flex items-center p-3 text-left rounded-lg transition-colors ${
                      selectedTeam === team.code
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => onSelectTeam(team.code)}
                  >
                    <div className="flex-shrink-0 w-8 h-8 mr-3 relative">
                      <Image
                        src={getTeamLogoUrl(team.code)}
                        alt={`${team.fullName} logo`}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className={`font-medium ${
                      selectedTeam === team.code
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {team.fullName}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Scroll indicator for mobile - shows when there are many teams */}
        {filteredTeams.length > 4 && (
          <div className="md:hidden absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none rounded-b-lg"></div>
        )}
      </div>
    </div>
  );
}
