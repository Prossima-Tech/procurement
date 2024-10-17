/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import ListComponent from '../common/ListComponent';
import { useTheme } from '../../contexts/ThemeContext';

const PartMasterComponent = () => {
    const [parts, setParts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const { isDarkMode } = useTheme();

    const fetchParts = async (page = 1) => {
        // TODO: Replace with actual API call
        const dummyData = [
            { id: 1, partNumber: 'PART001', description: 'Part A', size: 'Small', colour: 'Red', maker: 'Maker X', measurementUnit: 'Piece', price: 100 },
            { id: 2, partNumber: 'PART002', description: 'Part B', size: 'Medium', colour: 'Blue', maker: 'Maker Y', measurementUnit: 'Kg', price: 200 },
            // Add more dummy data as needed
        ];
        setParts(dummyData);
        setTotalPages(1); // Update this when implementing actual pagination
    };

    useEffect(() => {
        fetchParts();
    }, []);

    const handleCreateNew = () => {
        console.log('Create new part');
        // Implement create new functionality
    };

    const columns = [
        { header: 'Part Number', key: 'partNumber' },
        { header: 'Description', key: 'description' },
        { header: 'Size', key: 'size' },
        { header: 'Colour', key: 'colour' },
        { header: 'Maker', key: 'maker' },
        { header: 'Measurement Unit', key: 'measurementUnit' },
        { header: 'Price', key: 'price', render: (item) => `₹${item.price.toFixed(2)}` },
    ];

    return (
        <ListComponent
            title="Part Master"
            data={parts}
            columns={columns}
            onFetch={fetchParts}
            totalPages={totalPages}
            onCreateNew={handleCreateNew}
        />
    );
};

export { PartMasterComponent };