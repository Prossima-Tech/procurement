import React, { useState, useEffect } from 'react';
import VendorList from '../components/vendors/VendorList';
import VendorForm from '../components/vendors/VendorForm';
import VendorMetrics from '../components/vendors/VendorMetrics';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { UserGroupIcon, CurrencyDollarIcon, ClockIcon, PlusIcon } from '@heroicons/react/outline';
import { toast } from 'react-toastify';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/vendors');
      const data = await response.json();
      setVendors(data);
    } catch (error) {
      toast.error('Failed to fetch vendors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVendor = async (newVendor) => {
    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVendor),
      });
      const data = await response.json();
      setVendors([...vendors, data]);
      setIsModalOpen(false);
      toast.success('Vendor added successfully');
    } catch (error) {
      toast.error('Failed to add vendor');
    }
  };

  const handleEditVendor = async (updatedVendor) => {
    try {
      const response = await fetch(`/api/vendors/${updatedVendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedVendor),
      });
      const data = await response.json();
      setVendors(vendors.map(v => v.id === data.id ? data : v));
      toast.success('Vendor updated successfully');
    } catch (error) {
      toast.error('Failed to update vendor');
    }
  };

  const handleDeleteVendor = async (id) => {
    try {
      await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
      setVendors(vendors.filter(v => v.id !== id));
      toast.success('Vendor deleted successfully');
    } catch (error) {
      toast.error('Failed to delete vendor');
    }
  };

  const metrics = [
    { id: 1, title: 'Total Vendors', value: vendors.length, icon: UserGroupIcon, change: 5 },
    { id: 2, title: 'Active Vendors', value: vendors.filter(v => v.status === 'Active').length, icon: UserGroupIcon, change: 2 },
    { id: 4, title: 'Average Response Time', value: '2 days', icon: ClockIcon, change: -1 },
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Vendors</h1>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add New Vendor</span>
          </Button>
        </div>
        <div className="mb-8">
          <VendorMetrics metrics={metrics} />
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          {isLoading ? (
            <div className="text-center py-10">Loading vendors...</div>
          ) : (
            <VendorList
              vendors={vendors}
              onEdit={handleEditVendor}
              onDelete={handleDeleteVendor}
            />
          )}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} width="5xl" title="Add New Vendor">
        <VendorForm onSubmit={handleAddVendor} onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Vendors;