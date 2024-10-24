import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ListComponent from '../common/ListComponent';
import PurchaseOrderForm from './PurchaseOrderForm';
import { useTheme } from '../../contexts/ThemeContext';
import { Plus, ChevronLeft, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const PurchaseOrdersComponent = () => {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isDarkMode } = useTheme();

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

    const fetchPurchaseOrders = async (page = 1) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await axios.get(
                `http://localhost:5000/api/purchase-orders/getAllPOs?page=${page}&limit=10`,
                {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                }
            );

            const { purchaseOrders, totalPages: totalPgs } = response.data;

            // Transform the data to match your frontend structure
            const formattedOrders = purchaseOrders.map(po => ({
                id: po._id,
                reference: po.poCode,
                confirmationDate: new Date(po.poDate).toLocaleDateString(),
                vendor: {
                    name: po.vendorId?.name || 'N/A'
                },
                // Since preparedBy is not in schema, we'll skip it for now
                total: po.items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0,
                status: po.status || 'Pending',
                expectedArrival: po.deliveryDate ? new Date(po.deliveryDate).toLocaleDateString() : 'N/A',
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
        setError(null);
    };

    const handleSubmit = async (formData) => {
        try {
            setIsLoading(true);
            setError(null);

            await axios.post(
                'http://localhost:5000/api/purchase-orders/create',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            toast.success('Purchase Order created successfully!', toastConfig);
            setIsCreatingNew(false);
            await fetchPurchaseOrders(currentPage);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to create purchase order. Please try again.';
            console.error('Error creating purchase order:', err);
            setError(errorMessage);
            toast.error(errorMessage, toastConfig);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePurchaseOrder = (orderId, reference) => {
        toast(
            ({ closeToast }) => (
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-2">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        <span className="font-medium">Delete Purchase Order</span>
                    </div>
                    <p>Are you sure you want to delete this purchase order? This action cannot be undone.</p>
                    {reference && (
                        <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <span className="font-medium">PO Reference: {reference}</span>
                        </div>
                    )}
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={closeToast}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors
                            ${isDarkMode
                                    ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    setIsLoading(true);
                                    await axios.delete(
                                        `http://localhost:5000/api/purchase-orders/deletePO/${orderId}`,
                                        {
                                            headers: {
                                                'Authorization': `Bearer ${getToken()}`,
                                            }
                                        }
                                    );
                                    toast.success('Purchase Order deleted successfully', toastConfig);
                                    await fetchPurchaseOrders(
                                        purchaseOrders.length === 1 && currentPage > 1
                                            ? currentPage - 1
                                            : currentPage
                                    );
                                } catch (err) {
                                    const errorMessage = err.response?.data?.message || 'Failed to delete purchase order';
                                    toast.error(errorMessage, toastConfig);
                                    console.error('Error deleting purchase order:', err);
                                } finally {
                                    setIsLoading(false);
                                    closeToast();
                                }
                            }}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            ),
            {
                position: "top-center",
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
                style: {
                    background: isDarkMode ? '#1F2937' : '#ffffff',
                    color: isDarkMode ? '#ffffff' : '#1F2937',
                    minWidth: '320px',
                }
            }
        );
    };

    const handleCancel = () => {
        setIsCreatingNew(false);
        setError(null);
    };

    const columns = [
        { header: 'Reference', key: 'reference' },
        { header: 'Confirmation Date', key: 'confirmationDate' },
        { header: 'Vendor', key: 'vendor', render: (item) => item.vendor.name },
        { header: 'Total', key: 'total', render: (item) => `₹${item.total.toFixed(2)}` },
        {
            header: 'Status',
            key: 'status',
            render: (item) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Pending'
                    ? isDarkMode ? 'bg-yellow-700 text-yellow-100' : 'bg-yellow-100 text-yellow-800'
                    : isDarkMode ? 'bg-green-700 text-green-100' : 'bg-green-100 text-green-800'
                    }`}>
                    {item.status}
                </span>
            )
        },
        { header: 'Expected Arrival', key: 'expectedArrival' },
        {
            header: 'Actions',
            key: 'actions',
            render: (item) => (
                <div className="flex items-center justify-end space-x-2">
                    <button
                        onClick={() => handleDeletePurchaseOrder(item.id, item.reference)}
                        className={`text-red-600 hover:text-red-900 focus:outline-none p-1 rounded-full transition-colors`}
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex justify-center">
                        {isCreatingNew && (
                            <Link to="/" className={`flex justify-center p-2 mr-2 rounded-full ${isDarkMode ? ' hover:bg-gray-800' : 'hover:bg-gray-200'} transition duration-150 ease-in-out`}>
                                <button onClick={handleCancel}>
                                    <ChevronLeft size={24} />
                                </button>
                            </Link>
                        )}
                        <h1 className="text-2xl font-bold">Purchase Orders</h1>
                    </div>

                    {!isCreatingNew && (
                        <button
                            onClick={handleCreateNew}
                            className={`flex items-center p-4 rounded-md text-sm font-medium ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                                } transition duration-150 ease-in-out`}
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
                        {isCreatingNew ? (
                            <PurchaseOrderForm
                                onSubmit={handleSubmit}
                                onCancel={handleCancel}
                                isDarkMode={isDarkMode}
                                isLoading={isLoading}
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
        </div>
    );
};

export { PurchaseOrdersComponent };
