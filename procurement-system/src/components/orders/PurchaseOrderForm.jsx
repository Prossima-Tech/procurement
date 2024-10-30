/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../utils/endpoint';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { baseURL } from '../../utils/endpoint';
import axios from 'axios';
const PurchaseOrderForm = ({ onCancel, isLoading, setIsLoading, initialData, setIsModalOpen,setIsCreatingNew,fetchPurchaseOrders,setEditingPO }) => {
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
        unitName: '', // Added new field
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
    const getToken = () => localStorage.getItem('token');
    const [vendorSuggestions, setVendorSuggestions] = useState([]);
    const [newItem, setNewItem] = useState({ partCode: '', quantity: '', unitPrice: '' });

    useEffect(() => {
        if (initialData) {
            const formattedData = {
                ...initialData,
                poDate: initialData.poDate ? new Date(initialData.poDate).toISOString().split('T')[0] : '',
                validUpto: initialData.validUpto ? new Date(initialData.validUpto).toISOString().split('T')[0] : '',
                deliveryDate: initialData.deliveryDate ? new Date(initialData.deliveryDate).toISOString().split('T')[0] : '',
                items: initialData.items.map(item => ({
                    partCode: item.partCode.PartCodeNumber || item.partCode,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    masterItemName: item.masterItemName,
                    totalPrice: item.totalPrice
                }))
            };
            setFormData(formattedData);
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
            console.error('Error searching vendors:', error);
            // Handle error
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

    const handleNestedChange = (e, nestedField) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [nestedField]: { ...prev[nestedField], [name]: value },
        }));
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...formData.items];
        newItems[index][name] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = async () => {
        // Validate all required fields
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
            // toast.success("Toast checking");
            console.log("Part details", partDetails);
            if (response.data.success) {
                console.log("Part details found");
                const newItemWithDetails = {
                    ...newItem,
                    masterItemName: partDetails.ItemCode.ItemName,
                    // Add any other relevant details from the API response
                };

                setFormData(prev => ({
                    ...prev,
                    items: [...prev.items, newItemWithDetails]
                }));

                setNewItem({ partCode: '', quantity: '', unitPrice: '' });
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

    const handleSaveDraft = async (e) => {
        if(formData._id){
            console.log("updating purchase order");
            try {
                const response = await axios.put(`${baseURL}/purchase-orders/updatePO/${formData._id}`, 
                    {...formData, status: 'draft'}, 
                    {
                        headers: {
                            'Authorization': `Bearer ${getToken()}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );

                if (response.data.success) {
                    toast.success("Purchase order updated successfully");
                    setIsCreatingNew(false);
                    setIsModalOpen(false);
                } else {
                    throw new Error('Failed to update Purchase Order');
                }
            } catch (error) {
                console.error('Error updating Purchase Order:', error);
                toast.error(`Failed to update purchase order: ${error.response?.data?.message || error.message}`);
            } finally {
                setIsLoading(false);
                fetchPurchaseOrders();
                setEditingPO(null);
            }
        }else{
            e.preventDefault();
            await handleSubmit(e, 'draft');
        }
    };

    const handleCreatePO = async (e) => {
        if(formData._id){
            console.log("updating purchase order");
            try {
                const response = await axios.put(`${baseURL}/purchase-orders/updatePO/${formData._id}`, 
                    {...formData, status: 'created'}, 
                    {
                        headers: {
                            'Authorization': `Bearer ${getToken()}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );

                if (response.data.success) {
                    toast.success("Purchase order updated successfully");
                    setIsCreatingNew(false);
                    setIsModalOpen(false);
                } else {
                    throw new Error('Failed to update Purchase Order');
                }
            } catch (error) {
                console.error('Error updating Purchase Order:', error);
                toast.error(`Failed to update purchase order: ${error.response?.data?.message || error.message}`);
            } finally {
                setIsLoading(false);
                fetchPurchaseOrders();
                setEditingPO(null);
            }

        }else{
            e.preventDefault();
            await handleSubmit(e, 'created');
        }
    };

    const handleSubmit = async (e, status) => {
        e.preventDefault();
        if (isLoading) return;

        console.log("Form data before processing", formData);
        console.log("Status", status);
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

        // Filter out empty items
        const validItems = formData.items.filter(item =>
            item.partCode && item.quantity && item.unitPrice
        );

        if (validItems.length === 0) {
            toast.error("Please add at least one valid item to the order");
            return;
        }

        // Create a new object with valid items
        const dataToSend = {
            ...formData,
            items: validItems,
            status: status // Set the status based on which button was clicked
        };

        console.log("Data to send", dataToSend);

        // Set loading state
        setIsLoading(true);

        try {
            const response = await axios.post(`${baseURL}/purchase-orders/createPO`, dataToSend, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 201) {
                toast.success("Purchase order created successfully");
                setIsCreatingNew(false);
                setIsModalOpen(false);
            } else {
                throw new Error('Failed to create Purchase Order');
            }
        } catch (error) {
            console.error('Error creating Purchase Order:', error);
            toast.error(`Failed to create purchase order: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoading(false);
            fetchPurchaseOrders();
        }
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

    useEffect(() => {
        // searchUnit();
        console.log("formData", formData);
    }, [formData]);

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

    const inputClass = `w-full p-3 text-base rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`;
    const labelClass = 'block text-sm font-medium mb-2';
    const buttonClass = 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600';
    const readOnlyClass = `${inputClass} bg-opacity-60 cursor-not-allowed`;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <ToastContainer />
            <fieldset className="border p-4 rounded">
                <legend className="text-lg font-semibold px-2">Vendor Information</legend>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Vendor Code*</label>
                        <div className="flex space-x-2">
                            <input
                                name="vendorCode"
                                value={formData.vendorCode}
                                onChange={handleChange}
                                className={`${inputClass} flex-grow`}
                                required
                            />
                            <button type="button" onClick={fetchVendor} className={buttonClass}>Show</button>
                            <button type="button" onClick={searchVendors} className={buttonClass}>Search</button>
                        </div>
                        {vendorSuggestions.length > 0 && (
                            <ul className="mt-2 border rounded max-h-40 overflow-y-auto">
                                {vendorSuggestions.map(vendor => (
                                    <li
                                        key={vendor.code}
                                        className="p-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() => selectVendor(vendor)}
                                    >
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
                        <label className={labelClass}>Vendor Address</label>
                        <textarea name="vendorAddress" value={formData.vendorAddress} readOnly className={`${inputClass} h-20`} />
                    </div>
                    <div>
                        <label className={labelClass}>Vendor GST</label>
                        <input name="vendorGst" value={formData.vendorGst} readOnly className={inputClass} />
                    </div>
                </div>
            </fieldset>


            <fieldset className="border p-4 rounded">
                <legend className="text-lg font-semibold px-2">Project Details</legend>
                <div className="grid grid-cols-2 gap-4">
                    {/* Project ID and Name Group */}
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Project Code*</label>
                            <div className="flex space-x-2">
                                <input
                                    name="projectCode"
                                    value={formData.projectCode}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                    placeholder="Enter Project Code"
                                />
                                <button
                                    type="button"
                                    onClick={searchProject}
                                    className={buttonClass}
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Project Name</label>
                            <input
                                name="projectName"
                                value={formData.projectName}
                                className={readOnlyClass}
                                readOnly
                                placeholder="Project name will appear here"
                            />
                        </div>
                    </div>

                    {/* Unit ID and Name Group */}
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Unit ID*</label>
                            <div className="flex space-x-2">
                                <input
                                    name="unitCode"
                                    value={formData.unitCode}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                    placeholder="Enter Unit Code"
                                />
                                <button
                                    type="button"
                                    onClick={searchUnit}
                                    className={buttonClass}
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Unit Name</label>
                            <input
                                name="unitName"
                                value={formData.unitName}
                                className={readOnlyClass}
                                readOnly
                                placeholder="Unit name will appear here"
                            />
                        </div>
                    </div>

                    {/* Dates and Status Group */}
                    <div>
                        <label className={labelClass}>PO Date*</label>
                        <input
                            type="date"
                            name="poDate"
                            value={formData.poDate}
                            onChange={handleChange}
                            className={inputClass}
                            required
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Valid Upto*</label>
                        <input
                            type="date"
                            name="validUpto"
                            value={formData.validUpto}
                            onChange={handleChange}
                            className={inputClass}
                            required
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Delivery Date*</label>
                        <input
                            type="date"
                            name="deliveryDate"
                            value={formData.deliveryDate}
                            onChange={handleChange}
                            className={inputClass}
                            required
                        />
                    </div>
                    {/* <div>
                        <label className={labelClass}>Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className={inputClass}
                        >
                            <option value="draft">Draft</option>
                            <option value="created">Created</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="cancelled">Cancelled</option>
                        </select> 
                     </div> */}
                </div>
            </fieldset>

            <div className="flex flex-col md:flex-row gap-6">
                <fieldset className="border p-4 rounded">
                    <legend className="text-lg font-semibold px-2">Invoice To</legend>
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Name*</label>
                            <input name="name" value={formData.invoiceTo.name} onChange={(e) => handleNestedChange(e, 'invoiceTo')} className={inputClass} required />
                        </div>
                        <div>
                            <label className={labelClass}>Branch Name</label>
                            <input name="branchName" value={formData.invoiceTo.branchName} onChange={(e) => handleNestedChange(e, 'invoiceTo')} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Address*</label>
                            <input name="address" value={formData.invoiceTo.address} onChange={(e) => handleNestedChange(e, 'invoiceTo')} className={inputClass} required />
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <label className={labelClass}>City</label>
                                <input name="city" value={formData.invoiceTo.city} onChange={(e) => handleNestedChange(e, 'invoiceTo')} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>State</label>
                                <input name="state" value={formData.invoiceTo.state} onChange={(e) => handleNestedChange(e, 'invoiceTo')} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Pin</label>
                                <input name="pin" value={formData.invoiceTo.pin} onChange={(e) => handleNestedChange(e, 'invoiceTo')} className={inputClass} />
                            </div>
                        </div>
                    </div>
                </fieldset>

                <fieldset className="border p-4 rounded">
                    <legend className="text-lg font-semibold px-2">Dispatch To</legend>
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Name*</label>
                            <input name="name" value={formData.dispatchTo.name} onChange={(e) => handleNestedChange(e, 'dispatchTo')} className={inputClass} required />
                        </div>
                        <div>
                            <label className={labelClass}>Branch Name</label>
                            <input name="branchName" value={formData.dispatchTo.branchName} onChange={(e) => handleNestedChange(e, 'dispatchTo')} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Address*</label>
                            <input name="address" value={formData.dispatchTo.address} onChange={(e) => handleNestedChange(e, 'dispatchTo')} className={inputClass} required />
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <label className={labelClass}>City</label>
                                <input name="city" value={formData.dispatchTo.city} onChange={(e) => handleNestedChange(e, 'dispatchTo')} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>State</label>
                                <input name="state" value={formData.dispatchTo.state} onChange={(e) => handleNestedChange(e, 'dispatchTo')} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Pin</label>
                                <input name="pin" value={formData.dispatchTo.pin} onChange={(e) => handleNestedChange(e, 'dispatchTo')} className={inputClass} />
                            </div>
                        </div>
                    </div>
                </fieldset>
            </div>

            <fieldset className="border p-4 rounded">
                <legend className="text-lg font-semibold px-2">Order Items</legend>
                <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className={labelClass}>Part Code</label>
                        <input
                            name="partCode"
                            value={newItem.partCode}
                            onChange={handleNewItemChange}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Quantity</label>
                        <input
                            type="number"
                            name="quantity"
                            value={newItem.quantity}
                            onChange={handleNewItemChange}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Unit Price</label>
                        <input
                            type="number"
                            name="unitPrice"
                            value={newItem.unitPrice}
                            onChange={handleNewItemChange}
                            className={inputClass}
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={addItem}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Add Item
                        </button>
                    </div>
                </div>

                {formData.items.length > 0 && (
                    <table className="w-full mt-4">
                        <thead>
                            <tr className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                <th className="p-2 text-left">Part Code</th>
                                <th className="p-2 text-left">Master Item Name</th>
                                <th className="p-2 text-left">Quantity</th>
                                <th className="p-2 text-left">Unit Price</th>
                                <th className="p-2 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.items.map((item, index) => (
                                item.partCode && (
                                    <tr key={index} className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                        <td className="p-2">{item.partCode}</td>
                                        <td className="p-2">{item.masterItemName}</td>
                                        <td className="p-2">{item.quantity}</td>
                                        <td className="p-2">{item.unitPrice}</td>
                                        <td className="p-2">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                )
                            ))}
                        </tbody>
                    </table>
                )}
            </fieldset>

            <div className="grid grid-cols-2 gap-6">
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

            <div>
                <label className={labelClass}>Payment Terms</label>
                <input name="paymentTerms" value={formData.paymentTerms} onChange={handleChange} className={inputClass} />
            </div>

            <div>
                <label className={labelClass}>Delivery Terms</label>
                <input name="deliveryTerms" value={formData.deliveryTerms} onChange={handleChange} className={inputClass} />
            </div>

            <div>
                <label className={labelClass}>PO Narration</label>
                <textarea name="poNarration" value={formData.poNarration} onChange={handleChange} className={`${inputClass} h-24`}></textarea>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-base"
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-6 py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-base"
                    disabled={isLoading}
                >
                    {isLoading ? 'Saving...' : 'Save PO'}
                </button>
                <button
                    type="button"
                    onClick={handleCreatePO}
                    className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 text-base"
                    disabled={isLoading}
                >
                    {isLoading ? 'Creating...' : initialData ? 'Update Purchase Order' : 'Create Purchase Order'}
                </button>
            </div>
        </form>
    );
};

export default PurchaseOrderForm;
