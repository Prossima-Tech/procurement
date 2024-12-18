import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ShoppingCart, Users, Package, Settings, ChevronRight, Home } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import LogoSVG from '../../assets/prossimaLogo.svg';

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
        if (isCollapsed) setIsOpen(false);
    }, [isCollapsed]);

    return (
        <div className={`group ${isActive ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}`}>
            <button
                className="flex items-center w-full py-2.5 px-3 text-left transition-colors group-hover:bg-gray-50 dark:group-hover:bg-gray-800/80"
                onClick={toggleOpen}
            >
                <div className={`${isCollapsed ? 'mx-auto' : ''}`}>
                    {React.cloneElement(icon, {
                        size: 18,
                        className: `text-gray-500 dark:text-gray-400 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`
                    })}
                </div>
                {!isCollapsed && (
                    <>
                        <span className={`ml-3 text-sm font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}>
                            {title}
                        </span>
                        <ChevronRight className={`ml-auto h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                    </>
                )}
            </button>
            <div ref={contentRef} className="overflow-hidden transition-all bg-gray-50/30 dark:bg-gray-900/30" style={{ maxHeight: '0px' }}>
                {children.map((subItem, idx) => (
                    <div
                        key={idx}
                        className="py-2 px-3 pl-9 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 cursor-pointer"
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
    const timeoutRef = useRef(null);

    const handleExpand = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsCollapsed(false);
    };

    const handleCollapse = () => {
        timeoutRef.current = setTimeout(() => setIsCollapsed(true), 300);
    };

    useEffect(() => () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

    const menuItems = useMemo(() => [
        { title: 'Dashboard', icon: <Home />, component: 'Dashboard' },
        {
            title: 'Orders',
            icon: <ShoppingCart />,
            subItems: ['Request for Quotation', 'Purchase Orders', 'Goods Receipt Note', 'Quality Inspection']
        },
        { title: 'Vendors', icon: <Users />, component: 'Vendors' },
        { title: 'Products', icon: <Package />, subItems: ['Item Master', 'Part Master'] },
        { title: 'Config', icon: <Settings />, subItems: ['Size Master', 'Colour Master', 'MakerName Master', 'Unit of Measurement Master'] },
    ], []);

    const handleItemClick = useCallback((index) => {
        setActiveItem(index);
        setIsCollapsed(false);
        const item = menuItems[index];
        if (!item.subItems) onNavigate(item.component);
    }, [menuItems, onNavigate]);

    const handleSubItemClick = useCallback((mainItem, subItem) => {
        onNavigate(`${mainItem.title}.${subItem.replace(/\s+/g, '')}`);
    }, [onNavigate]);

    return (
        <div
            className={`h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-60'}`}
            onMouseEnter={handleExpand}
            onMouseLeave={handleCollapse}
        >
            <div className="h-14 flex items-center px-3 border-b border-gray-200 dark:border-gray-800">
                <img
                    src={LogoSVG}
                    alt="Logo"
                    className={`transition-all duration-300 ${isCollapsed ? 'w-8 h-8 mx-auto' : 'w-7 h-7'}`}
                />
                {!isCollapsed && (
                    <h1 className="ml-2.5 text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        Prossima<span className="text-blue-600">Tech</span>
                    </h1>
                )}
            </div>
            <nav className="py-2 space-y-0.5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700"
                style={{ height: 'calc(100vh - 56px)' }}>
                {menuItems.map((item, index) => (
                    item.subItems ? (
                        <AccordionItem
                            key={index}
                            {...item}
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
                            onClick={() => handleItemClick(index)}
                            className={`group flex items-center py-2.5 px-3 cursor-pointer transition-colors
                                ${activeItem === index ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}
                                hover:bg-gray-50 dark:hover:bg-gray-800/80`}
                        >
                            <div className={`${isCollapsed ? 'mx-auto' : ''}`}>
                                {React.cloneElement(item.icon, {
                                    size: 18,
                                    className: `text-gray-500 dark:text-gray-400 ${activeItem === index ? 'text-blue-600 dark:text-blue-400' : ''}`
                                })}
                            </div>
                            {!isCollapsed && (
                                <span className={`ml-3 text-sm font-medium ${activeItem === index ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}>
                                    {item.title}
                                </span>
                            )}
                        </div>
                    )
                ))}
            </nav>
        </div>
    );
};

Sidebar.displayName = 'Sidebar';

const MemoizedSidebar = React.memo(Sidebar);
MemoizedSidebar.displayName = 'MemoizedSidebar';

export default MemoizedSidebar;