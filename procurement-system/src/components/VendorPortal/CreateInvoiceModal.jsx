/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { baseURL } from '../../utils/endpoint';

const CreateInvoiceModal = ({ isOpen, onClose, grnData }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inspectionData, setInspectionData] = useState(null);
  const [selectedTaxType, setSelectedTaxType] = useState('sgst');
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    items: [],
    subTotal: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    utgstAmount: 0,
    igstAmount: 0,
    totalAmount: 0,
    taxType: 'sgst'
  });

  useEffect(() => {
    if (isOpen && grnData?._id) {
      fetchInspectionData();
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: generateInvoiceNumber()
      }));
    }
  }, [isOpen, grnData]);

  const calculateItemTotals = (item, taxType) => {
    const baseAmount = item.acceptedQuantity * item.unitPrice;

    // If IGST, only apply IGST
    if (taxType === 'igst') {
      const igstAmount = (baseAmount * item.igstRate) / 100;
      return {
        ...item,
        baseAmount,
        cgstAmount: 0,
        sgstAmount: 0,
        utgstAmount: 0,
        igstAmount,
        totalAmount: baseAmount + igstAmount
      };
    }

    // For SGST/UTGST, apply CGST + selected tax
    const cgstAmount = (baseAmount * item.cgstRate) / 100;
    const secondaryTaxAmount = (baseAmount * (taxType === 'sgst' ? item.sgstRate : item.utgstRate)) / 100;

    return {
      ...item,
      baseAmount,
      cgstAmount,
      sgstAmount: taxType === 'sgst' ? secondaryTaxAmount : 0,
      utgstAmount: taxType === 'utgst' ? secondaryTaxAmount : 0,
      igstAmount: 0,
      totalAmount: baseAmount + cgstAmount + secondaryTaxAmount
    };
  };

  const handleTaxTypeChange = (type) => {
    setSelectedTaxType(type);

    const recalculatedItems = invoiceData.items.map(item => calculateItemTotals(item, type));

    const newTotals = recalculatedItems.reduce((acc, item) => ({
      subTotal: acc.subTotal + item.baseAmount,
      cgstAmount: acc.cgstAmount + item.cgstAmount,
      sgstAmount: acc.sgstAmount + item.sgstAmount,
      utgstAmount: acc.utgstAmount + item.utgstAmount,
      igstAmount: acc.igstAmount + item.igstAmount,
      totalAmount: acc.totalAmount + item.totalAmount
    }), {
      subTotal: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      utgstAmount: 0,
      igstAmount: 0,
      totalAmount: 0
    });

    setInvoiceData(prev => ({
      ...prev,
      items: recalculatedItems,
      ...newTotals,
      taxType: type
    }));
  };

  const fetchInspectionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${baseURL}/grn/inspection/${grnData._id}`);
      setInspectionData(response.data);

      const processedItems = response.data.data.items.map(item =>
        calculateItemTotals(item, selectedTaxType)
      );

      const totals = processedItems.reduce((acc, item) => ({
        subTotal: acc.subTotal + item.baseAmount,
        cgstAmount: acc.cgstAmount + item.cgstAmount,
        sgstAmount: acc.sgstAmount + item.sgstAmount,
        utgstAmount: acc.utgstAmount + item.utgstAmount,
        igstAmount: acc.igstAmount + item.igstAmount,
        totalAmount: acc.totalAmount + item.totalAmount
      }), {
        subTotal: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        utgstAmount: 0,
        igstAmount: 0,
        totalAmount: 0
      });

      setInvoiceData(prev => ({
        ...prev,
        items: processedItems,
        ...totals
      }));

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch inspection data');
      console.error('Inspection fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const invoicePayload = {
        grnId: grnData._id,
        invoiceNumber: invoiceData.invoiceNumber,
        invoiceDate: invoiceData.invoiceDate,
        items: invoiceData.items,
        taxType: selectedTaxType,
        subTotal: invoiceData.subTotal,
        cgstAmount: invoiceData.cgstAmount,
        sgstAmount: invoiceData.sgstAmount,
        utgstAmount: invoiceData.utgstAmount,
        igstAmount: invoiceData.igstAmount,
        totalAmount: invoiceData.totalAmount
      };

      const response = await axios.post(`${baseURL}/invoice/create`, invoicePayload);

      if (response.data.success) {
        // Show success message
        // Close modal
        onClose();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create invoice');
      console.error('Invoice creation error:', error);
    }
  };

  const generateInvoiceNumber = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const vendorCode = grnData?.vendor?.id?.toString().slice(-4) || '0000';
    const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    return `INV-${year}${month}-${vendorCode}-${randomDigits}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
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
              {/* Invoice Details with Tax Type Selection */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Number
                    <button
                      onClick={() => setInvoiceData(prev => ({
                        ...prev,
                        invoiceNumber: generateInvoiceNumber()
                      }))}
                      className="ml-2 text-xs text-blue-600 hover:text-blue-700"
                      type="button"
                    >
                      Regenerate
                    </button>
                  </label>
                  <input
                    type="text"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) => setInvoiceData(prev => ({
                      ...prev,
                      invoiceNumber: e.target.value
                    }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter Invoice Number"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Type
                  </label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        name="taxType"
                        value="igst"
                        checked={selectedTaxType === 'igst'}
                        onChange={() => handleTaxTypeChange('igst')}
                      />
                      <span className="ml-2">IGST</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        name="taxType"
                        value="sgst"
                        checked={selectedTaxType === 'sgst'}
                        onChange={() => handleTaxTypeChange('sgst')}
                      />
                      <span className="ml-2">CGST + SGST</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        name="taxType"
                        value="utgst"
                        checked={selectedTaxType === 'utgst'}
                        onChange={() => handleTaxTypeChange('utgst')}
                      />
                      <span className="ml-2">CGST + UTGST</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Updated Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Part Code</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Item Name</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">HSN/SAC</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">UOM</th>
                      <th className="px-3 py-2 text-right text-sm font-medium text-gray-600">Qty</th>
                      <th className="px-3 py-2 text-right text-sm font-medium text-gray-600">Rate</th>
                      <th className="px-3 py-2 text-right text-sm font-medium text-gray-600">Amount</th>
                      {selectedTaxType === 'igst' ? (
                        <th className="px-3 py-2 text-right text-sm font-medium text-gray-600">IGST</th>
                      ) : (
                        <>
                          <th className="px-3 py-2 text-right text-sm font-medium text-gray-600">CGST</th>
                          <th className="px-3 py-2 text-right text-sm font-medium text-gray-600">
                            {selectedTaxType.toUpperCase()}
                          </th>
                        </>
                      )}
                      <th className="px-3 py-2 text-right text-sm font-medium text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoiceData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2">{item.partCode}</td>
                        <td className="px-3 py-2">{item.itemName}</td>
                        <td className="px-3 py-2">{item.sacHsnCode}</td>
                        <td className="px-3 py-2">{item.uom}</td>
                        <td className="px-3 py-2 text-right">{item.acceptedQuantity}</td>
                        <td className="px-3 py-2 text-right">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">₹{item.baseAmount.toFixed(2)}</td>
                        {selectedTaxType === 'igst' ? (
                          <td className="px-3 py-2 text-right">
                            {item.igstRate}% (₹{item.igstAmount.toFixed(2)})
                          </td>
                        ) : (
                          <>
                            <td className="px-3 py-2 text-right">
                              {item.cgstRate}% (₹{item.cgstAmount.toFixed(2)})
                            </td>
                            <td className="px-3 py-2 text-right">
                              {selectedTaxType === 'sgst' ? item.sgstRate : item.utgstRate}%
                              (₹{(selectedTaxType === 'sgst' ? item.sgstAmount : item.utgstAmount).toFixed(2)})
                            </td>
                          </>
                        )}
                        <td className="px-3 py-2 text-right">₹{item.totalAmount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Section */}
              <div className="flex justify-end">
                <div className="w-72 space-y-2">
                  <div className="flex justify-between">
                    <span>Sub Total:</span>
                    <span>₹{invoiceData.subTotal.toFixed(2)}</span>
                  </div>
                  {selectedTaxType === 'igst' ? (
                    <div className="flex justify-between">
                      <span>IGST:</span>
                      <span>₹{invoiceData.igstAmount.toFixed(2)}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>CGST:</span>
                        <span>₹{invoiceData.cgstAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{selectedTaxType.toUpperCase()}:</span>
                        <span>
                          ₹{(selectedTaxType === 'sgst' ? invoiceData.sgstAmount : invoiceData.utgstAmount).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total Amount:</span>
                    <span>₹{invoiceData.totalAmount.toFixed(2)}</span>
                  </div>
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
