import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../../utils/endpoint';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, Minus, X, LogOut, 
  Package, Building2, Users, Briefcase,
  AlertCircle, CheckCircle2, Clock,
  ChevronDown, ShoppingCart, Settings
} from 'lucide-react';

const InternalForm = () => {
  const navigate = useNavigate();

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

  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await axios.get(`${baseURL}/users`);
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
            return null;
          }
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }).filter(Boolean)
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
      const transformedUnits = response.data.map(unit => ({
        id: unit._id,
        code: unit.unitCode,
        name: unit.unitName,
        status: unit.unitStatus
      }));
      setAvailableUnits(transformedUnits);
    } catch (error) {
      console.error('Error fetching units:', error);
      toast.error('Failed to load units');
      setUnitError('Failed to load units. Please try again later.');
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <nav className="bg-white border-b px-4 py-2 fixed top-0 w-full z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} className="text-indigo-600" />
              <h1 className="text-lg font-semibold text-gray-800">Procurement Hub</h1>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      <div className="pt-16 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">New Purchase Request</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Request ID:</span>
              <span className="px-2 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                PR-{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-base font-medium text-gray-800 flex items-center gap-2">
                  <Users size={18} className="text-indigo-500" />
                  Request Details
                </h3>
              </div>
              
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Requesting Employee
                  </label>
                  <div className="relative">
                    <select
                      name="employeeCode"
                      value={formData.employeeCode}
                      onChange={handleInputChange}
                      className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                      required
                    >
                      <option value="">
                        {isLoadingUsers ? 'Loading...' : 'Select Employee'}
                      </option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>
                          {emp.username}
                        </option>
                      ))}
                    </select>
                    <ChevronDown 
                      size={16} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                    />
                  </div>
                  <input
                    type="email"
                    value={formData.employeeEmail}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                    placeholder="Employee Email"
                    readOnly
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Approving Manager
                  </label>
                  <div className="relative">
                    <select
                      name="managerId"
                      value={formData.managerId}
                      onChange={handleInputChange}
                      className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                      required
                    >
                      <option value="">
                        {isLoadingUsers ? 'Loading...' : 'Select Manager'}
                      </option>
                      {managers.map(manager => (
                        <option key={manager._id} value={manager._id}>
                          {manager.username} - {manager.email}
                        </option>
                      ))}
                    </select>
                    <ChevronDown 
                      size={16} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-base font-medium text-gray-800 flex items-center gap-2">
                  <Building2 size={18} className="text-indigo-500" />
                  Organization Details
                </h3>
              </div>
              
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Business Unit
                  </label>
                  <div className="relative">
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                      required
                    >
                      <option value="">
                        {isLoadingUnits ? 'Loading...' : 'Select Unit'}
                      </option>
                      {availableUnits.map(unit => (
                        <option key={unit.id} value={unit.code}>
                          {unit.name} ({unit.code})
                        </option>
                      ))}
                    </select>
                    <ChevronDown 
                      size={16} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Project
                  </label>
                  <div className="relative">
                    <select
                      name="project"
                      value={formData.project}
                      onChange={handleInputChange}
                      className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                      required
                    >
                      <option value="">
                        {isLoadingProjects ? 'Loading...' : 'Select Project'}
                      </option>
                      {availableProjects.map(project => (
                        <option key={project._id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown 
                      size={16} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
              <div className="xl:col-span-3 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-base font-medium text-gray-800 flex items-center gap-2">
                    <Package size={18} className="text-indigo-500" />
                    Available Items
                  </h3>
                </div>

                <div className="p-4 space-y-4">
                  <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Add Custom Item</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="name"
                        placeholder="Item name"
                        value={newItemInput.name}
                        onChange={handleNewItemInputChange}
                        className="flex-1 px-3 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                      />
                      <input
                        type="number"
                        name="quantity"
                        min="1"
                        value={newItemInput.quantity}
                        onChange={handleNewItemInputChange}
                        className="w-20 px-3 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewItem}
                        className="px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search items by name or code..."
                      value={itemInput}
                      onChange={(e) => setItemInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    />
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {loading ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : error ? (
                      <div className="flex items-center justify-center py-6 text-red-500 gap-2">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                      </div>
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
                            className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">
                                  {item.ItemName}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500">Code: {item.ItemCode}</span>
                                  <span className="text-xs text-gray-500">Type: {item.type}</span>
                                </div>
                              </div>
                              <span className="p-1 rounded-full bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Plus size={14} />
                              </span>
                            </div>
                          </button>
                        ))
                    )}
                  </div>
                </div>
              </div>

              <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-base font-medium text-gray-800 flex items-center gap-2">
                    <ShoppingCart size={18} className="text-indigo-500" />
                    Selected Items
                    <span className="ml-auto text-xs text-gray-500">
                      {selectedItems.length} items
                    </span>
                  </h3>
                </div>

                <div className="p-4">
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {selectedItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-gray-200 rounded-lg">
                        <Package size={32} className="text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500 text-center">No items selected yet</p>
                        <p className="text-xs text-gray-400 text-center mt-1">
                          Select items from the list or add custom items
                        </p>
                      </div>
                    ) : (
                      selectedItems.map((item, index) => (
                        <div 
                          key={item.id || item._id} 
                          className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-all"
                        >
                          <div className="flex flex-col gap-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-sm font-medium text-gray-800">
                                  {item.ItemName}
                                  {item.isCustom && (
                                    <span className="ml-2 text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">
                                      Custom
                                    </span>
                                  )}
                                </h4>
                                {!item.isCustom && item.ItemCode && (
                                  <p className="text-xs text-gray-500 mt-1">Code: {item.ItemCode}</p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => decrementQuantity(index)}
                                  className="p-1 hover:bg-gray-50 text-gray-600"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="px-3 py-1 font-medium text-sm text-gray-700 bg-gray-50">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => incrementQuantity(index)}
                                  className="p-1 hover:bg-gray-50 text-gray-600"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              <span className="text-xs text-gray-500">units</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-base font-medium text-gray-800 flex items-center gap-2">
                  <Briefcase size={18} className="text-indigo-500" />
                  Request Information
                </h3>
              </div>
              
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Purpose
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg h-32 resize-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    placeholder="Please describe the purpose of this procurement request"
                    required
                  />
                </div>

                {/* Priority */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Priority Level
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {['low', 'medium', 'high', 'urgent'].map((priority) => (
                      <label
                        key={priority}
                        className={`
                          flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer
                          ${formData.priority === priority 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={priority}
                          checked={formData.priority === priority}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        {priority === 'low' && <Clock size={18} />}
                        {priority === 'medium' && <Clock size={18} />}
                        {priority === 'high' && <AlertCircle size={18} />}
                        {priority === 'urgent' && <AlertCircle size={18} />}
                        <span className="capitalize">{priority}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  flex items-center gap-3 px-8 py-3 rounded-lg text-white font-medium
                  ${isSubmitting 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-indigo-500 hover:bg-indigo-600 transform hover:-translate-y-0.5'
                  }
                  transition-all duration-200
                `}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Quantity Popup */}
      {showQuantityPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 transform transition-all scale-100">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Select Quantity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setQuantityInput(prev => Math.max(1, prev - 1))}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                >
                  <Minus size={20} />
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center p-2 border border-gray-200 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setQuantityInput(prev => prev + 1)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuantityPopup(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuantity}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Add to List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
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
    </div>
  );
};

export default InternalForm;