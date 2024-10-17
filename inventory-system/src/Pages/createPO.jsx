import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreatePO = () => {
  const [formData, setFormData] = useState({
    vendorCode: '',
    vendorName: '',
    vendorAddress: '',
    gstNo: '',
    unitCode: '',
    unitName: '',
    purchaseIndentNo: '',
    purchaseIndentDate: '',
    poNo: '',
    poDate: '',
    validUpTo: '',
    projectId: '',
    unitName: '',
    paymentTerms: '',
    invoiceTo: {
      name: '',
      branchName: '',
      address: '',
      city: '',
      state: '',
      pin: ''
    },
    dispatchTo: {
      name: '',
      branchName: '',
      address: '',
      city: '',
      state: '',
      pin: ''
    },
    items: [],
    supplierRef: '',
    otherRef: '',
    dispatchThrough: '',
    destination: '',
    deliveryDate: '',
    poNarration: ''
  });

  const [vendors, setVendors] = useState([]);
  const [units, setUnits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [partCodes, setPartCodes] = useState([]);

  useEffect(() => {
    // Fetch vendors, units, projects, and part codes from your API
    // Update the respective state variables
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleNestedInputChange = (e, section) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [name]: value
      }
    }));
  };

  const handleVendorSelect = async (vendorCode) => {
    // Fetch vendor details and update form
  };

  const handleUnitSelect = async (unitCode) => {
    // Fetch unit details and update form
  };

  const handleAddItem = () => {
    setFormData(prevData => ({
      ...prevData,
      items: [...prevData.items, { partCode: '', quantity: '', unitPrice: '', totalPrice: '' }]
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prevData => ({
      ...prevData,
      items: prevData.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Submit the form data to your API
  };

  // Vendor Section Component
  const VendorSection = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-700">Supplier/Vendor</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Vendor Code</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              name="vendorCode"
              value={formData.vendorCode}
              onChange={handleInputChange}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
            />
            <button
              type="button"
              onClick={() => handleVendorSelect(formData.vendorCode)}
              className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm"
            >
              Search
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Vendor Name</label>
          <input
            type="text"
            name="vendorName"
            value={formData.vendorName}
            readOnly
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Vendor Address</label>
          <textarea
            name="vendorAddress"
            value={formData.vendorAddress}
            readOnly
            rows="3"
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">GST No</label>
          <input
            type="text"
            name="gstNo"
            value={formData.gstNo}
            readOnly
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm"
          />
        </div>
      </div>
    </div>
  );

  // Purchase Indent Section Component
  const PurchaseIndentSection = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-700">PO Against Purchase Indent</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Unit Code</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              name="unitCode"
              value={formData.unitCode}
              onChange={handleInputChange}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
            />
            <button
              type="button"
              onClick={() => handleUnitSelect(formData.unitCode)}
              className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm"
            >
              Search
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Unit Name</label>
          <input
            type="text"
            name="unitName"
            value={formData.unitName}
            readOnly
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Purchase Indent No</label>
          <select
            name="purchaseIndentNo"
            value={formData.purchaseIndentNo}
            onChange={handleInputChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Select Purchase Indent</option>
            {/* Add options for purchase indent numbers */}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Purchase Indent Date</label>
          <input
            type="date"
            name="purchaseIndentDate"
            value={formData.purchaseIndentDate}
            readOnly
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm"
          />
        </div>
      </div>
    </div>
  );

  // PO Detail Section Component
  const PODetailSection = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-700">PO Detail</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">PO No</label>
          <input
            type="text"
            name="poNo"
            value={formData.poNo}
            readOnly
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">PO Date</label>
          <input
            type="date"
            name="poDate"
            value={formData.poDate}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Valid Up To</label>
          <input
            type="date"
            name="validUpTo"
            value={formData.validUpTo}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Project ID</label>
          <select
            name="projectId"
            value={formData.projectId}
            onChange={handleInputChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Select Project</option>
            {projects.map(project => (
              <option key={project._id} value={project._id}>{project.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
          <input
            type="text"
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );

  // Address Section Component
  const AddressSection = ({ title, addressType }) => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData[addressType].name}
            onChange={(e) => handleNestedInputChange(e, addressType)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Branch Name</label>
          <input
            type="text"
            name="branchName"
            value={formData[addressType].branchName}
            onChange={(e) => handleNestedInputChange(e, addressType)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            name="address"
            value={formData[addressType].address}
            onChange={(e) => handleNestedInputChange(e, addressType)}
            rows="3"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            name="city"
            value={formData[addressType].city}
            onChange={(e) => handleNestedInputChange(e, addressType)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">State</label>
          <input
            type="text"
            name="state"
            value={formData[addressType].state}
            onChange={(e) => handleNestedInputChange(e, addressType)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">PIN</label>
          <input
            type="text"
            name="pin"
            value={formData[addressType].pin}
            onChange={(e) => handleNestedInputChange(e, addressType)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );

  // Items Section Component
  const ItemsSection = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-700">Items</h3>
      {formData.items.map((item, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-md">
          <div>
            <label className="block text-sm font-medium text-gray-700">Part Code</label>
            <select
              value={item.partCode}
              onChange={(e) => handleItemChange(index, 'partCode', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Select Part Code</option>
              {partCodes.map(code => (
                <option key={code._id} value={code._id}>{code.PartCodeNumber}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit Price</label>
            <input
              type="number"
              value={item.unitPrice}
              onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Price</label>
            <input
              type="number"
              value={item.totalPrice}
              readOnly
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddItem}
        className="mt-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Add Item
      </button>
    </div>
  );

  // Additional Details Section Component
  const AdditionalDetailsSection = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-700">Additional Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Supplier's Ref</label>
          <input
            type="text"
            name="supplierRef"
            value={formData.supplierRef}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Other's Ref</label>
          <input
            type="text"
            name="otherRef"
            value={formData.otherRef}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Dispatch Through</label>
          <input
            type="text"
            name="dispatchThrough"
            value={formData.dispatchThrough}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Destination</label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Delivery Date</label>
          <input
            type="date"
            name="deliveryDate"
            value={formData.deliveryDate}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">PO Narration</label>
          <textarea
            name="poNarration"
            value={formData.poNarration}
            onChange={handleInputChange}
            rows="3"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">PO Generation</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 space-y-6">
            <VendorSection />
            <PurchaseIndentSection />
            <PODetailSection />
            <AddressSection title="Invoice To" addressType="invoiceTo" />
            <AddressSection title="Dispatch To" addressType="dispatchTo" />
            <ItemsSection />
            <AdditionalDetailsSection />
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Create Purchase Order
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePO;
