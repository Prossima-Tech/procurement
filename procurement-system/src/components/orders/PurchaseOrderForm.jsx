/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const PurchaseOrderForm = ({ onSubmit, onCancel, isLoading }) => {
    const { isDarkMode } = useTheme();
    const [formData, setFormData] = useState({
        poNumber: '',
        orderDate: '',
        deliveryDate: '',
        vendorName: '',
        vendorAddress: '',
        billingAddress: { line1: '', line2: '', city: '', state: '', pinCode: '' },
        shippingAddress: { line1: '', line2: '', city: '', state: '', pinCode: '' },
        items: [{ description: '', quantity: '', unitPrice: '', total: '' }],
        subtotal: '',
        tax: '',
        shippingCost: '',
        total: '',
        paymentTerms: '',
        specialInstructions: '',
    });

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

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...formData.items];
        newItems[index][name] = value;
        if (name === 'quantity' || name === 'unitPrice') {
            newItems[index].total = (newItems[index].quantity * newItems[index].unitPrice).toFixed(2);
        }
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { description: '', quantity: '', unitPrice: '', total: '' }]
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

    const inputClass = `w-full p-3 text-base rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`;
    const labelClass = 'block text-sm font-medium mb-2';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
                <div>
                    <label className={labelClass}>PO Number*</label>
                    <input name="poNumber" value={formData.poNumber} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label className={labelClass}>Order Date*</label>
                    <input type="date" name="orderDate" value={formData.orderDate} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label className={labelClass}>Delivery Date*</label>
                    <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} className={inputClass} required />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className={labelClass}>Vendor Name*</label>
                    <input name="vendorName" value={formData.vendorName} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label className={labelClass}>Vendor Address</label>
                    <input name="vendorAddress" value={formData.vendorAddress} onChange={handleChange} className={inputClass} />
                </div>
            </div>

            <fieldset className="border p-4 rounded">
                <legend className="text-lg font-semibold px-2">Billing Address</legend>
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Address Line 1</label>
                        <input name="line1" value={formData.billingAddress.line1} onChange={(e) => handleNestedChange(e, 'billingAddress')} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Address Line 2</label>
                        <input name="line2" value={formData.billingAddress.line2} onChange={(e) => handleNestedChange(e, 'billingAddress')} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className={labelClass}>City</label>
                            <input name="city" value={formData.billingAddress.city} onChange={(e) => handleNestedChange(e, 'billingAddress')} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>State</label>
                            <input name="state" value={formData.billingAddress.state} onChange={(e) => handleNestedChange(e, 'billingAddress')} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Pin Code</label>
                            <input name="pinCode" value={formData.billingAddress.pinCode} onChange={(e) => handleNestedChange(e, 'billingAddress')} className={inputClass} />
                        </div>
                    </div>
                </div>
            </fieldset>

            <fieldset className="border p-4 rounded">
                <legend className="text-lg font-semibold px-2">Shipping Address</legend>
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Address Line 1</label>
                        <input name="line1" value={formData.shippingAddress.line1} onChange={(e) => handleNestedChange(e, 'shippingAddress')} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Address Line 2</label>
                        <input name="line2" value={formData.shippingAddress.line2} onChange={(e) => handleNestedChange(e, 'shippingAddress')} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className={labelClass}>City</label>
                            <input name="city" value={formData.shippingAddress.city} onChange={(e) => handleNestedChange(e, 'shippingAddress')} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>State</label>
                            <input name="state" value={formData.shippingAddress.state} onChange={(e) => handleNestedChange(e, 'shippingAddress')} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Pin Code</label>
                            <input name="pinCode" value={formData.shippingAddress.pinCode} onChange={(e) => handleNestedChange(e, 'shippingAddress')} className={inputClass} />
                        </div>
                    </div>
                </div>
            </fieldset>

            <fieldset className="border p-4 rounded">
                <legend className="text-lg font-semibold px-2">Order Items</legend>
                {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-5 gap-4 mb-4">
                        <div className="col-span-2">
                            <label className={labelClass}>Description</label>
                            <input name="description" value={item.description} onChange={(e) => handleItemChange(index, e)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Quantity</label>
                            <input type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(index, e)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Unit Price</label>
                            <input type="number" name="unitPrice" value={item.unitPrice} onChange={(e) => handleItemChange(index, e)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Total</label>
                            <input name="total" value={item.total} readOnly className={`${inputClass} bg-gray-200`} />
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
                    <label className={labelClass}>Subtotal</label>
                    <input name="subtotal" value={formData.subtotal} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Tax</label>
                    <input name="tax" value={formData.tax} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Shipping Cost</label>
                    <input name="shippingCost" value={formData.shippingCost} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Total</label>
                    <input name="total" value={formData.total} onChange={handleChange} className={inputClass} />
                </div>
            </div>

            <div>
                <label className={labelClass}>Payment Terms</label>
                <input name="paymentTerms" value={formData.paymentTerms} onChange={handleChange} className={inputClass} />
            </div>

            <div>
                <label className={labelClass}>Special Instructions</label>
                <textarea name="specialInstructions" value={formData.specialInstructions} onChange={handleChange} className={`${inputClass} h-24`}></textarea>
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