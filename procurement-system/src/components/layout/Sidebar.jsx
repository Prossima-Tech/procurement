/* eslint-disable react/prop-types */
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ShoppingCart, Users, Package, Settings, ChevronRight, Home } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import LogoSVG from '../../assets/prossimaLogo.svg'; // Adjust the path if necessary

const AccordionItem = React.memo(({ title, icon, children, isCollapsed, isActive, onClick, onSubItemClick, setIsCollapsed }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { isDarkMode } = useTheme();
    const contentRef = useRef(null);

    const toggleOpen = useCallback(() => {
        if (!isCollapsed) {
            setIsOpen(prev => !prev);
            setIsCollapsed(false);
            onClick();
        }
    }, [isCollapsed, onClick, setIsCollapsed]);

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.style.maxHeight = isOpen && !isCollapsed ? `${contentRef.current.scrollHeight}px` : '0px';
        }
    }, [isOpen, children, isCollapsed]);

    useEffect(() => {
        if (isCollapsed) {
            setIsOpen(false);
        }
    }, [isCollapsed]);

    return (
        <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} ${isActive ? (isDarkMode ? 'bg-gray-800' : 'bg-gray-100') : ''}`}>
            <button
                className={`flex items-center w-full p-4 text-left ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'} transition-all duration-300 ${isActive ? (isDarkMode ? 'text-white' : 'text-black') : ''}`}
                onClick={toggleOpen}
            >
                <div className={`flex items-center justify-center w-8 h-8 transition-all duration-300 ${isCollapsed ? 'mx-auto' : ''}`}>{icon}</div>
                {!isCollapsed && (
                    <>
                        <span className="ml-4 flex-grow font-medium text-base whitespace-nowrap overflow-hidden">{title}</span>
                        <ChevronRight className={`transition-transform duration-300 ${isOpen ? 'transform rotate-90' : ''}`} />
                    </>
                )}
            </button>
            <div
                ref={contentRef}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
                style={{ maxHeight: '0px' }}
            >
                {children.map((subItem, subIndex) => (
                    <div
                        key={subIndex}
                        className={`pl-16 pr-4 py-3 text-base ${isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-black'} cursor-pointer transition-all duration-300`}
                        onClick={() => onSubItemClick(subItem)}
                    >
                        {subItem}
                    </div>
                ))}
            </div>
        </div>
    );
});

AccordionItem.displayName = 'AccordionItem';

const Sidebar = ({ onNavigate }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [activeItem, setActiveItem] = useState(null);
    const { isDarkMode } = useTheme();
    const sidebarRef = useRef(null);
    const timeoutRef = useRef(null);

    const expandSidebar = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsCollapsed(false);
    };

    const collapseSidebar = () => {
        timeoutRef.current = setTimeout(() => {
            setIsCollapsed(true);
        }, 300);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const menuItems = useMemo(() => [
        { title: 'Dashboard', icon: <Home size={24} />, component: 'Dashboard' },
        { title: 'Orders', icon: <ShoppingCart size={24} />, subItems: ['Request for Quotation', 'Purchase Orders'] },
        { title: 'Vendors', icon: <Users size={24} />, component: 'Vendors' },
        { title: 'Products', icon: <Package size={24} />, subItems: ['Item Master', 'Part Master'] },
        { title: 'Config', icon: <Settings size={24} />, subItems: ['Size Master', 'Colour Master', 'MakerName Master', 'Unit of Measurement Master'] },
    ], []);

    const handleItemClick = useCallback((index) => {
        setActiveItem(index);
        setIsCollapsed(false);
        const item = menuItems[index];
        if (!item.subItems) {
            onNavigate(item.component);
        }
    }, [menuItems, onNavigate]);

    const handleSubItemClick = useCallback((mainItem, subItem) => {
        onNavigate(`${mainItem.title}.${subItem.replace(/\s+/g, '')}`);
    }, [onNavigate]);

    return (
        <div
            ref={sidebarRef}
            className={`h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} shadow-xl transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'} relative`}
            onMouseEnter={expandSidebar}
            onMouseLeave={collapseSidebar}
        >
            <div className={`flex items-center h-20 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} px-4 transition-all duration-300`}>
                <img
                    src={LogoSVG}
                    alt="Logo"
                    className={`transition-all duration-300 ${isCollapsed ? 'w-12 h-12 mx-auto' : 'w-10 h-10 mr-3'}`}
                />
                <h1
                    className={`font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed
                        ? 'w-0 opacity-0'
                        : 'w-auto opacity-100'
                        } ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
                >
                    <span className="text-xl">Prossima</span>
                    <span className="text-xl font-bold text-blue-500">Tech</span>
                </h1>
            </div>
            <nav className="mt-4 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
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
                            className={`flex items-center p-4 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} cursor-pointer transition-all duration-300 ${activeItem === index ? (isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black') : (isDarkMode ? 'text-gray-300' : 'text-gray-700')}`}
                            onClick={() => handleItemClick(index)}
                        >
                            <div className={`flex items-center justify-center w-8 h-8 transition-all duration-300 ${isCollapsed ? 'mx-auto' : ''}`}>{item.icon}</div>
                            {!isCollapsed && <span className="ml-4 font-medium text-base whitespace-nowrap overflow-hidden">{item.title}</span>}
                        </div>
                    )
                ))}
            </nav>
        </div>
    );
};

Sidebar.displayName = 'Sidebar';

export default React.memo(Sidebar);