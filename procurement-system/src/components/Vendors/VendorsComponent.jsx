import { useState, useEffect } from 'react';
import ListComponent from '../common/ListComponent';
import { useTheme } from '../../contexts/ThemeContext';
import Modal from '../common/Modal';
import VendorForm from './VendorForm';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

const VendorsComponent = () => {
    const [vendors, setVendors] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [responseData, setResponseData] = useState(null);
    const { isDarkMode } = useTheme();

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

    // const handleCreateNew = () => {
    //     setIsModalOpen(true);
    //     setError(null);
    //     setResponseData(null);
    // };

    // const handleCloseModal = () => {
    //     setIsModalOpen(false);
    //     setError(null);
    //     setResponseData(null);
    // };

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
            fetchVendors(); // Refresh the list after creating a new vendor
            setIsModalOpen(false); // Close the modal after successful creation
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
                // Refresh the vendor list after successful deletion
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
                    className={`p-2 rounded ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
                    title="Delete Vendor"
                >
                    <Trash2 size={20} />
                </button>
            )
        }
    ];


    return (
        <div className="container">

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
            </div>}

            <ListComponent
                title="Vendors"
                data={vendors}
                columns={columns}
                onFetch={fetchVendors}
                totalPages={totalPages}
                onCreateNew={() => setIsModalOpen(true)}
                isLoading={isLoading}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Vendor"
                size="lg"
            >
                {responseData && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Success!</strong>
                        <span className="block sm:inline"> Vendor created successfully! ID: {responseData._id}</span>
                    </div>
                )}
                <VendorForm
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={isLoading}
                />
            </Modal>
        </div>
    );
};

export { VendorsComponent };