import React, { useState } from 'react';
import { Button, Modal, Table, Space } from 'antd';

// Add this component for displaying items
const IndentItemsModal = ({ visible, indent, onClose }) => {
  if (!indent) return null;

  return (
    <Modal
      title={`Indent Items - ${indent.project}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <div className="space-y-6">
        {/* Existing Items Section */}
        {indent.items.existing.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Existing Items</h3>
            <Table
              dataSource={indent.items.existing}
              pagination={false}
              columns={[
                {
                  title: 'Item Name',
                  dataIndex: 'itemName',
                  key: 'itemName',
                },
                {
                  title: 'Specification',
                  dataIndex: 'specification',
                  key: 'specification',
                },
                {
                  title: 'Quantity',
                  dataIndex: 'quantity',
                  key: 'quantity',
                },
                {
                  title: 'Remarks',
                  dataIndex: 'remarks',
                  key: 'remarks',
                },
              ]}
            />
          </div>
        )}

        {/* New Items Section */}
        {indent.items.new.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">New Items</h3>
            <Table
              dataSource={indent.items.new}
              pagination={false}
              columns={[
                {
                  title: 'Item Name',
                  dataIndex: 'itemName',
                  key: 'itemName',
                },
                {
                  title: 'Specification',
                  dataIndex: 'specification',
                  key: 'specification',
                },
                {
                  title: 'Quantity',
                  dataIndex: 'quantity',
                  key: 'quantity',
                },
                {
                  title: 'Estimated Cost',
                  dataIndex: 'estimatedCost',
                  key: 'estimatedCost',
                  render: (cost) => `₹${cost?.toLocaleString() || 0}`,
                },
                {
                  title: 'Remarks',
                  dataIndex: 'remarks',
                  key: 'remarks',
                },
              ]}
            />
          </div>
        )}

        {/* Summary Section */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Priority</p>
              <p className="font-medium">{indent.priority}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Expected Delivery</p>
              <p className="font-medium">
                {new Date(indent.expectedDeliveryDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Update your main component to include the items view
const ManagerDashboard = () => {
  // ... existing state ...
  const [itemsModalVisible, setItemsModalVisible] = useState(false);
  const [selectedIndentForItems, setSelectedIndentForItems] = useState(null);

  const columns = [
    // ... your existing columns ...
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setSelectedIndentForItems(record);
              setItemsModalVisible(true);
            }}
          >
            View Items
          </Button>
          <Button
            type="primary"
            onClick={() => {
              setSelectedIndent(record);
              setModalVisible(true);
            }}
          >
            Take Action
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manager Dashboard</h1>
      
      <Table
        dataSource={indents}
        columns={columns}
        loading={loading}
        rowKey="_id"
      />

      {/* Approval Modal */}
      {/* ... your existing approval modal ... */}

      {/* Items Modal */}
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