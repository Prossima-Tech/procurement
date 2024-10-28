import React, { useState } from 'react';
import ItemsComponent from './ItemsComponent';

const ExternalForm = () => {
  // Form state
  const [formData, setFormData] = useState({
    employeeCode: '',
    employeeId:'',
    employeeEmail: '',
    unit: '',
    project: '',
    managerEmail: '',
  });

  // Items state (moved from previous component)
  const [selectedItems, setSelectedItems] = useState([
    // { id: 'LAP001', name: 'Laptop - Dell XPS 13', quantity: 1 },
    // { id: 'MOU001', name: 'Wireless Mouse', quantity: 2 },
  ]);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Item handlers
  const incrementQuantity = (index) => {
    setSelectedItems(prevItems =>
      prevItems.map((item, i) =>
        i === index ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementQuantity = (index) => {
    setSelectedItems(prevItems =>
      prevItems.map((item, i) =>
        i === index && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  const clearAllItems = () => {
    setSelectedItems([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Combine form data with selected items
    const submitData = {
      ...formData,
      items: selectedItems,
    };

    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/external-purchase-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        alert('Purchase request submitted successfully!');
        // Reset form
        setFormData({
          employeeCode: '',
          employeeEmail: '',
          unit: '',
          project: '',
          managerEmail: '',
        });
        setSelectedItems([]);
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      alert('Error submitting request: ' + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <div className="bg-white w-11/12 md:w-3/4 lg:w-1/2 mt-10 p-8 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 py-4 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-white">External Purchase Request</h2>
            <p className="text-white opacity-80 text-sm">Generate Purchase Request</p>
          </div>

          {/* Employee Details Card */}
          <div className="bg-white shadow-lg p-5 rounded-lg mt-8">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Employee Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="employeeCode"
                value={formData.employeeCode}
                onChange={handleInputChange}
                placeholder="Employee Code"
                className="bg-gray-100 p-3 rounded-md border border-gray-200 w-full"
                required
              />
              <input
                type="email"
                name="employeeEmail"
                value={formData.employeeEmail}
                onChange={handleInputChange}
                placeholder="Employee Email"
                className="bg-gray-100 p-3 rounded-md border border-gray-200 w-full"
                required
              />
            </div>
          </div>

          {/* Replace the entire Items Section with ItemsComponent */}
          <div className="bg-white shadow-lg mt-8 p-5 rounded-lg">
            <ItemsComponent 
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
            />
          </div>

          {/* Unit and Project Selection */}
          <div className="bg-white shadow-lg mt-8 p-5 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                placeholder="Unit"
                className="bg-gray-100 p-3 rounded-md border border-gray-200 w-full"
                required
              />
              <input
                type="text"
                name="project"
                value={formData.project}
                onChange={handleInputChange}
                placeholder="Project"
                className="bg-gray-100 p-3 rounded-md border border-gray-200 w-full"
                required
              />
            </div>
          </div>

          {/* Manager Approval Section */}
          <div className="bg-white shadow-lg mt-8 p-5 rounded-lg">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Manager Approval</h3>
            <input
              type="email"
              name="managerEmail"
              value={formData.managerEmail}
              onChange={handleInputChange}
              placeholder="Manager Email"
              className="bg-gray-100 p-3 rounded-md border border-gray-200 w-full"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="text-right mt-8">
            <button 
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-8 rounded-md shadow-lg hover:from-indigo-700 hover:to-purple-700"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExternalForm;
