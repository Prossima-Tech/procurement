/* eslint-disable react/prop-types */
import { BellIcon, LogoutIcon, SunIcon, MoonIcon } from '@heroicons/react/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

const Header = ({ onLogout }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { user } = useAuth();

    return (
        <header className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} border-b border-gray-200 dark:border-gray-800`}>
            <div className=" mx-auto px-4">
                <div className="flex justify-between items-center h-14">
                    <h2 className="text-lg font-medium">Procurement Management</h2>
                    <div className="flex items-center gap-3">
                        <span className="text-sm">{user.username}</span>
                        <Button variant="ghost" size="sm">
                            <BellIcon className="h-4 w-4" />
                        </Button>
                        {/* <Button variant="ghost" size="sm" onClick={toggleTheme}>
                            {isDarkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
                        </Button> */}
                        <Button variant="destructive" size="sm" onClick={onLogout}>
                            <LogoutIcon className="h-4 w-4 mr-1" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;