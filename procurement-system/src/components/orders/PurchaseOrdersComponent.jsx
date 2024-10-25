import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ListComponent from '../common/ListComponent';
import PurchaseOrderForm from './PurchaseOrderForm';
import { useTheme } from '../../contexts/ThemeContext';
import { Plus, ChevronLeft, Trash2, Pencil, X } from 'lucide-react';
import { api, baseURL } from '../../utils/endpoint';
import axios from 'axios';

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
                id: po._id,
                reference: po.poCode,
                confirmationDate: new Date(po.poDate).toLocaleDateString(),
                vendor: {
                    name: po.vendorId?.name || 'N/A'
                },
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
                        onClick={() => handleEdit(item.id)}
                        className="text-blue-600 hover:text-blue-900 focus:outline-none p-1 rounded-full transition-colors"
                        title="Edit Purchase Order"
                        disabled={isLoading}
                    >
                        <Pencil size={20} />
                    </button>
                    <button
                        onClick={() => handleDeletePurchaseOrder(item.id, item.reference)}
                        className="text-red-600 hover:text-red-900 focus:outline-none p-1 rounded-full transition-colors"
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
