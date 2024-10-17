/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import ListComponent from '../common/ListComponent';
import { useTheme } from '../../contexts/ThemeContext';
import Modal from '../common/Modal';
import PurchaseOrderForm from './PurchaseOrderForm';

const PurchaseOrdersComponent = () => {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isDarkMode } = useTheme();

    const fetchPurchaseOrders = async (page = 1) => {
        // TODO: Replace with actual API call
        const dummyData = [
            { id: 1, reference: 'PO001', confirmationDate: '2023-06-01', vendor: { name: 'Vendor A' }, preparedBy: { name: 'John Doe' }, total: 1000, status: 'Pending', expectedArrival: '2023-06-15' },
            { id: 2, reference: 'PO002', confirmationDate: '2023-06-02', vendor: { name: 'Vendor B' }, preparedBy: { name: 'Jane Smith' }, total: 2000, status: 'Approved', expectedArrival: '2023-06-20' },
            // Add more dummy data as needed
        ];
        setPurchaseOrders(dummyData);
        setTotalPages(1); // Update this when implementing actual pagination
    };

    useEffect(() => {
        fetchPurchaseOrders();
    }, []);

    const handleCreateNew = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = (formData) => {
        // TODO: Implement API call to create new purchase order
        console.log('New Purchase Order:', formData);
        setIsModalOpen(false);
        // Optionally, refresh the list after creating a new item
        fetchPurchaseOrders();
    };

    const columns = [
        { header: 'Reference', key: 'reference' },
        { header: 'Confirmation Date', key: 'confirmationDate' },
        { header: 'Vendor', key: 'vendor', render: (item) => item.vendor.name },
        {
            header: 'Buyer', key: 'preparedBy', render: (item) => (
                <div className="flex items-center">
                    <span className={`${isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'} rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm`}>
                        {item.preparedBy.name[0]}
                    </span>
                    <span>{item.preparedBy.name}</span>
                </div>
            )
        },
        { header: 'Total', key: 'total', render: (item) => `₹${item.total.toFixed(2)}` },
        {
            header: 'Status', key: 'status', render: (item) => (
                <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'Pending'
                    ? isDarkMode ? 'bg-yellow-800 text-yellow-300' : 'bg-yellow-200 text-yellow-800'
                    : 'bg-green-800 text-green-300'
                    }`}>
                    {item.status}
                </span>
            )
        },
        { header: 'Expected Arrival', key: 'expectedArrival' },
    ];

    return (
        <>
            <ListComponent
                title="Purchase Orders"
                data={purchaseOrders}
                columns={columns}
                onFetch={fetchPurchaseOrders}
                totalPages={totalPages}
                onCreateNew={handleCreateNew}
            />
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Create New Purchase Order">
                <PurchaseOrderForm onSubmit={handleSubmit} onCancel={handleCloseModal} />
            </Modal>
        </>
    );
};
export { PurchaseOrdersComponent };