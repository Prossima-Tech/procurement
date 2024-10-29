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
      prevItems.map((item, i) =>
        i === index && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
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
              <div className="space-y-2">
                {availableItems
                  .filter((item) => item.name.toLowerCase().includes(itemInput.toLowerCase()))
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center bg-gray-100 p-4 rounded-md border border-gray-200 cursor-pointer"
                      onClick={() => handleItemSelect(item)}
                    >
                      <p className="text-gray-800">{item.name}</p>
                    </div>
                  ))}
              </div>

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

              {/* Quantity Popup */}
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
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No items selected</p>
            )}
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
