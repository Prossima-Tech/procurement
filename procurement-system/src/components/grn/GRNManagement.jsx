/* eslint-disable react/prop-types */
// components/grn/GRNManagement.js
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Plus, Search, Eye, Edit, Trash, } from 'lucide-react';
import { toast } from 'react-toastify';
import { baseURL } from '../../utils/endpoint';

// Main GRN Form Component
const GRNForm = ({ grn, onBack, onSuccess }) => {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(false);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [selectedPO, setSelectedPO] = useState(null);
    const [formData, setFormData] = useState({
        purchaseOrder: '',
        challanNumber: '',
        challanDate: '',
        receivedDate: '',
        transportDetails: {
            vehicleNumber: '',
            transporterName: '',
            ewayBillNumber: '',
            freightTerms: '',
            freightAmount: 0
        },
        items: []
    });

    // Fetch PO list and details
    const fetchPurchaseOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseURL}/purchase-orders/getAllPOs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.purchaseOrders) {
                // Filter POs that are approved or partially delivered
                const eligiblePOs = data.purchaseOrders.filter(po =>
                    po.status === 'created' ||
                    po.status === 'in_progress' ||
                    po.deliveryStatus === 'partially_delivered'
                );
                setPurchaseOrders(eligiblePOs);
            } else {
                toast.error('No eligible purchase orders available');
            }
        } catch (error) {
            console.error('Error fetching POs:', error);
            toast.error('Failed to fetch purchase orders');
        }
    };

    const fetchPODetails = async (poId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseURL}/purchase-orders/getPO/${poId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const po = await response.json();

            if (!po) {
                throw new Error('Purchase order details not found');
            }

            setSelectedPO(po);
            console.log("po details:", po);

            setFormData(prev => ({
                ...prev,
                purchaseOrder: poId,
                items: po.items.map(item => {
                    // Use the delivery details from PO
                    const deliveredQty = item.deliveredQuantity || 0;
                    const pendingQty = item.pendingQuantity || (item.quantity - deliveredQty);

                    // Calculate GRN delivery history
                    const grnHistory = item.grnDeliveries?.map(delivery => ({
                        grnId: delivery.grnId,
                        receivedQuantity: delivery.receivedQuantity,
                        receivedDate: delivery.receivedDate,
                        status: delivery.status
                    })) || [];

                    return {
                        partId: item.partId,
                        partCode: item.partCode,
                        orderedQuantity: item.quantity,
                        receivedQuantity: 0, // Start with 0 for new GRN
                        pendingQuantity: pendingQty,
                        previouslyDelivered: deliveredQty,
                        grnDeliveries: grnHistory,
                        unitPrice: item.unitPrice,
                        totalPrice: 0,
                        remarks: '',
                        itemDetails: {
                            partCodeNumber: item.partCode?.PartCodeNumber || item.partCode,
                            itemName: item.masterItemName || item.itemDetails?.itemName,
                            itemCode: item.itemDetails?.itemCode || '',
                            measurementUnit: item.itemDetails?.measurementUnit || 'Units'
                        },
                        // Add delivery tracking
                        deliveryStatus: deliveredQty === item.quantity ? 'complete' :
                            deliveredQty > 0 ? 'partial' : 'pending',
                        deliveryHistory: grnHistory.map(delivery => ({
                            date: new Date(delivery.receivedDate).toLocaleDateString(),
                            quantity: delivery.receivedQuantity,
                            status: delivery.status
                        }))
                    };
                })
            }));

        } catch (error) {
            console.error('Error fetching PO details:', error);
            toast.error('Failed to fetch PO details');
        }
    };

    useEffect(() => {
        if (!grn) {
            fetchPurchaseOrders();
        }
    }, [grn]);

    useEffect(() => {
        if (grn) {
            setFormData({
                ...grn,
                challanDate: grn.challanDate.split('T')[0],
                receivedDate: grn.receivedDate.split('T')[0]
            });
            if (grn.purchaseOrder) {
                fetchPODetails(grn.purchaseOrder);
            }
        }
    }, [grn]);

    // const handleSubmit = async (status = 'draft') => {
    //     try {
    //         setLoading(true);
    //         const method = grn ? 'PUT' : 'POST';
    //         const url = grn ? `${baseURL}/grn/${grn._id}` : `${baseURL}/grn`;

    //         const response = await fetch(url, {
    //             method,
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify({
    //                 ...formData,
    //                 status
    //             })
    //         });

    //         const data = await response.json();
    //         if (data.success) {
    //             toast.success(`GRN ${grn ? 'updated' : 'created'} successfully`);
    //             if (onSuccess) {
    //                 onSuccess(data.data); // Pass the new/updated GRN data
    //             }
    //             onBack();
    //         } else {
    //             toast.error(data.message);
    //         }
    //     } catch (error) {
    //         console.error('Error saving GRN:', error);
    //         toast.error('Failed to save GRN');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleSubmit = async (status = 'draft') => {
        try {
            setLoading(true);

            // Validate all quantities before submission
            for (const item of formData.items) {
                const totalDelivered = item.previouslyDelivered + item.receivedQuantity;
                if (totalDelivered > item.orderedQuantity) {
                    toast.error(`Total delivered quantity exceeds ordered quantity for ${item.itemDetails.partCodeNumber}`);
                    return;
                }
            }

            const submitData = {
                ...formData,
                status,
                items: formData.items.map(item => ({
                    ...item,
                    pendingQuantity: item.orderedQuantity - (item.previouslyDelivered + item.receivedQuantity)
                }))
            };

            const response = await fetch(
                grn ? `${baseURL}/grn/${grn._id}` : `${baseURL}/grn`,
                {
                    method: grn ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(submitData)
                }
            );

            const data = await response.json();
            if (data.success) {
                toast.success(`GRN ${grn ? 'updated' : 'created'} successfully`);
                if (onSuccess) onSuccess(data.data);
                onBack();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error saving GRN:', error);
            toast.error('Failed to save GRN');
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (index, value) => {
        if (!validateReceivedQuantity(index, Number(value))) {
            return;
        }

        const newItems = [...formData.items];
        newItems[index] = {
            ...newItems[index],
            receivedQuantity: Number(value),
            totalPrice: Number(value) * newItems[index].unitPrice
        };
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    // Add validation for received quantities
    const validateReceivedQuantity = (index, newQuantity) => {
        const item = formData.items[index];
        const pendingQty = item.orderedQuantity - item.previouslyDelivered;

        if (newQuantity > pendingQty) {
            toast.error(`Received quantity cannot exceed pending quantity (${pendingQty})`);
            return false;
        }
        if (newQuantity < 0) {
            toast.error('Received quantity cannot be negative');
            return false;
        }
        return true;
    };

    return (
        <div>
            {/* Form Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <button
                        onClick={onBack}
                        className="mr-4 text-gray-500 hover:text-gray-700"
                    >
                        ← Back
                    </button>
                    <h2 className="text-2xl font-bold">
                        {grn ? 'Edit GRN' : 'Create New GRN'}
                    </h2>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleSubmit('draft')}
                        disabled={loading}
                        className={`px-4 py-2 rounded-md border ${isDarkMode
                            ? 'border-gray-600 hover:bg-gray-700'
                            : 'border-gray-300 hover:bg-gray-100'
                            }`}
                    >
                        Save as Draft
                    </button>
                    <button
                        onClick={() => handleSubmit('submitted')}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Submit GRN
                    </button>
                </div>
            </div>

            {/* Basic Details */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                {!grn && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Purchase Order *</label>
                        <select
                            value={formData.purchaseOrder}
                            onChange={(e) => fetchPODetails(e.target.value)}
                            className={`w-full px-3 py-2 rounded-md border ${isDarkMode
                                ? 'bg-gray-800 border-gray-600'
                                : 'bg-white border-gray-300'
                                }`}
                            required
                        >
                            <option value="">Select Purchase Order</option>
                            {purchaseOrders.map(po => (
                                <option key={po._id} value={po._id}>
                                    {po.poCode} - {po.vendorId?.name || 'Unknown Vendor'}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-1">Challan Number *</label>
                    <input
                        type="text"
                        value={formData.challanNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, challanNumber: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-md border ${isDarkMode
                            ? 'bg-gray-800 border-gray-600'
                            : 'bg-white border-gray-300'
                            }`}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Challan Date *</label>
                    <input
                        type="date"
                        value={formData.challanDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, challanDate: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-md border ${isDarkMode
                            ? 'bg-gray-800 border-gray-600'
                            : 'bg-white border-gray-300'
                            }`}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Received Date *</label>
                    <input
                        type="date"
                        value={formData.receivedDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, receivedDate: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-md border ${isDarkMode
                            ? 'bg-gray-800 border-gray-600'
                            : 'bg-white border-gray-300'
                            }`}
                        required
                    />
                </div>
            </div>

            {/* Transport Details */}
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-lg font-semibold mb-4">Transport Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Vehicle Number</label>
                        <input
                            type="text"
                            value={formData.transportDetails.vehicleNumber}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                transportDetails: {
                                    ...prev.transportDetails,
                                    vehicleNumber: e.target.value
                                }
                            }))}
                            className={`w-full px-3 py-2 rounded-md border ${isDarkMode
                                ? 'bg-gray-800 border-gray-600'
                                : 'bg-white border-gray-300'
                                }`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Transporter Name</label>
                        <input
                            type="text"
                            value={formData.transportDetails.transporterName}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                transportDetails: {
                                    ...prev.transportDetails,
                                    transporterName: e.target.value
                                }
                            }))}
                            className={`w-full px-3 py-2 rounded-md border ${isDarkMode
                                ? 'bg-gray-800 border-gray-600'
                                : 'bg-white border-gray-300'
                                }`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">E-way Bill Number</label>
                        <input
                            type="text"
                            value={formData.transportDetails.ewayBillNumber}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                transportDetails: {
                                    ...prev.transportDetails,
                                    ewayBillNumber: e.target.value
                                }
                            }))}
                            className={`w-full px-3 py-2 rounded-md border ${isDarkMode
                                ? 'bg-gray-800 border-gray-600'
                                : 'bg-white border-gray-300'
                                }`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Freight Terms</label>
                        <input
                            type="text"
                            value={formData.transportDetails.freightTerms}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                transportDetails: {
                                    ...prev.transportDetails,
                                    freightTerms: e.target.value
                                }
                            }))}
                            className={`w-full px-3 py-2 rounded-md border ${isDarkMode
                                ? 'bg-gray-800 border-gray-600'
                                : 'bg-white border-gray-300'
                                }`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Freight Amount</label>
                        <input
                            type="number"
                            value={formData.transportDetails.freightAmount}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                transportDetails: {
                                    ...prev.transportDetails,
                                    freightAmount: Number(e.target.value)
                                }
                            }))}
                            className={`w-full px-3 py-2 rounded-md border ${isDarkMode
                                ? 'bg-gray-800 border-gray-600'
                                : 'bg-white border-gray-300'
                                }`}
                        />
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-lg font-semibold mb-4">Items</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Part Code
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Ordered Qty
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Previously Delivered
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Pending Quantity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Received Qty
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Unit Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Total Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Remarks
                                </th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            {formData.items.map((item, index) => (
                                <tr key={index} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <td className="px-4 py-2">
                                        {item.itemDetails.partCodeNumber}
                                    </td>
                                    <td className="px-4 py-2">{item.itemDetails.itemName}</td>
                                    <td className="px-4 py-2 text-right">
                                        {item.orderedQuantity} {item.itemDetails.measurementUnit}
                                    </td>
                                    <td className="px-4 py-2 text-right font-medium">
                                        {item.previouslyDelivered} {item.itemDetails.measurementUnit}
                                    </td>
                                    <td className="px-4 py-2 text-right font-medium text-orange-600">
                                        {item.pendingQuantity} {item.itemDetails.measurementUnit}
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="number"
                                            value={item.receivedQuantity || 0}
                                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                                            min="0"
                                            max={item.pendingQuantity}
                                            className={`w-20 px-2 py-1 text-right rounded-md border 
                        ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-right">₹{item.unitPrice.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right">₹{item.totalPrice.toFixed(2)}</td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="text"
                                            value={item.remarks}
                                            onChange={(e) => {
                                                const newItems = [...formData.items];
                                                newItems[index].remarks = e.target.value;
                                                setFormData(prev => ({ ...prev, items: newItems }));
                                            }}
                                            className={`w-full px-2 py-1 rounded-md border ${isDarkMode
                                                ? 'bg-gray-800 border-gray-600'
                                                : 'bg-white border-gray-300'
                                                }`}
                                            placeholder="Add remarks..."
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-right font-semibold">
                                    Total Quantities:
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">
                                    {formData.items.reduce((sum, item) => sum + item.pendingQuantity, 0)} (Pending)
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">
                                    {formData.items.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0)} (Current)
                                </td>
                                <td colSpan="2" className="px-6 py-4 whitespace-nowrap text-right font-semibold">
                                    Total Value: ₹{formData.items.reduce((sum, item) =>
                                        sum + (item.receivedQuantity * item.unitPrice), 0).toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

// GRN View Component
const GRNView = ({ grn, onBack }) => {
    const { isDarkMode } = useTheme();

    const getStatusBadgeColor = (status) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800',
            submitted: 'bg-blue-100 text-blue-800',
            inspection_pending: 'bg-yellow-100 text-yellow-800',
            inspection_in_progress: 'bg-orange-100 text-orange-800',
            inspection_completed: 'bg-green-100 text-green-800',
            approved: 'bg-emerald-100 text-emerald-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return colors[status] || colors.draft;
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <button
                        onClick={onBack}
                        className="mr-4 text-gray-500 hover:text-gray-700"
                    >
                        ← Back
                    </button>
                    <h2 className="text-2xl font-bold">
                        GRN: {grn.grnNumber}
                    </h2>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(grn.status)}`}>
                    {grn.status.replace(/_/g, ' ').toUpperCase()}
                </span>
            </div>

            {/* Basic Details */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div>
                    <label className="block text-sm font-medium mb-1">PO Code</label>
                    <p className="text-lg">{grn.purchaseOrder?.poCode || 'N/A'}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Challan Number</label>
                    <p className="text-lg">{grn.challanNumber}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Challan Date</label>
                    <p className="text-lg">{new Date(grn.challanDate).toLocaleDateString()}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Received Date</label>
                    <p className="text-lg">{new Date(grn.receivedDate).toLocaleDateString()}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Created By</label>
                    <p className="text-lg">{grn.createdBy?.name}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Created Date</label>
                    <p className="text-lg">{new Date(grn.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Vendor Details */}
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-lg font-semibold mb-4">Vendor Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Vendor Name</label>
                        <p className="text-lg">{grn.vendor?.name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Vendor Code</label>
                        <p className="text-lg">{grn.vendor?.code}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">GST Number</label>
                        <p className="text-lg">{grn.vendor?.gstNumber}</p>
                    </div>
                </div>
            </div>

            {/* Transport Details */}
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-lg font-semibold mb-4">Transport Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Vehicle Number</label>
                        <p className="text-lg">{grn.transportDetails?.vehicleNumber || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Transporter Name</label>
                        <p className="text-lg">{grn.transportDetails?.transporterName || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">E-way Bill Number</label>
                        <p className="text-lg">{grn.transportDetails?.ewayBillNumber || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Freight Terms</label>
                        <p className="text-lg">{grn.transportDetails?.freightTerms || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Freight Amount</label>
                        <p className="text-lg">₹{grn.transportDetails?.freightAmount?.toLocaleString() || '0'}</p>
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-lg font-semibold mb-4">Items</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Part Code
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Ordered Qty
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Previously Delivered
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Pending After GRN
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Current Received
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Unit Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Total Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Remarks
                                </th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            {grn.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.itemDetails.partCodeNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.itemDetails.itemName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        {item.orderedQuantity} {item.itemDetails.measurementUnit}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        {item.previouslyDelivered} {item.itemDetails.measurementUnit}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        {item.orderedQuantity - (item.previouslyDelivered + item.receivedQuantity)} {item.itemDetails.measurementUnit}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        {item.receivedQuantity} {item.itemDetails.measurementUnit}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        ₹{item.unitPrice.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        ₹{item.totalPrice.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.remarks || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-right font-semibold">
                                    Total Value:
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">
                                    ₹{grn.totalValue.toLocaleString()}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>


        </div>
    );
};


const getDeliveryStatusBadge = (item) => {
    const delivered = item.previouslyDelivered + item.receivedQuantity;
    const percentage = (delivered / item.orderedQuantity) * 100;

    if (percentage === 0) return (
        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            Pending
        </span>
    );
    if (percentage === 100) return (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Complete
        </span>
    );
    return (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            Partial ({percentage.toFixed(0)}%)
        </span>
    );
};

const DeliveryProgress = ({ item }) => {
    const delivered = item.previouslyDelivered + item.receivedQuantity;
    const percentage = (delivered / item.orderedQuantity) * 100;

    return (
        <div className="w-full">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="text-xs mt-1 text-gray-500">
                {delivered} of {item.orderedQuantity} delivered
            </div>
        </div>
    );
};

// Main GRN Component
export const GRNComponent = () => {
    const { isDarkMode } = useTheme();
    const [view, setView] = useState('list');
    const [selectedGRN, setSelectedGRN] = useState(null);
    const [grns, setGRNs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        dateFrom: '',
        dateTo: '',
        status: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    const fetchGRNs = useCallback(async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: pagination.currentPage.toString(),
                limit: pagination.itemsPerPage.toString(),
                ...(filters.search && { search: filters.search }),
                ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
                ...(filters.dateTo && { dateTo: filters.dateTo }),
                ...(filters.status && { status: filters.status })
            });

            // Add token if you have authentication
            const headers = {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Uncomment if using auth
            };

            const response = await fetch(
                `${baseURL}/grn?${queryParams.toString()}`,
                { headers }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('GRN Response:', data); // For debugging

            if (data.success) {
                setGRNs(data.data);
                setPagination(prev => ({
                    ...prev,
                    totalPages: data.pagination.pages,
                    totalItems: data.pagination.total
                }));
            } else {
                toast.error(data.message || 'Failed to fetch GRNs');
            }
        } catch (error) {
            console.error('Error fetching GRNs:', error);
            toast.error('Failed to fetch GRNs: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.currentPage, pagination.itemsPerPage, baseURL]);

    useEffect(() => {
        fetchGRNs();
    }, [fetchGRNs]);

    const handleCreateGRN = () => {
        setSelectedGRN(null);
        setView('create');
    };

    const handleEditGRN = (grn) => {
        setSelectedGRN(grn);
        setView('edit');
    };

    const handleViewGRN = (grn) => {
        setSelectedGRN(grn);
        setView('view');
    };

    const handleDeleteGRN = async (grnId) => {
        if (window.confirm('Are you sure you want to delete this GRN?')) {
            try {
                const response = await fetch(`${baseURL}/api/grn/${grnId}`, {
                    method: 'DELETE'
                });
                const data = await response.json();

                if (data.success) {
                    toast.success('GRN deleted successfully');
                    fetchGRNs();
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                console.error('Error deleting GRN:', error);
                toast.error('Failed to delete GRN');
            }
        }
    };

    const getStatusBadgeColor = (status) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800',
            submitted: 'bg-blue-100 text-blue-800',
            inspection_pending: 'bg-yellow-100 text-yellow-800',
            inspection_in_progress: 'bg-orange-100 text-orange-800',
            inspection_completed: 'bg-green-100 text-green-800',
            approved: 'bg-emerald-100 text-emerald-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return colors[status] || colors.draft;
    };

    const renderGRNList = () => (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Goods Receipt Notes</h2>
                <button
                    onClick={handleCreateGRN}
                    className={`flex items-center px-4 py-2 rounded-md 
                        ${isDarkMode
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-blue-500 hover:bg-blue-600'} 
                        text-white transition-colors duration-200`}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create GRN
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className={`w-full pl-10 pr-4 py-2 rounded-md border 
                            ${isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                </div>

                <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className={`rounded-md border p-2
                        ${isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'}`}
                />

                <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className={`rounded-md border p-2
                        ${isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'}`}
                />

                <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className={`rounded-md border p-2
                        ${isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'}`}
                >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="inspection_pending">Inspection Pending</option>
                    <option value="inspection_in_progress">Inspection In Progress</option>
                    <option value="inspection_completed">Inspection Completed</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* GRN Table */}
            <div className={`rounded-lg shadow overflow-hidden
                ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">GRN Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">PO Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Vendor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Challan Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Total Value</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center">Loading...</td>
                            </tr>
                        ) : grns.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center">No GRNs found</td>
                            </tr>
                        ) : (
                            grns.map((grn) => (
                                <tr key={grn._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleViewGRN(grn)}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            {grn.grnNumber}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {grn.purchaseOrder?.poCode || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {grn.vendor?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(grn.challanDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${getStatusBadgeColor(grn.status)}`}>
                                            {grn.status.replace(/_/g, ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        ₹{grn.totalValue.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleViewGRN(grn)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {grn.status === 'draft' && (
                                                <>
                                                    <button
                                                        onClick={() => handleEditGRN(grn)}
                                                        className="text-green-500 hover:text-green-700"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteGRN(grn._id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-500">
                    Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                    {pagination.totalItems} entries
                </span>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                        disabled={pagination.currentPage === 1}
                        className={`px-3 py-1 rounded-md ${isDarkMode
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-white hover:bg-gray-100'
                            } border disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className={`px-3 py-1 rounded-md ${isDarkMode
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-white hover:bg-gray-100'
                            } border disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );

    const handleGRNSuccess = (newGRN) => {
        // Update the GRNs list with the new data
        setGRNs(prevGRNs => {
            if (newGRN._id) {
                // If editing, replace the existing GRN
                const updatedGRNs = prevGRNs.map(grn =>
                    grn._id === newGRN._id ? newGRN : grn
                );
                return updatedGRNs;
            } else {
                // If creating, add the new GRN to the beginning of the list
                return [newGRN, ...prevGRNs];
            }
        });

        // Reset view to list
        setView('list');

        // Refresh the list to ensure proper sorting and pagination
        fetchGRNs();
    };

    const renderContent = () => {
        switch (view) {
            case 'create':
                return <GRNForm
                    onBack={() => setView('list')}
                    onSuccess={handleGRNSuccess}
                />;
            case 'edit':
                return <GRNForm
                    grn={selectedGRN}
                    onBack={() => setView('list')}
                    onSuccess={handleGRNSuccess}
                />;
            case 'view':
                return <GRNView grn={selectedGRN} onBack={() => setView('list')} />;
            default:
                return renderGRNList();
        }
    };

    return (
        <div className={`p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            {renderContent()}
        </div>
    );
};

export default GRNComponent;