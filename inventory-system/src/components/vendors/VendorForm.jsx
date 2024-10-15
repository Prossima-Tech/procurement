import React, { useState } from 'react';
import Input from '../common/Input';

const VendorForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Vendor Code"
          name="VendorCode"
          value={formData.VendorCode || ''}
          onChange={handleChange}
          required
        />
        <Input
          label="Vendor Name"
          name="VendorName"
          value={formData.VendorName || ''}
          onChange={handleChange}
          required
        />
        <Input
          label="Contact Person"
          name="ContactPerson"
          value={formData.ContactPerson || ''}
          onChange={handleChange}
          required
        />
        <Input
          label="Mobile Number"
          name="MobileNumber"
          type="tel"
          value={formData.MobileNumber || ''}
          onChange={handleChange}
          required
        />
        <Input
          label="PIN Code"
          name="PINCode"
          value={formData.PINCode || ''}
          onChange={handleChange}
          required
        />
        <Input
          label="PO Prefix"
          name="POPrefix"
          value={formData.POPrefix || ''}
          onChange={handleChange}
        />
        <Input
          label="Contact Number"
          name="ContactNumber"
          type="tel"
          value={formData.ContactNumber || ''}
          onChange={handleChange}
        />
        <Input
          label="PAN Number"
          name="PANNumber"
          value={formData.PANNumber || ''}
          onChange={handleChange}
        />
        <Input
          label="Email ID"
          name="EmailID"
          type="email"
          value={formData.EmailID || ''}
          onChange={handleChange}
        />
        <Input
          label="GST Number"
          name="GSTNumber"
          value={formData.GSTNumber || ''}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Bank Name"
          name="BankName"
          value={formData.BankName || ''}
          onChange={handleChange}
        />
        <Input
          label="Bank Branch Name"
          name="BankBranchName"
          value={formData.BankBranchName || ''}
          onChange={handleChange}
        />
        <Input
          label="Bank Account Number"
          name="BankAccountNumber"
          value={formData.BankAccountNumber || ''}
          onChange={handleChange}
        />
        <Input
          label="Bank IFSC Code"
          name="BankIFSCCode"
          value={formData.BankIFSCCode || ''}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          label="State Name"
          name="StateName"
          value={formData.StateName || ''}
          onChange={handleChange}
        />
        <Input
          label="City Name"
          name="CityName"
          value={formData.CityName || ''}
          onChange={handleChange}
        />
        <Input
          label="PIN Code"
          name="PINCode"
          value={formData.PINCode || ''}
          onChange={handleChange}
        />
      </div>

      <Input
        label="Address"
        name="Address"
        value={formData.Address || ''}
        onChange={handleChange}
      />

      <Input
        label="Remark"
        name="Remark"
        value={formData.Remark || ''}
        onChange={handleChange}
      />

      <div className="flex justify-end">
        <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300">
          Save Vendor
        </button>
      </div>
    </form>
  );
};

export default VendorForm;