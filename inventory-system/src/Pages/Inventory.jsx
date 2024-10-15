import React, { useState } from 'react';
import ItemList from '../Components/items/ItemList';
import ItemCategories from '../Components/items/ItemCategories';
import Button from '../Components/common/Button';
import Modal from '../Components/common/Modal';
import ItemForm from '../Components/items/ItemForm';

const Inventory = () => {
  // Dummy data for demonstration
  const [items, setItems] = useState([
    { id: 1, name: 'Item 1', category: 'Category A', price: 10.99, stock: 100 },
    { id: 2, name: 'Item 2', category: 'Category B', price: 15.99, stock: 50 },
    // Add more items as needed
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddItem = (newItem) => {
    setItems([...items, { ...newItem, id: items.length + 1 }]);
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
      <div className="mt-4">
        <ItemCategories />
      </div>
      <div className="mt-4">
        <Button onClick={() => setIsModalOpen(true)}>Add New Item</Button>
      </div>
      <div className="mt-8">
        <ItemList items={items} />
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Item">
        <ItemForm onSubmit={handleAddItem} />
      </Modal>
    </div>
  );
};

export default Inventory;