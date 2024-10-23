import { useState, useEffect } from 'react';
import ListComponent from '../common/ListComponent';
import VendorForm from './VendorForm';
import axios from 'axios';
import { Trash2, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';

const VendorsComponent = () => {
    const { isDarkMode } = useTheme();
    const [vendors, setVendors] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

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

    const fetchVendors = async (page = 1, limit = 5, search = '') => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(
                `http://localhost:5000/api/vendors?page=${page}&limit=${limit}&search=${search}`,
                {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                }
            );
            setVendors(response.data.vendors || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (err) {
            const errorMessage = 'Failed to fetch vendors. Please try again later.';
            console.error('Error fetching vendors:', err);
            setError(errorMessage);
            toast.error(errorMessage, toastConfig);
            setVendors([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleCloseModal();
            }
        };

        if (isModalOpen) {
            document.addEventListener('keydown', handleEscape);
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
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setError(null);
    };

    const handleSubmit = async (formData) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.post(
                'http://localhost:5000/api/vendors/',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            toast.success('Vendor created successfully!', toastConfig);
            await fetchVendors();
            setIsModalOpen(false);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to create vendor. Please try again.';
            console.error('Error creating vendor:', err);
            setError(errorMessage);
            toast.error(errorMessage, toastConfig);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteVendor = (vendorId, vendorName) => {
        toast(
            ({ closeToast }) => (
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-2">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        <span className="font-medium">Delete Vendor</span>
                    </div>
                    <p>Are you sure you want to delete this vendor? This action cannot be undone.</p>
                    {vendorName && (
                        <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <span className="font-medium">{vendorName}</span>
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
                                        `http://localhost:5000/api/vendors/${vendorId}`,
                                        {
                                            headers: { 'Authorization': `Bearer ${getToken()}` }
                                        }
                                    );
                                    toast.success('Vendor deleted successfully', toastConfig);
                                    await fetchVendors();
                                } catch (err) {
                                    toast.error('Failed to delete vendor. Please try again.', toastConfig);
                                    console.error('Error deleting vendor:', err);
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
        { header: 'Vendor Code', key: 'vendorCode' },
        { header: 'Name', key: 'name' },
        { header: 'Contact Person', key: 'contactPerson' },
        { header: 'Mobile', key: 'mobileNumber' },
        { header: 'City', key: 'address', render: (item) => item.address?.city || '-' },
        { header: 'State', key: 'address', render: (item) => item.address?.state || '-' },
        {
            header: 'Actions',
            key: 'actions',
            render: (item) => (
                <button
                    onClick={() => handleDeleteVendor(item._id, item.name)}
                    className="text-red-600 ml-5 hover:text-red-900 focus:outline-none p-1 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete Vendor"
                    disabled={isLoading}
                >
                    <Trash2 size={20} />
                </button>
            )
        }
    ];

    return (
        <div className="container p-6">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                    role="alert"
                >
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

            {/* Modal */}
            {isModalOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                        onClick={handleCloseModal}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className={`relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-lg shadow-xl
                                ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 border-b shrink-0">
                                <h2 className="text-xl font-bold">Create New Vendor</h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-500 hover:text-gray-700 focus:outline-none p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-4 min-h-0">
                                <VendorForm
                                    onSubmit={handleSubmit}
                                    onCancel={handleCloseModal}
                                    isLoading={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export { VendorsComponent };