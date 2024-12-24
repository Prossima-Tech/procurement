/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    Card,
    Button,
    Input,
    Select,
    Space,
    Tag,
    Modal,
    Form,
    InputNumber,
    Typography,
    Tabs,
    Divider,
    message,
    Row,
    Col
} from 'antd';
import {
    SearchOutlined,
    EyeOutlined,
    CheckOutlined,
    PlusOutlined,
    RollbackOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { baseURL } from '../../utils/endpoint';
import InspectionDetail from './InspectionDetail';

const { Title, Text } = Typography;

// Status Tag Component
const StatusTag = ({ status }) => {
    const colorMap = {
        pending: 'gold',
        in_progress: 'blue',
        completed: 'green',
        pass: 'green',
        fail: 'red',
        conditional: 'orange'
    };

    return (
        <Tag color={colorMap[status]}>
            {status.replace(/_/g, ' ').toUpperCase()}
        </Tag>
    );
};

const InspectionManagement = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [inspections, setInspections] = useState([]);
    const [pendingGRNs, setPendingGRNs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedInspection, setSelectedInspection] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        status: ''
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    // Fetch Data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: pagination.current.toString(),
                limit: pagination.pageSize.toString(),
                ...(filters.search && { search: filters.search }),
                ...(filters.status && { status: filters.status })
            });

            const response = await axios.get(`${baseURL}/inspection?${queryParams}`);
            if (response.data.success) {
                setInspections(response.data.data.inspections || []);
                setPendingGRNs(response.data.data.pendingGRNs || []);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination.total
                }));
            }
        } catch (error) {
            message.error('Failed to fetch inspections');
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.current, pagination.pageSize]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Create Inspection
    const handleCreateInspection = async (grn) => {
        try {
            setLoading(true);
            const inspectionItems = grn.items.map(item => ({
                grnItemId: item._id,
                partCode: item.partCode,
                receivedQuantity: item.receivedQuantity,
                itemDetails: {
                    partCodeNumber: item.partCode,
                    itemName: item.itemDetails?.itemName || item.masterItemName || 'N/A',
                    measurementUnit: item.itemDetails?.measurementUnit || item.masterMeasurementUnit || 'Units'
                }
            }));

            const response = await axios.post(`${baseURL}/inspection/create`, {
                grnId: grn._id,
                items: inspectionItems
            });

            if (response.data.success) {
                message.success('Inspection created successfully');
                fetchData();
            }
        } catch (error) {
            message.error('Failed to create inspection');
        } finally {
            setLoading(false);
        }
    };

    // Table Columns
    const pendingGRNColumns = [
        {
            title: 'GRN Number',
            dataIndex: 'grnNumber',
            key: 'grnNumber',
        },
        {
            title: 'Vendor',
            dataIndex: ['vendor', 'name'],
            key: 'vendor',
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Items',
            dataIndex: 'items',
            key: 'items',
            render: (items) => items?.length || 0,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleCreateInspection(record)}
                >
                    Move to Inspection
                </Button>
            ),
        },
    ];

    const inspectionColumns = [
        {
            title: 'Inspection Number',
            dataIndex: 'inspectionNumber',
            key: 'inspectionNumber',
        },
        {
            title: 'GRN',
            dataIndex: ['grn', 'grnNumber'],
            key: 'grn',
        },
        {
            title: 'Date',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <StatusTag status={status} />,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setSelectedInspection(record);
                            setIsModalOpen(true);
                        }}
                    >
                        View
                    </Button>
                    {record.status !== 'completed' && (
                        <Button
                            icon={<CheckOutlined />}
                            onClick={() => {
                                setSelectedInspection(record);
                                setIsModalOpen(true);
                            }}
                        >
                            Update
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    // Define tab items
    const tabItems = [
        {
            key: 'pending',
            label: 'Pending GRNs',
            children: (
                <Table
                    columns={pendingGRNColumns}
                    dataSource={pendingGRNs}
                    rowKey="_id"
                    loading={loading}
                    pagination={false}
                />
            ),
        },
        {
            key: 'inspections',
            label: 'Inspections',
            children: (
                <Table
                    columns={inspectionColumns}
                    dataSource={inspections}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        onChange: (page) => setPagination(prev => ({ ...prev, current: page }))
                    }}
                />
            ),
        },
    ];

    // Filter Components
    const FilterSection = () => (
        <Card style={{ marginBottom: 16 }}>
            <Row gutter={16}>
                <Col span={12}>
                    <Input
                        placeholder="Search inspections..."
                        prefix={<SearchOutlined />}
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                </Col>
                <Col span={8}>
                    <Select
                        placeholder="Select status"
                        value={filters.status}
                        onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                        style={{ width: '100%' }}
                    >
                        <Select.Option value="">All Status</Select.Option>
                        <Select.Option value="pending">Pending</Select.Option>
                        <Select.Option value="in_progress">In Progress</Select.Option>
                        <Select.Option value="completed">Completed</Select.Option>
                    </Select>
                </Col>
                <Col span={4}>
                    <Button type="primary" onClick={fetchData}>
                        Apply Filters
                    </Button>
                </Col>
            </Row>
        </Card>
    );

    return (
        <div style={{ padding: 24 }}>
            <Title level={4}>Inspection Management</Title>

            <FilterSection />

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
            />

            <Modal
                title={`Inspection: ${selectedInspection?.inspectionNumber}`}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setSelectedInspection(null);
                }}
                width={1000}
                footer={null}
            >
                {selectedInspection && (
                    <InspectionDetail
                        inspection={selectedInspection}
                        onClose={() => {
                            setIsModalOpen(false);
                            setSelectedInspection(null);
                            fetchData();
                        }}
                    />
                )}
            </Modal>
        </div>
    );
};

export default InspectionManagement;