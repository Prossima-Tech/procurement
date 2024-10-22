import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ListComponent from '../common/ListComponent';
import PurchaseOrderForm from './PurchaseOrderForm';
import { useTheme } from '../../contexts/ThemeContext';
import { Plus, ChevronLeft } from 'lucide-react';

const PurchaseOrdersComponent = () => {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const { isDarkMode } = useTheme();

    const fetchPurchaseOrders = async (page = 1) => {
        // TODO: Replace with actual API call
        const dummyData = [
            { id: 1, reference: 'PO001', confirmationDate: '2023-06-01', vendor: { name: 'Vendor A' }, preparedBy: { name: 'John Doe' }, total: 1000, status: 'Pending', expectedArrival: '2023-06-15' },
            { id: 2, reference: 'PO002', confirmationDate: '2023-06-02', vendor: { name: 'Vendor B' }, preparedBy: { name: 'Jane Smith' }, total: 2000, status: 'Approved', expectedArrival: '2023-06-20' },
        ];
        setPurchaseOrders(dummyData);
        setTotalPages(1);
        setCurrentPage(page);
    };

    useEffect(() => {
        fetchPurchaseOrders();
    }, []);

    const handleCreateNew = () => {
        setIsCreatingNew(true);
    };

    const handleSubmit = (formData) => {
        console.log('New Purchase Order:', formData);
        setIsCreatingNew(false);
        fetchPurchaseOrders();
    };

    const handleCancel = () => {
        setIsCreatingNew(false);
    };

    const columns = [
        { header: 'Reference', key: 'reference' },
        { header: 'Confirmation Date', key: 'confirmationDate' },
        { header: 'Vendor', key: 'vendor', render: (item) => item.vendor.name },
        {
            header: 'Buyer', key: 'preparedBy', render: (item) => (
                <div className="flex items-center">
                    <span className={`${isDarkMode ? 'bg-purple-700 text-purple-100' : 'bg-purple-100 text-purple-700'} rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm font-medium`}>
                        {item.preparedBy.name[0]}
                    </span>
                    <span>{item.preparedBy.name}</span>
                </div>
            )
        },
        { header: 'Total', key: 'total', render: (item) => `₹${item.total.toFixed(2)}` },
        {
            header: 'Status', key: 'status', render: (item) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Pending'
                    ? isDarkMode ? 'bg-yellow-700 text-yellow-100' : 'bg-yellow-100 text-yellow-800'
                    : isDarkMode ? 'bg-green-700 text-green-100' : 'bg-green-100 text-green-800'
                    }`}>
                    {item.status}
                </span>
            )
        },
        { header: 'Expected Arrival', key: 'expectedArrival' },
    ];

    return (
        <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white  text-gray-900'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex justify-center ">
                        <Link to="/" className={`flex justify-center p-2 mr-2 rounded-full ${isDarkMode ? ' hover:bg-gray-800' : 'hover:bg-gray-200'} transition duration-150 ease-in-out`}>
                            <button onClick={handleCancel}>
                                <ChevronLeft size={24} />
                            </button>
                        </Link>
                        <h1 className="text-2xl font-bold">Purchase Orders</h1>
                    </div>
                    {!isCreatingNew && (
                        <button
                            onClick={handleCreateNew}
                            className={`flex items-center p-4 rounded-md text-sm font-medium ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                                } transition duration-150 ease-in-out`}
                        >
                            <Plus size={18} className="mr-2" /> New Purchase Order
                        </button>
                    )}
                </div>
                <div className={`${isDarkMode ? ' border-gray-700' : ' border-gray-200'} `}>
                    <div className="p-6">
                        {isCreatingNew ? (
                            <PurchaseOrderForm onSubmit={handleSubmit} onCancel={handleCancel} isDarkMode={isDarkMode} />
                        ) : (
                            <ListComponent
                                showHeader={false}
                                title="Purchase Orders"
                                data={purchaseOrders}
                                columns={columns}
                                onFetch={fetchPurchaseOrders}
                                totalPages={totalPages}
                                currentPage={currentPage}
                                onCreateNew={handleCreateNew}
                                isDarkMode={isDarkMode}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export { PurchaseOrdersComponent };