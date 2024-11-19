import React, { useState, useEffect } from 'react';
import { Modal, Select, message } from 'antd';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { baseURL } from '../../utils/endpoint';

const CreateRfqModal = ({ isOpen, onClose, indent, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedVendors, setSelectedVendors] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [rfqFormData, setRfqFormData] = useState({
        submissionDeadline: new Date(),
        publishDate: new Date(),
        generalTerms: "",
        unit: indent?.unit?._id || "",
        project: indent?.project?._id || ""
    });

    // Add reset function
    const resetModal = () => {
        setStep(1);
        setSelectedItems([]);
        setSelectedVendors([]);
        setRfqFormData({
            submissionDeadline: new Date(),
            publishDate: new Date(),
            generalTerms: "",
            unit: indent?.unit?._id || "",
            project: indent?.project?._id || ""
        });
    };

    // Update handleClose
    const handleClose = () => {
        resetModal();
        onClose();
    };

    // Fetch vendors
    useEffect(() => {
        const fetchVendors = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get(`${baseURL}/vendors`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setVendors(response.data.vendors || []);
            } catch (error) {
                console.error('Error fetching vendors:', error);
                message.error('Failed to fetch vendors');
            } finally {
                setIsLoading(false);
            }
        };

        if (step === 2) {
            fetchVendors();
        }
    }, [step]);

    // Handle item selection
    const handleItemSelection = (itemId) => {
        const item = indent.items.existing.find(i => i._id === itemId) || 
                    indent.items.new.find(i => i._id === itemId);
        
        // Don't allow selection if item already has RFQ or PO
        if (item && (item.status === 'rfq' || item.status === 'po')) {
            message.warning(`This item already has a ${item.status.toUpperCase()} created`);
            return;
        }

        setSelectedItems(prev => {
            if (prev.includes(itemId)) {
                return prev.filter(id => id !== itemId);
            }
            return [...prev, itemId];
        });
    };

    // Render item card
    const ItemCard = ({ item, isExisting = true }) => {
        const isSelected = selectedItems.includes(item._id);
        
        // Add status badge component
        const StatusBadge = ({ status }) => {
            const getStatusColor = (status) => {
                switch (status) {
                    case 'rfq':
                        return 'bg-blue-100 text-blue-800';
                    case 'po':
                        return 'bg-green-100 text-green-800';
                    default: // 'indent'
                        return 'bg-gray-100 text-gray-800';
                }
            };

            return (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                    {status.toUpperCase()}
                </span>
            );
        };
        
        return (
            <div 
                className={`p-4 border rounded-lg mb-2 ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
            >
                <div className="flex items-start space-x-3">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleItemSelection(item._id)}
                        className="mt-1"
                        // Disable checkbox if item already has RFQ or PO
                        disabled={item.status === 'rfq' || item.status === 'po'}
                    />
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h4 className="font-medium">{item.name}</h4>
                            <StatusBadge status={item.status || 'indent'} />
                        </div>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        {isExisting && (
                            <p className="text-sm text-gray-600">Item Code: {item.itemCode}</p>
                        )}
                        {/* {(item.status === 'rfq' || item.status === 'po') && (
                            <p className="text-sm text-red-500 mt-1">
                                This item already has a {item.status.toUpperCase()} created
                            </p>
                        )} */}
                    </div>
                </div>
            </div>
        );
    };

    const renderVendorCard = (vendor) => {
        const isSelected = selectedVendors.includes(vendor._id);
        
        return (
            <div 
                key={vendor._id}
                className={`p-4 border rounded-lg mb-3 cursor-pointer ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handleVendorSelection(vendor._id)}
            >
                <div className="flex items-start space-x-3">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                            e.stopPropagation();
                            handleVendorSelection(vendor._id);
                        }}
                        className="mt-1"
                    />
                    <div className="flex-1">
                        <h4 className="font-medium">{vendor.name}</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>Contact: {vendor.contactPerson}</p>
                            <p>Email: {vendor.email}</p>
                            <p>Phone: {vendor.contactNumber}</p>
                            <p>GST: {vendor.gstNumber}</p>
                            <p>Location: {vendor.address.city}, {vendor.address.state}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handleVendorSelection = (vendorId) => {
        setSelectedVendors(prev => {
            if (prev.includes(vendorId)) {
                return prev.filter(id => id !== vendorId);
            }
            return [...prev, vendorId];
        });
    };

    // Handle RFQ creation
    const handleCreateRfq = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');

            // Format the selected items
            const formattedItems = selectedItems.map(itemId => {
                const existingItem = indent.items.existing.find(item => item._id === itemId);
                const newItem = indent.items.new.find(item => item._id === itemId);

                if (existingItem) {
                    return {
                        indentItemType: "existing",
                        indentItemId: itemId,
                        name: existingItem.name,
                        quantity: existingItem.quantity || 0,
                        itemCode: existingItem.itemCode,
                        requiredDeliveryDate: existingItem.requiredDeliveryDate || new Date()
                    };
                } else if (newItem) {
                    return {
                        indentItemType: "new",
                        name: newItem.name,
                        quantity: newItem.quantity || 0,
                        requiredDeliveryDate: newItem.requiredDeliveryDate || new Date()
                    };
                }
                return null;
            }).filter(item => item !== null);

            // Format the selected vendors
            const formattedVendors = selectedVendors.map(vendorId => ({
                vendor: vendorId,
                status: 'invited'
            }));

            const rfqData = {
                indent: indent._id,
                unit: indent.unit,
                project: indent.project,
                items: formattedItems,
                selectedVendors: formattedVendors,
                publishDate: rfqFormData.publishDate,
                submissionDeadline: rfqFormData.submissionDeadline,
                generalTerms: rfqFormData.generalTerms
            };

            const response = await axios.post(`${baseURL}/rfq/createRFQ`, rfqData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log("response after creation of rfq", response.data)
            if (response.data.success === true) {
                // Send emails to vendors
                await axios.post(
                    `${baseURL}/rfq/notify-vendors`,
                    {
                        rfqId: response.data.data.rfqId,
                        vendorIds: selectedVendors,
                        // items: formattedItems,
                        submissionDeadline: rfqFormData.submissionDeadline,
                        generalTerms: rfqFormData.generalTerms
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                message.success('RFQ created and vendors notified successfully');
                onSuccess();
                handleClose();
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Error creating RFQ:', error);
            message.error(error.response?.data?.message || error.message || 'Failed to create RFQ');
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep2 = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Select Vendors</h3>
            
            {isLoading ? (
                <div className="text-center py-4">
                    <span className="text-gray-600">Loading vendors...</span>
                </div>
            ) : vendors.length === 0 ? (
                <div className="text-center py-4">
                    <span className="text-gray-600">No vendors found</span>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {vendors.map(vendor => renderVendorCard(vendor))}
                    </div>

                    <div className="flex justify-end space-x-3 mt-4">
                        <button
                            onClick={() => setStep(1)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => setStep(3)}
                            disabled={selectedVendors.length === 0}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <Modal
            title={`Create RFQ - Step ${step} of 3`}
            open={isOpen}
            onCancel={handleClose}
            footer={null}
            width={800}
            maskClosable={false}
            closable={true}
        >
            {step === 1 ? (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium mb-4">Select Items</h3>
                    
                    {/* Check if all items have RFQs/POs */}
                    {indent?.items?.existing?.every(item => item.status === 'rfq' || item.status === 'po') &&
                     indent?.items?.new?.every(item => item.status === 'rfq' || item.status === 'po') ? (
                        <div className="text-center py-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-yellow-700">
                                All items in this indent already have RFQs or POs created.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Existing Items */}
                            {indent?.items?.existing?.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-medium mb-2">Existing Items</h4>
                                    {indent.items.existing.map(item => (
                                        <ItemCard 
                                            key={item._id} 
                                            item={item} 
                                            isExisting={true}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* New Items */}
                            {indent?.items?.new?.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2">New Items</h4>
                                    {indent.items.new.map(item => (
                                        <ItemCard 
                                            key={item._id} 
                                            item={item} 
                                            isExisting={false}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {selectedItems.length > 0 && (
                        <div className="flex justify-end">
                            <button
                                onClick={() => setStep(2)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            ) : step === 2 ? (
                renderStep2()
            ) : (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium mb-4">RFQ Details</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Submission Deadline
                            </label>
                            <DatePicker
                                selected={rfqFormData.submissionDeadline}
                                onChange={(date) => setRfqFormData(prev => ({
                                    ...prev,
                                    submissionDeadline: date
                                }))}
                                className="w-full p-2 border rounded"
                                minDate={new Date()}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Publish Date
                            </label>
                            <DatePicker
                                selected={rfqFormData.publishDate}
                                onChange={(date) => setRfqFormData(prev => ({
                                    ...prev,
                                    publishDate: date
                                }))}
                                className="w-full p-2 border rounded"
                                minDate={new Date()}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                General Terms
                            </label>
                            <textarea
                                value={rfqFormData.generalTerms}
                                onChange={(e) => setRfqFormData(prev => ({
                                    ...prev,
                                    generalTerms: e.target.value
                                }))}
                                className="w-full p-2 border rounded"
                                rows={4}
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setStep(2)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleCreateRfq}
                                disabled={isLoading}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
                            >
                                {isLoading ? 'Creating...' : 'Create RFQ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default CreateRfqModal;