import React, { useState } from 'react';
import { Modal, message } from 'antd';
import axios from 'axios';
import { baseURL } from '../../utils/endpoint';

const VendorQuoteForm = ({ isOpen, onClose, rfq, vendor }) => {
    const [formData, setFormData] = useState(
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

    const [loading, setLoading] = useState(false);

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
            const token = localStorage.getItem('token');
            
            const quoteData = {
                rfqId: rfq._id,
                vendorId: vendor._id,
                items: formData.map(item => ({
                    itemId: item.itemId,
                    quotedPrice: parseFloat(item.quotedPrice),
                    quotedQuantity: parseInt(item.quotedQuantity),
                    remarks: item.remarks,
                    deliveryTimeline: item.deliveryTimeline
                }))
            };

            const response = await axios.post(
                `${baseURL}/rfq/submit-quote`,
                quoteData,
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                message.success('Quote submitted successfully');
                onClose();
            }
        } catch (error) {
            console.error('Error submitting quote:', error);
            message.error(error.response?.data?.message || 'Failed to submit quote');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={`Submit Quote - ${rfq.rfqNumber}`}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-gray-50 p-3 rounded text-sm mb-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-gray-600">RFQ Number:</span>
                            <span className="ml-1 font-medium">{rfq.rfqNumber}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Vendor:</span>
                            <span className="ml-1 font-medium">{vendor.name}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Submission Deadline:</span>
                            <span className="ml-1 font-medium">
                                {new Date(rfq.submissionDeadline).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {formData.map((item, index) => (
                        <div key={item.itemId} className="border rounded p-4">
                            <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Item Name
                                    </label>
                                    <div className="mt-1 text-sm">{item.name}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Required Quantity
                                    </label>
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
                                        className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm"
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
                                        className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm"
                                        required
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Delivery Timeline *
                                    </label>
                                    <input
                                        type="date"
                                        value={item.deliveryTimeline}
                                        onChange={(e) => handleInputChange(index, 'deliveryTimeline', e.target.value)}
                                        className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm"
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
                                        className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm"
                                        placeholder="Optional remarks"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm border rounded text-gray-700 hover:bg-gray-50"
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