import React from 'react';
import {
  Modal,
  Descriptions,
  Table,
  Tag,
  Divider,
  Timeline,
  Card,
  Space
} from 'antd';
import {
  FileText,
  Building2,
  User,
  FolderKanban,
  Calendar,
  Package,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ClipboardList
} from 'lucide-react';

const IndentDetailsModal = ({ visible, indent, onClose }) => {
  if (!indent) return null;

  // Status configuration for timeline
  const statusConfig = {
    submitted: {
      icon: <Clock className="text-blue-500" size={16} />,
      color: 'blue',
      text: 'Submitted'
    },
    manager_approved: {
      icon: <CheckCircle2 className="text-green-500" size={16} />,
      color: 'green',
      text: 'Manager Approved'
    },
    manager_rejected: {
      icon: <XCircle className="text-red-500" size={16} />,
      color: 'red',
      text: 'Manager Rejected'
    },
    admin_approved: {
      icon: <CheckCircle2 className="text-green-500" size={16} />,
      color: 'green',
      text: 'Admin Approved'
    }
  };

  // Columns for items tables
  const itemColumns = [
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: () => (
        <Tag color="green">Available</Tag>
      )
    }
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      title={
        <div className="flex items-center gap-2">
          <FileText className="text-blue-500" size={20} />
          <span className="font-semibold">Indent Details - {indent.indentNumber}</span>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Basic Information Card */}
        <Card className="shadow-sm">
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item 
              label={
                <Space>
                  <Calendar size={16} className="text-gray-500" />
                  Created Date
                </Space>
              }
            >
              {new Date(indent.createdAt).toLocaleDateString()}
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={
                <Space>
                  <AlertCircle size={16} className="text-gray-500" />
                  Priority
                </Space>
              }
            >
              <Tag color={
                indent.priority === 'high' ? 'red' : 
                indent.priority === 'medium' ? 'orange' : 
                'green'
              }>
                {indent.priority?.toUpperCase()}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item 
              label={
                <Space>
                  <User size={16} className="text-gray-500" />
                  Employee
                </Space>
              }
            >
              {indent.employee?.username || 'N/A'}
            </Descriptions.Item>

            <Descriptions.Item 
              label={
                <Space>
                  <User size={16} className="text-gray-500" />
                  Manager
                </Space>
              }
            >
              {indent.manager?.username || 'N/A'}
            </Descriptions.Item>

            <Descriptions.Item 
              label={
                <Space>
                  <Building2 size={16} className="text-gray-500" />
                  Unit
                </Space>
              }
            >
              {indent.unit?.unitName || 'N/A'}
            </Descriptions.Item>

            <Descriptions.Item 
              label={
                <Space>
                  <FolderKanban size={16} className="text-gray-500" />
                  Project
                </Space>
              }
            >
              {indent.project?.projectName || 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="text-blue-500" size={20} />
            <h3 className="text-lg font-semibold">Requested Items</h3>
          </div>
          
          {/* Existing Items */}
          {indent.items?.existing?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Existing Items</h4>
              <Table
                columns={itemColumns}
                dataSource={indent.items.existing}
                pagination={false}
                size="small"
                className="shadow-sm"
              />
            </div>
          )}

          {/* New Items */}
          {indent.items?.new?.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">New Items</h4>
              <Table
                columns={itemColumns}
                dataSource={indent.items.new}
                pagination={false}
                size="small"
                className="shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Purpose Section */}
        <Card className="shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ClipboardList className="text-blue-500" size={20} />
              <h3 className="text-lg font-semibold">Purpose</h3>
            </div>
            <p className="text-gray-600">{indent.purpose}</p>
          </div>
        </Card>

        {/* Updated Approval Timeline */}
        <Card className="shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="text-blue-500" size={20} />
              <h3 className="text-lg font-semibold">Approval Timeline</h3>
            </div>
            <Timeline
              items={[
                {
                  dot: statusConfig.submitted.icon,
                  color: statusConfig.submitted.color,
                  children: (
                    <div>
                      <p className="font-medium">Indent Submitted</p>
                      <p className="text-sm text-gray-500">
                        {new Date(indent.createdAt).toLocaleString()}
                      </p>
                    </div>
                  )
                },
                {
                  dot: statusConfig[indent.status]?.icon,
                  color: statusConfig[indent.status]?.color,
                  children: (
                    <div>
                      <p className="font-medium">
                        {statusConfig[indent.status]?.text}
                      </p>
                      <p className="text-sm text-gray-500">
                        {indent.status === 'manager_approved' ? (
                          <>
                            {indent.approvalDetails?.managerApproval?.date 
                              ? new Date(indent.approvalDetails.managerApproval.date).toLocaleString()
                              : new Date(indent.updatedAt).toLocaleString() // Fallback to updatedAt if specific date not available
                            }
                          </>
                        ) : (
                          'Pending'
                        )}
                      </p>
                      {indent.approvalDetails?.managerApproval?.remarks && (
                        <p className="text-sm text-gray-600 mt-1">
                          Remarks: {indent.approvalDetails.managerApproval.remarks}
                        </p>
                      )}
                    </div>
                  )
                },
                // Add Admin approval step if needed
                {
                  dot: indent.status === 'admin_approved' ? statusConfig.admin_approved.icon : <Clock className="text-gray-300" size={16} />,
                  color: indent.status === 'admin_approved' ? 'green' : 'gray',
                  children: (
                    <div>
                      <p className="font-medium">Admin Approval</p>
                      <p className="text-sm text-gray-500">
                        {indent.status === 'admin_approved' 
                          ? (indent.approvalDetails?.adminApproval?.date 
                              ? new Date(indent.approvalDetails.adminApproval.date).toLocaleString()
                              : new Date(indent.updatedAt).toLocaleString()
                            )
                          : 'Pending'
                        }
                      </p>
                      {indent.approvalDetails?.adminApproval?.remarks && (
                        <p className="text-sm text-gray-600 mt-1">
                          Remarks: {indent.approvalDetails.adminApproval.remarks}
                        </p>
                      )}
                    </div>
                  )
                }
              ]}
            />
          </div>
        </Card>
      </div>
    </Modal>
  );
};

export default IndentDetailsModal; 