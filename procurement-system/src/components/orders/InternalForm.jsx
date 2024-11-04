import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../../utils/endpoint';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const InternalForm = () => {
  // Form state
  const [formData, setFormData] = useState({
    employeeCode: '',
    employeeId: '671bacdb385cef712dfecb7c',
    employeeEmail: '',
    managerId: '671da8ea459e3fc7de03d837',
    unit: '',
    unitId: '',
    project: '',
    projectId: '',
    purpose: '',
    priority: 'medium'
  });

  // Item selection state
  const [itemInput, setItemInput] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [customItem, setCustomItem] = useState(''); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantityInput, setQuantityInput] = useState(1);
  const [showQuantityPopup, setShowQuantityPopup] = useState(false);

  // Replace the static availableItems with state
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simplified new item state
  const [newItemInput, setNewItemInput] = useState({
    name: '',
    quantity: 1
  });

  // Handle new item input change
  const handleNewItemInputChange = (e) => {
    const { name, value } = e.target;
    setNewItemInput(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle adding new custom item
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
      toast.success('Item added successfully');
      // Reset input after adding
      setNewItemInput({
        name: '',
        quantity: 1
      });
    } else {
      toast.warning('Please enter an item name');
    }
  };

  // Fetch items from database
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseURL}/items`);
        console.log("response for availabe item",response.data.data);
        setAvailableItems(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching items:', err);
        toast.error('Failed to fetch items');
        setError('Failed to fetch items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const [availableUnits, setAvailableUnits] = useState([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);
  const [unitError, setUnitError] = useState(null);

  const [availableProjects, setAvailableProjects] = useState([
    { id: 'PRJ001', name: 'Project Alpha' },
    { id: 'PRJ002', name: 'Project Beta' },
    { id: 'PRJ003', name: 'Project Gamma' },
    { id: 'PRJ004', name: 'Project Delta' }
  ]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectError, setProjectError] = useState(null);

  // Add these state variables at the top with your other states
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Add this function to fetch users
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await axios.get(`${baseURL}/users`);
      
      // Filter users based on their roles
      const employeesList = response.data.filter(user => user.role === 'employee');
      const managersList = response.data.filter(user => user.role === 'manager');
      
      setEmployees(employeesList);
      setManagers(managersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Add this useEffect to fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'employeeCode') {
      const selectedEmployee = employees.find(emp => emp._id === value);
      setFormData(prev => ({
        ...prev,
        employeeCode: value,
        employeeId: selectedEmployee?._id || '',
        employeeEmail: selectedEmployee?.email || ''
      }));
    } else if (name === 'managerId') {
      setFormData(prev => ({
        ...prev,
        managerId: value
      }));
    } else if (name === 'unit') {
      const selectedUnit = availableUnits.find(unit => unit.code === value);
      setFormData(prev => ({
        ...prev,
        unit: value,
        unitId: selectedUnit?.id || ''
      }));
    } 
    else if (name === 'project') {
      const selectedProject = availableProjects.find(project => project.id === value);
      setFormData(prev => ({
        ...prev,
        project: value,
        projectId: selectedProject?._id || ''
      }));
    }
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle item selection and show quantity popup
  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setQuantityInput(1);
    setShowQuantityPopup(true);
  };

  // Save selected item with quantity
  const handleSaveQuantity = () => {
    if (selectedItem && quantityInput > 0) {
      setSelectedItems((prev) => [
        ...prev,
        {
          _id: selectedItem._id,
          ItemCode: selectedItem.ItemCode,
          ItemName: selectedItem.ItemName,
          type: selectedItem.type,
          ItemCategory: selectedItem.ItemCategory,
          quantity: quantityInput,
          reference: selectedItem._id,
          itemCode: selectedItem.ItemCode
        }
      ]);
      console.log("selectedItems",selectedItems);
      toast.success('Item added successfully');
      setShowQuantityPopup(false);
      setSelectedItem(null);
      setQuantityInput(1);
    } else {
      toast.error('Please select a valid quantity');
    }
  };

  const handleAddCustomItem = () => {
    if (customItem.trim()) {
      setSelectedItems((prev) => [
        ...prev,
        { id: `CUSTOM-${Date.now()}`, name: customItem, quantity: 1, isCustom: true },
      ]);
      setCustomItem('');
    }
  };

  const incrementQuantity = (index) => {
    setSelectedItems((prevItems) =>
      prevItems.map((item, i) => (i === index ? { ...item, quantity: item.quantity + 1 } : item))
    );
  };

  const decrementQuantity = (index) => {
    setSelectedItems((prevItems) =>
      prevItems.map((item, i) => {
        if (i === index) {
          if (item.quantity <= 1) {
            return null; // This item will be filtered out
          }
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }).filter(Boolean) // Remove null items
    );
  };

  const removeItem = (index) => {
    setSelectedItems(prevItems => prevItems.filter((_, i) => i !== index));
    toast.info('Item removed');
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item');
      return;
    }

    if (!formData.purpose.trim()) {
      toast.error('Please provide a purpose for the request');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const existingItems = selectedItems
        .filter(item => !item.isCustom)
        .map(item => ({
          name: item.ItemName || item.name,
          quantity: parseInt(item.quantity) || 1,
          reference: item.reference,
          itemCode: item.itemCode
        }));

      const newItems = selectedItems
        .filter(item => item.isCustom)
        .map(item => ({
          name: item.ItemName || item.name,
          quantity: parseInt(item.quantity) || 1
        }));

      const submitData = {
        employeeId: formData.employeeId,
        managerId: formData.managerId,
        unitId: formData.unitId,
        projectId: formData.projectId,
        items: {
          existing: existingItems,
          new: newItems
        },
        purpose: formData.purpose,
        priority: formData.priority,
        status: "submitted"
      };
      console.log("submitData",submitData);
      const response = await axios.post(`${baseURL}/indents/`, submitData);

      if (response.data.success) {
        toast.success('Purchase indent created successfully!');
        setFormData({
          employeeCode: '',
          employeeId: '',
          employeeEmail: '',
          managerId: '',
          unit: '',
          unitId: '',
          project: '',
          projectId: '',
          purpose: '',
          priority: 'medium'
        });
        setSelectedItems([]);
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.message || 'Failed to create purchase indent');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    setProjectError(null);
    try {
      const response = await axios.get(`${baseURL}/projects/`);
      // Transform the API data to match our required format
      const transformedProjects = response.data.map(project => ({
        id: project.projectCode,
        name: `${project.projectName} (${project.projectLocation || 'N/A'})`,
        status: project.projectStatus,
        _id: project._id
      }));
      setAvailableProjects(transformedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
      setProjectError('Failed to load projects. Please try again later.');
      // Fallback dummy data
      setAvailableProjects([
        { id: '001', name: 'Lucknow Office (LKO)', status: 'Active' },
        { id: '002D', name: 'Delhi', status: 'Active' }
      ]);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchUnits = async () => {
    setIsLoadingUnits(true);
    setUnitError(null);
    try {
      const response = await axios.get(`${baseURL}/units/`);
      // Transform the API data to match our required format
      const transformedUnits = response.data.map(unit => ({
        id: unit._id,
        code: unit.unitCode,
        name: unit.unitName,
        status: unit.unitStatus
      }));
      console.log("transformedUnits",transformedUnits);
      setAvailableUnits(transformedUnits);
    } catch (error) {
      console.error('Error fetching units:', error);
      toast.error('Failed to load units');
      setUnitError('Failed to load units. Please try again later.');
      // Fallback dummy data
      setAvailableUnits([
        { id: '1', code: 'IT', name: 'IT Department', status: 'Active' },
        { id: '2', code: 'HR', name: 'Human Resources', status: 'Active' },
        { id: '3', code: 'FIN', name: 'Finance', status: 'Active' }
      ]);
    } finally {
      setIsLoadingUnits(false);
    }
  };

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  useEffect(() => {
    fetchUnits();
    fetchProjects();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
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
                disabled={isLoadingUsers}
              >
                <option value="">
                  {isLoadingUsers ? 'Loading Employees...' : 'Select Employee ▼'}
                </option>
                {employees.map(employee => (
                  <option key={employee._id} value={employee._id}>
                    {employee.username} 
                  </option>
                ))}
              </select>
              <input
                type="email"
                name="employeeEmail"
                value={formData.employeeEmail}
                className="bg-gray-100 p-2 rounded-md border border-gray-300"
                placeholder="Employee Email"
                readOnly
              />
            </div>
          </div>

          {/* Item Selection */}
          <div className="mb-6">
            <label className="block text-md font-medium text-gray-700 mb-2">Item Selection</label>
            <div className="bg-white shadow-md p-5 rounded-lg">
              <h3 className="font-bold text-lg text-gray-800 mb-4">Available Items</h3>

              {/* New Item Input Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Add Custom Item</h4>
                <div className="flex gap-3">
                  <div className="flex-grow">
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter item name"
                      value={newItemInput.name}
                      onChange={handleNewItemInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      value={newItemInput.quantity}
                      onChange={handleNewItemInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddNewItem}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Existing Items Search */}
              <div className="flex items-center bg-gray-100 p-3 rounded-md mb-4">
                <span className="text-gray-500">🔍</span>
                <input
                  type="text"
                  placeholder="Search existing items..."
                  className="bg-transparent outline-none ml-3 text-sm w-full"
                  value={itemInput}
                  onChange={(e) => setItemInput(e.target.value)}
                />
              </div>

              {/* Loading and Error States */}
              {loading && (
                <div className="text-center py-4">Loading items...</div>
              )}

              {error && (
                <div className="text-red-500 text-center py-4">{error}</div>
              )}

              {/* Available Items List with Radio Buttons */}
              <div className="space-y-2">
                {availableItems
                  .filter((item) => 
                    item.ItemName.toLowerCase().includes(itemInput.toLowerCase()) ||
                    item.ItemCode.toLowerCase().includes(itemInput.toLowerCase())
                  )
                  .map((item) => (
                    <div
                      key={item._id}
                      className={`flex items-center bg-gray-100 p-4 rounded-md border ${
                        selectedItem?._id === item._id ? 'border-indigo-500' : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        id={item._id}
                        name="itemSelection"
                        checked={selectedItem?._id === item._id}
                        onChange={() => handleItemSelect(item)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-full"
                      />
                      <label htmlFor={item._id} className="ml-3 flex flex-row justify-between flex-grow cursor-pointer">
                        <div>
                          <p className="text-gray-800 font-medium">{item.ItemName}</p>
                          <p className="text-gray-500 text-sm">Type: {item.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500 text-sm">Code: {item.ItemCode}</p>
                          {item.ItemCategory && (
                            <p className="text-gray-500 text-sm">Category: {item.ItemCategory}</p>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
              </div>

              {/* No Results Message */}
              {!loading && !error && availableItems.filter(item => 
                item.ItemName.toLowerCase().includes(itemInput.toLowerCase()) ||
                item.ItemCode.toLowerCase().includes(itemInput.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No items found matching your search
                </div>
              )}

              {/* Keep existing custom item section
              <input
                type="text"
                placeholder="New Item Description"
                value={customItem}
                onChange={(e) => setCustomItem(e.target.value)}
                className="w-full p-2 mt-4 rounded-md border border-gray-300"
              />
              <button
                type="button"
                onClick={handleAddCustomItem}
                className="w-full mt-2 bg-indigo-500 text-white p-2 rounded-md hover:bg-indigo-600"
              >
                Add Custom Item
              </button> */}

              {/* Keep existing quantity popup */}
              {showQuantityPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                    <h3 className="text-lg font-semibold mb-4">Select Quantity</h3>
                    <p className="text-gray-600 mb-4">{selectedItem?.name}</p>
                    <input
                      type="number"
                      min="1"
                      value={quantityInput}
                      onChange={(e) => setQuantityInput(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full p-2 border rounded-md mb-4"
                    />
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowQuantityPopup(false)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveQuantity}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Items */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-3">Selected Items</h4>
            {selectedItems.length > 0 ? (
              <div className="space-y-3">
                {selectedItems.map((item, index) => (
                  <div 
                    key={item.id || item._id}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {item.ItemName}
                        {item.isCustom && <span className="ml-2 text-xs text-gray-500">(Custom)</span>}
                      </p>
                      {!item.isCustom && item.ItemCode && (
                        <p className="text-sm text-gray-500">Code: {item.ItemCode}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => decrementQuantity(index)}
                        className="px-2 py-1 border rounded"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => incrementQuantity(index)}
                        className="px-2 py-1 border rounded"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No items selected</p>
            )}
          </div>

          {/* Request Details Section - New Addition */}
          <div className="bg-white shadow-lg mt-8 p-5 rounded-lg">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Request Details</h3>
            
            {/* Purpose Field */}
            <div className="mb-4">
              <label className="block text-md font-medium text-gray-700 mb-2">
                Purpose
              </label>
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                className="w-full p-3 rounded-md border border-gray-300 min-h-[100px]"
                placeholder="Please describe the purpose of this procurement request"
                required
              />
            </div>

            {/* Priority Field */}
            <div className="mb-4">
              <label className="block text-md font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full bg-gray-100 p-3 rounded-md border border-gray-300"
                required
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Approval Section */}
          <div className="bg-white shadow-lg mt-8 p-5 rounded-lg">
            <h3 className="font-bold text-lg text-gray-800 mb-2">Approval</h3>
            <select
              name="managerId"
              value={formData.managerId}
              onChange={handleInputChange}
              className="w-full bg-gray-100 p-3 rounded-md border border-gray-200"
              required
              disabled={isLoadingUsers}
            >
              <option value="">
                {isLoadingUsers ? 'Loading Managers...' : 'Select Manager ▼'}
              </option>
              {managers.map(manager => (
                <option key={manager._id} value={manager._id}>
                  {manager.username} - {manager.email}
                </option>
              ))}
            </select>
          </div>

          {/* Unit and Project Selection */}
          <div className="bg-white shadow-lg mt-8 p-5 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="bg-gray-100 p-3 rounded-md border border-gray-200 w-full"
                  required
                  disabled={isLoadingUnits}
                >
                  <option value="" disabled>
                    {isLoadingUnits ? 'Loading Units...' : 'Select Unit ▼'}
                  </option>
                  {availableUnits.map(unit => (
                    <option 
                      key={unit.id} 
                      value={unit.code}
                    >
                      {unit.name} ({unit.code})
                    </option>
                  ))}
                </select>
                {unitError && (
                  <p className="text-red-500 text-sm mt-1">{unitError}</p>
                )}
              </div>
              <div className="relative">
                <select
                  name="project"
                  value={formData.project}
                  onChange={handleInputChange}
                  className="bg-gray-100 p-3 rounded-md border border-gray-200 w-full"
                  required
                  disabled={isLoadingProjects}
                >
                  <option value="" disabled>
                    {isLoadingProjects ? 'Loading Projects...' : 'Select Project ▼'}
                  </option>
                  {availableProjects.map(project => (
                    <option 
                      key={project._id} 
                      value={project.id}
                    >
                      {project.name}
                    </option>
                  ))}
                </select>
                {projectError && (
                  <p className="text-red-500 text-sm mt-1">{projectError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${
              isSubmitting 
                ? 'bg-indigo-300 cursor-not-allowed' 
                : 'bg-indigo-500 hover:bg-indigo-600'
            } text-white py-2 rounded-md text-lg mt-8`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InternalForm;
