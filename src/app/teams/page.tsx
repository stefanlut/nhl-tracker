'use client';

import { useEffect, useState } from 'react';
import TeamList from '../components/TeamList';
import TeamDetails from '../components/TeamDetails';
import { NHL_TEAMS } from '@/constants/teams';
import ErrorBoundary from '../components/ErrorBoundary';

export default function TeamsPage() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'roster' | 'stats'>('roster');
  
  // Initialize with first team if none selected
  useEffect(() => {
    if (!selectedTeam && NHL_TEAMS.length > 0) {
      setSelectedTeam(NHL_TEAMS[0].code);
    }
  }, [selectedTeam]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 px-4 sm:px-6 lg:px-8">
      <main className="container mx-auto max-w-7xl flex flex-col items-center">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">NHL Teams</h1>
        
        <div className="w-full flex flex-col md:flex-row gap-6">
          {/* Left sidebar with team list */}
          <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 md:mb-0">
          <TeamList 
            selectedTeam={selectedTeam} 
            onSelectTeam={setSelectedTeam} 
          />
        </div>
        
        {/* Right container with tabs and details */}
        <div className="w-full md:w-2/3 bg-white dark:bg-gray-800 rounded-lg shadow">
          {selectedTeam ? (
            <div className="flex flex-col h-full">
              {/* Tab navigation */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('roster')}
                  className={`flex-1 py-4 px-4 text-center font-medium ${
                    activeTab === 'roster' 
                      ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Team Roster
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`flex-1 py-4 px-4 text-center font-medium ${
                    activeTab === 'stats' 
                      ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Team Stats
                </button>
              </div>
              
              {/* Tab content */}
              <div className="p-4 flex-1">
                <ErrorBoundary>
                  <TeamDetails 
                    teamCode={selectedTeam}
                    view={activeTab}
                  />
                </ErrorBoundary>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Select a team to view details
            </div>
          )}
        </div>
      </div>
    </main>
    </div>
  );
}
