import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const ItemForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/item/createItem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        onSubmit(data.data);
      } else {
        console.error('Error creating item:', data.error);
        // Handle error (e.g., show error message to user)
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Item Code"
          name="ItemCode"
          value={formData.ItemCode || ''}
          onChange={handleChange}
          required
          className="w-full"
        />
        <Input
          label="Item Name"
          name="ItemName"
          value={formData.ItemName || ''}
          onChange={handleChange}
          required
          className="w-full"
        />
        <div className="w-full">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
          <select
            id="type"
            name="type"
            value={formData.type || ''}
            onChange={handleChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select Type</option>
            <option value="good">Good</option>
            <option value="service">Service</option>
          </select>
        </div>
        <Input
          label="SAC/HSN Code"
          name="SAC_HSN_Code"
          value={formData.SAC_HSN_Code || ''}
          onChange={handleChange}
          className="w-full"
        />
        <Input
          label="Item Category"
          name="ItemCategory"
          value={formData.ItemCategory || ''}
          onChange={handleChange}
          className="w-full"
        />
        <Input
          label="Serial Number"
          name="SerialNumber"
          value={formData.SerialNumber || ''}
          onChange={handleChange}
          className="w-full"
        />
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tax Rates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            label="IGST Rate (%)"
            name="IGST_Rate"
            type="number"
            value={formData.IGST_Rate || ''}
            onChange={handleChange}
            className="w-full"
          />
          <Input
            label="CGST Rate (%)"
            name="CGST_Rate"
            type="number"
            value={formData.CGST_Rate || ''}
            onChange={handleChange}
            className="w-full"
          />
          <Input
            label="SGST Rate (%)"
            name="SGST_Rate"
            type="number"
            value={formData.SGST_Rate || ''}
            onChange={handleChange}
            className="w-full"
          />
          <Input
            label="UTGST Rate (%)"
            name="UTGST_Rate"
            type="number"
            value={formData.UTGST_Rate || ''}
            onChange={handleChange}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="flex items-center justify-end mt-6">
        <Button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Save Item
        </Button>
      </div>
    </form>
  );
};

export default ItemForm;