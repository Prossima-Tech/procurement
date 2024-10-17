// dummyData.js

export const dummyPurchaseOrders = [
    {
        id: 'PO001',
        reference: 'PO-2023-001',
        confirmationDate: '2023-10-15T10:30:00Z',
        vendor: { name: 'Acme Supplies' },
        preparedBy: { name: 'John Doe' },
        total: 5000.00,
        status: 'Pending',
        expectedArrival: '2023-10-30'
    },
    {
        id: 'PO002',
        reference: 'PO-2023-002',
        confirmationDate: '2023-10-16T14:45:00Z',
        vendor: { name: 'TechPro Inc.' },
        preparedBy: { name: 'Jane Smith' },
        total: 7500.50,
        status: 'Approved',
        expectedArrival: '2023-11-05'
    },
    {
        id: 'PO003',
        reference: 'PO-2023-003',
        confirmationDate: '2023-10-17T09:15:00Z',
        vendor: { name: 'Global Gadgets' },
        preparedBy: { name: 'Bob Johnson' },
        total: 3200.75,
        status: 'Shipped',
        expectedArrival: '2023-10-25'
    },
    // Add more dummy purchase orders as needed
];

export const dummyVendors = [
    {
        id: 'V001',
        name: 'Acme Supplies',
        contactPerson: 'John Smith',
        contactNumber: '+1 (555) 123-4567',
        emailId: 'john@acmesupplies.com',
        address: { city: 'New York', country: 'USA' }
    },
    {
        id: 'V002',
        name: 'TechPro Inc.',
        contactPerson: 'Sarah Johnson',
        contactNumber: '+1 (555) 987-6543',
        emailId: 'sarah@techpro.com',
        address: { city: 'San Francisco', country: 'USA' }
    },
    {
        id: 'V003',
        name: 'Global Gadgets',
        contactPerson: 'Mike Chen',
        contactNumber: '+86 10 8765 4321',
        emailId: 'mike@globalgadgets.com',
        address: { city: 'Shanghai', country: 'China' }
    },
    // Add more dummy vendors as needed
];

export const dummyItems = [
    {
        id: 'I001',
        code: 'ITEM-001',
        name: 'Widget A',
        type: 'good',
        sacHsnCode: '8471',
        category: 'Electronics',
        igst: 18,
        cgst: 9,
        sgst: 9
    },
    {
        id: 'I002',
        code: 'ITEM-002',
        name: 'Gadget B',
        type: 'good',
        sacHsnCode: '8517',
        category: 'Electronics',
        igst: 12,
        cgst: 6,
        sgst: 6
    },
    {
        id: 'I003',
        code: 'SRV-001',
        name: 'Maintenance Service',
        type: 'service',
        sacHsnCode: '998719',
        category: 'Services',
        igst: 18,
        cgst: 9,
        sgst: 9
    },
    // Add more dummy items as needed
];

export const dummyParts = [
    {
        id: 'P001',
        partNumber: 'PART-001',
        description: 'Screw 5mm x 10mm',
        size: '5x10mm',
        colour: 'Silver',
        maker: 'FastenRight Inc.',
        measurementUnit: 'Piece',
        price: 0.50
    },
    {
        id: 'P002',
        partNumber: 'PART-002',
        description: 'Circuit Board A1',
        size: '100x50mm',
        colour: 'Green',
        maker: 'ElectroPro',
        measurementUnit: 'Piece',
        price: 15.75
    },
    {
        id: 'P003',
        partNumber: 'PART-003',
        description: 'Rubber Gasket',
        size: '30mm diameter',
        colour: 'Black',
        maker: 'SealMaster',
        measurementUnit: 'Piece',
        price: 2.25
    },
    // Add more dummy parts as needed
];