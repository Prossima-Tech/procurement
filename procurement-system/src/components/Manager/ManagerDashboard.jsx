import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import {
  Table,
  Button,
  Modal,
  Form,
  message,
  Tag,
  Space,
  Input
} from 'antd';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Building2, 
  User, 
  FolderKanban,
  FileText,
  Calendar,
  Eye,
  LogOut
} from 'lucide-react';
import { baseURL } from '../../utils/endpoint';
import { useAuth } from '../../hooks/useAuth';

// Add Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl text-red-600 mb-4">Something went wrong</h2>
          <Button 
            type="primary" 
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrap your ManagerDashboard component
const ManagerDashboardWithErrorBoundary = () => {
  return (
    <ErrorBoundary>
      <ManagerDashboard />
    </ErrorBoundary>
  );
};

const IndentItemsModal = ({ visible, indent, onClose }) => {
  if (!indent) return null;

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <FileText className="text-blue-500" size={20} />
          <span>Indent Items - {indent.indentNumber}</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <div className="space-y-6">
        {/* Existing Items Section */}
        {indent.items?.existing?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Building2 className="mr-2 text-gray-500" size={18} />
              Existing Items
            </h3>
            <Table
              dataSource={indent.items.existing}
              pagination={false}
              columns={[
                {
                  title: 'Item Name',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Quantity',
                  dataIndex: 'quantity',
                  key: 'quantity',
                }
              ]}
            />
          </div>
        )}

        {/* New Items Section */}
        {indent.items?.new?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <FolderKanban className="mr-2 text-gray-500" size={18} />
              New Items
            </h3>
            <Table
              dataSource={indent.items.new}
              pagination={false}
              columns={[
                {
                  title: 'Item Name',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Quantity',
                  dataIndex: 'quantity',
                  key: 'quantity',
                }
              ]}
            />
          </div>
        )}

        {/* Summary Section */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Priority</p>
              <p className="font-medium capitalize">{indent.priority}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Purpose</p>
              <p className="font-medium">{indent.purpose}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created Date</p>
              <p className="font-medium">
                {new Date(indent.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Tab configuration with predefined color classes
const tabConfig = {
  submitted: {
    key: 'submitted',
    label: 'Pending Approvals',
    icon: Clock,
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-500',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-600',
    status: 'submitted'
  },
  approved: {
    key: 'approved',
    label: 'Approved Indents',
    icon: CheckCircle2,
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-500',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-600',
    status: 'manager_approved'
  },
  rejected: {
    key: 'rejected',
    label: 'Rejected Indents',
    icon: XCircle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-500',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-600',
    status: 'manager_rejected'
  }
};

// Updated TabButton component
const TabButton = ({ tab, isActive, count, onClick }) => {
  const config = tabConfig[tab];
  const Icon = config.icon;
  
  return (
    <button
      onClick={() => onClick(tab)}
      className={`
        relative py-4 px-6 border-b-2 font-medium text-sm
        transition-all duration-200 ease-in-out
        ${isActive 
          ? `${config.borderColor} ${config.textColor} ${config.bgColor}` 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }
      `}
    >
      <div className="flex items-center gap-2">
        <Icon 
          size={16} 
          className={isActive ? config.textColor : ''} 
        />
        <span>{config.label}</span>
        {count > 0 && (
          <span 
            className={`
              absolute top-3 right-1
              py-0.5 px-2.5 rounded-full text-xs font-medium
              ${isActive 
                ? `${config.badgeBg} ${config.badgeText}` 
                : 'bg-gray-100 text-gray-600'
              }
              transition-all duration-200
            `}
          >
            {count}
          </span>
        )}
      </div>
    </button>
  );
};

// Updated StatsCard component
const StatsCard = ({ label, value, icon: Icon, type }) => {
  const config = tabConfig[type];
  
  return (
    <div className={`
      bg-white p-6 rounded-lg shadow-sm border border-gray-200 
      hover:border-${type === 'submitted' ? 'indigo' : type === 'approved' ? 'green' : 'red'}-500 
      transition-colors duration-200
    `}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className={config.textColor + ' text-2xl font-semibold'}>{value}</p>
        </div>
        <div className={`p-3 rounded-full ${config.badgeBg}`}>
          <Icon size={24} className={config.textColor} />
        </div>
      </div>
    </div>
  );
};

const ManagerDashboard = () => {
  const [indents, setIndents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [actionType, setActionType] = useState('');
  const [itemsModalVisible, setItemsModalVisible] = useState(false);
  const [selectedIndentForItems, setSelectedIndentForItems] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [activeTab, setActiveTab] = useState('submitted');
  const [filterLoading, setFilterLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { logout } = useAuth();

  // Create memoized debounce function
  const debouncedFetch = React.useMemo(
    () => 
      debounce((page, pageSize) => {
        fetchIndents(page, pageSize);
      }, 300),
    [] // Empty dependency array since fetchIndents is defined inside component
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  // Fetch indents
  const fetchIndents = async (status, page = 1, pageSize = 10, search = '') => {
    try {
      setFilterLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${baseURL}/indents`, {
        params: {
          status,
          page,
          limit: pageSize,
          search
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setIndents(response.data.data);
      setPagination({
        current: page,
        pageSize,
        total: response.data.totalCount
      });

    } catch (error) {
      if (error.response?.status === 401) {
        message.error('Session expired. Please login again.');
      } else {
        message.error('Failed to fetch indents');
      }
    } finally {
      setFilterLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndents(activeTab, pagination.current, pagination.pageSize);
  }, []);

  // Handle approval/rejection
  const handleAction = async (approved) => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${baseURL}/indents/${selectedIndent._id}/manager-approval`,
        {
          approved,
          remarks
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      message.success({
        content: `Indent ${approved ? 'approved' : 'rejected'} successfully`,
        icon: approved ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />
      });
      setModalVisible(false);
      setRemarks(''); // Clear remarks after successful action
      await fetchIndents(); // Refresh the list
    } catch (error) {
      if (error.response?.status === 401) {
        message.error('Session expired. Please login again.');
        // Handle logout or redirect to login if needed
      } else {
        message.error({
          content: 'Action failed: ' + (error.response?.data?.message || 'Unknown error'),
          icon: <AlertCircle className="text-red-500" />
        });
      }
    }
  };

  // Status tag configuration
  const statusConfig = {
    submitted: { color: 'gold', icon: <Clock size={14} /> },
    manager_approved: { color: 'green', icon: <CheckCircle2 size={14} /> },
    manager_rejected: { color: 'red', icon: <XCircle size={14} /> }
  };

  const getActionColumn = () => {
    if (activeTab === 'submitted') {
      return {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button
              type="default"
              icon={<Eye size={16} />}
              onClick={() => {
                setSelectedIndentForItems(record);
                setItemsModalVisible(true);
              }}
            >
              View Items
            </Button>
            <Button
              type="primary"
              icon={<CheckCircle2 size={16} />}
              className="bg-green-500 hover:bg-green-600"
              onClick={() => {
                setSelectedIndent(record);
                setActionType('approve');
                setModalVisible(true);
              }}
              disabled={record.status !== 'submitted'}
            >
              Approve
            </Button>
            <Button
              danger
              icon={<XCircle size={16} />}
              onClick={() => {
                setSelectedIndent(record);
                setActionType('reject');
                setModalVisible(true);
              }}
              disabled={record.status !== 'submitted'}
            >
              Reject
            </Button>
          </Space>
        ),
      };
    }
    
    // For rejected indents, only show view button
    return {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="default"
          icon={<Eye size={16} />}
          onClick={() => {
            setSelectedIndentForItems(record);
            setItemsModalVisible(true);
          }}
        >
          View Items
        </Button>
      ),
    };
  };

  const columns = [
    {
      title: 'Indent Number',
      dataIndex: 'indentNumber',
      key: 'indentNumber',
      render: (text) => (
        <Space>
          <FileText size={16} className="text-gray-500" />
          {text}
        </Space>
      )
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <Space>
          <Calendar size={16} className="text-gray-500" />
          {new Date(date).toLocaleDateString()}
        </Space>
      )
    },
    {
      title: 'Employee',
      dataIndex: 'employee',
      key: 'employee',
      render: (employee) => (
        <Space>
          <User size={16} className="text-gray-500" />
          {employee?.username || 'N/A'}
        </Space>
      )
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      render: (unit) => (
        <Space>
          <Building2 size={16} className="text-gray-500" />
          {unit?.unitName || 'N/A'}
        </Space>
      )
    },
    {
      title: 'Project',
      dataIndex: 'project',
      key: 'project',
      render: (project) => (
        <Space>
          <FolderKanban size={16} className="text-gray-500" />
          {project?.projectName || 'N/A'}
        </Space>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={
          priority === 'high' ? 'red' : 
          priority === 'medium' ? 'orange' : 
          priority === 'low' ? 'green' : 'blue'
        }>
          {priority?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusConfig[status]?.color || 'default'} className="px-2 py-1">
          <Space>
            {statusConfig[status]?.icon}
            {status?.replace('_', ' ').toUpperCase()}
          </Space>
        </Tag>
      ),
    },
    getActionColumn()
  ];

  // Add pagination change handler
  const handleTableChange = (newPagination, filters, sorter) => {
    debouncedFetch(newPagination.current, newPagination.pageSize);
  };

  // Add loading skeleton
  const loadingSkeleton = (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  const handleLogout = () => {
    logout();
  };

  // Create a separate tab change handler
  const handleTabChange = async (newTab) => {
    setLoading(true);  // Start loading immediately
    setIndents([]); // Clear current indents
    setActiveTab(newTab); // Update active tab
    await fetchIndents(newTab, 1, pagination.pageSize); // Fetch new data
  };

  // Add search handler
  const handleSearch = (value) => {
    setSearchText(value);
    debouncedFetch(activeTab, pagination.current, pagination.pageSize, value);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manager Dashboard</h1>
          <p className="text-gray-600">Manage indent approvals and rejections</p>
        </div>
        <Button 
          type="primary" 
          danger 
          icon={<LogOut size={16} />}
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          Logout
        </Button>
      </div>
      
      {/* Search Input */}
      <div className="mb-4">
        <Input.Search
          placeholder="Search by indent number or employee name"
          allowClear
          enterButton
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Updated Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {Object.values(tabConfig).map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.status)}
                className={`
                  py-4 px-6 border-b-2 font-medium text-sm
                  transition-all duration-200
                  ${activeTab === tab.status
                    ? `${tab.borderColor} ${tab.textColor} ${tab.bgColor}`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <tab.icon size={16} />
                  {tab.label}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Existing Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={indents}
          rowKey="_id"
          loading={loading || filterLoading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => {
              fetchIndents(activeTab, page, pageSize, searchText);
            },
            showTotal: (total, range) => (
              <span className="text-gray-600">
                Showing {range[0]}-{range[1]} of {total} indents
              </span>
            ),
          }}
          locale={{
            emptyText: (
              <div className="py-8 text-center text-gray-500">
                <FolderKanban size={40} className="mx-auto mb-4 opacity-50" />
                <p>No {activeTab === 'submitted' ? 'pending' : 'rejected'} indents found</p>
              </div>
            )
          }}
        />
      </div>

      <Modal
        title={
          <Space>
            {actionType === 'approve' ? 
              <CheckCircle2 className="text-green-500" size={20} /> : 
              <XCircle className="text-red-500" size={20} />
            }
            {`${actionType === 'approve' ? 'Approve' : 'Reject'} Indent`}
          </Space>
        }
        open={modalVisible}
        onOk={() => handleAction(actionType === 'approve')}
        onCancel={() => {
          setModalVisible(false);
          setRemarks('');
        }}
        okText={actionType === 'approve' ? 'Approve' : 'Reject'}
        okButtonProps={{
          danger: actionType === 'reject',
          icon: actionType === 'approve' ? 
            <CheckCircle2 size={16} /> : 
            <XCircle size={16} />
        }}
      >
        <Form layout="vertical">
          <Form.Item 
            label="Remarks"
            help="Add any additional comments or reasons for your decision"
          >
            <Input.TextArea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={4}
              placeholder="Enter your remarks (optional)"
              className="mt-1"
            />
          </Form.Item>
        </Form>
      </Modal>

      <IndentItemsModal
        visible={itemsModalVisible}
        indent={selectedIndentForItems}
        onClose={() => {
          setItemsModalVisible(false);
          setSelectedIndentForItems(null);
        }}
      />
    </div>
  );
};

export default ManagerDashboard;