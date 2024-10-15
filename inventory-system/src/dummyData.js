export const dummyVendors = [
    { id: 1, name: 'Vendor A', email: 'vendora@example.com', phone: '123-456-7890', status: 'Active' },
    { id: 2, name: 'Vendor B', email: 'vendorb@example.com', phone: '098-765-4321', status: 'Inactive' },
    { id: 3, name: 'Vendor C', email: 'vendorc@example.com', phone: '111-222-3333', status: 'Active' },
  ];
  
  export const dummyItems = [
    { id: 1, name: 'Item 1', category: 'Category A', price: 10.99, stock: 100 },
    { id: 2, name: 'Item 2', category: 'Category B', price: 15.99, stock: 50 },
    { id: 3, name: 'Item 3', category: 'Category A', price: 5.99, stock: 200 },
  ];
  
  export const dummyPurchaseOrders = [
    { id: 1, vendor: 'Vendor A', total: 1000, status: 'Pending', date: '2023-05-01' },
    { id: 2, vendor: 'Vendor B', total: 1500, status: 'Approved', date: '2023-05-02' },
    { id: 3, vendor: 'Vendor C', total: 750, status: 'Delivered', date: '2023-04-30' },
  ];