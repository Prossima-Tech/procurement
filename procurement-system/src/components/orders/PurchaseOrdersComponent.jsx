import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ListComponent from '../common/ListComponent';
import { toast, ToastContainer } from 'react-toastify';
import PurchaseOrderForm from './PurchaseOrderForm';
import { useTheme } from '../../contexts/ThemeContext';
import { Plus, ChevronLeft, Trash2, Pencil, X, Send } from 'lucide-react';
import { api, baseURL } from '../../utils/endpoint';
import axios from 'axios';
import { FileDown } from 'lucide-react';

const PurchaseOrdersComponent = () => {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingPO, setEditingPO] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isDarkMode } = useTheme();
    const [openNotifyModal, setOpenNotifyModal] = useState(false);
    const [selectedPO, setSelectedPO] = useState(null);
    const [customMessage, setCustomMessage] = useState('');
    const [notifyLoading, setNotifyLoading] = useState(false);

    // Toast configuration
    const toastConfig = {
        position: "top-right",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
            background: isDarkMode ? '#1F2937' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#1F2937',
        }
    };

    const getToken = () => localStorage.getItem('token');

    const handlePrintPO = async (orderId) => {
        try {
            const response = await axios.get(
                `${baseURL}/purchase-orders/generatePdf/${orderId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`,
                        'Accept': 'application/pdf'
                    },
                    responseType: 'blob'
                }
            );

            // Create blob and download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `PO_${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF');
        }
    };

    const fetchPurchaseOrders = async (page = 1) => {
        console.log("fetching purchase orders");
        try {
            setIsLoading(true);
            setError(null);

            // const response = await axios.get(
            //     `http://localhost:5000/api/purchase-orders/getAllPOs?page=${page}&limit=10`,
            //     {
            //         headers: { 'Authorization': `Bearer ${getToken()}` }
            //     }
            // );
            const response = await api(
                `/purchase-orders/getAllPOs?page=${page}&limit=10`,
                'get',
                null,
                { 'Authorization': `Bearer ${getToken()}` }
            );

            const { purchaseOrders, totalPages: totalPgs } = response.data;

            // Transform the data to match your frontend structure
            const formattedOrders = purchaseOrders.map(po => ({
                _id: po._id,
                poCode: po.poCode,
                poDate: new Date(po.poDate).toLocaleDateString(),
                vendor: {
                    name: po.vendorId?.name || 'N/A'
                },
                status: po.status || 'draft',
                deliveryStatus: po.deliveryStatus || 'pending',
                deliveryDate: po.deliveryDate,
                items: po.items || []
            }));

            setPurchaseOrders(formattedOrders);
            setTotalPages(totalPgs);
            setCurrentPage(page);

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch purchase orders';
            console.error('Error fetching purchase orders:', err);
            setError(errorMessage);
            toast.error(errorMessage, toastConfig);
            setPurchaseOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPurchaseOrders(currentPage);
    }, [currentPage]);

    const handleCreateNew = () => {
        setIsCreatingNew(true);
        setIsModalOpen(true);
        setError(null);
        setEditingPO(null); // Reset editingPO when creating new
    };

    const handleEdit = async (orderId) => {
        try {
            setIsLoading(true);
            const response = await axios.get(
                `${baseURL}/purchase-orders/getPO/${orderId}`,
                {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                }
            );

            if (response.data) {
                const formattedData = {
                    ...response.data,
                    poDate: response.data.poDate ? new Date(response.data.poDate).toISOString().split('T')[0] : '',
                    validUpto: response.data.validUpto ? new Date(response.data.validUpto).toISOString().split('T')[0] : '',
                    deliveryDate: response.data.deliveryDate ? new Date(response.data.deliveryDate).toISOString().split('T')[0] : '',
                    items: response.data.items.map(item => ({
                        partCode: item.partCode,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        masterItemName: item.masterItemName,
                        totalPrice: item.totalPrice
                    }))
                };
                console.log("formattedData", formattedData);
                setEditingPO(formattedData);

            }
        } catch (err) {
            console.error('Error fetching PO details:', err);
            toast.error('Failed to fetch purchase order details');
        } finally {
            setIsLoading(false);
            setIsCreatingNew(true);
            setIsModalOpen(true);
        }
    };


    const handleDeletePurchaseOrder = async (orderId, reference) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete Purchase Order ${reference}?`);

        if (confirmDelete) {
            setIsLoading(true);
            try {
                const response = await axios.delete(
                    `${baseURL}/purchase-orders/deletePO/${orderId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${getToken()}`,
                        }
                    }
                );

                if (response.status === 200) {
                    toast.success('Purchase Order deleted successfully');
                    // Refresh the purchase orders list
                    console.log("fetching purchase orders after deletion");
                    await fetchPurchaseOrders(
                        purchaseOrders.length === 1 && currentPage > 1
                            ? currentPage - 1
                            : currentPage
                    );
                } else {
                    throw new Error('Failed to delete purchase order');
                }
            } catch (error) {
                console.error('Error deleting Purchase Order:', error);
                toast.error('Failed to delete purchase order');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleCancel = () => {
        setIsCreatingNew(false);
        setEditingPO(null);
        setIsModalOpen(false);
        setError(null);
    };

    const handleNotifyVendor = async (purchaseOrder) => {
        setSelectedPO(purchaseOrder);
        setOpenNotifyModal(true);
    };

    const handleSendNotification = async () => {
        try {
            setNotifyLoading(true);
            const response = await api(`${baseURL}/purchase-orders/notify-vendor/${selectedPO._id}`, 'post', {
                customMessage
            });

            if (response.data.success === true) {
                toast.success(response.data.message || 'Vendor notification sent successfully', toastConfig);
            } else {
                toast.error(response.data.message || 'Failed to send notification', toastConfig);
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            toast.error('Error sending notification', toastConfig);
        } finally {
            setNotifyLoading(false);
            setOpenNotifyModal(false);
            setCustomMessage('');
            setSelectedPO(null);
        }
    };

    const columns = [
        { header: 'PO Code', key: 'poCode' },
        { header: 'PO Date', key: 'poDate' },
        { header: 'Vendor', key: 'vendor', render: (item) => item.vendor?.name || 'N/A' },
        {
            header: 'Status',
            key: 'status',
            render: (item) => {
                const statusColors = {
                    draft: 'gray',
                    created: 'blue',
                    submitted: 'yellow',
                    approved: 'green',
                    in_progress: 'purple',
                    partially_delivered: 'orange',
                    fully_delivered: 'green',
                    cancelled: 'red'
                };
                const color = statusColors[item.status] || 'gray';
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode
                        ? `bg-${color}-700 text-${color}-100`
                        : `bg-${color}-100 text-${color}-800`
                        }`}>
                        {item.status?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                );
            }
        },
        {
            header: 'Delivery Status',
            key: 'deliveryStatus',
            render: (item) => {
                const statusColors = {
                    pending: 'yellow',
                    partially_delivered: 'orange',
                    fully_delivered: 'green'
                };
                const color = statusColors[item.deliveryStatus] || 'gray';
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode
                        ? `bg-${color}-700 text-${color}-100`
                        : `bg-${color}-100 text-${color}-800`
                        }`}>
                        {item.deliveryStatus?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                );
            }
        },
        {
            header: 'Total Value',
            key: 'totalValue',
            render: (item) => `₹${item.items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0).toFixed(2)}`
        },
        { header: 'Delivery Date', key: 'deliveryDate', render: (item) => new Date(item.deliveryDate).toLocaleDateString() },
        {
            header: 'Actions',
            key: 'actions',
            render: (item) => (
                <div className="flex items-center justify-end space-x-2">
                    <button
                        onClick={() => handlePrintPO(item._id)}
                        className="text-green-600 hover:text-green-900 focus:outline-none p-1 rounded-full transition-colors"
                        title="Download PDF"
                    >
                        <FileDown size={20} />
                    </button>
                    {/* Your existing buttons */}
                    <button
                        onClick={() => handleNotifyVendor(item)}
                        className={`text-green-600 hover:text-green-900 focus:outline-none p-1 rounded-full transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Notify Vendor"
                        disabled={isLoading}
                    >
                        <Send size={20} />
                    </button>
                    <button
                        onClick={() => {
                            if (item.status === 'in_progress' || item.status === 'grn_created') {
                                toast.warning(`Purchase Orders in ${item.status.replace('_', ' ')} status cannot be edited`, toastConfig);
                            } else {
                                handleEdit(item._id);
                            }
                        }}
                        className={`text-blue-600 hover:text-blue-900 focus:outline-none p-1 rounded-full transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        title="Edit Purchase Order"
                        disabled={isLoading}
                    >
                        <Pencil size={20} />
                    </button>
                    <button
                        onClick={() => {
                            if (item.status === 'in_progress' || item.status === 'grn_created') {
                                toast.warning(`Purchase Orders in ${item.status.replace('_', ' ')} status cannot be deleted`, toastConfig);
                            } else {
                                handleDeletePurchaseOrder(item._id, item.poCode);
                            }
                        }}
                        className={`text-red-600 hover:text-red-900 focus:outline-none p-1 rounded-full transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        title="Delete Purchase Order"
                        disabled={isLoading}
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-900'}`}>
            <ToastContainer />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex justify-center">
                        {isCreatingNew && (
                            <Link to="/" className={`flex justify-center p-2 mr-2 rounded-full ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} transition duration-150 ease-in-out`}>
                                <button onClick={handleCancel}>
                                    <ChevronLeft size={24} />
                                </button>
                            </Link>
                        )}
                        <h1 className="text-2xl font-bold">
                            {isCreatingNew ? (editingPO ? 'Edit Purchase Order' : 'Create Purchase Order') : 'Purchase Orders'}
                        </h1>
                    </div>

                    {!isCreatingNew && (
                        <button
                            onClick={handleCreateNew}
                            className={`flex items-center p-4 rounded-md text-sm font-medium ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} transition duration-150 ease-in-out`}
                        >
                            <Plus size={18} className="mr-2" /> New Purchase Order
                        </button>
                    )}
                </div>
                {error && (
                    <div className="mb-4 p-4 rounded-md bg-red-100 text-red-700">
                        {error}
                    </div>
                )}
                <div className={`${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="">
                        {isCreatingNew || editingPO ? (
                            <PurchaseOrderForm
                                onCancel={handleCancel}
                                isLoading={isLoading}
                                setIsLoading={setIsLoading}
                                setIsCreatingNew={setIsCreatingNew}
                                initialData={editingPO}
                                setIsModalOpen={setIsModalOpen}
                                fetchPurchaseOrders={fetchPurchaseOrders}
                                setEditingPO={setEditingPO}
                            />
                        ) : (
                            <ListComponent
                                showHeader={false}
                                title="Purchase Orders"
                                data={purchaseOrders}
                                columns={columns}
                                onFetch={fetchPurchaseOrders}
                                totalPages={totalPages}
                                currentPage={currentPage}
                                onCreateNew={handleCreateNew}
                                isDarkMode={isDarkMode}
                                isLoading={isLoading}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Notification Modal */}
            {openNotifyModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className={`inline-block align-middle rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${isDarkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-900'
                            }`}>
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Notify Vendor
                                    </h3>
                                    <div className="ml-3 h-7 flex items-center">
                                        <button
                                            onClick={() => setOpenNotifyModal(false)}
                                            className="bg-white rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2 text-base text-gray-500">
                                    <p>Enter the custom message for the vendor:</p>
                                    <textarea
                                        value={customMessage}
                                        onChange={(e) => setCustomMessage(e.target.value)}
                                        className="mt-2 w-full border border-gray-300 rounded-md p-2"
                                        rows="4"
                                        placeholder="Enter your message here..."
                                    />
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={handleSendNotification}
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-md"
                                        disabled={notifyLoading}
                                    >
                                        {notifyLoading ? (
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3.148 7.935l3.801-3.041z"></path>
                                            </svg>
                                        ) : (
                                            'Send Notification'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export { PurchaseOrdersComponent };
