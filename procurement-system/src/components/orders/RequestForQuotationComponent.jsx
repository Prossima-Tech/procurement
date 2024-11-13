import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Modal from '../common/Modal';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import { message, Table } from 'antd';
import { baseURL } from '../../utils/endpoint';
import CreateRfqModal from './CreateRfqModal';
import ViewRfqModal from './ViewRfqModal';
import VendorQuoteForm from './VendorQuoteForm';

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
            setApprovedIndents(response.data.data || []);
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
                <span className={`px-2 py-1 rounded-full text-xs ${
                    status === 'manager_approved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                    {status?.toUpperCase()}
                </span>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <button
                    onClick={() => {
                        setSelectedIndent(record);
                        setIsCreateRfqModalOpen(true);
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                >
                    Create RFQ
                </button>
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
                <span className={`px-2 py-1 rounded-full text-sm ${
                    status === 'published' ? 'bg-green-100 text-green-800' :
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
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleViewRfq(record)}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        View
                    </button>
                    {/* {record.status === 'published' && (
                        <button
                            onClick={() => handleOpenQuoteForm(record, record.selectedVendors[0])}
                            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Submit Quote
                        </button>
                    )} */}
                </div>
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

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Request for Quotation Management</h1>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setActiveTab('rfqs')}
                        className={`px-4 py-2 rounded-md ${
                            activeTab === 'rfqs' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        RFQ List
                    </button>
                    <button
                        onClick={() => setActiveTab('indents')}
                        className={`px-4 py-2 rounded-md ${
                            activeTab === 'indents' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        Approved Indents
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                {isLoading ? (
                    <div className="text-center py-10">
                        <span className="text-gray-600">Loading...</span>
                    </div>
                ) : (
                    <Table
                        dataSource={activeTab === 'indents' ? approvedIndents : rfqs}
                        columns={activeTab === 'indents' ? indentColumns : rfqColumns}
                        rowKey="_id"
                        pagination={{
                            total: activeTab === 'indents' ? approvedIndents.length : rfqs.length,
                            pageSize: 10,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                        }}
                    />
                )}
            </div>

            {isCreateRfqModalOpen && selectedIndent && (
                <CreateRfqModal
                    isOpen={isCreateRfqModalOpen}
                    onClose={handleCloseCreateRfqModal}
                    indent={selectedIndent}
                    onSuccess={() => {
                        fetchApprovedIndents();
                        fetchRfqs();
                        setIsCreateRfqModalOpen(false);
                        setSelectedIndent(null);
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
                    onClose={handleCloseQuoteForm}
                    rfq={selectedRfq}
                    vendor={selectedVendor}
                />
            )}
        </div>
    );
};