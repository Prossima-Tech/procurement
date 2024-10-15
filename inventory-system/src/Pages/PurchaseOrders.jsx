import React from 'react';
import Table from '../Components/common/Table';

const PurchaseOrders = () => {
  const purchaseOrders = [
    { id: 1, vendor: 'Vendor A', total: 1000, status: 'Pending', date: '2023-05-01' },
    { id: 2, vendor: 'Vendor B', total: 1500, status: 'Approved', date: '2023-05-02' },
    // Add more purchase orders as needed
  ];

  const columns = React.useMemo(
    () => [
      {
        Header: 'PO Number',
        accessor: 'id',
      },
      {
        Header: 'Vendor',
        accessor: 'vendor',
      },
      {
        Header: 'Total',
        accessor: 'total',
        Cell: ({ value }) => `$${value.toFixed(2)}`,
      },
      {
        Header: 'Status',
        accessor: 'status',
      },
      {
        Header: 'Date',
        accessor: 'date',
      },
    ],
    []
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Purchase Orders</h1>
      <div className="mt-8">
        <Table columns={columns} data={purchaseOrders} />
      </div>
    </div>
  );
};

export default PurchaseOrders;