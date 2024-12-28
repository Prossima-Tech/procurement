import { useState, useEffect } from 'react';
import { Table, Modal, Button, Space, Card, Tabs, Tag, message, Typography, Input } from 'antd';
import { PlusOutlined, EyeOutlined, CheckOutlined, CloseOutlined, SendOutlined } from '@ant-design/icons';
import { useTheme } from '../../../contexts/ThemeContext';
import axios from 'axios';
import { baseURL } from '../../../utils/endpoint';
import CreateRfqModal from './CreateRfqModal';
import ViewRfqModal from './ViewRfqModal';
import VendorQuoteForm from './VendorQuoteForm';
import CreateDirectPOModal from './CreateDirectPOModal';

const { Title } = Typography;
const { TabPane } = Tabs;

const ITEM_STATUS = {
    AVAILABLE: 'available',
    RFQ_CREATED: 'rfq_created',
    RFQ_SENT: 'rfq_sent',
    PO_CREATED: 'po_created'
};

export const RequestForQuotationComponent = () => {
    const [activeTab, setActiveTab] = useState('indents');
    const [rfqs, setRfqs] = useState([]);
    const [approvedIndents, setApprovedIndents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndent, setSelectedIndent] = useState(null);
    const [isCreateRfqModalOpen, setIsCreateRfqModalOpen] = useState(false);
    const { isDarkMode } = useTheme();
    const [vendors, setVendors] = useState([]);
    const [selectedRfq, setSelectedRfq] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [isCreatePOModalOpen, setIsCreatePOModalOpen] = useState(false);
    const [notifyModalState, setNotifyModalState] = useState({
        isOpen: false,
        selectedRfq: null
    });

    // Add this function after your state declarations
    const handleViewRfq = (record) => {
        console.log('Viewing RFQ:', record); // Debug log
        setSelectedRfq(record);
        setIsViewModalOpen(true);
    };

    // Fetch approved indents
    const fetchApprovedIndents = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${baseURL}/indents`, {
                params: { status: 'manager_approved' },
                headers: { Authorization: `Bearer ${token}` }
            });

            // Filter indents that meet our criteria
            const filteredIndents = (response.data.data || []).filter(indent => {
                // Check existing items
                const existingItemsQualified = (indent.items?.existing || []).some(item =>
                    item.status === 'indent' || item.status !== 'rfq'
                );

                // Check new items
                const newItemsQualified = (indent.items?.new || []).some(item =>
                    item.status === 'indent'
                );

                // At least one group should have qualifying items
                return existingItemsQualified || newItemsQualified;
            });

            setApprovedIndents(filteredIndents);
        } catch (error) {
            console.error('Error fetching indents:', error);
            message.error('Failed to fetch approved indents');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch RFQs
    const fetchRfqs = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${baseURL}/rfq/getallRFQ`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRfqs(response.data.rfqs || []);
        } catch (error) {
            console.error('Error fetching RFQs:', error);
            message.error('Failed to fetch RFQs');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch vendors
    const fetchVendors = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${baseURL}/vendors`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVendors(response.data.vendors || []);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        }
    };

    useEffect(() => {
        if (activeTab === 'indents') {
            fetchApprovedIndents();
        } else {
            fetchRfqs();
        }
        fetchVendors();
    }, [activeTab]);

    // Helper function to get vendor name
    const getVendorName = (vendorId) => {
        const vendor = vendors.find(v => v._id === vendorId);
        return vendor ? vendor.name : 'Unknown Vendor';
    };

    const indentColumns = [
        {
            title: 'Indent Number',
            dataIndex: 'indentNumber',
            key: 'indentNumber',
        },
        {
            title: 'Created Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Unit',
            dataIndex: ['unit', 'unitName'],
            key: 'unit',
        },
        {
            title: 'Project',
            dataIndex: ['project', 'projectName'],
            key: 'project',
        },
        {
            title: 'Items Count',
            key: 'itemsCount',
            render: (record) => {
                const existingCount = record.items?.existing?.length || 0;
                const newCount = record.items?.new?.length || 0;
                return existingCount + newCount;
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'manager_approved' ? 'success' : 'default'}>
                    {status?.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        onClick={() => {
                            setSelectedIndent(record);
                            setIsCreateRfqModalOpen(true);
                        }}
                    >
                        Create RFQ
                    </Button>
                    <Button
                        type="primary"
                        className="bg-green-500"
                        onClick={() => {
                            setSelectedIndent(record);
                            setIsCreatePOModalOpen(true);
                        }}
                    >
                        Create PO
                    </Button>
                </Space>
            )
        }
    ];

    const handleOpenQuoteForm = (rfq, vendor) => {
        console.log('Opening quote form:', { rfq, vendor }); // Debug log
        setSelectedRfq(rfq);
        setSelectedVendor(vendor);
        setIsQuoteFormOpen(true);
    };

    const rfqColumns = [
        {
            title: 'RFQ Number',
            dataIndex: 'rfqNumber',
            key: 'rfqNumber',
        },
        {
            title: 'Indent Number',
            dataIndex: ['indent', 'indentNumber'],
            key: 'indentNumber',
        },
        {
            title: 'Items',
            key: 'items',
            render: (record) => (
                <div>
                    {record.items.map((item, index) => (
                        <div key={item._id} className="mb-1">
                            {item.name} ({item.quantity})
                            {index < record.items.length - 1 && ', '}
                        </div>
                    ))}
                </div>
            )
        },
        {
            title: 'Vendors',
            key: 'vendors',
            render: (record) => (
                <div>
                    {record.selectedVendors.map((vendorData, index) => (
                        <div key={vendorData._id} className="mb-1">
                            {getVendorName(vendorData.vendor)}
                            <span className="text-gray-500 text-sm ml-2">
                                ({vendorData.status})
                            </span>
                            {index < record.selectedVendors.length - 1 && ', '}
                        </div>
                    ))}
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span className={`px-2 py-1 rounded-full text-sm ${status === 'published' ? 'bg-green-100 text-green-800' :
                    status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                    }`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            )
        },
        {
            title: 'Submission Deadline',
            dataIndex: 'submissionDeadline',
            key: 'submissionDeadline',
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleViewRfq(record)}
                        type="link"
                    />
                    {record.status === 'published' && (
                        <>
                            <Button
                                icon={<SendOutlined />}
                                onClick={() => setNotifyModalState({
                                    isOpen: true,
                                    selectedRfq: record
                                })}
                                type="primary"
                                className="bg-blue-500"
                            >
                                Notify
                            </Button>
                            <Button
                                onClick={() => handleOpenQuoteForm(record, record.selectedVendors[0])}
                                type="primary"
                                className="bg-green-500"
                            >
                                Quote
                            </Button>
                        </>
                    )}
                </Space>
            )
        }
    ];

    const handleCloseCreateRfqModal = () => {
        setIsCreateRfqModalOpen(false);
        setSelectedIndent(null);
        if (activeTab === 'indents') {
            fetchApprovedIndents();
        } else {
            fetchRfqs();
        }
    };

    const handleCloseQuoteForm = () => {
        setIsQuoteFormOpen(false);
        setSelectedRfq(null);
        setSelectedVendor(null);
    };

    // Add this console log to check the data
    useEffect(() => {
        console.log('Current state:', {
            isQuoteFormOpen,
            selectedRfq,
            selectedVendor
        });
    }, [isQuoteFormOpen, selectedRfq, selectedVendor]);

    // Add notification handler
    const handleNotifyVendor = async (message) => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            
            // Get all vendor IDs from the selected RFQ
            const vendorIds = notifyModalState.selectedRfq.selectedVendors.map(v => v.vendor);
            
            const response = await axios.post(
                `${baseURL}/rfq/notify-vendors`,
                {
                    rfqId: notifyModalState.selectedRfq._id,
                    vendorIds: vendorIds,
                    submissionDeadline: notifyModalState.selectedRfq.submissionDeadline,
                    generalTerms: message
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                // Show success message from backend response if available
                message.success({
                    content: response.data.message || 'Vendors notified successfully',
                    duration: 5, // Show for 5 seconds
                    icon: <SendOutlined style={{ color: '#52c41a' }} /> // Add an icon
                });
                // Optionally refresh RFQ list
                fetchRfqs();
            }
        } catch (error) {
            console.error('Error notifying vendors:', error);
            // Show error message from backend if available
            message.error({
                content: error.response?.data?.message || 'Failed to notify vendors',
                duration: 5,
                icon: <AlertCircle className="text-red-500" />
            });
        } finally {
            setIsLoading(false);
            setNotifyModalState({ isOpen: false, selectedRfq: null });
        }
    };

    return (
        <Card className="">
            <Title level={4}>
                Request for Quotation
            </Title>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="RFQ List" key="rfqs" />
                <TabPane tab="Approved Indents" key="indents" />
            </Tabs>

            <Table
                dataSource={activeTab === 'indents' ? approvedIndents : rfqs}
                columns={activeTab === 'indents' ? indentColumns : rfqColumns}
                rowKey="_id"
                loading={isLoading}
                pagination={{
                    total: activeTab === 'indents' ? approvedIndents.length : rfqs.length,
                    pageSize: 10,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                }}
            />

            {/* Modals */}
            {isCreateRfqModalOpen && selectedIndent && (
                <CreateRfqModal
                    isOpen={isCreateRfqModalOpen}
                    onClose={() => {
                        setIsCreateRfqModalOpen(false);
                        setSelectedIndent(null);
                    }}
                    indent={selectedIndent}
                    onSuccess={() => {
                        fetchApprovedIndents();
                        fetchRfqs();
                        setIsCreateRfqModalOpen(false);
                        setSelectedIndent(null);
                        message.success('RFQ created successfully');
                    }}
                />
            )}

            {isViewModalOpen && selectedRfq && (
                <ViewRfqModal
                    isOpen={isViewModalOpen}
                    onClose={() => {
                        setIsViewModalOpen(false);
                        setSelectedRfq(null);
                    }}
                    rfq={selectedRfq}
                />
            )}

            {isQuoteFormOpen && selectedRfq && selectedVendor && (
                <VendorQuoteForm
                    isOpen={isQuoteFormOpen}
                    onClose={() => {
                        setIsQuoteFormOpen(false);
                        setSelectedVendor(null);
                    }}
                    rfq={selectedRfq}
                    vendor={selectedVendor}
                />
            )}

            {isCreatePOModalOpen && selectedIndent && (
                <CreateDirectPOModal
                    isOpen={isCreatePOModalOpen}
                    onClose={() => {
                        setIsCreatePOModalOpen(false);
                        setSelectedIndent(null);
                    }}
                    indent={selectedIndent}
                    onSuccess={() => {
                        setIsCreatePOModalOpen(false);
                        setSelectedIndent(null);
                        message.success('Purchase Order created successfully');
                    }}
                />
            )}

            {/* Add Notification Modal */}
            <Modal
                title={`Notify Vendors - RFQ ${notifyModalState.selectedRfq?.rfqNumber}`}
                open={notifyModalState.isOpen}
                onCancel={() => setNotifyModalState({ isOpen: false, selectedRfq: null })}
                onOk={() => {
                    const message = document.getElementById('rfqNotificationMessage').value;
                    handleNotifyVendor(message);
                }}
                confirmLoading={isLoading}
            >
                <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                        Send notification to vendors regarding this RFQ
                    </div>
                    <Input.TextArea
                        id="rfqNotificationMessage"
                        rows={4}
                        placeholder="Enter message for vendors..."
                        className="w-full"
                    />
                    {notifyModalState.selectedRfq && (
                        <div className="text-sm text-gray-500">
                            <div>Selected Vendors:</div>
                            <ul className="list-disc pl-4">
                                {notifyModalState.selectedRfq.selectedVendors.map((vendorData) => (
                                    <li key={vendorData._id}>
                                        {getVendorName(vendorData.vendor)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </Modal>
        </Card>
    );
};