import React from 'react';
import Table from '../common/Table';

const ItemList = ({ items }) => {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Category',
        accessor: 'category',
      },
      {
        Header: 'Price',
        accessor: 'price',
        Cell: ({ value }) => `$${value.toFixed(2)}`,
      },
      {
        Header: 'Stock',
        accessor: 'stock',
      },
    ],
    []
  );

  return <Table columns={columns} data={items} />;
};

export default ItemList;