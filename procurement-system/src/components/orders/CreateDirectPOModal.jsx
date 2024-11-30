import React, { useState, useEffect } from 'react';
import { Modal, message, Spin, Select } from 'antd';
import { api } from '../../utils/endpoint';
import { baseURL } from '../../utils/endpoint';
import PurchaseOrderForm from './PurchaseOrderForm';
import PartForm from '../Products/partForm';
import axios from 'axios';
const CreateDirectPOModal = ({ isOpen, onClose, indent, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedPartCodes, setSelectedPartCodes] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [itemPartCodes, setItemPartCodes] = useState({});
    const [itemDetails, setItemDetails] = useState({});
    const [initialPOData, setInitialPOData] = useState({});

    useEffect(() => {
        if (isOpen) {
            resetSelections();
            fetchPartCodesForItems();
        }
    }, [isOpen]);

    const resetSelections = () => {
        setSelectedItems([]);
        setSelectedPartCodes({});
        setItemDetails({});
    };

    const fetchPartCodesForItems = async () => {
        setIsLoading(true);
        try {
            const allItems = [
                ...(indent?.items?.existing || []).map(item => ({ ...item, type: 'existing' })),
                ...(indent?.items?.new || []).map(item => ({ ...item, type: 'new' }))
            ];

            const partCodesPromises = allItems
                .filter(item => item.reference)
                .map(item => 
                    api(`${baseURL}/parts/getPartByItemCode/${item.reference}`, 'get')
                );

            const responses = await Promise.all(partCodesPromises);
            console.log("responses", responses);

            const partCodesMap = {};
            const detailsMap = {};
            
            allItems.forEach((item, index) => {
                if (item.reference) {
                    const partsData = responses[index]?.data?.data || [];
                    partCodesMap[item._id] = partsData;
                    detailsMap[item._id] = {
                        ...item,
                        availablePartCodes: partsData
                    };
                }
            });

            console.log("partCodesMap", partCodesMap);
            console.log("detailsMap", detailsMap);

            setItemPartCodes(partCodesMap);
            setItemDetails(detailsMap);
        } catch (error) {
            console.error('Error fetching part codes:', error);
            message.error('Failed to fetch part codes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleItemSelection = (itemId) => {
        if (selectedItems.includes(itemId)) {
            setSelectedItems(prev => prev.filter(id => id !== itemId));
            setSelectedPartCodes(prev => {
                const { [itemId]: removed, ...rest } = prev;
                return rest;
            });
        } else {
            setSelectedItems(prev => [...prev, itemId]);
        }
    };

    const handlePartCodeSelect = (itemId, partCodeNumber) => {
        if (!partCodeNumber) {
            setSelectedItems(prev => prev.filter(id => id !== itemId));
            setSelectedPartCodes(prev => {
                const { [itemId]: removed, ...rest } = prev;
                return rest;
            });
            setItemDetails(prev => {
                const { [itemId]: removed, ...rest } = prev;
                return rest;
            });
            return;
        }

        const selectedPart = itemPartCodes[itemId]?.find(
            part => part.PartCodeNumber === partCodeNumber
        );

        setSelectedPartCodes(prev => ({
            ...prev,
            [itemId]: selectedPart
        }));

        setItemDetails(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                selectedPartCode: selectedPart,
                unitPrice: prev[itemId]?.unitPrice || ''
            }
        }));
    };

    const validateSelections = () => {
        const missingPrices = selectedItems.filter(
            itemId => !itemDetails[itemId]?.unitPrice
        );

        if (missingPrices.length > 0) {
            message.warning('Please enter unit prices for all selected items');
            return false;
        }

        return selectedItems.length > 0 && 
               selectedItems.every(itemId => selectedPartCodes[itemId]);
    };

    const handleNext = () => {
        if (!validateSelections()) return;
        
        const selectedItemsData = selectedItems.map(itemId => {
            const itemDetail = itemDetails[itemId];
            const originalItem = indent.items.existing.find(i => i._id === itemId) || 
                               indent.items.new.find(i => i._id === itemId);
            const partCode = selectedPartCodes[itemId];
            
            return {
                partCode: partCode.PartCodeNumber,
                masterItemName: originalItem.name,
                quantity: originalItem.quantity,
                unitPrice: itemDetail.unitPrice,
                totalPrice: (parseFloat(itemDetail.unitPrice) * originalItem.quantity).toFixed(2),
                unit: partCode.MeasurementUnit,
                itemDetails: {
                    ...originalItem,
                    partCodeDetails: partCode
                }
            };
        });

        // Prepare initial PO data
        const initialPOData = {
            projectCode: indent.projectCode || '001',
            projectName: indent.projectName || '',
            projectId: indent.projectId || '',
            unitCode: indent.unitCode || '001',
            unitName: indent.unitName || '',
            poDate: new Date().toISOString().split('T')[0],
            validUpto: '', // To be filled
            status: 'draft',
            items: selectedItemsData,
            // Other fields will be empty for user to fill
            vendorId: '',
            vendorCode: '',
            vendorName: '',
            vendorAddress: '',
            vendorGst: '',
            invoiceTo: {
                name: '',
                branchName: '',
                address: '',
                city: '',
                state: '',
                pin: ''
            },
            dispatchTo: {
                name: '',
                branchName: '',
                address: '',
                city: '',
                state: '',
                pin: ''
            },
            deliveryDate: '',
            supplierRef: '',
            otherRef: '',
            dispatchThrough: '',
            destination: '',
            paymentTerms: '',
            deliveryTerms: '',
            poNarration: '',
            indentReference: indent._id // Store reference to original indent
        };

        setInitialPOData(initialPOData); // New state to store PO data
        setStep(2);
    };

    // Render step 2 with PurchaseOrderForm
    const renderStep2 = () => (
        <div className="py-4">
            <PurchaseOrderForm
                initialData={initialPOData}
                onCancel={onClose}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                onSuccess={() => {
                    onSuccess?.();
                    console.log("onSuccess");
                    onClose();
                    // setStep(1); // Reset step to initial state
                    // resetSelections(); 
                }}
                isDirectPO={true} // New prop to indicate direct PO creation
                readOnlyItems={true} // Items are pre-filled and shouldn't be editable
            />
        </div>
    );

    const ItemCard = ({ item, isExisting = true }) => {
        const [showPartForm, setShowPartForm] = useState(false);
        const isSelected = selectedItems.includes(item._id);
        const partCodes = itemPartCodes[item._id] || [];
        const selectedPartCode = selectedPartCodes[item._id];
        const itemExists = itemDetails[item._id]?.availablePartCodes !== undefined;

        const handleItemClick = () => {
            if (!itemExists) {
                message.error(
                    <div>
                        <p>Item code no longer exists in the database.</p>
                        <p>Please update the item master data first.</p>
                    </div>
                );
                return;
            }

            if (partCodes.length === 0) {
                message.warning(
                    <div>
                        <p>No parts assigned to this item.</p>
                        <p>Please create part details first.</p>
                    </div>
                );
                return;
            }
            handleItemSelection(item._id);
        };

        const handleCreatePart = () => {
            setShowPartForm(true);
        };

        const handlePartFormSubmit = async (formData) => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem('token');
                
                const response = await axios.post(
                    `${baseURL}/parts/createPart`,
                    formData,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (response.data.success) {
                    message.success('Part created successfully');
                    setShowPartForm(false);
                    
                    // Refresh the part codes and item details
                    await fetchPartCodesForItems();
                    
                    // Optionally auto-select the item after creating its part
                    const itemId = item._id;
                    if (!selectedItems.includes(itemId)) {
                        handleItemSelection(itemId);
                    }
                }
            } catch (error) {
                console.error('Error creating part:', error);
                const errorMessage = error.response?.data?.error ||
                    error.response?.data?.message ||
                    'Failed to create part';
                message.error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        return (
            <>
                <div className={`border rounded-lg p-4 mb-3 transition-all duration-200 ${
                    isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
                }`}>
                    <div className="flex items-start space-x-4">
                        <div 
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer
                                ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
                                ${!isExisting && (!partCodes || partCodes.length === 0) ? 'opacity-50' : ''}
                            `}
                            onClick={handleItemClick}
                        >
                            {isSelected && (
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium text-lg">{item.name}</h4>
                                    <div className="text-sm text-gray-600 mt-1">
                                        <span className="inline-flex items-center bg-gray-100 px-2 py-1 rounded">
                                            Qty: {item.quantity}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {isSelected && (
                                <div className="mt-4">
                                    <div className="mb-3">
                                        <Select
                                            placeholder="Select part code"
                                            style={{ width: '100%' }}
                                            onChange={(value) => handlePartCodeSelect(item._id, value)}
                                            value={selectedPartCode?.PartCodeNumber}
                                        >
                                            {partCodes.map(part => (
                                                <Select.Option key={part.PartCodeNumber} value={part.PartCodeNumber}>
                                                    {part.PartCodeNumber}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </div>

                                    {selectedPartCode && (
                                        <>
                                            <div className="mb-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Unit Price (₹)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={itemDetails[item._id]?.unitPrice || ''}
                                                    onChange={(e) => {
                                                        const newPrice = e.target.value;
                                                        setItemDetails(prev => ({
                                                            ...prev,
                                                            [item._id]: {
                                                                ...prev[item._id],
                                                                unitPrice: newPrice
                                                            }
                                                        }));
                                                    }}
                                                    placeholder="Enter unit price"
                                                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            <div className="p-3 bg-gray-50 rounded-md">
                                                <h5 className="font-medium mb-2">Selected Part Details:</h5>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <p>Size: {selectedPartCode.SizeName || 'N/A'}</p>
                                                    <p>Color: {selectedPartCode.ColourName || 'N/A'}</p>
                                                    <p>Make: {selectedPartCode.ItemMakeName || 'N/A'}</p>
                                                    <p>Unit: {selectedPartCode.MeasurementUnit || 'N/A'}</p>
                                                    {itemDetails[item._id]?.unitPrice && (
                                                        <p className="col-span-2 text-blue-600 font-medium">
                                                            Total Price: ₹{(parseFloat(itemDetails[item._id].unitPrice) * item.quantity).toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {isExisting && itemExists && partCodes.length === 0 && (
                                <div className="mt-2 w-full">
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                        <p className="text-yellow-700 text-sm">No parts assigned to this item.</p>
                                        <button
                                            onClick={handleCreatePart}
                                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                                        >
                                            Create Part Details
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isExisting && !itemExists && (
                                <div className="mt-2 w-full">
                                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                        <p className="text-red-700 text-sm">
                                            Item code no longer exists in the database.
                                        </p>
                                        <p className="text-red-600 text-sm mt-1">
                                            Please update the item master data first.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Part Form Modal */}
                <Modal
                    title="Create Part Details"
                    open={showPartForm}
                    onCancel={() => setShowPartForm(false)}
                    footer={null}
                    width={800}
                >
                    <PartForm
                        initialData={{
                            ItemCode: item.reference, // Pre-fill the item code
                            PartCodeNumber: '', // This will be filled by the user
                        }}
                        onSubmit={handlePartFormSubmit}
                        onCancel={() => setShowPartForm(false)}
                    />
                </Modal>
            </>
        );
    };

    return (
        <Modal
            title={`Create Purchase Order - ${step === 1 ? 'Select Items' : 'Fill PO Details'}`}
            open={isOpen}
            onCancel={onClose}
            width={1000} // Increased width for PO form
            footer={null}
        >
            {isLoading ? (
                <div className="flex justify-center items-center py-8">
                    <Spin size="large" />
                </div>
            ) : (
                <div className="space-y-4">
                    {step === 1 ? (
                        <>
                            <div className="bg-blue-50 p-4 rounded-md mb-4">
                                <p className="text-sm text-blue-700">
                                    Select items and their corresponding part codes to create a Purchase Order
                                </p>
                            </div>

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
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-medium">New Items</h4>
                                        <span className="text-sm text-orange-600">
                                            * New items require Item Part details in Item Master
                                        </span>
                                    </div>
                                    {indent.items.new.map(item => (
                                        <ItemCard 
                                            key={item._id} 
                                            item={item} 
                                            isExisting={false}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 mt-4">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={selectedItems.length === 0}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    ) : (
                        renderStep2()
                    )}
                </div>
            )}
        </Modal>
    );
};

export default CreateDirectPOModal; 