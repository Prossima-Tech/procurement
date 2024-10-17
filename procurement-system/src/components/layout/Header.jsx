/* eslint-disable react/prop-types */
import { BellIcon, SearchIcon, LogoutIcon } from '@heroicons/react/outline';
import { SunIcon, MoonIcon } from '@heroicons/react/solid';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ onLogout }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { user } = useAuth();

    return (
        <header className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-sm`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 sm:text-3xl sm:truncate">
                            Procurement System
                        </h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span>Welcome, {user.username}</span>
                        <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <BellIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            <span>Notifications</span>
                        </button>
                        <div className={`relative rounded-full px-3 py-1 text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <SearchIcon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
                        >
                            {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                        </button>
                        <button
                            onClick={onLogout}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <LogoutIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;