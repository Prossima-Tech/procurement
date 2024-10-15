import React from 'react';
import { BellIcon, SearchIcon } from '@heroicons/react/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/solid';

const Header = () => {

  const { isDarkMode, toggleTheme } = useTheme(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Procurement System
            </h2>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button
                type="button"
                className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <BellIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                <span>Notifications</span>
              </button>
            </div>
            <div className="ml-4 flex-shrink-0">
              <div className="relative rounded-full px-3 py-1 text-sm text-gray-900 bg-gray-200">
                <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
            </div>
            <div>
            <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
        >
                  {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;