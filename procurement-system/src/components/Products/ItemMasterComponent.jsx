/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import ListComponent from '../common/ListComponent';
import { dummyItems } from '../dummydata';
import { useTheme } from '../../contexts/ThemeContext';

const ItemMasterComponent = () => {
    const [items, setItems] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const { isDarkMode } = useTheme();

    const fetchItems = async (page = 1) => {
        // TODO: Replace with actual API call
        const dummyData = [
            { id: 1, code: 'ITEM001', name: 'Item A', type: 'Product', sacHsnCode: 'HSN001', category: 'Category A', igst: 18, cgst: 9, sgst: 9 },
            { id: 2, code: 'ITEM002', name: 'Item B', type: 'Service', sacHsnCode: 'SAC001', category: 'Category B', igst: 12, cgst: 6, sgst: 6 },
            // Add more dummy data as needed
        ];
        setItems(dummyData);
        setTotalPages(1); // Update this when implementing actual pagination
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleCreateNew = () => {
        console.log('Create new item');
        // Implement create new functionality
    };

    const columns = [
        { header: 'Code', key: 'code' },
        { header: 'Name', key: 'name' },
        { header: 'Type', key: 'type' },
        { header: 'SAC/HSN Code', key: 'sacHsnCode' },
        { header: 'Category', key: 'category' },
        { header: 'IGST', key: 'igst', render: (item) => `${item.igst}%` },
        { header: 'CGST', key: 'cgst', render: (item) => `${item.cgst}%` },
        { header: 'SGST', key: 'sgst', render: (item) => `${item.sgst}%` },
    ];

    return (
        <ListComponent
            title="Item Master"
            data={items}
            columns={columns}
            onFetch={fetchItems}
            totalPages={totalPages}
            onCreateNew={handleCreateNew}
        />
    );
};

export { ItemMasterComponent };