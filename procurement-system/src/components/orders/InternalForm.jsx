import React, { useState } from 'react';

const InternalForm = () => {
  // Form state
  const [formData, setFormData] = useState({
    employeeCode: '',
    employeeId: '',
    employeeEmail: '',
    managerCode: '',
    unit: '',
    project: '',
  });

  // Item selection state
  const [itemInput, setItemInput] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [customItem, setCustomItem] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantityInput, setQuantityInput] = useState(1);
  const [showQuantityPopup, setShowQuantityPopup] = useState(false);

  const availableItems = [
    { id: 'LAP001', name: 'Laptop - Dell XPS 13' },
    { id: 'MOU001', name: 'Wireless Mouse' },
    { id: 'MON001', name: 'Monitor - 24 inch' },
  ];

  const availableManagers = [
    { code: 'MGR001', name: 'John Smith' },
    { code: 'MGR002', name: 'Sarah Johnson' },
    { code: 'MGR003', name: 'Mike Wilson' },
  ];

  const availableUnits = [
    'IT Department',
    'Human Resources',
    'Finance',
    'Operations',
  ];

  const availableProjects = [
    'Project Alpha',
    'Project Beta',
    'Project Gamma',
    'Project Delta',
  ];

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      setSelectedItems((prev) => [...prev, { ...selectedItem, quantity: quantityInput }]);
      setShowQuantityPopup(false);
      setSelectedItem(null);
      setQuantityInput(1);
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
            <div className="bg-white shadow-md p-5 rounded-lg">
              <h3 className="font-bold text-lg text-gray-800 mb-4">Available Items</h3>

              {/* Search Bar */}
              <div className="flex items-center bg-gray-100 p-3 rounded-md mb-4">
                <span className="text-gray-500">🔍</span>
                <input
                  type="text"
                  placeholder="Search items..."
                  className="bg-transparent outline-none ml-3 text-sm w-full"
                  value={itemInput}
                  onChange={(e) => setItemInput(e.target.value)}
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex space-x-2 mb-4">
                <button type="button" className="bg-indigo-500 text-white px-4 py-1 rounded-full">All Items</button>
                <button type="button" className="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full border border-indigo-500">Electronics</button>
                <button type="button" className="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full border border-indigo-500">Stationery</button>
              </div>

              {/* Available Items List with Radio Buttons */}
              <div className="space-y-2">
                {availableItems
                  .filter((item) => item.name.toLowerCase().includes(itemInput.toLowerCase()))
                  .map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center bg-gray-100 p-4 rounded-md border ${
                        selectedItem?.id === item.id ? 'border-indigo-500' : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        id={item.id}
                        name="itemSelection"
                        checked={selectedItem?.id === item.id}
                        onChange={() => handleItemSelect(item)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-full"
                      />
                      <label htmlFor={item.id} className="ml-3 flex flex-row justify-between flex-grow cursor-pointer">
                        <p className="text-gray-800">{item.name}</p>
                        <p className="text-gray-500 text-sm ml-auto">ID: {item.id}</p>
                      </label>
                    </div>
                  ))}
              </div>

              {/* Keep existing custom item section */}
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
              </button>

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
          <div className="bg-white shadow-md mt-8 p-5 rounded-lg">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Selected Items</h3>
            {selectedItems.length > 0 ? (
              selectedItems.map((item, index) => (
                <div key={item.id} className="flex justify-between items-center bg-gray-100 p-4 rounded-lg mb-4">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => decrementQuantity(index)}
                      className="bg-white border border-gray-300 rounded px-2 py-1"
                    >
                      -
                    </button>
                    <span className="text-gray-800 font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => incrementQuantity(index)}
                      className="bg-white border border-gray-300 rounded px-2 py-1"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="ml-4 bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No items selected</p>
            )}
          </div>

          {/* Approval Section */}
          <div className="bg-white shadow-lg mt-8 p-5 rounded-lg">
            <h3 className="font-bold text-lg text-gray-800 mb-2">Approval</h3>
            <select
              name="managerCode"
              value={formData.managerCode}
              onChange={handleInputChange}
              className="w-full bg-gray-100 p-3 rounded-md border border-gray-200"
              required
            >
              <option value="" disabled>Select Manager ▼</option>
              {availableManagers.map(manager => (
                <option key={manager.code} value={manager.code}>
                  {manager.name} ({manager.code})
                </option>
              ))}
            </select>
          </div>

          {/* Unit and Project Selection */}
          <div className="bg-white shadow-lg mt-8 p-5 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="bg-gray-100 p-3 rounded-md border border-gray-200"
                required
              >
                <option value="" disabled>Select Unit ▼</option>
                {availableUnits.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              <select
                name="project"
                value={formData.project}
                onChange={handleInputChange}
                className="bg-gray-100 p-3 rounded-md border border-gray-200"
                required
              >
                <option value="" disabled>Select Project ▼</option>
                {availableProjects.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600 text-lg mt-8"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default InternalForm;
