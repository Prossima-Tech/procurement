import React from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';

const ViewInvoiceModal = ({ isOpen, onClose, invoiceData }) => {
  if (!isOpen || !invoiceData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[80%] max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">Invoice Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-4">
          {/* Invoice Header Information */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Invoice Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Invoice Number:</span> {invoiceData.invoiceNumber}</p>
                <p><span className="font-medium">Invoice Date:</span> {format(new Date(invoiceData.invoiceDate), 'dd MMM yyyy')}</p>
                <p><span className="font-medium">GRN Number:</span> {invoiceData.grnId?.grnNumber}</p>
                <p><span className="font-medium">PO Number:</span> {invoiceData.poId?.poCode}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Vendor Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Vendor Name:</span> {invoiceData.vendorId?.name}</p>
                <p><span className="font-medium">GSTIN:</span> {invoiceData.vendorId?.gstNumber}</p>
                <p><span className="font-medium">Contact:</span> {invoiceData.vendorId?.contactNumber}</p>
                <p><span className="font-medium">Email:</span> {invoiceData.vendorId?.email}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Invoice Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Part Code</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Item Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">HSN/SAC</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Qty</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Unit Price</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Base Amount</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Tax Amount</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoiceData.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{item.itemDetails.partCode}</td>
                      <td className="px-4 py-2">{item.itemDetails.itemName}</td>
                      <td className="px-4 py-2">{item.itemDetails.sacHsnCode}</td>
                      <td className="px-4 py-2 text-right">{item.acceptedQuantity}</td>
                      <td className="px-4 py-2 text-right">₹{item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">₹{item.baseAmount.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">
                        {invoiceData.taxType === 'igst' 
                          ? `₹${item.igstAmount.toFixed(2)} (${item.igstRate}%)`
                          : `₹${(item.cgstAmount + item.sgstAmount).toFixed(2)} (${item.cgstRate + item.sgstRate}%)`
                        }
                      </td>
                      <td className="px-4 py-2 text-right">₹{item.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Section */}
          <div className="mt-6 flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Sub Total:</span>
                <span>₹{invoiceData.subTotal.toFixed(2)}</span>
              </div>
              
              {invoiceData.taxType === 'igst' ? (
                <div className="flex justify-between">
                  <span className="font-medium">IGST:</span>
                  <span>₹{invoiceData.igstAmount.toFixed(2)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium">CGST:</span>
                    <span>₹{invoiceData.cgstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">SGST:</span>
                    <span>₹{invoiceData.sgstAmount.toFixed(2)}</span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between pt-2 border-t font-semibold">
                <span>Total Amount:</span>
                <span>₹{invoiceData.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewInvoiceModal; 