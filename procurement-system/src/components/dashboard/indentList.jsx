import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  message
} from 'antd';
import {
  FileText,
  Building2,
  User,
  FolderKanban,
  Calendar,
  Eye,
  Package,
  Search,
  AlertCircle
} from 'lucide-react';
import { baseURL } from '../../utils/endpoint';
import IndentDetailsModal from './IndentDetailsModal';

const IndentList = () => {
  const [indents, setIndents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchText, setSearchText] = useState('');
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Create memoized debounce function
  const debouncedFetch = React.useMemo(
    () => 
      debounce((page, pageSize, search) => {
        fetchIndents(page, pageSize, search);
      }, 300),
    []
  );

  const fetchIndents = async (page = 1, pageSize = 10, search = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${baseURL}/indents`, {
        params: {
          status: 'manager_approved',
          page,
          limit: pageSize,
          search
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("response",response.data.data);
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
        message.error({
          content: 'Failed to fetch indents',
          icon: <AlertCircle className="text-red-500" />
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndents();
    return () => {
      debouncedFetch.cancel();
    };
  }, []);

  const columns = [
    {
      title: 'Indent Number',
      dataIndex: 'indentNumber',
      key: 'indentNumber',
      render: (text) => (
        <Space>
          <FileText size={16} className="text-blue-500" />
          <span className="font-medium">{text}</span>
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
          'green'
        }>
          {priority?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<Eye size={16} />}
          className="bg-blue-500 hover:bg-blue-600"
          onClick={() => handleViewDetails(record)}
        >
          View Details
        </Button>
      ),
    }
  ];

  const handleViewDetails = (record) => {
    setSelectedIndent(record);
    setDetailsModalVisible(true);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    debouncedFetch(1, pagination.pageSize, value);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-blue-500" />
          Approved Purchase Indents
        </h1>
        <p className="text-gray-600">View all approved purchase indents</p>
      </div>

      {/* Search Bar */}
      {/* <div className="mb-6">
        <div className="max-w-md">
          <Input.Search
            placeholder="Search by indent number or employee name"
            allowClear
            enterButton={<Search size={16} />}
            size="large"
            onChange={(e) => handleSearch(e.target.value)}
            className="shadow-sm"
          />
        </div>
      </div> */}

      {/* Indents Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={indents}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => {
              fetchIndents(page, pageSize, searchText);
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
                <Package size={40} className="mx-auto mb-4 opacity-50" />
                <p>No approved indents found</p>
              </div>
            )
          }}
        />
      </div>

      {/* Add the modal */}
      <IndentDetailsModal
        visible={detailsModalVisible}
        indent={selectedIndent}
        onClose={() => {
          setDetailsModalVisible(false);
          setSelectedIndent(null);
        }}
      />
    </div>
  );
};

export default IndentList;
