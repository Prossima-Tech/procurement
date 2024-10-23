/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import ListComponent from '../common/ListComponent';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import PartForm from './partForm';
import { Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';

const PartModal = ({ isOpen, onClose, title, children }) => {
    const { isDarkMode } = useTheme();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className={`rounded-lg shadow-xl w-11/12 max-w-4xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
                <div className="border-b p-4 flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
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
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Toast configuration
    const toastConfig = {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
            background: isDarkMode ? '#1F2937' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#1F2937',
        }
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const fetchParts = async (page = 1, query = '') => {
        if (!token) {
            toast.error('Authentication required', toastConfig);
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.get(
                `http://localhost:5000/api/parts/allParts?page=${page}${query ? `&search=${query}` : ''}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setParts(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching parts:', error);
            toast.error('Failed to fetch parts', toastConfig);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            const debounceTimer = setTimeout(() => {
                fetchParts(1, searchQuery);
            }, 300);
            return () => clearTimeout(debounceTimer);
        }
    }, [token, searchQuery]);

    const handleSubmit = async (formData) => {
        try {
            setIsLoading(true);
            const response = await axios.post(
                'http://localhost:5000/api/parts/createPart',
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success('Part created successfully', toastConfig);
            setIsModalOpen(false);
            fetchParts(pagination.currentPage, searchQuery);
        } catch (error) {
            console.error('Error creating part:', error);
            toast.error(error.response?.data?.message || 'Failed to create part', toastConfig);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleDeletePart = (partId, partName) => {
        toast(
            ({ closeToast }) => (
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-2">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        <span className="font-medium">Delete Part</span>
                    </div>
                    <p>Are you sure you want to delete this part? This action cannot be undone.</p>
                    {partName && (
                        <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <span className="font-medium">{partName}</span>
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
                                        `http://localhost:5000/api/parts/deletePart/${partId}`,
                                        {
                                            headers: { Authorization: `Bearer ${token}` }
                                        }
                                    );
                                    toast.success('Part deleted successfully', toastConfig);
                                    fetchParts(pagination.currentPage, searchQuery);
                                } catch (error) {
                                    toast.error('Failed to delete part', toastConfig);
                                    console.error('Error deleting part:', error);
                                } finally {
                                    setIsLoading(false);
                                    closeToast();
                                }
                            }}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"
                        >
                            Delete
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
                    onClick={() => handleDeletePart(part._id, part.PartCodeNumber)}
                    className="text-red-600 hover:text-red-900 focus:outline-none p-1 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete Part"
                    disabled={isLoading}
                >
                    <Trash2 size={16} />
                </button>
            )
        }
    ];

    return (
        <>
            <div className='p-6'>
                <ListComponent
                    title="Part Master"
                    data={parts}
                    columns={columns}
                    onFetch={fetchParts}
                    pagination={pagination}
                    onCreateNew={() => setIsModalOpen(true)}
                    onSearch={handleSearch}
                    isLoading={isLoading}
                />
            </div>
            <PartModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Part"
            >
                <PartForm
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={isLoading}
                />
            </PartModal>
        </>
    );
};

export { PartMasterComponent };