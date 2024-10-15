import React, { useState } from 'react';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/outline';
import Button from '../common/Button';
import Modal from '../common/Modal';
import VendorForm from './VendorForm';
import { useTheme } from '../../contexts/ThemeContext';

const VendorList = ({ onEdit, onDelete, onView }) => {
  const { isDarkMode } = useTheme();

  // Dummy data for demonstration
  const [vendors, setVendors] = useState([
    { id: 1, name: 'Acme Corp', email: 'contact@acme.com', phone: '123-456-7890', status: 'Active' },
    { id: 2, name: 'Globex Corporation', email: 'info@globex.com', phone: '987-654-3210', status: 'Inactive' },
    { id: 3, name: 'Soylent Corp', email: 'hello@soylent.com', phone: '456-789-0123', status: 'Active' },
    { id: 4, name: 'Initech', email: 'support@initech.com', phone: '789-012-3456', status: 'Active' },
    { id: 5, name: 'Umbrella Corporation', email: 'info@umbrella.com', phone: '321-654-0987', status: 'Inactive' },
  ]);

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('');

  const handleAction = (vendor, action) => {
    setSelectedVendor(vendor);
    setModalMode(action);
    setIsModalOpen(true);
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg overflow-hidden`}>
      <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
        <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
          <tr>
            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Name</th>
            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Email</th>
            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Phone</th>
            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
          </tr>
        </thead>
        <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {vendors.map((vendor) => (
            <tr key={vendor.id}>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{vendor.name}</td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{vendor.email}</td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{vendor.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  vendor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {vendor.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Button
                  variant="icon"
                  onClick={() => handleAction(vendor, 'view')}
                  aria-label="View"
                  className="text-blue-600 hover:text-blue-900 mr-2"
                >
                  <EyeIcon className="h-5 w-5" />
                </Button>
                <Button
                  variant="icon"
                  onClick={() => handleAction(vendor, 'edit')}
                  aria-label="Edit"
                  className="text-yellow-600 hover:text-yellow-900 mr-2"
                >
                  <PencilIcon className="h-5 w-5" />
                </Button>
                <Button
                  variant="icon"
                  onClick={() => handleAction(vendor, 'delete')}
                  aria-label="Delete"
                  className="text-red-600 hover:text-red-900"
                >
                  <TrashIcon className="h-5 w-5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'view' ? 'View Vendor' : modalMode === 'edit' ? 'Edit Vendor' : 'Delete Vendor'}
      >
        {modalMode === 'view' && (
          <div className="grid grid-cols-2 gap-4">
            <p><strong>Name:</strong> {selectedVendor?.name}</p>
            <p><strong>Email:</strong> {selectedVendor?.email}</p>
            <p><strong>Phone:</strong> {selectedVendor?.phone}</p>
            <p><strong>Status:</strong> {selectedVendor?.status}</p>
          </div>
        )}
        {modalMode === 'edit' && (
          <VendorForm
            initialData={selectedVendor}
            onSubmit={(updatedVendor) => {
              onEdit(updatedVendor);
              setIsModalOpen(false);
            }}
            onClose={() => setIsModalOpen(false)}
          />
        )}
        {modalMode === 'delete' && (
          <div>
            <p className="mb-4">Are you sure you want to delete this vendor?</p>
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button
                variant="danger"
                onClick={() => {
                  onDelete(selectedVendor.id);
                  setIsModalOpen(false);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VendorList;