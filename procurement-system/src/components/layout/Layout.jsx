
import React, { useState, useCallback } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '../../contexts/ThemeContext';

import {
    ItemMasterComponent,
} from '../Products/ItemMasterComponent';

import {
    PartMasterComponent,
} from '../Products/PartMasterComponent';

import {
    VendorsComponent
} from '../Vendors/VendorsComponent'

import {
    RequestForQuotationComponent
} from '../orders/RequestForQuotationComponent';

import {
    PurchaseOrdersComponent
} from '../orders/PurchaseOrdersComponent';

import {
    SizeMasterComponent,
    ColourMasterComponent,
    MakerNameMasterComponent,
    UnitOfMeasurementMasterComponent
} from '../config/configMasters';

const DashboardComponent = () => {
    const { isDarkMode } = useTheme();
    return (
        <div className={`p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-md`}>
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            <p>Welcome to your dashboard. Here you can see an overview of your system.</p>
        </div>
    );
};

const Layout = () => {
    const [currentComponent, setCurrentComponent] = useState('Dashboard');
    const { isDarkMode } = useTheme();
    const { user, logout } = useAuth();

    const handleNavigation = useCallback((componentName) => {
        setCurrentComponent(componentName);
    }, []);

    const handleLogout = useCallback(() => {
        logout();
    }, [logout]);

    const renderComponent = useCallback(() => {
        switch (currentComponent) {
            case 'Dashboard':
                return <DashboardComponent />;
            case 'Orders.RequestforQuotation':
                return <RequestForQuotationComponent />;
            case 'Orders.PurchaseOrders':
                return <PurchaseOrdersComponent />;
            case 'Vendors':
                return <VendorsComponent />;
            case 'Products.ItemMaster':
                return <ItemMasterComponent />;
            case 'Products.PartMaster':
                return <PartMasterComponent />;
            case 'Config.SizeMaster':
                return <SizeMasterComponent />;
            case 'Config.ColourMaster':
                return <ColourMasterComponent />;
            case 'Config.MakerNameMaster':
                return <MakerNameMasterComponent />;
            case 'Config.UnitofMeasurementMaster':
                return <UnitOfMeasurementMasterComponent />;
            default:
                return <DashboardComponent />;
        }
    }, [currentComponent]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className={`h-screen flex overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <Sidebar onNavigate={handleNavigation} />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header onLogout={handleLogout} />
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <div className={`transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-md`}>
                                {renderComponent()}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={isDarkMode ? "dark" : "light"}
                toastStyle={{
                    background: isDarkMode ? '#1F2937' : '#ffffff',
                    color: isDarkMode ? '#ffffff' : '#1F2937',
                }}
            />
        </div>
    );
};

export default React.memo(Layout);