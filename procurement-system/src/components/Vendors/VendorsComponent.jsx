import { useState, useEffect } from 'react';
import ListComponent from '../common/ListComponent';
import VendorForm from './VendorForm';
import axios from 'axios';
import { Trash2, X, Pencil } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';
import { baseURL } from '../../utils/endpoint';
import { Modal, Table, Button, Input, Space, Card, Typography, Form } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;

const VendorsComponent = () => {
    const { isDarkMode } = useTheme();
    const [vendors, setVendors] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingVendor, setEditingVendor] = useState(null);
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [tempFormData, setTempFormData] = useState(null);
    const [passwordData, setPasswordData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');

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
                `${baseURL}/vendors?page=${page}&limit=${limit}&search=${search}`,
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
        setEditingVendor(null);
        setIsModalOpen(true);
        setError(null);
    };

    const handleEdit = (vendor) => {
        setEditingVendor(vendor);
        setIsModalOpen(true);
        setError(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingVendor(null);
        setError(null);
    };

    const handleSubmit = async (formData) => {
        try {
            setError(null);
            
            if (editingVendor) {
                setIsLoading(true);
                await axios.put(
                    `${baseURL}/vendors/${editingVendor._id}`,
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${getToken()}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                toast.success('Vendor updated successfully!', toastConfig);
                await fetchVendors();
                setIsModalOpen(false);
                setEditingVendor(null);
            } else {
                // For new vendor, show password modal
                setTempFormData(formData);
                setIsModalOpen(false);
                setIsPasswordModalVisible(true);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || `Failed to ${editingVendor ? 'update' : 'register'} vendor`;
            setError(errorMessage);
            toast.error(errorMessage, toastConfig);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async () => {
        const [form] = Form.useForm();
        const values = await form.validateFields();
        
        if (values.password !== values.confirmPassword) {
            setPasswordError("Passwords don't match");
            return;
        }
        if (values.password.length < 6) {
            setPasswordError("Password must be at least 6 characters long");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const completeData = {
                ...tempFormData,
                password: values.password
            };

            await axios.post(
                `${baseURL}/auth/vendor-register`,
                completeData,
                {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            toast.success('Vendor registered successfully!', toastConfig);
            await fetchVendors();
            setIsPasswordModalVisible(false);
            form.resetFields();
            setTempFormData(null);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to register vendor';
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
                                        `${baseURL}/vendors/${vendorId}`,
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

    const antColumns = [
        {
            title: 'Vendor Code',
            dataIndex: 'vendorCode',
            key: 'vendorCode',
            sorter: (a, b) => {
                // Handle cases where vendorCode might be undefined or null
                const codeA = a.vendorCode || '';
                const codeB = b.vendorCode || '';
                return codeA.toString().localeCompare(codeB.toString());
            },
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => {
                // Handle cases where name might be undefined or null
                const nameA = a.name || '';
                const nameB = b.name || '';
                return nameA.toString().localeCompare(nameB.toString());
            },
        },
        {
            title: 'Contact Person',
            dataIndex: 'contactPerson',
            key: 'contactPerson',
        },
        {
            title: 'Mobile',
            dataIndex: 'mobileNumber',
            key: 'mobileNumber',
        },
        {
            title: 'City',
            dataIndex: ['address', 'city'],
            key: 'city',
        },
        {
            title: 'State',
            dataIndex: ['address', 'state'],
            key: 'state',
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
                        onClick={() => handleDeleteVendor(record._id, record.name)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <Card className="">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Space className="flex justify-between">
                    <Title level={4}>Vendors</Title>
                    <Space>
                        <Search
                            placeholder="Search vendors..."
                            onSearch={(value) => fetchVendors(1, 5, value)}
                            style={{ width: 250 }}
                        />
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={handleCreateNew}
                        >
                            Add Vendor
                        </Button>
                    </Space>
                </Space>

                <Table
                    columns={antColumns}
                    dataSource={vendors}
                    rowKey="_id"
                    loading={isLoading}
                    pagination={{
                        total: totalPages * 5,
                        pageSize: 5,
                        onChange: (page) => fetchVendors(page),
                    }}
                />
            </Space>

            <Modal
                title={editingVendor ? 'Edit Vendor' : 'Create New Vendor'}
                open={isModalOpen}
                onCancel={handleCloseModal}
                width={1000}
                footer={null}
                destroyOnClose
            >
                <VendorForm
                    onSubmit={handleSubmit}
                    onCancel={handleCloseModal}
                    isLoading={isLoading}
                    initialData={editingVendor}
                />
            </Modal>

            <Modal
                title="Set Vendor Password"
                open={isPasswordModalVisible}
                onCancel={() => {
                    setIsPasswordModalVisible(false);
                    setPasswordError('');
                }}
                onOk={handlePasswordSubmit}
                confirmLoading={isLoading}
                destroyOnClose
            >
                <Form layout="vertical">
                    <Form.Item 
                        label="Password" 
                        name="password"
                        rules={[
                            { required: true, message: 'Please input password' },
                            { min: 6, message: 'Password must be at least 6 characters' }
                        ]}
                        validateStatus={passwordError ? 'error' : ''}
                        help={passwordError}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item 
                        label="Confirm Password"
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Please confirm password' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Passwords do not match'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export { VendorsComponent };