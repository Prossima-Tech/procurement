/* eslint-disable no-undef */
import React, { useState, useEffect, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Search, Plus, Trash2, ChevronLeft } from 'lucide-react';
import { api, baseURL } from '../../../utils/endpoint';
import { useTheme } from '../../../contexts/ThemeContext';
import axios from 'axios';
import PropTypes from 'prop-types';

const PurchaseOrderForm = ({
    onCancel,
    isLoading,
    setIsLoading,
    initialData,
    setIsModalOpen,
    setIsCreatingNew,
    fetchPurchaseOrders,
    setEditingPO,
    isDirectPO = false,
    readOnlyItems = false,
    onSubmit
}) => {
    const { isDarkMode } = useTheme();
    const [formData, setFormData] = useState({
        vendorId: '',
        vendorCode: '',
        vendorName: '',
        vendorAddress: '',
        vendorGst: '',
        projectCode: '001',
        projectName: '',
        projectId: '',
        unitId: '',
        unitCode: '001',
        unitName: '',
        poDate: '',
        validUpto: '',
        status: 'draft',
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
        items: [{ partCode: '', quantity: '', unitPrice: '' }],
        deliveryDate: '',
        supplierRef: '',
        otherRef: '',
        dispatchThrough: '',
        destination: '',
        paymentTerms: '',
        deliveryTerms: '',
        poNarration: ''
    });

    const [vendorSuggestions, setVendorSuggestions] = useState([]);
    const [newItem, setNewItem] = useState({ partCode: '', quantity: '', unitPrice: '' });
    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        if (initialData) {
            const formattedData = {
                ...initialData,
                poDate: initialData.poDate || new Date().toISOString().split('T')[0],
                validUpto: initialData.validUpto || '',
                deliveryDate: initialData.deliveryDate || '',
                items: initialData.items.map(item => ({
                    partCode: item.partCode,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice || '',
                    masterItemName: item.masterItemName,
                    unit: item.unit,
                    totalPrice: item.totalPrice || '',
                    itemDetails: item.itemDetails
                }))
            };
            setFormData(formattedData);
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNestedChange = (e, nestedField) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [nestedField]: { ...prev[nestedField], [name]: value },
        }));
    };

    const fetchVendor = async () => {
        if (!formData.vendorCode.trim()) {
            toast.error("Please enter a vendor code");
            return;
        }

        try {
            const response = await api(`/vendors/getByCode/${formData.vendorCode}`, 'get');
            const vendor = response.data;

            if (vendor) {
                setFormData(prev => ({
                    ...prev,
                    vendorId: vendor._id,
                    vendorName: vendor.name,
                    vendorAddress: vendor.address.line1 + ', ' + vendor.address.line2,
                    vendorGst: vendor.gstNumber
                }));
                toast.success("Vendor details loaded successfully");
            } else {
                toast.error("Vendor not found in database");
            }
        } catch (error) {
            toast.error(`Error: ${error.response?.data?.message || "Failed to fetch vendor details"}`);
        }
    };

    const searchVendors = async () => {
        try {
            const response = await api(`/vendors/searchVendors?query=${formData.vendorCode}`, 'get');
            setVendorSuggestions(response.data);
        } catch (error) {
            toast.error(`Error: ${error.response?.data?.message || "Failed to search vendors"}`);
        }
    };

    const selectVendor = (vendor) => {
        setFormData(prev => ({
            ...prev,
            vendorId: vendor._id,
            vendorCode: vendor.code,
            vendorName: vendor.name,
            vendorAddress: vendor.address.line1 + ', ' + vendor.address.line2,
            vendorGst: vendor.gstNumber
        }));
        setVendorSuggestions([]);
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...formData.items];
        newItems[index][name] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const calculateTotalPrice = (quantity, unitPrice) => {
        return quantity && unitPrice ? (quantity * unitPrice).toFixed(2) : '';
    };

    const addItem = async () => {
        if (!newItem.partCode.trim()) {
            toast.error("Please enter a part code");
            return;
        }
        if (!newItem.quantity || newItem.quantity <= 0) {
            toast.error("Please enter a valid quantity");
            return;
        }
        if (!newItem.unitPrice || newItem.unitPrice <= 0) {
            toast.error("Please enter a valid unit price");
            return;
        }

        try {
            const response = await api(`/parts/getPartByCode/${newItem.partCode}`, 'get');
            const partDetails = response.data.data;

            if (response.data.success) {
                const newItemWithDetails = {
                    partCode: partDetails._id,
                    partCodeDisplay: partDetails.ItemCode.ItemName,
                    quantity: Number(newItem.quantity),
                    unitPrice: Number(newItem.unitPrice),
                    totalPrice: Number(newItem.quantity) * Number(newItem.unitPrice),
                    masterItemName: partDetails.ItemCode.ItemName,
                    itemDetails: {
                        partCodeNumber: partDetails.PartCodeNumber,
                        itemName: partDetails.ItemCode.ItemName,
                        itemCode: partDetails.ItemCode.ItemCode,
                        measurementUnit: partDetails.MeasurementUnit || 'Units'
                    }
                };

                setFormData(prev => ({
                    ...prev,
                    items: [...prev.items, newItemWithDetails]
                }));
                setNewItem({ partCode: '', partCodeDisplay: '', quantity: '', unitPrice: '' });
                toast.success("Item added successfully");
            } else {
                toast.error("Part code not found in database");
            }
        } catch (error) {
            toast.error(`Error: ${error.response?.data?.message || "Failed to fetch part details"}`);
        }
    };

    const handleNewItemChange = (e) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ ...prev, [name]: value }));
    };

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
        toast.info("Item removed from order");
    };

    const searchProject = async () => {
        if (!formData.projectCode.trim()) {
            toast.error("Please enter a project code");
            return;
        }

        try {
            const response = await api(`/projects/${formData.projectCode}`, 'get');
            const project = response.data;

            if (project) {
                setFormData(prev => ({
                    ...prev,
                    projectId: project._id,
                    projectName: project.projectName
                }));
                toast.success("Project details loaded successfully");
            } else {
                toast.error("Project not found in database");
            }
        } catch (error) {
            console.error('Error searching for project:', error);
            toast.error("Failed to fetch project details");
        }
    };

    const searchUnit = async () => {
        if (!formData.unitCode.trim()) {
            toast.error("Please enter a unit code");
            return;
        }

        try {
            const response = await api(`/units/${formData.unitCode}`, 'get');
            const unit = response.data;

            if (unit) {
                setFormData(prev => ({
                    ...prev,
                    unitId: unit._id,
                    unitName: unit.unitName
                }));
                toast.success("Unit details loaded successfully");
            } else {
                toast.error("Unit not found in database");
            }
        } catch (error) {
            toast.error(`Error: ${error.response?.data?.message || "Failed to fetch unit details"}`);
        }
    };

    const handleSaveDraft = async (e) => {
        if (formData._id) {
            try {
                const response = await axios.put(`${baseURL}/purchase-orders/updatePO/${formData._id}`,
                    { ...formData, status: 'draft' },
                    {
                        headers: {
                            'Authorization': `Bearer ${getToken()}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );

                if (response.data.success) {
                    toast.success("Purchase order updated successfully");
                    if (setIsCreatingNew) setIsCreatingNew(false);
                    if (setIsModalOpen) setIsModalOpen(false);
                } else {
                    throw new Error('Failed to update Purchase Order');
                }
            } catch (error) {
                console.error('Error updating Purchase Order:', error);
                toast.error(`Failed to update purchase order: ${error.response?.data?.message || error.message}`);
            } finally {
                setIsLoading(false);
                if (fetchPurchaseOrders) fetchPurchaseOrders();
                if (setEditingPO) setEditingPO(null);
            }
        } else {
            e.preventDefault();
            await handleSubmit(e, 'draft');
        }
    };

    const handleCreatePO = async (e) => {
        if (formData._id) {
            try {
                const response = await axios.put(`${baseURL}/purchase-orders/updatePO/${formData._id}`,
                    { ...formData, status: 'created' },
                    {
                        headers: {
                            'Authorization': `Bearer ${getToken()}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );

                if (response.data.success) {
                    toast.success("Purchase order updated successfully");
                    if (setIsCreatingNew) setIsCreatingNew(false);
                    if (setIsModalOpen) setIsModalOpen(false);
                } else {
                    throw new Error('Failed to update Purchase Order');
                }
            } catch (error) {
                console.error('Error updating Purchase Order:', error);
                toast.error(`Failed to update purchase order: ${error.response?.data?.message || error.message}`);
            } finally {
                setIsLoading(false);
                if (fetchPurchaseOrders) fetchPurchaseOrders();
                if (setEditingPO) setEditingPO(null);
            }
        } else {
            e.preventDefault();
            await handleSubmit(e, 'created');
        }
    };

    const handleSubmit = async (e, status) => {
        e.preventDefault();
        if (isLoading) return;

        // Validate required fields
        if (!formData.vendorId) {
            toast.error("Please select a valid vendor");
            return;
        }
        if (!formData.projectId) {
            toast.error("Please select a valid project");
            return;
        }
        if (!formData.unitId) {
            toast.error("Please select a valid unit");
            return;
        }
        if (!formData.poDate) {
            toast.error("Please select PO date");
            return;
        }
        if (!formData.validUpto) {
            toast.error("Please select validity date");
            return;
        }
        if (!formData.deliveryDate) {
            toast.error("Please select delivery date");
            return;
        }

        const validItems = formData.items.filter(item =>
            item.partCode && item.quantity && item.unitPrice
        ).map(item => ({
            partCode: item.partCode,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            totalPrice: Number(item.quantity) * Number(item.unitPrice)
        }));

        if (validItems.length === 0) {
            toast.error("Please add at least one valid item to the order");
            return;
        }

        const dataToSend = {
            ...formData,
            items: validItems,
            status
        };

        try {
            setIsLoading(true);
            const response = await axios.post(
                `${baseURL}/purchase-orders/createPO`,
                dataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.status === 201) {
                toast.success("Purchase order created successfully");
                const notifyResponse = await api(`/purchase-orders/notify-vendor/${response.data.data._id}`, 'post');
                if (onSubmit) onSubmit();
                if (!isDirectPO && setIsCreatingNew) setIsCreatingNew(false);
                if (!isDirectPO && setIsModalOpen) setIsModalOpen(false);
                if (isDirectPO) onCancel();
            } else {
                throw new Error('Failed to create Purchase Order');
            }
        } catch (error) {
            console.error('Error creating Purchase Order:', error);
            toast.error(`Failed to create purchase order: ${error.response?.data?.message || error.message}`);
        } finally {
            if (!isDirectPO) setIsLoading(false);
            if (!isDirectPO && fetchPurchaseOrders) fetchPurchaseOrders();
            if (isDirectPO) {
                onCancel();
                setIsLoading(false);
            }
        }
    };

    const inputClass = `w-full p-2 text-sm rounded bg-white text-gray-800 border border-gray-300`;
    const labelClass = 'text-xs font-medium mb-2';
    const buttonClass = 'px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors';
    const readOnlyClass = `${inputClass} bg-opacity-60 cursor-not-allowed`;

    return (
        <form onSubmit={handleSubmit} className="bg-white">
            <ToastContainer />

            {/* Vendor Information */}
            <fieldset className="border p-4 rounded-lg bg-white">
                <legend className="text-sm font-medium px-2">Vendor Info</legend>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Vendor Code*</label>
                        <div className="flex gap-2">
                            <input name="vendorCode" value={formData.vendorCode} onChange={handleChange} className={`${inputClass} flex-grow`} required />
                            <button type="button" onClick={fetchVendor} className={buttonClass}>Show</button>
                            <button type="button" onClick={searchVendors} className={buttonClass}>Search</button>
                        </div>
                        {vendorSuggestions.length > 0 && (
                            <ul className="mt-2 border rounded-lg max-h-32 overflow-y-auto text-sm bg-white">
                                {vendorSuggestions.map(vendor => (
                                    <li key={vendor.code} className="p-2 hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => selectVendor(vendor)}>
                                        {vendor.name} ({vendor.code})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div>
                        <label className={labelClass}>Vendor Name</label>
                        <input name="vendorName" value={formData.vendorName} readOnly className={inputClass} />
                    </div>
                    <div className="col-span-2">
                        <label className={labelClass}>Address</label>
                        <textarea name="vendorAddress" value={formData.vendorAddress} readOnly className={`${inputClass} h-20`} />
                    </div>
                    <div>
                        <label className={labelClass}>GST No.</label>
                        <input name="vendorGst" value={formData.vendorGst} readOnly className={inputClass} />
                    </div>
                </div>
            </fieldset>

            {/* Project Details */}
            <fieldset className="border my-3 p-4 rounded-lg bg-white shadow-sm">
                <legend className="text-sm font-medium px-2">Project Details</legend>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Project Code*</label>
                        <div className="flex gap-2">
                            <input name="projectCode" value={formData.projectCode} onChange={handleChange} className={inputClass} required />
                            <button type="button" onClick={searchProject} className={buttonClass}>Search</button>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Project Name</label>
                        <input name="projectName" value={formData.projectName} readOnly className={readOnlyClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Unit ID*</label>
                        <div className="flex gap-2">
                            <input name="unitCode" value={formData.unitCode} onChange={handleChange} className={inputClass} required />
                            <button type="button" onClick={searchUnit} className={buttonClass}>Search</button>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Unit Name</label>
                        <input name="unitName" value={formData.unitName} readOnly className={readOnlyClass} />
                    </div>
                    <div>
                        <label className={labelClass}>PO Date*</label>
                        <input type="date" name="poDate" value={formData.poDate} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label className={labelClass}>Valid Upto*</label>
                        <input type="date" name="validUpto" value={formData.validUpto} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label className={labelClass}>Expected Delivery*</label>
                        <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} className={inputClass} required />
                    </div>
                </div>
            </fieldset>

            {/* Address Details */}
            <div className="flex gap-6">
                {/* Invoice To */}
                <fieldset className="border my-3 p-4 rounded-lg bg-white shadow-sm flex-1">
                    <legend className="text-sm font-medium px-2">Invoice To</legend>
                    <div className="space-y-3">
                        <div>
                            <label className={labelClass}>Name*</label>
                            <input name="name" value={formData.invoiceTo.name} onChange={(e) => handleNestedChange(e, 'invoiceTo')} className={inputClass} required />
                        </div>
                        <div>
                            <label className={labelClass}>Branch</label>
                            <input name="branchName" value={formData.invoiceTo.branchName} onChange={(e) => handleNestedChange(e, 'invoiceTo')} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Address*</label>
                            <input name="address" value={formData.invoiceTo.address} onChange={(e) => handleNestedChange(e, 'invoiceTo')} className={inputClass} required />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className={labelClass}>City</label>
                                <input name="city" value={formData.invoiceTo.city} onChange={(e) => handleNestedChange(e, 'invoiceTo')} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>State</label>
                                <input name="state" value={formData.invoiceTo.state} onChange={(e) => handleNestedChange(e, 'invoiceTo')} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>PIN</label>
                                <input name="pin" value={formData.invoiceTo.pin} onChange={(e) => handleNestedChange(e, 'invoiceTo')} className={inputClass} />
                            </div>
                        </div>
                    </div>
                </fieldset>

                {/* Dispatch To */}
                <fieldset className="border my-3 p-4 rounded-lg bg-white shadow-sm flex-1">
                    <legend className="text-sm font-medium px-2">Dispatch To</legend>
                    <div className="space-y-3">
                        <div>
                            <label className={labelClass}>Name*</label>
                            <input name="name" value={formData.dispatchTo.name} onChange={(e) => handleNestedChange(e, 'dispatchTo')} className={inputClass} required />
                        </div>
                        <div>
                            <label className={labelClass}>Branch</label>
                            <input name="branchName" value={formData.dispatchTo.branchName} onChange={(e) => handleNestedChange(e, 'dispatchTo')} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Address*</label>
                            <input name="address" value={formData.dispatchTo.address} onChange={(e) => handleNestedChange(e, 'dispatchTo')} className={inputClass} required />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className={labelClass}>City</label>
                                <input name="city" value={formData.dispatchTo.city} onChange={(e) => handleNestedChange(e, 'dispatchTo')} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>State</label>
                                <input name="state" value={formData.dispatchTo.state} onChange={(e) => handleNestedChange(e, 'dispatchTo')} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>PIN</label>
                                <input name="pin" value={formData.dispatchTo.pin} onChange={(e) => handleNestedChange(e, 'dispatchTo')} className={inputClass} />
                            </div>
                        </div>
                    </div>
                </fieldset>
            </div>

            {/* Items */}
            <fieldset className="border my-3 p-4 rounded-lg bg-white shadow-sm">
                <legend className="text-sm font-medium px-2">Order Items</legend>
                <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className={labelClass}>Part Code</label>
                        <input name="partCode" value={newItem.partCode} onChange={handleNewItemChange} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Quantity</label>
                        <input type="number" name="quantity" value={newItem.quantity} onChange={handleNewItemChange} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Unit Price</label>
                        <input type="number" name="unitPrice" value={newItem.unitPrice} onChange={handleNewItemChange} className={inputClass} />
                    </div>
                    <div className="flex items-end">
                        <button type="button" onClick={addItem} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm transition-colors w-full">Add Item</button>
                    </div>
                </div>

                {formData.items.length > 0 && (
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <th className="p-2 text-left">Part Code</th>
                                    <th className="p-2 text-left">Master Item</th>
                                    <th className="p-2 text-left">Qty</th>
                                    <th className="p-2 text-left">Unit Price</th>
                                    <th className="p-2 text-left">Total</th>
                                    <th className="p-2 text-left">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.items.map((item, index) => (
                                    item.partCode && (
                                        <tr key={index} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                            <td className="p-2">{item.partCodeDisplay || item.itemDetails?.partCodeNumber}</td>
                                            <td className="p-2">{item.masterItemName}</td>
                                            <td className="p-2">{item.quantity}</td>
                                            <td className="p-2">{item.unitPrice}</td>
                                            <td className="p-2">{calculateTotalPrice(item.quantity, item.unitPrice)}</td>
                                            <td className="p-2">
                                                <button type="button" onClick={() => removeItem(index)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs transition-colors">Delete</button>
                                            </td>
                                        </tr>
                                    )
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </fieldset>

            {/* Additional Details */}
            <div className="grid grid-cols-2 gap-4 my-3">
                <div>
                    <label className={labelClass}>Supplier Ref</label>
                    <input name="supplierRef" value={formData.supplierRef} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Other Ref</label>
                    <input name="otherRef" value={formData.otherRef} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Dispatch Through</label>
                    <input name="dispatchThrough" value={formData.dispatchThrough} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Destination</label>
                    <input name="destination" value={formData.destination} onChange={handleChange} className={inputClass} />
                </div>
            </div>

            <div className='my-3'>
                <label className={labelClass}>Payment Terms</label>
                <input name="paymentTerms" value={formData.paymentTerms} onChange={handleChange} className={inputClass} />
            </div>

            <div>
                <label className={labelClass}>Delivery Terms</label>
                <input name="deliveryTerms" value={formData.deliveryTerms} onChange={handleChange} className={inputClass} />
            </div>

            <div className='my-3'>
                <label className={labelClass}>PO Narration</label>
                <textarea name="poNarration" value={formData.poNarration} onChange={handleChange} className={`${inputClass} h-20`} />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm transition-colors" disabled={isLoading}>
                    Cancel
                </button>
                <button type="button" onClick={handleSaveDraft} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm transition-colors" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Draft'}
                </button>
                <button type="button" onClick={handleCreatePO} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors" disabled={isLoading}>
                    {isLoading ? 'Processing...' : initialData ? 'Update PO' : 'Create PO'}
                </button>
            </div>
        </form>
    );
};

// PropTypes
PurchaseOrderForm.propTypes = {
    onCancel: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    setIsLoading: PropTypes.func.isRequired,
    initialData: PropTypes.object,
    setIsModalOpen: PropTypes.func,
    setIsCreatingNew: PropTypes.func,
    fetchPurchaseOrders: PropTypes.func,
    setEditingPO: PropTypes.func,
    isDirectPO: PropTypes.bool,
    readOnlyItems: PropTypes.bool,
    onSubmit: PropTypes.func
};

PurchaseOrderForm.defaultProps = {
    isLoading: false,
    initialData: null,
    isDirectPO: false,
    readOnlyItems: false
};

export default PurchaseOrderForm;