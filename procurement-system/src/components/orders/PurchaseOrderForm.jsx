/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios'; // Make sure to install and import axios

const PurchaseOrderForm = ({ onSubmit, onCancel, isLoading }) => {
    const { isDarkMode } = useTheme();
    const [formData, setFormData] = useState({
        vendorId: '',
        vendorCode: '',
        vendorName: '',
        vendorAddress: '',
        vendorGst: '',
        projectId: '',
        projectName: '', // Added new field
        unitId: '',
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
    const [vendorSuggestions, setVendorSuggestions] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const fetchVendor = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/vendors/getByCode/${formData.vendorCode}`);
            const vendor = response.data;
            if(vendor){
                setFormData(prev => ({
                    ...prev,
                    vendorName: vendor.name,
                    vendorAddress: vendor.address.line1 + ', ' + vendor.address.line2,
                    vendorGst: vendor.gstNumber
                }));
            }else{
                toast.error("Vendor not found. Please check the vendor code and try again.");
            }
        } catch (error) {
            console.error('Error fetching vendor:', error);
            // Handle error (e.g., show error message to user)
        }
    };

    const searchVendors = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/vendors/searchVendors?query=${formData.vendorCode}`);
            setVendorSuggestions(response.data);
        } catch (error) {
            console.error('Error searching vendors:', error);
            // Handle error
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

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { partCode: '', quantity: '', unitPrice: '' }]
        }));
    };

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const searchProject = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/projects/${formData.projectId}`);
            const project = response.data;
            setFormData(prev => ({
                ...prev,
                projectName: project.projectName
            }));
        } catch (error) {
            console.error('Error fetching project:', error);
            // Handle error (e.g., show error message to user)
        }
    };

    const searchUnit = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/units/${formData.unitId}`);
            const unit = response.data;
            setFormData(prev => ({
                ...prev,
                unitName: unit.unitName
            }));
        } catch (error) {
            console.error('Error fetching unit:', error);
            // Handle error (e.g., show error message to user)
        }
    };

    const inputClass = `w-full p-3 text-base rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`;
    const labelClass = 'block text-sm font-medium mb-2';
    const buttonClass = 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600';
    const readOnlyClass = `${inputClass} bg-opacity-60 cursor-not-allowed`;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
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
                            <label className={labelClass}>Project ID*</label>
                            <div className="flex space-x-2">
                                <input
                                    name="projectId"
                                    value={formData.projectId}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                    placeholder="Enter Project ID"
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
                                    name="unitId"
                                    value={formData.unitId}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                    placeholder="Enter Unit ID"
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
                    <div>
                        <label className={labelClass}>Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className={inputClass}
                        >
                            <option value="draft">Draft</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
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
            </div>

            <fieldset className="border p-4 rounded">
                <legend className="text-lg font-semibold px-2">Order Items</legend>
                {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className={labelClass}>Part Code</label>
                            <input name="partCode" value={item.partCode} onChange={(e) => handleItemChange(index, e)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Quantity</label>
                            <input type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(index, e)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Unit Price</label>
                            <input type="number" name="unitPrice" value={item.unitPrice} onChange={(e) => handleItemChange(index, e)} className={inputClass} />
                        </div>
                    </div>
                ))}
                <div className="flex justify-between mt-4">
                    <button type="button" onClick={addItem} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Add Item</button>
                    {formData.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(formData.items.length - 1)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Remove Last Item</button>
                    )}
                </div>
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
                    type="submit"
                    className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 text-base"
                    disabled={isLoading}
                >
                    {isLoading ? 'Creating...' : 'Create Purchase Order'}
                </button>
            </div>
        </form>
    );
};

export default PurchaseOrderForm;
