/* eslint-disable react/prop-types */

import { BellIcon, LogoutIcon, SunIcon, MoonIcon } from '@heroicons/react/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';  // Import the custom Button component

const Header = ({ onLogout }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { user } = useAuth();

    return (
        <header className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
                <div className="flex justify-between items-center h-20">
                    <h2 className="text-2xl font-semibold leading-8">
                        Procurement Management 
                    </h2>
                    <div className="flex items-center space-x-6">
                        <span className="text-base">Welcome, {user.username}</span>
                        <Button variant="ghost" size="icon" className="p-2.5">
                            <BellIcon className="h-6 w-6" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={toggleTheme} className="p-2.5">
                            {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
                        </Button>
                        <Button variant="destructive" size="md" onClick={onLogout} className="text-base">
                            <LogoutIcon className="h-5 w-6 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;