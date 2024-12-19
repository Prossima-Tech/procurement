import React, { useState, useEffect } from 'react';
import { Modal, message } from 'antd';
import axios from 'axios';
import { baseURL } from '../../../utils/endpoint';

const VendorQuoteForm = ({ isOpen, onClose, rfq, vendor }) => {
    const [formData, setFormData] = useState([]);
    const [loading, setLoading] = useState(false);
    // console.log("rfq", rfq);
    // console.log("vendor", vendor);
    useEffect(() => {
        if (rfq?.items?.length > 0) {
            setFormData(
                rfq.items.map(item => ({
                    itemId: item._id,
                    name: item.name,
                    requiredQuantity: item.quantity,
                    quotedPrice: '',
                    quotedQuantity: item.quantity,
                    remarks: '',
                    deliveryTimeline: ''
                }))
            );
        }
    }, [rfq]);

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
        
        if (!formData.length) {
            message.error('No items to submit');
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

        try {
            setLoading(true);
            console.log("data to the endpoint", {...formData, vendorId: vendor.vendor, rfqId: rfq._id})
            const response = await fetch(`${baseURL}/rfq/submitVendorQuote/${vendor.vendor}/${rfq._id}`, {
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

    return (
        <Modal
            title="Submit Quote"
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* RFQ Details Header */}
                <div className="bg-gray-50 p-3 rounded text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-gray-600">RFQ Number:</span>
                            <span className="ml-1 font-medium">{rfq?.rfqNumber}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Deadline:</span>
                            <span className="ml-1 font-medium">
                                {rfq?.submissionDeadline && new Date(rfq.submissionDeadline).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                    {formData.map((item, index) => (
                        <div key={item.itemId} className="border rounded p-4">
                            <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Item Name</label>
                                    <div className="mt-1 text-sm">{item.name}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Required Quantity</label>
                                    <div className="mt-1 text-sm">{item.requiredQuantity}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Price per Unit (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        value={item.quotedPrice}
                                        onChange={(e) => handleInputChange(index, 'quotedPrice', e.target.value)}
                                        className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm p-2 border"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        value={item.quotedQuantity}
                                        onChange={(e) => handleInputChange(index, 'quotedQuantity', e.target.value)}
                                        className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm p-2 border"
                                        required
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Delivery Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={item.deliveryTimeline}
                                        onChange={(e) => handleInputChange(index, 'deliveryTimeline', e.target.value)}
                                        className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm p-2 border"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Remarks
                                    </label>
                                    <input
                                        type="text"
                                        value={item.remarks}
                                        onChange={(e) => handleInputChange(index, 'remarks', e.target.value)}
                                        className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm p-2 border"
                                        placeholder="Optional remarks"
                                    />
                                </div>
                            </div>

                            {/* Total Amount Display */}
                            <div className="mt-3 text-right">
                                <span className="text-sm font-medium text-gray-700">
                                    Total Amount: ₹
                                    {item.quotedPrice && item.quotedQuantity 
                                        ? (parseFloat(item.quotedPrice) * parseInt(item.quotedQuantity)).toLocaleString()
                                        : '0'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm border rounded text-gray-700 hover:bg-gray-50"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Submit Quote'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default VendorQuoteForm; 