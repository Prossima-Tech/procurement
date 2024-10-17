/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import ListComponent from '../common/ListComponent';
import { useTheme } from '../../contexts/ThemeContext';

export const RequestForQuotationComponent = () => {
    const [rfqs, setRfqs] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const { isDarkMode } = useTheme();

    const fetchRfqs = async (page = 1) => {
        // TODO: Replace with actual API call
        const dummyData = [
            { id: 1, rfqNumber: 'RFQ001', date: '2023-06-01', vendor: 'Vendor A', status: 'Pending', items: 5, totalAmount: 10000 },
            { id: 2, rfqNumber: 'RFQ002', date: '2023-06-02', vendor: 'Vendor B', status: 'Approved', items: 3, totalAmount: 5000 },
            // Add more dummy data as needed
        ];
        setRfqs(dummyData);
        setTotalPages(1); // Update this when implementing actual pagination
    };

    useEffect(() => {
        fetchRfqs();
    }, []);

    const handleCreateNew = () => {
        console.log('Create new RFQ');
        // Implement create new functionality
    };

    const columns = [
        { header: 'RFQ Number', key: 'rfqNumber' },
        { header: 'Date', key: 'date' },
        { header: 'Vendor', key: 'vendor' },
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
        { header: 'Items', key: 'items' },
        { header: 'Total Amount', key: 'totalAmount', render: (item) => `₹${item.totalAmount.toFixed(2)}` },
    ];

    return (
        <ListComponent
            title="Request for Quotation"
            data={rfqs}
            columns={columns}
            onFetch={fetchRfqs}
            totalPages={totalPages}
            onCreateNew={handleCreateNew}
        />
    );
};