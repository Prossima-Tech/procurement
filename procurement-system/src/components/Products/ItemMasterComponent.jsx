/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import ListComponent from '../common/ListComponent';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import ItemForm from './ItemForm';
import { Trash2, X, Pencil } from 'lucide-react';
import { toast } from 'react-toastify';

const ItemModal = ({ isOpen, onClose, title, children }) => {
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

const ItemMasterComponent = () => {
    const [items, setItems] = useState([]);
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
    const [editingItem, setEditingItem] = useState(null);

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

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const fetchItems = async (page = 1) => {
        if (!token) {
            toast.error('Authentication required', toastConfig);
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.get(`http://localhost:5000/api/items?page=${page}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItems(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching items:', error);
            toast.error('Failed to fetch items', toastConfig);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchItems();
        }
    }, [token]);

    const handleCreateNew = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };
    const handleSubmit = async (formData) => {
        try {
            setIsLoading(true);

            if (editingItem) {
                // Update existing item
                await axios.put(
                    `http://localhost:5000/api/items/${editingItem._id}`,
                    formData,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                toast.success('Item updated successfully', toastConfig);
            } else {
                // Create new item
                await axios.post(
                    'http://localhost:5000/api/items',
                    formData,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                toast.success('Item created successfully', toastConfig);
            }

            setIsModalOpen(false);
            setEditingItem(null);
            fetchItems(pagination.currentPage);
        } catch (error) {
            console.error('Error saving item:', error);
            toast.error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                `Failed to ${editingItem ? 'update' : 'create'} item`,
                toastConfig
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteItem = (itemId, itemName) => {
        toast(
            ({ closeToast }) => (
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-2">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        <span className="font-medium">Delete Item</span>
                    </div>
                    <p>Are you sure you want to delete this item? This action cannot be undone.</p>
                    {itemName && (
                        <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <span className="font-medium">{itemName}</span>
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
                                    await axios.delete(`http://localhost:5000/api/items/${itemId}`, {
                                        headers: { Authorization: `Bearer ${token}` }
                                    });
                                    toast.success('Item deleted successfully', toastConfig);
                                    fetchItems();
                                } catch (error) {
                                    toast.error('Failed to delete item', toastConfig);
                                    console.error('Error deleting item:', error);
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
        { header: 'Code', key: 'ItemCode' },
        { header: 'Name', key: 'ItemName' },
        { header: 'Type', key: 'type' },
        { header: 'SAC/HSN Code', key: 'SAC_HSN_Code' },
        { header: 'Category', key: 'ItemCategory' },
        { header: 'IGST', key: 'IGST_Rate', render: (item) => item.IGST_Rate ? `${item.IGST_Rate}%` : '-' },
        { header: 'CGST', key: 'CGST_Rate', render: (item) => item.CGST_Rate ? `${item.CGST_Rate}%` : '-' },
        { header: 'SGST', key: 'SGST_Rate', render: (item) => item.SGST_Rate ? `${item.SGST_Rate}%` : '-' },
        { header: 'UTGST', key: 'UTGST_Rate', render: (item) => item.UTGST_Rate ? `${item.UTGST_Rate}%` : '-' },
        {
            header: 'Actions',
            key: 'actions',
            render: (item) => (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900 focus:outline-none p-1 hover:bg-blue-50 rounded-full transition-colors"
                        title="Edit Item"
                        disabled={isLoading}
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={() => handleDeleteItem(item._id, item.ItemName)}
                        className="text-red-600 hover:text-red-900 focus:outline-none p-1 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Item"
                        disabled={isLoading}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <>
            <div className='p-6'>
                <ListComponent
                    title="Item Master"
                    data={items}
                    columns={columns}
                    onFetch={fetchItems}
                    pagination={pagination}
                    onCreateNew={() => {
                        setEditingItem(null);
                        setIsModalOpen(true);
                    }}
                    isLoading={isLoading}
                />
            </div>
            <ItemModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingItem ? "Edit Item" : "Create New Item"}
            >
                <ItemForm
                    onSubmit={handleSubmit}
                    onCancel={handleCloseModal}
                    isLoading={isLoading}
                    initialData={editingItem}
                />
            </ItemModal>
        </>
    );
};

export { ItemMasterComponent };