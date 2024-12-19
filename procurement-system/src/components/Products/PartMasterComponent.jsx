import { useState, useEffect } from 'react';
import { Table, Modal, Button, Input, Space, Card, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import PartForm from './partForm';
import { toast } from 'react-toastify';
import { baseURL } from '../../utils/endpoint';

const { Title } = Typography;
const { Search } = Input;

const PartMasterComponent = () => {
    const { isDarkMode } = useTheme();
    const [parts, setParts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editingPart, setEditingPart] = useState(null);
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

    const fetchParts = async (page = 1, limit = 10, search = '') => {
        try {
            setIsLoading(true);
            const endpoint = `${baseURL}/parts/allParts?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;
            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setParts(response.data.data || []);
            setTotalPages(response.data.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Error fetching parts:', error);
            toast.error('Failed to fetch parts', toastConfig);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchParts();
    }, []);

    const handleEdit = (record) => {
        setEditingPart(record);
        setIsModalOpen(true);
    };

    const handleDelete = (id, name) => {
        Modal.confirm({
            title: 'Delete Part',
            content: `Are you sure you want to delete ${name}?`,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await axios.delete(`${baseURL}/parts/deletePart/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    toast.success('Part deleted successfully', toastConfig);
                    fetchParts();
                } catch (error) {
                    toast.error('Failed to delete part', toastConfig);
                }
            }
        });
    };

    const handleSubmit = async (formData) => {
        try {
            setIsLoading(true);
            if (editingPart) {
                await axios.put(
                    `${baseURL}/parts/updatePart/${editingPart._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success('Part updated successfully', toastConfig);
            } else {
                await axios.post(
                    `${baseURL}/parts`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success('Part created successfully', toastConfig);
            }
            setIsModalOpen(false);
            fetchParts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save part', toastConfig);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = [
        {
            title: 'Part Number',
            dataIndex: 'PartCodeNumber',
            key: 'PartCodeNumber',
            sorter: (a, b) => (a.PartCodeNumber || '').localeCompare(b.PartCodeNumber || ''),
        },
        {
            title: 'Item Code',
            dataIndex: 'ItemCode',
            key: 'ItemCode',
        },
        {
            title: 'Item Name',
            dataIndex: 'ItemName',
            key: 'ItemName',
        },
        {
            title: 'Size',
            dataIndex: 'SizeName',
            key: 'SizeName',
        },
        {
            title: 'Colour',
            dataIndex: 'ColourName',
            key: 'ColourName',
        },
        {
            title: 'Serial Number',
            dataIndex: 'SerialNumber',
            key: 'SerialNumber',
        },
        {
            title: 'Maker',
            dataIndex: 'ItemMakeName',
            key: 'ItemMakeName',
        },
        {
            title: 'Measurement Unit',
            dataIndex: 'MeasurementUnit',
            key: 'MeasurementUnit',
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
                        onClick={() => handleDelete(record._id, record.PartCodeNumber)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <Card className="">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Space className="flex justify-between">
                    <Title level={4}>Parts</Title>
                    <Space>
                        <Search
                            placeholder="Search parts..."
                            onSearch={(value) => fetchParts(1, 10, value)}
                            style={{ width: 250 }}
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setEditingPart(null);
                                setIsModalOpen(true);
                            }}
                        >
                            Add Part
                        </Button>
                    </Space>
                </Space>

                <Table
                    columns={columns}
                    dataSource={parts}
                    rowKey="_id"
                    loading={isLoading}
                    pagination={{
                        total: totalPages * 10,
                        pageSize: 10,
                        onChange: (page) => fetchParts(page),
                    }}
                />
            </Space>

            <Modal
                title={editingPart ? 'Edit Part' : 'Create New Part'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                width={1000}
                footer={null}
                destroyOnClose
            >
                <PartForm
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={isLoading}
                    initialData={editingPart}
                />
            </Modal>
        </Card>
    );
};

export { PartMasterComponent };