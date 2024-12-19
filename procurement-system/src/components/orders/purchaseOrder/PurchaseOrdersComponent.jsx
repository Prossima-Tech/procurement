import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Card, Modal, Input, Tag, message, Typography, Descriptions, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, SendOutlined, EyeOutlined } from '@ant-design/icons';
import { api, baseURL } from '../../../utils/endpoint';
import { useTheme } from '../../../contexts/ThemeContext';
import axios from 'axios';
import PurchaseOrderForm from './PurchaseOrderForm';

const { Title } = Typography;
const { TextArea } = Input;

const PurchaseOrdersComponent = () => {
    const [state, setState] = useState({
        purchaseOrders: [],
        totalPages: 1,
        currentPage: 1,
        isCreatingNew: false,
        isLoading: false,
        error: null,
        editingPO: null,
        selectedPO: null,
        notifyModalOpen: false,
        viewModalOpen: false,
        selectedViewPO: null,
    });

    const { isDarkMode } = useTheme();
    const getToken = () => localStorage.getItem('token');

    const fetchPurchaseOrders = useCallback(async (page = 1) => {
        try {
            setState(s => ({ ...s, isLoading: true, error: null }));
            const response = await api('/purchase-orders/getAllPOs?page=${page}&limit=10', 'get', null, { 'Authorization': `Bearer ${getToken()}` });

            const formattedOrders = response.data.purchaseOrders.map(po => ({
                _id: po._id,
                poCode: po.poCode,
                poDate: new Date(po.poDate).toLocaleDateString(),
                vendor: { name: po.vendorId?.name || 'N/A' },
                status: po.status || 'draft',
                deliveryStatus: po.deliveryStatus || 'pending',
                deliveryDate: po.deliveryDate,
                items: po.items || []
            }));

            setState(s => ({
                ...s,
                purchaseOrders: formattedOrders,
                totalPages: response.data.totalPages,
                currentPage: page,
                isLoading: false
            }));
        } catch (error) {
            message.error('Failed to fetch purchase orders');
            setState(s => ({ ...s, error: error.message, isLoading: false }));
        }
    }, []);

    useEffect(() => {
        fetchPurchaseOrders(state.currentPage);
    }, [state.currentPage, fetchPurchaseOrders]);

    const handlePrintPO = async (orderId) => {
        try {
            const response = await axios.get(
                `${baseURL}/purchase-orders/generatePdf/${orderId}`,
                {
                    headers: { 'Authorization': `Bearer ${getToken()}`, 'Accept': 'application/pdf' },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `PO_${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            message.success('PDF downloaded successfully');
        } catch (error) {
            message.error('Failed to generate PDF');
        }
    };

    const handleEdit = async (orderId) => {
        try {
            setState(s => ({ ...s, isLoading: true }));
            const response = await axios.get(`${baseURL}/purchase-orders/getPO/${orderId}`, { 'Authorization': `Bearer ${getToken()}` });
            const po = response.data;

            const formattedPO = {
                ...po,
                poDate: po.poDate ? new Date(po.poDate).toISOString().split('T')[0] : '',
                validUpto: po.validUpto ? new Date(po.validUpto).toISOString().split('T')[0] : '',
                deliveryDate: po.deliveryDate ? new Date(po.deliveryDate).toISOString().split('T')[0] : '',
                items: po.items.map(item => ({
                    partCode: item.partCode,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    masterItemName: item.masterItemName,
                    totalPrice: item.totalPrice
                }))
            };

            setState(s => ({
                ...s,
                editingPO: formattedPO,
                isCreatingNew: true,
                isLoading: false
            }));
        } catch (error) {
            message.error('Failed to fetch purchase order details');
            setState(s => ({ ...s, isLoading: false }));
        }
    };

    const handleDelete = async (orderId, poCode) => {
        Modal.confirm({
            title: 'Delete Purchase Order',
            content: `Are you sure you want to delete Purchase Order ${poCode}?`,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    setState(s => ({ ...s, isLoading: true }));
                    await axios.delete(`${baseURL}/purchase-orders/deletePO/${orderId}`, { 'Authorization': `Bearer ${getToken()}` });
                    message.success('Purchase Order deleted successfully');
                    fetchPurchaseOrders(
                        state.purchaseOrders.length === 1 && state.currentPage > 1
                            ? state.currentPage - 1
                            : state.currentPage
                    );
                } catch (error) {
                    message.error('Failed to delete purchase order');
                    setState(s => ({ ...s, isLoading: false }));
                }
            }
        });
    };

    const handleNotifyVendor = async (message) => {
        try {
            setState(s => ({ ...s, isLoading: true }));
            const response = await api(
                `/purchase-orders/notify-vendor/${state.selectedPO._id}`,
                'post',
                { customMessage: message }
            );

            if (response.data.success) {
                message.success('Vendor notification sent successfully');
            } else {
                throw new Error(response.data.message || 'Failed to send notification');
            }
        } catch (error) {
            message.error('Failed to send vendor notification');
        } finally {
            setState(s => ({
                ...s,
                isLoading: false,
                notifyModalOpen: false,
                selectedPO: null
            }));
        }
    };

    const handleViewPO = async (orderId) => {
        try {
            setState(s => ({ ...s, isLoading: true }));
            const response = await axios.get(
                `${baseURL}/purchase-orders/getPO/${orderId}`,
                { headers: { 'Authorization': `Bearer ${getToken()}` } }
            );
            setState(s => ({
                ...s,
                selectedViewPO: response.data,
                viewModalOpen: true,
                isLoading: false
            }));
        } catch (error) {
            message.error('Failed to fetch purchase order details');
            setState(s => ({ ...s, isLoading: false }));
        }
    };

    const handleFormSubmit = () => {
        setState(s => ({ ...s, isCreatingNew: false, editingPO: null }));
    };

    const columns = [
        {
            title: 'PO Code',
            dataIndex: 'poCode',
            key: 'poCode',
        },
        {
            title: 'Date',
            dataIndex: 'poDate',
            key: 'poDate',
        },
        {
            title: 'Vendor',
            dataIndex: ['vendor', 'name'],
            key: 'vendor',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = {
                    draft: 'default',
                    created: 'processing',
                    submitted: 'warning',
                    approved: 'success',
                    in_progress: 'processing',
                    partially_delivered: 'warning',
                    fully_delivered: 'success',
                    cancelled: 'error'
                };
                return (
                    <Tag color={colors[status] || 'default'}>
                        {status?.replace(/_/g, ' ').toUpperCase()}
                    </Tag>
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleViewPO(record._id)}
                        type="link"
                    />
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={() => handlePrintPO(record._id)}
                        type="primary"
                        ghost
                    />
                    <Button
                        icon={<SendOutlined />}
                        onClick={() => setState(s => ({ ...s, selectedPO: record, notifyModalOpen: true }))}
                        type="primary"
                    />
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record._id)}
                        disabled={['in_progress', 'grn_created'].includes(record.status)}
                        type="default"
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record._id, record.poCode)}
                        disabled={['in_progress', 'grn_created'].includes(record.status)}
                        danger
                    />
                </Space>
            )
        }
    ];

    return (
        <Card className="">
            <Space direction="vertical" size="large" className="w-full">
                <Space className="justify-between w-full">
                    <Title level={4}>
                        {state.isCreatingNew
                            ? `${state.editingPO ? 'Edit' : 'Create'} Purchase Order`
                            : 'Purchase Orders'
                        }
                    </Title>

                    {!state.isCreatingNew && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setState(s => ({ ...s, isCreatingNew: true }))}
                        >
                            New Order
                        </Button>
                    )}
                </Space>

                {state.isCreatingNew ? (
                    <PurchaseOrderForm
                        onCancel={() => setState(s => ({ ...s, isCreatingNew: false, editingPO: null }))}
                        initialData={state.editingPO}
                        isLoading={state.isLoading}
                        setIsLoading={(loading) => setState(s => ({ ...s, isLoading: loading }))}
                        fetchPurchaseOrders={fetchPurchaseOrders}
                        onSubmit={handleFormSubmit}
                    />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={state.purchaseOrders}
                        rowKey="_id"
                        loading={state.isLoading}
                        pagination={{
                            total: state.totalPages * 10,
                            current: state.currentPage,
                            onChange: (page) => fetchPurchaseOrders(page),
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                        }}
                    />
                )}

                <Modal
                    title="Notify Vendor"
                    open={state.notifyModalOpen}
                    onCancel={() => setState(s => ({ ...s, notifyModalOpen: false, selectedPO: null }))}
                    onOk={() => {
                        const message = document.getElementById('notificationMessage').value;
                        handleNotifyVendor(message);
                    }}
                >
                    <TextArea
                        id="notificationMessage"
                        rows={4}
                        placeholder="Enter notification message..."
                    />
                </Modal>

                <Modal
                    title={`Purchase Order Details: ${state.selectedViewPO?.poCode}`}
                    open={state.viewModalOpen}
                    onCancel={() => setState(s => ({ ...s, viewModalOpen: false, selectedViewPO: null }))}
                    width={800}
                    footer={null}
                >
                    {state.selectedViewPO && (
                        <Space direction="vertical" style={{ width: '100%' }} size="large">
                            <Descriptions bordered column={2}>
                                <Descriptions.Item label="PO Number">
                                    {state.selectedViewPO.poCode}
                                </Descriptions.Item>
                                <Descriptions.Item label="Vendor">
                                    {state.selectedViewPO.vendorId?.name}
                                </Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    <Tag color={
                                        state.selectedViewPO.status === 'approved' ? 'success' :
                                        state.selectedViewPO.status === 'draft' ? 'default' :
                                        'processing'
                                    }>
                                        {state.selectedViewPO.status?.toUpperCase()}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="PO Date">
                                    {new Date(state.selectedViewPO.poDate).toLocaleDateString()}
                                </Descriptions.Item>
                                <Descriptions.Item label="Delivery Date">
                                    {new Date(state.selectedViewPO.deliveryDate).toLocaleDateString()}
                                </Descriptions.Item>
                                <Descriptions.Item label="Valid Until">
                                    {new Date(state.selectedViewPO.validUpto).toLocaleDateString()}
                                </Descriptions.Item>
                            </Descriptions>

                            <Divider orientation="left">Items</Divider>
                            <Table
                                dataSource={state.selectedViewPO.items}
                                pagination={false}
                                columns={[
                                    {
                                        title: 'Part Code',
                                        dataIndex: ['partCode', 'PartCodeNumber'],
                                        key: 'partCode',
                                    },
                                    {
                                        title: 'Item Name',
                                        dataIndex: 'masterItemName',
                                        key: 'itemName',
                                    },
                                    {
                                        title: 'Quantity',
                                        dataIndex: 'quantity',
                                        key: 'quantity',
                                    },
                                    {
                                        title: 'Unit Price',
                                        dataIndex: 'unitPrice',
                                        key: 'unitPrice',
                                        render: (price) => `₹${price.toLocaleString()}`,
                                    },
                                    {
                                        title: 'Total Price',
                                        dataIndex: 'totalPrice',
                                        key: 'totalPrice',
                                        render: (price) => `₹${price.toLocaleString()}`,
                                    },
                                ]}
                            />
                        </Space>
                    )}
                </Modal>
            </Space>
        </Card>
    );
};

export { PurchaseOrdersComponent };