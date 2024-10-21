/* eslint-disable react/prop-types */
import React, { useState, useCallback, useMemo } from 'react';
import { ShoppingCart, Users, Package, Settings, ChevronRight, Menu, X, Home } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const AccordionItem = React.memo(({ title, icon, children, isCollapsed, isActive, onClick, onSubItemClick, setIsCollapsed }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { isDarkMode } = useTheme();

    const toggleOpen = useCallback(() => {
        setIsOpen(prev => !prev);
        setIsCollapsed(false); // Ensure sidebar is expanded when accordion is opened
        onClick();
    }, [onClick, setIsCollapsed]);

    return (
        <div className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} ${isActive ? (isDarkMode ? 'bg-gray-800' : 'bg-gray-100') : ''}`}>
            <button
                className={`flex items-center w-full p-4 text-left ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'} transition-colors duration-200 ${isActive ? (isDarkMode ? 'text-white' : 'text-black') : ''}`}
                onClick={toggleOpen}
            >
                <div className={`${isCollapsed ? 'mx-auto' : ''}`}>{icon}</div>
                {!isCollapsed && (
                    <>
                        <span className="ml-4 flex-grow font-medium text-base">{title}</span>
                        <ChevronRight className={`transition-transform duration-200 ${isOpen ? 'transform rotate-90' : ''}`} />
                    </>
                )}
            </button>
            {isOpen && !isCollapsed && (
                <div className={isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}>
                    {children.map((subItem, subIndex) => (
                        <div
                            key={subIndex}
                            className={`px-8 py-3 text-base ${isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-black'} cursor-pointer transition-colors duration-200`}
                            onClick={() => onSubItemClick(subItem)}
                        >
                            {subItem}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

AccordionItem.displayName = 'AccordionItem';

const Sidebar = ({ onNavigate }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeItem, setActiveItem] = useState(null);
    const { isDarkMode } = useTheme();

    const toggleSidebar = useCallback(() => setIsCollapsed(prev => !prev), []);

    const menuItems = useMemo(() => [
        { title: 'Dashboard', icon: <Home size={24} />, component: 'Dashboard' },
        { title: 'Orders', icon: <ShoppingCart size={24} />, subItems: ['Request for Quotation', 'Purchase Orders'] },
        { title: 'Vendors', icon: <Users size={24} />, component: 'Vendors' },
        { title: 'Products', icon: <Package size={24} />, subItems: ['Item Master', 'Part Master'] },
        { title: 'Config', icon: <Settings size={24} />, subItems: ['Size Master', 'Colour Master', 'MakerName Master', 'Unit of Measurement Master'] },
    ], []);

    const handleItemClick = useCallback((index) => {
        setActiveItem(index);
        setIsCollapsed(false); // Ensure sidebar is expanded when any item is clicked
        const item = menuItems[index];
        if (!item.subItems) {
            onNavigate(item.component);
        }
    }, [menuItems, onNavigate]);

    const handleSubItemClick = useCallback((mainItem, subItem) => {
        onNavigate(`${mainItem.title}.${subItem.replace(/\s+/g, '')}`);
    }, [onNavigate]);

    return (
        <div className={`h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} shadow-xl transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`flex items-center justify-between p-5 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                {!isCollapsed && (
                    <h1
                        className="text-2xl font-semibold cursor-pointer hover:text-blue-500 transition-colors duration-200"
                        onClick={() => onNavigate('Dashboard')}
                    >
                        Dashboard
                    </h1>
                )}
                <button
                    className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} transition-colors duration-200 ${isCollapsed ? 'mx-auto' : ''}`}
                    onClick={toggleSidebar}
                >
                    {isCollapsed ? <Menu size={28} /> : <X size={28} />}
                </button>
            </div>
            <nav className="mt-2">
                {menuItems.map((item, index) => (
                    item.subItems ? (
                        <AccordionItem
                            key={index}
                            title={item.title}
                            icon={item.icon}
                            isCollapsed={isCollapsed}
                            isActive={activeItem === index}
                            onClick={() => handleItemClick(index)}
                            onSubItemClick={(subItem) => handleSubItemClick(item, subItem)}
                            setIsCollapsed={setIsCollapsed}
                        >
                            {item.subItems}
                        </AccordionItem>
                    ) : (
                        <div
                            key={index}
                            className={`flex items-center p-4 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} cursor-pointer transition-colors duration-200 ${activeItem === index ? (isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black') : (isDarkMode ? 'text-gray-300' : 'text-gray-700')}`}
                            onClick={() => handleItemClick(index)}
                        >
                            <div className={`${isCollapsed ? 'mx-auto' : ''}`}>{item.icon}</div>
                            {!isCollapsed && <span className="ml-4 font-medium text-base">{item.title}</span>}
                        </div>
                    )
                ))}
            </nav>
        </div>
    );
};

Sidebar.displayName = 'Sidebar';

export default React.memo(Sidebar);