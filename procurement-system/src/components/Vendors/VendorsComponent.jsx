/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import ListComponent from '../common/ListComponent';
import { useTheme } from '../../contexts/ThemeContext';

const VendorsComponent = () => {
    const [vendors, setVendors] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const { isDarkMode } = useTheme();

    const fetchVendors = async (page = 1) => {
        // TODO: Replace with actual API call
        const dummyData = [
            { id: 1, name: 'Vendor A', contactPerson: 'John Doe', phone: '123-456-7890', email: 'john@vendora.com', address: { city: 'New York', country: 'USA' } },
            { id: 2, name: 'Vendor B', contactPerson: 'Jane Smith', phone: '098-765-4321', email: 'jane@vendorb.com', address: { city: 'London', country: 'UK' } },
            // Add more dummy data as needed
        ];
        setVendors(dummyData);
        setTotalPages(1); // Update this when implementing actual pagination
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const handleCreateNew = () => {
        console.log('Create new vendor');
        // Implement create new functionality
    };

    const columns = [
        { header: 'Name', key: 'name' },
        { header: 'Contact Person', key: 'contactPerson' },
        { header: 'Phone', key: 'phone' },
        {
            header: 'Email', key: 'email', render: (item) => (
                <a href={`mailto:${item.email}`} className={isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}>
                    {item.email}
                </a>
            )
        },
        { header: 'City', key: 'address', render: (item) => item.address.city },
        { header: 'Country', key: 'address', render: (item) => item.address.country },
    ];

    return (
        <ListComponent
            title="Vendors"
            data={vendors}
            columns={columns}
            onFetch={fetchVendors}
            totalPages={totalPages}
            onCreateNew={handleCreateNew}
        />
    );
};

export { VendorsComponent };