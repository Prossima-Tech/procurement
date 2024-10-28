import React, { useState } from 'react';

const ItemsComponent = ({ selectedItems, setSelectedItems }) => {
  const [itemInput, setItemInput] = useState({ name: '', quantity: 1 });
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); 
  const [showQuantityPopup, setShowQuantityPopup] = useState(false); 
  const [quantityInput, setQuantityInput] = useState(1);

  const [availableItems] = useState([
    { id: 'LAP001', name: 'Laptop - Dell XPS 13' },
    { id: 'MOU001', name: 'Wireless Mouse' },
    { id: 'MON001', name: 'Monitor - 24 inch' },
  ]);

  // Modified to handle item selection and show popup
  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setQuantityInput(1); // Reset quantity
    setShowQuantityPopup(true);
  };

  // New function to handle saving quantity
  const handleSaveQuantity = () => {
    if (selectedItem && quantityInput > 0) {
      setSelectedItems(prev => [...prev, { 
        ...selectedItem, 
        quantity: parseInt(quantityInput) 
      }]);
      setShowQuantityPopup(false);
      setSelectedItem(null);
      setQuantityInput(1);
    }
  };

  // New function to handle canceling selection
  const handleCancelSelection = () => {
    setShowQuantityPopup(false);
    setSelectedItem(null);
    setQuantityInput(1);
  };

  // Modified search handler
  const handleSearchChange = (e) => {
    setItemInput(prev => ({ ...prev, name: e.target.value }));
    setShowCustomForm(false); // Reset custom form when searching
  };

  // Modified custom item submit
  const handleCustomItemSubmit = (e) => {
    e.preventDefault();
    if (itemInput.name.trim()) {
      const newItem = {
        id: `CUSTOM-${Date.now()}`,
        name: itemInput.name.trim(),
        quantity: parseInt(itemInput.quantity) || 1,
        isCustom: true
      };
      
      // Add the new item to the existing selected items
      setSelectedItems(prevItems => [...prevItems, newItem]);
      
      // Reset the form
      setItemInput({ name: '', quantity: 1 });
      setShowCustomForm(false);
    }
  };

  return (
    <div className="relative"> {/* Added relative positioning for popup */}
      <div className="flex flex-col items-center bg-gray-100 w-full">
        <div className="bg-white shadow-md mt-8 p-5 rounded-lg w-full max-w-xl">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Available Items</h3>

          {/* Search Bar */}
          <div className="flex items-center bg-gray-100 p-3 rounded-md mb-4">
            <span className="text-gray-500">🔍</span>
            <input
              type="text"
              placeholder="Search items..."
              className="bg-transparent outline-none ml-3 text-sm w-full"
              value={itemInput.name}
              onChange={(e) => setItemInput(prev => ({ ...prev, name: e.target.value }))}
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
              .filter((item) => item.name.toLowerCase().includes(itemInput.name.toLowerCase()))
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
                  <label htmlFor={item.id} className="ml-3 flex-grow cursor-pointer">
                    <p className="text-gray-800">{item.name}</p>
                    <p className="text-gray-500 text-sm">ID: {item.id}</p>
                  </label>
                </div>
              ))}
          </div>

          {/* Quantity Selection Popup */}
          {showQuantityPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h3 className="text-lg font-semibold mb-4">Select Quantity</h3>
                <p className="text-gray-600 mb-4">{selectedItem?.name}</p>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantityInput}
                    onChange={(e) => setQuantityInput(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelSelection}
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

          {/* Add Selected Items Button */}
          {selectedItem && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedItems(prev => [...prev, { ...selectedItem, quantity: parseInt(quantityInput) }]);
                  setShowQuantityPopup(false);
                  setSelectedItem(null);
                  setQuantityInput(1);
                }}
                className="w-full bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
              >
                Add Selected Item ({selectedItem.name})
              </button>
            </div>
          )}

          {/* No Results Found - Custom Item Form */}
          {itemInput.name && !availableItems.some(item => 
            item.name.toLowerCase().includes(itemInput.name.toLowerCase())
          ) && (
            <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-600 mb-2">Item not found in the list?</p>
              {!showCustomForm ? (
                <button
                  type="button"
                  onClick={() => setShowCustomForm(true)}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  + Add Custom Item
                </button>
              ) : (
                <form onSubmit={handleCustomItemSubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter item name"
                    value={itemInput.name}
                    onChange={(e) => setItemInput(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min="1"
                      value={itemInput.quantity}
                      onChange={(e) => setItemInput(prev => ({ ...prev, quantity: e.target.value }))}
                      className="w-24 p-2 border rounded-md"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
                    >
                      Add Item
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomForm(false);
                        setItemInput({ name: '', quantity: 1 });
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Items Section */}
      <div className="bg-white shadow-md mt-8 p-5 rounded-lg w-full max-w-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-800">Selected Items</h3>
          <button 
            type="button" 
            onClick={() => {
              setSelectedItems([]);
              setSelectedItem(null);
              setQuantityInput(1);
            }} 
            className="bg-red-100 text-red-600 px-4 py-2 rounded-md hover:bg-red-200"
          >
            Clear All
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Add quantities for selected items</p>

        {/* Selected Items List */}
        {selectedItems.length > 0 ? (
          selectedItems.map((item, index) => (
            <div key={item.id} className="flex justify-between items-center bg-gray-100 p-4 rounded-lg mb-4">
              <div>
                <h4 className="font-medium text-gray-800">{item.name}</h4>
                <p className="text-sm text-gray-500">ID: {item.id}</p>
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
    </div>
  );
};

export default ItemsComponent;
