import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../../utils/endpoint';

const InternalForm = () => {
  // Form Data State
  const [formData, setFormData] = useState({
    employeeCode: '',
    employeeId: '',
    employeeEmail: '',
    managerCode: '',
    managerId: '',
    unit: '',
    project: '',
  });

  // Users State
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState(null);

  // Items State
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemInput, setItemInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // New Item Input State
  const [newItemInput, setNewItemInput] = useState({
    name: '',
    quantity: 1
  });

  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await axios.get(`${baseURL}/users`);
        const allUsers = response.data;
        
        setEmployees(allUsers.filter(user => user.role === 'employee'));
        setManagers(allUsers.filter(user => user.role === 'manager'));
        setUserError(null);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUserError('Failed to load users');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch Items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseURL}/items`);
        setAvailableItems(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching items:', err);
        setError('Failed to fetch items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Handlers
  const handleEmployeeSelect = (e) => {
    const selectedEmployee = employees.find(emp => emp._id === e.target.value);
    setFormData(prev => ({
      ...prev,
      employeeCode: selectedEmployee?.username || '',
      employeeId: selectedEmployee?._id || '',
      employeeEmail: selectedEmployee?.email || ''
    }));
  };

  const handleManagerSelect = (e) => {
    const selectedManager = managers.find(mgr => mgr._id === e.target.value);
    setFormData(prev => ({
      ...prev,
      managerCode: selectedManager?.username || '',
      managerId: selectedManager?._id || ''
    }));
  };

  const handleNewItemInputChange = (e) => {
    const { name, value } = e.target;
    setNewItemInput(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Math.max(1, parseInt(value) || 1) : value
    }));
  };

  const handleAddNewItem = () => {
    if (newItemInput.name.trim()) {
      setSelectedItems(prev => [
        ...prev,
        {
          id: `CUSTOM-${Date.now()}`,
          ItemName: newItemInput.name,
          quantity: parseInt(newItemInput.quantity),
          isCustom: true
        }
      ]);
      setNewItemInput({ name: '', quantity: 1 });
    }
  };

  const handleItemSelect = (item) => {
    setSelectedItems(prev => [
      ...prev,
      { ...item, quantity: 1 }
    ]);
  };

  const incrementQuantity = (index) => {
    setSelectedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const decrementQuantity = (index) => {
    setSelectedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
    ));
  };

  const removeItem = (index) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add your submit logic here
    console.log('Form Data:', {
      ...formData,
      items: selectedItems
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Request Materials & Services
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">1. Your Details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Select Employee</label>
                {loadingUsers ? (
                  <div className="p-2 text-gray-500">Loading employees...</div>
                ) : userError ? (
                  <div className="p-2 text-red-500">{userError}</div>
                ) : (
                  <select
                    value={formData.employeeId}
                    onChange={handleEmployeeSelect}
                    className="w-full p-2 border rounded-md bg-white"
                    required
                  >
                    <option value="">Select your name</option>
                    {employees.map(employee => (
                      <option key={employee._id} value={employee._id}>
                        {employee.username}  
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.employeeEmail}
                  className="w-full p-2 border rounded-md bg-gray-100"
                  disabled
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">2. What do you need?</h2>
            
            {/* Add New Item */}
            <div className="mb-4 bg-white p-4 rounded-md shadow-sm">
              <h3 className="text-md font-medium mb-2">Request New Item</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="name"
                  placeholder="What item do you need?"
                  value={newItemInput.name}
                  onChange={handleNewItemInputChange}
                  className="flex-grow p-2 border rounded-md"
                />
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={newItemInput.quantity}
                  onChange={handleNewItemInputChange}
                  className="w-20 p-2 border rounded-md"
                />
                <button
                  type="button"
                  onClick={handleAddNewItem}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Search Existing Items */}
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Or select from available items:</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search available items..."
                  value={itemInput}
                  onChange={(e) => setItemInput(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
                
                {/* Scrollable Items List */}
                <div className="mt-2 max-h-[300px] overflow-y-auto rounded-md border border-gray-200 bg-white">
                  {loading ? (
                    <div className="text-center py-4">Loading items...</div>
                  ) : error ? (
                    <div className="text-red-500 text-center py-4">{error}</div>
                  ) : (
                    availableItems
                      .filter(item => 
                        item.ItemName.toLowerCase().includes(itemInput.toLowerCase()) ||
                        item.ItemCode.toLowerCase().includes(itemInput.toLowerCase())
                      )
                      .map(item => (
                        <button
                          key={item._id}
                          type="button"
                          onClick={() => handleItemSelect(item)}
                          className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0"
                        >
                          <div className="font-medium">{item.ItemName}</div>
                          <div className="text-sm text-gray-500">Code: {item.ItemCode}</div>
                        </button>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Selected Items */}
            {selectedItems.length > 0 && (
              <div className="mt-4">
                <h3 className="text-md font-medium mb-2">Your Selected Items:</h3>
                <div className="space-y-2">
                  {selectedItems.map((item, index) => (
                    <div 
                      key={item.id || item._id}
                      className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm"
                    >
                      <div>
                        <div className="font-medium">{item.ItemName}</div>
                        {!item.isCustom && <div className="text-sm text-gray-500">Code: {item.ItemCode}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => decrementQuantity(index)}
                          className="w-8 h-8 flex items-center justify-center border rounded-full"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => incrementQuantity(index)}
                          className="w-8 h-8 flex items-center justify-center border rounded-full"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Manager Approval */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">3. Manager Approval</h2>
            {loadingUsers ? (
              <div className="p-2 text-gray-500">Loading managers...</div>
            ) : userError ? (
              <div className="p-2 text-red-500">{userError}</div>
            ) : (
              <select
                value={formData.managerId}
                onChange={handleManagerSelect}
                className="w-full p-2 border rounded-md bg-white"
                required
              >
                <option value="">Select approving manager</option>
                {managers.map(manager => (
                  <option key={manager._id} value={manager._id}>
                    {manager.username} ({manager.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-3 rounded-lg text-lg font-medium hover:bg-green-600 transition-colors"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default InternalForm;
