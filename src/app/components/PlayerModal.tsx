'use client';

import { Fragment } from 'react';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { NHLPlayer } from '@/types/nhl';

interface PlayerModalProps {
  player: NHLPlayer | null;
  isOpen: boolean;
  closeModal: () => void;
}

// Helper function to get full position name
const getPositionFullName = (positionCode: string | undefined): string => {
  if (!positionCode) return '';
  
  const positions: {[key: string]: string} = {
    'L': 'Left Wing',
    'R': 'Right Wing',
    'C': 'Center',
    'D': 'Defense',
    'G': 'Goalie'
  };
  
  return positions[positionCode] ? `(${positions[positionCode]})` : '';
};

export default function PlayerModal({ player, isOpen, closeModal }: PlayerModalProps) {
  if (!player) {
    return null;
  }

  // Format birthdate
  const formatBirthDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

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

  // Player headshot URL
  const playerHeadshot = player.headshot || `https://assets.nhle.com/mugs/nhl/default.png`;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex justify-between items-center"
                >
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                    {player.firstName && player.lastName 
                      ? `${player.firstName.default} ${player.lastName.default}`
                      : 'Player Details'} 
                  </h3>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </Dialog.Title>

                <div className="mt-4 flex flex-col md:flex-row md:items-start gap-6">
                  {/* Player Image */}
                  <div className="flex-shrink-0">
                    <div className="relative h-44 w-44 mx-auto md:mx-0">
                      <Image
                        src={playerHeadshot}
                        alt={`${player.firstName?.default} ${player.lastName?.default}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="mt-2 text-center md:text-left">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        #{player.sweaterNumber || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Player Info */}
                  <div className="flex-1">
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Position</dt>
                        <dd className="text-sm text-gray-900 dark:text-gray-100">
                          {player.positionCode || 'N/A'} {getPositionFullName(player.positionCode)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Age</dt>
                        <dd className="text-sm text-gray-900 dark:text-gray-100">
                          {player.birthDate ? `${calculateAge(player.birthDate)}` : 'N/A'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Height</dt>
                        <dd className="text-sm text-gray-900 dark:text-gray-100">
                          {player.heightInInches ? `${Math.floor(player.heightInInches/12)}'${player.heightInInches % 12}"` : 'N/A'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Weight</dt>
                        <dd className="text-sm text-gray-900 dark:text-gray-100">
                          {player.weightInPounds ? `${player.weightInPounds} lbs` : 'N/A'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Shoots/Catches</dt>
                        <dd className="text-sm text-gray-900 dark:text-gray-100">
                          {player.shootsCatches || 'N/A'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Birthdate</dt>
                        <dd className="text-sm text-gray-900 dark:text-gray-100">
                          {player.birthDate ? formatBirthDate(player.birthDate) : 'N/A'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Birthplace</dt>
                        <dd className="text-sm text-gray-900 dark:text-gray-100">
                          {player.birthCity?.default && player.birthCountry ? 
                            `${player.birthCity.default}, ${player.birthStateProvince?.default ? `${player.birthStateProvince.default}, ` : ''}${player.birthCountry}` : 
                            'N/A'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Player Additional Stats Section */}
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-md font-medium mb-3 text-gray-900 dark:text-gray-100">Player Information</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Position</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
                        {player.positionCode || 'N/A'} 
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                          {getPositionFullName(player.positionCode)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Number</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        #{player.sweaterNumber || 'N/A'}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Shoots/Catches</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {player.shootsCatches || 'N/A'}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Age</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {player.birthDate ? `${calculateAge(player.birthDate)} years` : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Physical Attributes */}
                  <h4 className="text-md font-medium my-3 text-gray-900 dark:text-gray-100">Physical</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Height</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {player.heightInInches ? `${Math.floor(player.heightInInches/12)}'${player.heightInInches % 12}"` : 'N/A'}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Weight</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {player.weightInPounds ? `${player.weightInPounds} lbs` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
