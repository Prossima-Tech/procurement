/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const VendorForm = ({ onSubmit, onCancel, isLoading }) => {
    const { isDarkMode } = useTheme();
    const [formData, setFormData] = useState({
        poPrefix: '',
        name: '',
        contactPerson: '',
        contactNumber: '',
        mobileNumber: '',
        panNumber: '',
        email: '',
        gstNumber: '',
        bankDetails: { name: '', branchName: '', accountNumber: '', ifscCode: '' },
        address: { line1: '', line2: '', city: '', state: '', pinCode: '' },
        remark: '',
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
                    <label className={labelClass}>PO Prefix</label>
                    <input name="poPrefix" value={formData.poPrefix} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Vendor Name*</label>
                    <input name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label className={labelClass}>Contact Person*</label>
                    <input name="contactPerson" value={formData.contactPerson} onChange={handleChange} className={inputClass} required />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div>
                    <label className={labelClass}>Contact Number</label>
                    <input name="contactNumber" value={formData.contactNumber} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Mobile Number*</label>
                    <input name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label className={labelClass}>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div>
                    <label className={labelClass}>PAN Number</label>
                    <input name="panNumber" value={formData.panNumber} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>GST Number</label>
                    <input name="gstNumber" value={formData.gstNumber} onChange={handleChange} className={inputClass} />
                </div>
            </div>

            <fieldset className="border p-4 rounded">
                <legend className="text-lg font-semibold px-2">Bank Details</legend>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Bank Name</label>
                        <input name="name" value={formData.bankDetails.name} onChange={(e) => handleNestedChange(e, 'bankDetails')} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Branch Name</label>
                        <input name="branchName" value={formData.bankDetails.branchName} onChange={(e) => handleNestedChange(e, 'bankDetails')} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Account Number</label>
                        <input name="accountNumber" value={formData.bankDetails.accountNumber} onChange={(e) => handleNestedChange(e, 'bankDetails')} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>IFSC Code</label>
                        <input name="ifscCode" value={formData.bankDetails.ifscCode} onChange={(e) => handleNestedChange(e, 'bankDetails')} className={inputClass} />
                    </div>
                </div>
            </fieldset>

            <fieldset className="border p-4 rounded">
                <legend className="text-lg font-semibold px-2">Address</legend>
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Address Line 1</label>
                        <input name="line1" value={formData.address.line1} onChange={(e) => handleNestedChange(e, 'address')} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Address Line 2</label>
                        <input name="line2" value={formData.address.line2} onChange={(e) => handleNestedChange(e, 'address')} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className={labelClass}>City</label>
                            <input name="city" value={formData.address.city} onChange={(e) => handleNestedChange(e, 'address')} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>State</label>
                            <input name="state" value={formData.address.state} onChange={(e) => handleNestedChange(e, 'address')} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Pin Code</label>
                            <input name="pinCode" value={formData.address.pinCode} onChange={(e) => handleNestedChange(e, 'address')} className={inputClass} />
                        </div>
                    </div>
                </div>
            </fieldset>

            <div>
                <label className={labelClass}>Remark</label>
                <textarea name="remark" value={formData.remark} onChange={handleChange} className={`${inputClass} h-24`}></textarea>
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
                    {isLoading ? 'Creating...' : 'Create Vendor'}
                </button>
            </div>
        </form>
    );
};

export default VendorForm;