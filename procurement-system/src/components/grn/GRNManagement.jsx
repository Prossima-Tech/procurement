/* eslint-disable react/prop-types */
// components/grn/GRNManagement.js
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Plus, Search, Eye, Edit, Trash, } from 'lucide-react';
import { toast ,ToastContainer} from 'react-toastify';
import { baseURL } from '../../utils/endpoint';
import {
  Table,
  Button,
  Input,
  DatePicker,
  Select,
  Card,
  Tag,
  Space,
  Popconfirm,
  message,
  Form,
  InputNumber,
  Descriptions,
  Divider,
  Typography,
  Progress,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Add this function near the top of the file, alongside other utility functions
const getStatusTag = (status) => {
    const statusConfig = {
        draft: { color: 'default', label: 'Draft' },
        submitted: { color: 'processing', label: 'Submitted' },
        inspection_pending: { color: 'warning', label: 'Inspection Pending' },
        inspection_in_progress: { color: 'orange', label: 'Inspection In Progress' },
        inspection_completed: { color: 'success', label: 'Inspection Completed' },
        approved: { color: 'green', label: 'Approved' },
        rejected: { color: 'error', label: 'Rejected' }
    };

    const config = statusConfig[status] || { color: 'default', label: status };
    
    return (
        <Tag color={config.color}>
            {config.label.toUpperCase()}
        </Tag>
    );
};

// Main GRN Form Component
const GRNForm = ({ grn, onBack, onSuccess }) => {
    const [form] = Form.useForm();
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(false);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [selectedPO, setSelectedPO] = useState(null);
    const [formData, setFormData] = useState({
        purchaseOrder: '',
        challanNumber: '',
        challanDate: '',
        receivedDate: '',
        transportDetails: {
            vehicleNumber: '',
            transporterName: '',
            ewayBillNumber: '',
            freightTerms: '',
            freightAmount: 0
        },
        items: []
    });

    // Fetch PO list and details
    const fetchPurchaseOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseURL}/purchase-orders/getAllPOs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.purchaseOrders) {
                // Filter POs that are approved or partially delivered
                const eligiblePOs = data.purchaseOrders.filter(po =>
                    po.status === 'created' ||
                    po.status === 'in_progress' ||
                    po.deliveryStatus === 'partially_delivered'
                );
                setPurchaseOrders(eligiblePOs);
            } else {
                toast.error('No eligible purchase orders available');
            }
        } catch (error) {
            console.error('Error fetching POs:', error);
            toast.error('Failed to fetch purchase orders');
        }
    };

    const fetchPODetails = async (poId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseURL}/purchase-orders/getPO/${poId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const po = await response.json();

            if (!po) {
                throw new Error('Purchase order details not found');
            }

            setSelectedPO(po);
            console.log("po details:", po);

            setFormData(prev => ({
                ...prev,
                purchaseOrder: poId,
                items: po.items.map(item => {
                    // Use the delivery details from PO
                    const deliveredQty = item.deliveredQuantity || 0;
                    const pendingQty = item.pendingQuantity || (item.quantity - deliveredQty);

                    // Calculate GRN delivery history
                    const grnHistory = item.grnDeliveries?.map(delivery => ({
                        grnId: delivery.grnId,
                        receivedQuantity: delivery.receivedQuantity,
                        receivedDate: delivery.receivedDate,
                        status: delivery.status
                    })) || [];

                    return {
                        partId: item.partId,
                        partCode: item.partCode,
                        orderedQuantity: item.quantity,
                        receivedQuantity: 0, // Start with 0 for new GRN
                        pendingQuantity: pendingQty,
                        previouslyDelivered: deliveredQty,
                        grnDeliveries: grnHistory,
                        unitPrice: item.unitPrice,
                        totalPrice: 0,
                        remarks: '',
                        itemDetails: {
                            partCodeNumber: item.partCode?.PartCodeNumber || item.partCode,
                            itemName: item.masterItemName || item.itemDetails?.itemName,
                            itemCode: item.itemDetails?.itemCode || '',
                            measurementUnit: item.itemDetails?.measurementUnit || 'Units'
                        },
                        // Add delivery tracking
                        deliveryStatus: deliveredQty === item.quantity ? 'complete' :
                            deliveredQty > 0 ? 'partial' : 'pending',
                        deliveryHistory: grnHistory.map(delivery => ({
                            date: new Date(delivery.receivedDate).toLocaleDateString(),
                            quantity: delivery.receivedQuantity,
                            status: delivery.status
                        }))
                    };
                })
            }));

        } catch (error) {
            console.error('Error fetching PO details:', error);
            toast.error('Failed to fetch PO details');
        }
    };

    useEffect(() => {
        if (!grn) {
            fetchPurchaseOrders();
        }
    }, [grn]);

    useEffect(() => {
        if (grn) {
            setFormData({
                ...grn,
                challanDate: grn.challanDate.split('T')[0],
                receivedDate: grn.receivedDate.split('T')[0]
            });
            if (grn.purchaseOrder) {
                fetchPODetails(grn.purchaseOrder);
            }
        }
    }, [grn]);

    // const handleSubmit = async (status = 'draft') => {
    //     try {
    //         setLoading(true);
    //         const method = grn ? 'PUT' : 'POST';
    //         const url = grn ? `${baseURL}/grn/${grn._id}` : `${baseURL}/grn`;

    //         const response = await fetch(url, {
    //             method,
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify({
    //                 ...formData,
    //                 status
    //             })
    //         });

    //         const data = await response.json();
    //         if (data.success) {
    //             toast.success(`GRN ${grn ? 'updated' : 'created'} successfully`);
    //             if (onSuccess) {
    //                 onSuccess(data.data); // Pass the new/updated GRN data
    //             }
    //             onBack();
    //         } else {
    //             toast.error(data.message);
    //         }
    //     } catch (error) {
    //         console.error('Error saving GRN:', error);
    //         toast.error('Failed to save GRN');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleSubmit = async (status = 'draft') => {
        try {
            setLoading(true);

            // Validate all quantities before submission
            for (const item of formData.items) {
                const totalDelivered = item.previouslyDelivered + item.receivedQuantity;
                if (totalDelivered > item.orderedQuantity) {
                    toast.error(`Total delivered quantity exceeds ordered quantity for ${item.itemDetails.partCodeNumber}`);
                    return;
                }
            }

            const submitData = {
                ...formData,
                status,
                items: formData.items.map(item => ({
                    ...item,
                    pendingQuantity: item.orderedQuantity - (item.previouslyDelivered + item.receivedQuantity)
                }))
            };

            const response = await fetch(
                grn ? `${baseURL}/grn/${grn._id}` : `${baseURL}/grn`,
                {
                    method: grn ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(submitData)
                }
            );

            const data = await response.json();
            if (data.success) {
                toast.success(`GRN ${grn ? 'updated' : 'created'} successfully`);
                if (onSuccess) onSuccess(data.data);
                onBack();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error saving GRN:', error);
            toast.error('Failed to save GRN');
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (index, value) => {
        if (!validateReceivedQuantity(index, Number(value))) {
            return;
        }

        const newItems = [...formData.items];
        newItems[index] = {
            ...newItems[index],
            receivedQuantity: Number(value),
            totalPrice: Number(value) * newItems[index].unitPrice
        };
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    // Add validation for received quantities
    const validateReceivedQuantity = (index, newQuantity) => {
        const item = formData.items[index];
        const pendingQty = item.orderedQuantity - item.previouslyDelivered;

        if (newQuantity > pendingQty) {
            toast.error(`Received quantity cannot exceed pending quantity (${pendingQty})`);
            return false;
        }
        if (newQuantity < 0) {
            toast.error('Received quantity cannot be negative');
            return false;
        }
        return true;
    };

    return (
        <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                    <Space>
                        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
                            Back
                        </Button>
                        <Typography.Title level={4}>
                            {grn ? 'Edit GRN' : 'Create New GRN'}
                        </Typography.Title>
                    </Space>
                    <Space>
                        <Button onClick={() => handleSubmit('draft')} loading={loading}>
                            Save as Draft
                        </Button>
                        <Button type="primary" onClick={() => handleSubmit('submitted')} loading={loading}>
                            Submit GRN
                        </Button>
                    </Space>
                </Space>

                <Form
                    form={form}
                    layout="vertical"
                    initialValues={formData}
                    onValuesChange={(_, values) => setFormData(values)}
                >
                    <Card title="Basic Details" style={{ marginBottom: 16 }}>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name="purchaseOrder"
                                    label="Purchase Order"
                                    rules={[{ required: true, message: 'Please select a Purchase Order' }]}
                                >
                                    <Select
                                        placeholder="Select Purchase Order"
                                        onChange={(value) => fetchPODetails(value)}
                                        loading={loading}
                                    >
                                        {purchaseOrders.map(po => (
                                            <Select.Option key={po._id} value={po._id}>
                                                {po.poCode}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="challanNumber"
                                    label="Challan Number"
                                    rules={[{ required: true, message: 'Please enter Challan Number' }]}
                                >
                                    <Input placeholder="Enter Challan Number" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="challanDate"
                                    label="Challan Date"
                                    rules={[{ required: true, message: 'Please select Challan Date' }]}
                                >
                                    <DatePicker style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name="receivedDate"
                                    label="Received Date"
                                    rules={[{ required: true, message: 'Please select Received Date' }]}
                                >
                                    <DatePicker style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    <Card title="Transport Details" style={{ marginBottom: 16 }}>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name={['transportDetails', 'vehicleNumber']}
                                    label="Vehicle Number"
                                >
                                    <Input placeholder="Enter Vehicle Number" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name={['transportDetails', 'transporterName']}
                                    label="Transporter Name"
                                >
                                    <Input placeholder="Enter Transporter Name" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name={['transportDetails', 'ewayBillNumber']}
                                    label="E-way Bill Number"
                                >
                                    <Input placeholder="Enter E-way Bill Number" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name={['transportDetails', 'freightTerms']}
                                    label="Freight Terms"
                                >
                                    <Input placeholder="Enter Freight Terms" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name={['transportDetails', 'freightAmount']}
                                    label="Freight Amount"
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        placeholder="Enter Freight Amount"
                                        min={0}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    {selectedPO && (
                        <Card title="Items">
                            <Table
                                dataSource={formData.items}
                                rowKey="partId"
                                pagination={false}
                                columns={[
                                    {
                                        title: 'Part Code',
                                        dataIndex: ['itemDetails', 'partCodeNumber'],
                                        key: 'partCode'
                                    },
                                    {
                                        title: 'Item Name',
                                        dataIndex: ['itemDetails', 'itemName'],
                                        key: 'itemName'
                                    },
                                    {
                                        title: 'Ordered Qty',
                                        dataIndex: 'orderedQuantity',
                                        key: 'orderedQuantity'
                                    },
                                    {
                                        title: 'Pending Qty',
                                        dataIndex: 'pendingQuantity',
                                        key: 'pendingQuantity'
                                    },
                                    {
                                        title: 'Received Qty',
                                        key: 'receivedQuantity',
                                        render: (_, record, index) => (
                                            <InputNumber
                                                min={0}
                                                max={record.pendingQuantity}
                                                value={record.receivedQuantity}
                                                onChange={(value) => handleQuantityChange(index, value)}
                                            />
                                        )
                                    },
                                    {
                                        title: 'Unit Price',
                                        dataIndex: 'unitPrice',
                                        key: 'unitPrice',
                                        render: (price) => `₹${price.toLocaleString()}`
                                    },
                                    {
                                        title: 'Total Price',
                                        dataIndex: 'totalPrice',
                                        key: 'totalPrice',
                                        render: (price) => `₹${price.toLocaleString()}`
                                    }
                                ]}
                            />
                        </Card>
                    )}
                </Form>
            </Space>
        </Card>
    );
};

// GRN View Component
const GRNView = ({ grn, onBack }) => {
    const { isDarkMode } = useTheme();

    // Define the columns for the items table
    const itemColumns = [
        {
            title: 'Part Code',
            dataIndex: ['itemDetails', 'partCodeNumber'],
            key: 'partCode'
        },
        {
            title: 'Item Name',
            dataIndex: ['itemDetails', 'itemName'],
            key: 'itemName'
        },
        {
            title: 'Ordered Qty',
            dataIndex: 'orderedQuantity',
            key: 'orderedQuantity'
        },
        {
            title: 'Received Qty',
            dataIndex: 'receivedQuantity',
            key: 'receivedQuantity'
        },
        {
            title: 'Delivery Status',
            key: 'deliveryStatus',
            render: (_, record) => getDeliveryStatusBadge(record)
        },
        {
            title: 'Progress',
            key: 'progress',
            render: (_, record) => <DeliveryProgress item={record} />
        },
        {
            title: 'Unit Price',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            render: (price) => `₹${price.toLocaleString()}`
        },
        {
            title: 'Total Price',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (price) => `₹${price.toLocaleString()}`
        }
    ];

    return (
        <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
                        Back
                    </Button>
                    <Typography.Title level={4}>
                        GRN: {grn.grnNumber}
                    </Typography.Title>
                    {getStatusTag(grn.status)}
                </Space>

                <Descriptions bordered>
                    <Descriptions.Item label="PO Number">{grn.purchaseOrder?.poCode}</Descriptions.Item>
                    <Descriptions.Item label="Vendor">{grn.vendor?.name}</Descriptions.Item>
                    <Descriptions.Item label="Challan Number">{grn.challanNumber}</Descriptions.Item>
                    <Descriptions.Item label="Challan Date">
                        {dayjs(grn.challanDate).format('DD/MM/YYYY')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Received Date">
                        {dayjs(grn.receivedDate).format('DD/MM/YYYY')}
                    </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Items</Divider>
                <Table
                    columns={itemColumns}
                    dataSource={grn.items}
                    rowKey="partId"
                    pagination={false}
                />
            </Space>
        </Card>
    );
};


const getDeliveryStatusBadge = (item) => {
    const delivered = item.previouslyDelivered + item.receivedQuantity;
    const percentage = (delivered / item.orderedQuantity) * 100;

    if (percentage === 0) return (
        <Tag color="default">Pending</Tag>
    );
    if (percentage === 100) return (
        <Tag color="success">Complete</Tag>
    );
    return (
        <Tag color="warning">
            Partial ({percentage.toFixed(0)}%)
        </Tag>
    );
};

const DeliveryProgress = ({ item }) => {
    const delivered = item.previouslyDelivered + item.receivedQuantity;
    const percentage = (delivered / item.orderedQuantity) * 100;

    return (
        <div style={{ width: '100%' }}>
            <Progress 
                percent={percentage} 
                size="small" 
                status={percentage === 100 ? "success" : "active"}
            />
            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                {delivered} of {item.orderedQuantity} delivered
            </Typography.Text>
        </div>
    );
};

// Main GRN Component
export const GRNComponent = () => {
    const { isDarkMode } = useTheme();
    const [view, setView] = useState('list');
    const [selectedGRN, setSelectedGRN] = useState(null);
    const [grns, setGRNs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        dateFrom: '',
        dateTo: '',
        status: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    const fetchGRNs = useCallback(async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: pagination.currentPage.toString(),
                limit: pagination.itemsPerPage.toString(),
                ...(filters.search && { search: filters.search }),
                ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
                ...(filters.dateTo && { dateTo: filters.dateTo }),
                ...(filters.status && { status: filters.status })
            });

            // Add token if you have authentication
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Uncomment if using auth
            };

            const response = await fetch(
                `${baseURL}/grn?${queryParams.toString()}`,
                { headers }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('GRN Response:', data); // For debugging

            if (data.success) {
                setGRNs(data.data);
                setPagination(prev => ({
                    ...prev,
                    totalPages: data.pagination.pages,
                    totalItems: data.pagination.total
                }));
            } else {
                toast.error(data.message || 'Failed to fetch GRNs');
            }
        } catch (error) {
            console.error('Error fetching GRNs:', error);
            toast.error('Failed to fetch GRNs: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.currentPage, pagination.itemsPerPage, baseURL]);

    useEffect(() => {
        fetchGRNs();
    }, [fetchGRNs]);

    const handleCreateGRN = () => {
        setSelectedGRN(null);
        setView('create');
    };

    const handleEditGRN = (grn) => {
        setSelectedGRN(grn);
        setView('edit');
    };

    const handleViewGRN = (grn) => {
        setSelectedGRN(grn);
        setView('view');
    };

    const handleDeleteGRN = async (grnId) => {
        if (window.confirm('Are you sure you want to delete this GRN?')) {
            try {
                const response = await fetch(`${baseURL}/api/grn/${grnId}`, {
                    method: 'DELETE'
                });
                const data = await response.json();

                if (data.success) {
                    toast.success('GRN deleted successfully');
                    fetchGRNs();
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                console.error('Error deleting GRN:', error);
                toast.error('Failed to delete GRN');
            }
        }
    };

    const getStatusBadgeColor = (status) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800',
            submitted: 'bg-blue-100 text-blue-800',
            inspection_pending: 'bg-yellow-100 text-yellow-800',
            inspection_in_progress: 'bg-orange-100 text-orange-800',
            inspection_completed: 'bg-green-100 text-green-800',
            approved: 'bg-emerald-100 text-emerald-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return colors[status] || colors.draft;
    };

    const columns = [
        {
            title: 'GRN Number',
            dataIndex: 'grnNumber',
            key: 'grnNumber',
            render: (text) => text
        },
        {
            title: 'PO Code',
            dataIndex: ['purchaseOrder', 'poCode'],
            key: 'poCode',
        },
        {
            title: 'Vendor',
            dataIndex: ['vendor', 'name'],
            key: 'vendor',
        },
        {
            title: 'Challan Date',
            dataIndex: 'challanDate',
            key: 'challanDate',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Total Value',
            dataIndex: 'totalValue',
            key: 'totalValue',
            render: (value) => `₹${value.toLocaleString()}`,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewGRN(record)}
                    />
                    {record.status === 'draft' && (
                        <>
                            <Button
                                type="link"
                                icon={<EditOutlined />}
                                onClick={() => handleEditGRN(record)}
                            />
                            <Popconfirm
                                title="Are you sure you want to delete this GRN?"
                                onConfirm={() => handleDeleteGRN(record._id)}
                            >
                                <Button type="link" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    const renderGRNList = () => (
        <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                    <Typography.Title level={4}>Goods Receipt Notes</Typography.Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreateGRN}
                    >
                        Create GRN
                    </Button>
                </Space>

                <Space style={{ width: '100%' }} wrap>
                    <Input
                        placeholder="Search..."
                        prefix={<SearchOutlined />}
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        style={{ width: 200 }}
                    />
                    <DatePicker
                        placeholder="Date From"
                        value={filters.dateFrom ? dayjs(filters.dateFrom) : null}
                        onChange={(date) => setFilters(prev => ({ 
                            ...prev, 
                            dateFrom: date ? date.format('YYYY-MM-DD') : '' 
                        }))}
                    />
                    <DatePicker
                        placeholder="Date To"
                        value={filters.dateTo ? dayjs(filters.dateTo) : null}
                        onChange={(date) => setFilters(prev => ({ 
                            ...prev, 
                            dateTo: date ? date.format('YYYY-MM-DD') : '' 
                        }))}
                    />
                    <Select
                        style={{ width: 200 }}
                        value={filters.status}
                        onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                        placeholder="Select Status"
                    >
                        <Select.Option value="">All Status</Select.Option>
                        <Select.Option value="draft">Draft</Select.Option>
                        <Select.Option value="submitted">Submitted</Select.Option>
                        {/* ... other status options ... */}
                    </Select>
                </Space>

                <Table
                    columns={columns}
                    dataSource={grns}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        current: pagination.currentPage,
                        pageSize: pagination.itemsPerPage,
                        total: pagination.totalItems,
                        onChange: (page) => setPagination(prev => ({ ...prev, currentPage: page })),
                    }}
                />
            </Space>
        </Card>
    );

    const handleGRNSuccess = (newGRN) => {
        // Update the GRNs list with the new data
        setGRNs(prevGRNs => {
            if (newGRN._id) {
                // If editing, replace the existing GRN
                const updatedGRNs = prevGRNs.map(grn =>
                    grn._id === newGRN._id ? newGRN : grn
                );
                return updatedGRNs;
            } else {
                // If creating, add the new GRN to the beginning of the list
                return [newGRN, ...prevGRNs];
            }
        });

        // Reset view to list
        setView('list');

        // Refresh the list to ensure proper sorting and pagination
        fetchGRNs();
    };

    const renderContent = () => {
        switch (view) {
            case 'create':
                return <GRNForm
                    onBack={() => setView('list')}
                    onSuccess={handleGRNSuccess}
                />;
            case 'edit':
                return <GRNForm
                    grn={selectedGRN}
                    onBack={() => setView('list')}
                    onSuccess={handleGRNSuccess}
                />;
            case 'view':
                return <GRNView grn={selectedGRN} onBack={() => setView('list')} />;
            default:
                return renderGRNList();
        }
    };

    return (
        <div className={` ${isDarkMode ? 'bg-gray-800 text-white' : ' text-gray-800'}`}>
            {renderContent()}
        </div>
    );
};

export default GRNComponent;