/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import ListComponent from '../common/ListComponent';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import PartForm from './partForm';
import { Trash2 } from 'lucide-react';

const PartModal = ({ isOpen, onClose, title, children }) => {
    const { isDarkMode } = useTheme();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className={`rounded-lg shadow-xl w-11/12 max-w-4xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
                <div className="border-b px-4 py-2 flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <button onClick={onClose} className="text-2xl">&times;</button>
                </div>
                <div className="p-4 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

const PartMasterComponent = () => {
    const [parts, setParts] = useState([]);
    const { isDarkMode } = useTheme();
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 15
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [token, setToken] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const fetchParts = async (page = 1, query = '') => {
        if (!token) {
            console.error('No token available');
            return;
        }

        try {
            // const response = await axios.get(`http://localhost:5000/api/parts/search?page=${page}&query=${query}`, {
            const response = await axios.get(`http://localhost:5000/api/parts/allParts?page=${page}`, {

                headers: { Authorization: `Bearer ${token}` }
            });
            setParts(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching parts:', error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchParts();
            // fetchParts(1, searchQuery);
        }
    }, [token]);
    // }, [token, searchQuery]);

    const handleCreateNew = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (formData) => {
        try {

            // const response = await axios.post('http://localhost:5000/api/parts', formData, {
            const response = await axios.post('http://localhost:5000/api/parts/createPart', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('New Part:', response.data);
            setIsModalOpen(false);
            fetchParts(); // Refresh the list
        } catch (error) {
            console.error('Error creating part:', error);
            // TODO: Handle error (e.g., show error message to user)
        }
    };

    const handleDeletePart = async (partId) => {
        if (window.confirm('Are you sure you want to delete this part?')) {
            try {
                await axios.delete(`http://localhost:5000/api/parts/deletePart/${partId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                fetchParts();
                // fetchParts(pagination.currentPage, searchQuery);
            } catch (err) {
                console.error('Error deleting part:', err);
                // TODO: Handle error (e.g., show error message to user)
            }
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const columns = [
        { header: 'Part Number', key: 'PartCodeNumber' },
        { header: 'Item Code', key: 'ItemCode' },
        { header: 'Item Name', key: 'ItemName' },
        { header: 'Size', key: 'SizeName' },
        { header: 'Colour', key: 'ColourName' },
        { header: 'Serial Number', key: 'SerialNumber' },
        { header: 'Maker', key: 'ItemMakeName' },
        { header: 'Measurement Unit', key: 'MeasurementUnit' },
        {
            header: 'Actions',
            key: 'actions',
            render: (part) => (
                <button
                    onClick={() => handleDeletePart(part._id)}
                    className={`p-1 rounded ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
                    title="Delete Part"
                >
                    <Trash2 size={16} />
                </button>
            )
        }
    ];

    return (
        <>
            <ListComponent
                title="Part Master"
                data={parts}
                columns={columns}
                onFetch={fetchParts}
                pagination={pagination}
                onCreateNew={handleCreateNew}
                onSearch={handleSearch}
            />
            <PartModal isOpen={isModalOpen} onClose={handleCloseModal} title="Create New Part">
                <PartForm onSubmit={handleSubmit} onCancel={handleCloseModal} />
            </PartModal>
        </>
    );
};

export { PartMasterComponent };
