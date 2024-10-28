import React, { useState } from 'react';

const PurchaseIndentForm = () => {
  // Form state
  const [formData, setFormData] = useState({
    employeeCode: '',
    employeeEmail: '',
    managerCode: '',
    unit: '',
    project: '',
  });

  // Item Selection State
  const [itemInput, setItemInput] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [customItem, setCustomItem] = useState('');

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Item handlers
  const handleAddItem = () => {
    if (itemInput.trim()) {
      setSelectedItems(prev => [...prev, itemInput.trim()]);
      setItemInput('');
    }
  };

  const handleAddCustomItem = () => {
    if (customItem.trim()) {
      setSelectedItems(prev => [...prev, customItem.trim()]);
      setCustomItem('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      items: selectedItems,
    };
    console.log('Form Data:', submitData);
    alert('Form submitted successfully!');
    setFormData({
      employeeCode: '',
      employeeEmail: '',
      managerCode: '',
      unit: '',
      project: '',
    });
    setSelectedItems([]);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white w-full max-w-3xl p-8 rounded-lg shadow-lg">
        <h2 className="text-center text-2xl font-semibold text-gray-700 mb-8 border-b pb-4">
          Purchase Indent Form
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Employee Details */}
          <div className="mb-6">
            <label className="block text-md font-medium text-gray-700 mb-2">Employee Details</label>
            <div className="grid grid-cols-2 gap-4">
              <select
                name="employeeCode"
                value={formData.employeeCode}
                onChange={handleInputChange}
                className="bg-white p-2 rounded-md border border-gray-300"
                required
              >
                <option value="" disabled>Employee Code ▼</option>
                <option value="EMP001">EMP001</option>
                <option value="EMP002">EMP002</option>
                <option value="EMP003">EMP003</option>
              </select>
              <input
                type="email"
                name="employeeEmail"
                value={formData.employeeEmail}
                onChange={handleInputChange}
                placeholder="Employee Email"
                className="bg-gray-100 p-2 rounded-md border border-gray-300"
                required
              />
            </div>
          </div>

          {/* Item Selection */}
          <div className="mb-6">
            <label className="block text-md font-medium text-gray-700 mb-2">Item Selection</label>
            <div className="bg-gray-100 p-4 rounded-md">
              <input
                type="text"
                placeholder="🔍 Search Items"
                value={itemInput}
                onChange={(e) => setItemInput(e.target.value)}
                className="w-full p-2 mb-2 rounded-md border border-gray-300"
              />
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full bg-indigo-500 text-white p-2 rounded-md hover:bg-indigo-600 mb-4"
              >
                Add Item
              </button>
              <input
                type="text"
                placeholder="New Item Description"
                value={customItem}
                onChange={(e) => setCustomItem(e.target.value)}
                className="w-full p-2 rounded-md border border-gray-300"
              />
              <button
                type="button"
                onClick={handleAddCustomItem}
                className="w-full mt-2 bg-indigo-500 text-white p-2 rounded-md hover:bg-indigo-600"
              >
                Add Custom Item
              </button>
              <div className="mt-4">
                {selectedItems.map((item, index) => (
                  <p key={index} className="text-gray-700 text-sm">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Approval Details */}
          <div className="mb-6">
            <label className="block text-md font-medium text-gray-700 mb-2">Approval Details</label>
            <select
              name="managerCode"
              value={formData.managerCode}
              onChange={handleInputChange}
              className="bg-white w-full p-2 rounded-md border border-gray-300"
              required
            >
              <option value="" disabled>Manager Code ▼</option>
              <option value="MGR001">MGR001</option>
              <option value="MGR002">MGR002</option>
              <option value="MGR003">MGR003</option>
            </select>
          </div>

          {/* Project Details */}
          <div className="mb-6">
            <label className="block text-md font-medium text-gray-700 mb-2">Project Details</label>
            <div className="grid grid-cols-2 gap-4">
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="bg-white p-2 rounded-md border border-gray-300"
                required
              >
                <option value="" disabled>Unit ▼</option>
                <option value="Unit1">Unit1</option>
                <option value="Unit2">Unit2</option>
                <option value="Unit3">Unit3</option>
              </select>
              <select
                name="project"
                value={formData.project}
                onChange={handleInputChange}
                className="bg-white p-2 rounded-md border border-gray-300"
                required
              >
                <option value="" disabled>Project ▼</option>
                <option value="Project1">Project1</option>
                <option value="Project2">Project2</option>
                <option value="Project3">Project3</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600 text-lg"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default PurchaseIndentForm;
