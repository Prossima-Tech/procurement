import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { baseURL } from '../../utils/endpoint';

const CreateInvoiceModal = ({ isOpen, onClose, grnData }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inspectionData, setInspectionData] = useState(null);
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    items: []
  });

  useEffect(() => {
    if (isOpen && grnData?._id) {
      fetchInspectionData();
    }
  }, [isOpen, grnData]);

  const fetchInspectionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${baseURL}/grn/inspection/${grnData._id}`);
      setInspectionData(response.data);
      
      // Merge inspection data with GRN items data
      const initialItems = grnData.items.map(grnItem => {
        // Find corresponding inspection item
        const inspectionItem = response.data.items.find(
          item => item.partCode === grnItem.partCode
        );

        return {
          partCode: grnItem.partCode,
          itemName: grnItem.itemName || grnItem.itemDetails?.itemName,
          approvedQuantity: inspectionItem ? 
            (inspectionItem.inspectedQuantity - inspectionItem.rejectedQuantity) : 0,
          unitPrice: grnItem.unitPrice,
          totalPrice: (inspectionItem ? 
            (inspectionItem.inspectedQuantity - inspectionItem.rejectedQuantity) : 0) * grnItem.unitPrice
        };
      });
      
      setInvoiceData(prev => ({
        ...prev,
        items: initialItems
      }));
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch inspection data');
      console.error('Inspection fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = () => {
    const invoicePayload = {
      grnId: grnData._id,
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceDate: invoiceData.invoiceDate,
      items: invoiceData.items,
      totalAmount: invoiceData.items.reduce((sum, item) => sum + item.totalPrice, 0),
      status: 'pending'
    };

    console.log('Invoice Payload:', invoicePayload);
    // TODO: Implement API call to create invoice
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Create Invoice for GRN: {grnData.grnNumber}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-2 text-red-500 py-4">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) => setInvoiceData(prev => ({
                      ...prev,
                      invoiceNumber: e.target.value
                    }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={invoiceData.invoiceDate}
                    onChange={(e) => setInvoiceData(prev => ({
                      ...prev,
                      invoiceDate: e.target.value
                    }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="text-lg font-medium mb-3">Invoice Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Part Code</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Item Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Approved Qty</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Unit Price</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Total Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invoiceData.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">{item.partCode}</td>
                          <td className="px-4 py-3">{item.itemName}</td>
                          <td className="px-4 py-3">{item.approvedQuantity}</td>
                          <td className="px-4 py-3">₹{item.unitPrice?.toFixed(2)}</td>
                          <td className="px-4 py-3">₹{item.totalPrice?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Amount */}
              <div className="flex justify-end">
                <div className="bg-gray-50 px-4 py-3 rounded-md">
                  <span className="font-medium">Total Amount: </span>
                  <span className="text-lg font-semibold">
                    ₹{invoiceData.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateInvoice}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={loading || !invoiceData.invoiceNumber}
          >
            Create Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;
