import { useState, useEffect } from 'react';
import ListComponent from '../common/ListComponent';
import VendorForm from './VendorForm';
import axios from 'axios';
import { Trash2, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const VendorsComponent = () => {
    const { isDarkMode } = useTheme();
    const [vendors, setVendors] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [responseData, setResponseData] = useState(null);

    const getToken = () => {
        return localStorage.getItem('token');
    };

    const fetchVendors = async (page = 1, limit = 5, search = '') => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(`http://localhost:5000/api/vendors?page=${page}&limit=${limit}&search=${search}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            setVendors(response.data.vendors || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (err) {
            console.error('Error fetching vendors:', err);
            setError('Failed to fetch vendors. Please try again later.');
            setVendors([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    // Close modal on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleCloseModal();
            }
        };

        if (isModalOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);

    const handleCreateNew = () => {
        setIsModalOpen(true);
        setError(null);
        setResponseData(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setError(null);
        setResponseData(null);
    };

    const handleSubmit = async (formData) => {
        try {
            setIsLoading(true);
            setError(null);
            setResponseData(null);
            const response = await axios.post('http://localhost:5000/api/vendors/', formData, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('New Vendor created:', response.data);
            setResponseData(response.data);
            fetchVendors();
            setIsModalOpen(false);
        } catch (err) {
            console.error('Error creating vendor:', err);
            setError(err.response?.data?.message || 'Failed to create vendor. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteVendor = async (vendorId) => {
        if (window.confirm('Are you sure you want to delete this vendor?')) {
            try {
                setIsLoading(true);
                await axios.delete(`http://localhost:5000/api/vendors/${vendorId}`, {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`
                    }
                });
                fetchVendors();
            } catch (err) {
                console.error('Error deleting vendor:', err);
                setError('Failed to delete vendor. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const columns = [
        { header: 'Vendor Code', key: 'vendorCode' },
        { header: 'Name', key: 'name' },
        { header: 'Contact Person', key: 'contactPerson' },
        { header: 'Mobile', key: 'mobileNumber' },
        { header: 'City', key: 'address', render: (item) => item.address?.city },
        { header: 'State', key: 'address', render: (item) => item.address?.state },
        {
            header: 'Actions',
            key: 'actions',
            render: (item) => (
                <button
                    onClick={() => handleDeleteVendor(item._id)}
                    className="text-red-600 ml-5 hover:text-red-900 focus:outline-none"
                    title="Delete Vendor"
                >
                    <Trash2 size={20} />
                </button>
            )
        }
    ];

    return (
        <div className="container p-6">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            <ListComponent
                title="Vendors"
                data={vendors}
                columns={columns}
                onFetch={fetchVendors}
                totalPages={totalPages}
                onCreateNew={handleCreateNew}
                isLoading={isLoading}
            />

            {/* Modal Backdrop */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleCloseModal} />
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className={`relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                            }`}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header - Fixed */}
                        <div className="flex items-center justify-between p-4 border-b shrink-0">
                            <h2 className="text-xl font-bold">Create New Vendor</h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4 min-h-0">
                            {responseData && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                                    <strong className="font-bold">Success!</strong>
                                    <span className="block sm:inline"> Vendor created successfully! ID: {responseData._id}</span>
                                </div>
                            )}
                            <VendorForm
                                onSubmit={handleSubmit}
                                onCancel={handleCloseModal}
                                isLoading={isLoading}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export { VendorsComponent };