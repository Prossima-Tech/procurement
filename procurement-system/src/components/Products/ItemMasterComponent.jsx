import { useState, useEffect } from 'react';
import { Table, Modal, Button, Input, Space, Card, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import ItemForm from './ItemForm';
import { toast } from 'react-toastify';
import { baseURL } from '../../utils/endpoint';

const { Title } = Typography;
const { Search } = Input;

const ItemMasterComponent = () => {
    const { isDarkMode } = useTheme();
    const [items, setItems] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [token] = useState(localStorage.getItem('token'));

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

    const fetchItems = async (page = 1, limit = 10, search = '') => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(
                `${baseURL}/items?page=${page}&limit=${limit}&search=${search}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setItems(response.data.data || []);
            setTotalPages(response.data.pagination?.totalPages || 1);
        } catch (err) {
            const errorMessage = 'Failed to fetch items. Please try again later.';
            console.error('Error fetching items:', err);
            setError(errorMessage);
            toast.error(errorMessage, toastConfig);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleCreateNew = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingItem(record);
        setIsModalOpen(true);
    };

    const handleDelete = async (id, name) => {
        Modal.confirm({
            title: 'Delete Item',
            content: `Are you sure you want to delete ${name}?`,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await axios.delete(`${baseURL}/items/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    toast.success('Item deleted successfully', toastConfig);
                    fetchItems();
                } catch (error) {
                    toast.error('Failed to delete item', toastConfig);
                }
            }
        });
    };

    const handleSubmit = async (formData) => {
        try {
            setIsLoading(true);
            if (editingItem) {
                await axios.put(
                    `${baseURL}/items/${editingItem._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success('Item updated successfully', toastConfig);
            } else {
                await axios.post(
                    `${baseURL}/items`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success('Item created successfully', toastConfig);
            }
            setIsModalOpen(false);
            fetchItems();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save item', toastConfig);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = [
        {
            title: 'Item Code',
            dataIndex: 'ItemCode',
            key: 'ItemCode',
            sorter: (a, b) => (a.ItemCode || '').localeCompare(b.ItemCode || ''),
        },
        {
            title: 'Name',
            dataIndex: 'ItemName',
            key: 'ItemName',
            sorter: (a, b) => (a.ItemName || '').localeCompare(b.ItemName || ''),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Category',
            dataIndex: 'ItemCategory',
            key: 'ItemCategory',
        },
        {
            title: 'SAC/HSN',
            dataIndex: 'SAC_HSN_Code',
            key: 'SAC_HSN_Code',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record._id, record.ItemName)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <Card className="">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Space className="flex justify-between">
                    <Title level={4}>Items</Title>
                    <Space>
                        <Search
                            placeholder="Search items..."
                            onSearch={(value) => fetchItems(1, 10, value)}
                            style={{ width: 250 }}
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreateNew}
                        >
                            Add Item
                        </Button>
                    </Space>
                </Space>

                <Table
                    columns={columns}
                    dataSource={items}
                    rowKey="_id"
                    loading={isLoading}
                    pagination={{
                        total: totalPages * 10,
                        pageSize: 10,
                        onChange: (page) => fetchItems(page),
                    }}
                />
            </Space>

            <Modal
                title={editingItem ? 'Edit Item' : 'Create New Item'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                width={1000}
                footer={null}
                destroyOnClose
            >
                <ItemForm
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={isLoading}
                    initialData={editingItem}
                />
            </Modal>
        </Card>
    );
};

export { ItemMasterComponent };