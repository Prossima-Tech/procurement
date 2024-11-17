import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../../utils/endpoint';
import { Card, Spin } from 'antd';


// const VendorDashboard = () => {
//     const { user } = useAuth();
//     const { isDarkMode } = useTheme();
//     const [loading] = useState(false);

//     // Static data for demonstration
//     console.log("user",user);
//     const mockVendorData = {
//         vendorCode: "V001",
//         name: "Tech Solutions Pvt Ltd",
//         contactPerson: "John Smith",
//         email: "john@techsolutions.com",
//         gstNumber: "22AAAAA0000A1Z5",
//         mobileNumber: "+91 98765 43210",
//         contactNumber: "011-2345-6789",
//         address: {
//             line1: "123 Business Park",
//             line2: "Sector 15",
//             city: "Mumbai",
//             state: "Maharashtra",
//             pinCode: "400001"
//         }
//     };

//     // Static orders data
//     const recentOrders = [
//         {
//             id: "PO-2024-001",
//             date: "2024-01-15",
//             amount: "₹75,000",
//             status: "Delivered"
//         },
//         {
//             id: "PO-2024-002",
//             date: "2024-01-20",
//             amount: "₹1,25,000",
//             status: "In Progress"
//         },
//         {
//             id: "PO-2024-003",
//             date: "2024-01-25",
//             amount: "₹45,000",
//             status: "Pending"
//         }
//     ];

//     // Static activity data
//     const recentActivities = [
//         {
//             id: 1,
//             date: "2024-01-26",
//             activity: "New Purchase Order Received",
//             details: "PO-2024-003 worth ₹45,000"
//         },
//         {
//             id: 2,
//             date: "2024-01-24",
//             activity: "Payment Received",
//             details: "₹75,000 for PO-2024-001"
//         },
//         {
//             id: 3,
//             date: "2024-01-22",
//             activity: "Delivery Completed",
//             details: "Order PO-2024-001 delivered successfully"
//         }
//     ];

//     // Static performance metrics
//     const performanceMetrics = {
//         totalOrders: 25,
//         completedOrders: 22,
//         pendingPayments: "₹1,45,000",
//         deliveryRating: "4.8/5"
//     };

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center h-screen">
//                 <Spin size="large" />
//             </div>
//         );
//     }

//     return (
//         <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
//             <div className={`max-w-7xl mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
//                 {/* Welcome Section */}
//                 <div className="mb-8">
//                     <h1 className="text-2xl font-bold">Welcome, {mockVendorData.name}</h1>
//                     <p className="text-sm mt-2">Vendor Code: {mockVendorData.vendorCode}</p>
//                 </div>

//                 {/* Performance Metrics */}
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//                     {Object.entries(performanceMetrics).map(([key, value]) => (
//                         <div key={key} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
//                             <h3 className="text-sm font-medium mb-2">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</h3>
//                             <p className="text-2xl font-bold">{value}</p>
//                         </div>
//                     ))}
//                 </div>

//                 {/* Recent Orders */}
//                 <div className={`p-4 rounded-lg mb-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
//                     <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
//                     <div className="overflow-x-auto">
//                         <table className="min-w-full">
//                             <thead>
//                                 <tr className="text-left">
//                                     <th className="pb-3">Order ID</th>
//                                     <th className="pb-3">Date</th>
//                                     <th className="pb-3">Amount</th>
//                                     <th className="pb-3">Status</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {recentOrders.map(order => (
//                                     <tr key={order.id} className="border-t">
//                                         <td className="py-3">{order.id}</td>
//                                         <td>{order.date}</td>
//                                         <td>{order.amount}</td>
//                                         <td>
//                                             <span className={`px-2 py-1 rounded-full text-xs ${
//                                                 order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
//                                                 order.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
//                                                 'bg-blue-100 text-blue-800'
//                                             }`}>
//                                                 {order.status}
//                                             </span>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>

//                 {/* Recent Activity */}
//                 <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
//                     <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
//                     <div className="space-y-4">
//                         {recentActivities.map(activity => (
//                             <div key={activity.id} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-white'} shadow`}>
//                                 <div className="flex justify-between items-start">
//                                     <div>
//                                         <h3 className="font-medium">{activity.activity}</h3>
//                                         <p className="text-sm text-gray-500">{activity.details}</p>
//                                     </div>
//                                     <span className="text-sm text-gray-500">{activity.date}</span>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };


const VendorDashboard = () => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [vendorDetails, setVendorDetails] = useState(null);

    console.log("user",user);
    useEffect(() => {
        fetchVendorDetails();
    }, [user]);

    const fetchVendorDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch vendor details
            console.log("user.id",user.id);
            const response = await axios.get(
                `${baseURL}/vendors/getVendorByUserId/${user.id}`,
                // {
                //     headers: { 'Authorization': `Bearer ${getToken()}` }
                // }
            );
            console.log("response",response);
            setVendorDetails(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch vendor details');
            console.error('Vendor details fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500">
                Error: {error}
            </div>
        );
    }

    return (
        <div className={`p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
            {/* Vendor Profile Section */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-4">Welcome, {vendorDetails?.name}</h1>
                <Card className={isDarkMode ? 'bg-gray-800 text-white' : ''}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold">Contact Information</h3>
                            <p>Email: {vendorDetails?.email}</p>
                            <p>Contact Number: {vendorDetails?.contactNumber}</p>
                            <p>Mobile Number: {vendorDetails?.mobileNumber}</p>
                            <p>Contact Person: {vendorDetails?.contactPerson}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Company Details</h3>
                            <p>Vendor Code: {vendorDetails?.vendorCode}</p>
                            <p>GST Number: {vendorDetails?.gstNumber}</p>
                            <p>PAN Number: {vendorDetails?.panNumber}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="font-semibold">Address</h3>
                        <p>{vendorDetails?.address?.line1}</p>
                        <p>{vendorDetails?.address?.line2}</p>
                        <p>{vendorDetails?.address?.city}, {vendorDetails?.address?.state} - {vendorDetails?.address?.pinCode}</p>
                    </div>
                    <div className="mt-4">
                        <h3 className="font-semibold">Bank Details</h3>
                        <p>Bank Name: {vendorDetails?.bankDetails?.name}</p>
                        <p>Branch Name: {vendorDetails?.bankDetails?.branchName}</p>
                        <p>Account Number: {vendorDetails?.bankDetails?.accountNumber}</p>
                        <p>IFSC Code: {vendorDetails?.bankDetails?.ifscCode}</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default VendorDashboard; 