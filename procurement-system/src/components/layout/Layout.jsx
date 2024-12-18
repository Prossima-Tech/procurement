
import React, { useState, useCallback } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '../../contexts/ThemeContext';
import IndentList from '../dashboard/indentList';
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
} from '../orders/rfq/RequestForQuotationComponent';

import {
    PurchaseOrdersComponent
} from '../orders/purchaseOrder/PurchaseOrdersComponent';

import GRNManagement from '../grn/GRNManagement';
import InspectionManagement from '../inspection/InspectionManagement'

import {
    SizeMasterComponent,
    ColourMasterComponent,
    MakerNameMasterComponent,
    UnitOfMeasurementMasterComponent
} from '../config/configMasters';

import MainDashboard from '../dashboard/MainDashboard';

const DashboardComponent = () => {
    const { isDarkMode } = useTheme();
    return (
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} min-h-screen`}>
            <div className=" mx-auto space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome to Dashboard</h1>
                    <p className="text-blue-100 text-lg">Manage and monitor your procurement system efficiently</p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                </svg>
                            </div>
                            <span className="text-2xl font-bold">24</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-1">Pending Approvals</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Requires immediate attention</p>
                    </div>

                    <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <span className="text-2xl font-bold">156</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-1">Completed Orders</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Successfully processed</p>
                    </div>

                    <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <span className="text-2xl font-bold">₹2.4M</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-1">Total Spend</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Current month</p>
                    </div>

                    <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                            </div>
                            <span className="text-2xl font-bold">98%</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-1">System Status</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Operational efficiency</p>
                    </div>
                </div>

                {/* Main Dashboard Content */}
                <MainDashboard />
            </div>
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
            case 'Orders.GoodsReceiptNote':    // Add this case
                return <GRNManagement />;
            case 'Orders.QualityInspection':  // Add this case
                return <InspectionManagement />;
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
                        <div className=" mx-auto px-4 sm:px-6 md:px-8">
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