import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, CubeIcon, UserGroupIcon, DocumentTextIcon, ChartBarIcon, CogIcon, MenuIcon } from '@heroicons/react/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Inventory', href: '/inventory', icon: CubeIcon },
  { name: 'Vendors', href: '/vendors', icon: UserGroupIcon },
  { name: 'Purchase Orders', href: '/purchase-orders', icon: DocumentTextIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`flex flex-col ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out`}>
      <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
        <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 bg-gray-900">
          {!collapsed && <span className="text-white text-lg font-semibold">ProcurePro</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <item.icon className="mr-3 flex-shrink-0 h-6 w-6" aria-hidden="true" />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;