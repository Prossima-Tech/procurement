import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Calendar, 
    DollarSign, 
    Package, 
    Truck, 
    MessageSquare,
    AlertCircle,
    CheckCircle,
    Clock
} from 'lucide-react';
import { baseURL } from '../../utils/endpoint';

const ExternalVendorQuoteForm = () => {
    const { vendorId, rfqId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rfq, setRfq] = useState(null);
    const [vendor, setVendor] = useState(null);
    const [formData, setFormData] = useState([]);
    useEffect(() => {
        console.log("vendorId", vendorId);
        console.log("rfqId", rfqId);
    }, [vendorId, rfqId]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                const response = await fetch(`${baseURL}/rfq/vendorQuote/${rfqId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                
                const data = await response.json();
                setRfq(data.rfq);
                setVendor(data.vendor);
                
                // Initialize form data from API response
                if (data.rfq.items) {
                    setFormData(data.rfq.items.map(item => ({
                        itemId: item._id,
                        name: item.name,
                        itemCode: item.itemCode || '',
                        requiredQuantity: item.quantity,
                        requiredDeliveryDate: item.requiredDeliveryDate,
                        quotedPrice: '',
                        quotedQuantity: item.quantity,
                        remarks: '',
                        deliveryTimeline: ''
                    })));
                }
                
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load required information. Please check the URL and try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        console.log("formData fetching on the external vendor quote form", formData);
    }, [vendorId, rfqId]);

    const handleInputChange = (index, field, value) => {
        const newFormData = [...formData];
        newFormData[index] = {
            ...newFormData[index],
            [field]: value
        };
        setFormData(newFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!rfq || !vendor) {
            message.error('Missing required information');
            return;
        }

        // Validate form
        const invalidItems = formData.filter(item => 
            !item.quotedPrice || 
            !item.quotedQuantity || 
            !item.deliveryTimeline
        );

        if (invalidItems.length > 0) {
            message.error('Please fill all required fields for all items');
            return;
        }

        // Validate numeric values
        // const invalidValues = formData.some(item => 
        //     isNaN(parseFloat(item.quotedPrice)) || 
        //     parseFloat(item.quotedPrice) <= 0 ||
        //     isNaN(parseInt(item.quotedQuantity)) || 
        //     parseInt(item.quotedQuantity) <= 0 ||
        //     isNaN(parseInt(item.deliveryTimeline)) || 
        //     parseInt(item.deliveryTimeline) <= 0
        // );

        // if (invalidValues) {
        //     message.error('Please enter valid numeric values for price, quantity, and delivery timeline');
        //     return;
        // }

        try {
            setLoading(true);
            console.log("data to the endpoint", {...formData, vendorId: vendor.id, rfqId: rfq._id})
            const response = await fetch(`${baseURL}/rfq/submitVendorQuote/${vendor.id}/${rfq._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData.map(item => ({
                    ...item,
                    quotedPrice: parseFloat(item.quotedPrice),
                    quotedQuantity: parseInt(item.quotedQuantity),
                    deliveryTimeline: parseInt(item.deliveryTimeline)
                })))
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit quote');
            }

            const result = await response.json();
            
            message.success('Quote submitted successfully!');
            navigate('/vendor/quotes', { 
                state: { 
                    success: true,
                    rfqNumber: result.data.rfqNumber,
                    quotationReference: result.data.quotationReference,
                    totalAmount: result.data.totalAmount 
                }
            });
            
        } catch (error) {
            console.error('Error submitting quote:', error);
            message.error(error.message || 'Failed to submit quote');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>;
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="text-red-500 text-center">
                <h2 className="text-xl font-bold mb-2">Error</h2>
                <p>{error}</p>
            </div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-semibold text-gray-900">Vendor Quote Submission</h1>
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-amber-500" />
                            <span className="text-sm text-gray-600">
                                Deadline: {new Date(rfq?.submissionDeadline).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-medium">Quote Details - {rfq?.rfqNumber}</h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Please provide your quotation for the requested items below.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="p-6 space-y-6">
                                    {formData.map((item, index) => (
                                        <div 
                                            key={item.itemId} 
                                            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-200 transition-colors"
                                        >
                                            {/* Item Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {item.name}
                                                    </h3>
                                                    {item.itemCode && (
                                                        <span className="mt-1 text-sm text-gray-500">
                                                            Code: {item.itemCode}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                                    Required: {item.requiredQuantity} units
                                                </span>
                                            </div>

                                            {/* Form Fields */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                                            <DollarSign className="w-4 h-4" />
                                                            Price per Unit (₹)
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                value={item.quotedPrice}
                                                                onChange={(e) => handleInputChange(index, 'quotedPrice', e.target.value)}
                                                                className="block w-full pl-3 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-sm"
                                                                required
                                                                min="0"
                                                                step="0.01"
                                                                placeholder="Enter unit price"
                                                            />
                                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                                <span className="text-gray-500 text-sm">₹</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                                            <Package className="w-4 h-4" />
                                                            Quantity
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={item.quotedQuantity}
                                                            onChange={(e) => handleInputChange(index, 'quotedQuantity', e.target.value)}
                                                            className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-sm"
                                                            required
                                                            min="1"
                                                            placeholder="Enter quantity"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                                            <Truck className="w-4 h-4" />
                                                            Delivery Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={item.deliveryTimeline}
                                                            onChange={(e) => handleInputChange(index, 'deliveryTimeline', e.target.value)}
                                                            className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-sm"
                                                            required
                                                            min={new Date().toISOString().split('T')[0]}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                                            <MessageSquare className="w-4 h-4" />
                                                            Remarks
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={item.remarks}
                                                            onChange={(e) => handleInputChange(index, 'remarks', e.target.value)}
                                                            className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-sm"
                                                            placeholder="Optional remarks"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Total Amount */}
                                            {item.quotedPrice && item.quotedQuantity && (
                                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Total Amount:</span>
                                                        <span className="text-lg font-semibold text-gray-900">
                                                            ₹ {(parseFloat(item.quotedPrice) * parseInt(item.quotedQuantity)).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Form Actions */}
                                <div className="px-6 py-4 bg-gray-50 border-t rounded-b-lg">
                                    <div className="flex justify-end gap-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                        >
                                            {loading ? 'Submitting...' : 'Submit Quote'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExternalVendorQuoteForm;