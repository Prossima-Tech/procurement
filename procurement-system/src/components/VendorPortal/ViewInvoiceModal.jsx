/* eslint-disable react/prop-types */
import React from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
// /import { numberToWords } from '../../utils/helpers';

const ViewInvoiceModal = ({ isOpen, onClose, invoiceData,vendorDetails }) => {
  if (!isOpen || !invoiceData) return null;

  const formatAddress = (address) => {
    return `${address.line1}, ${address.line2}, ${address.city}, ${address.state} - ${address.pinCode}`;
  };

  const numberToWords = (number) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    const convertLessThanThousand = (num) => {
      if (num === 0) return '';
      
      let result = '';
      
      if (num >= 100) {
        result += ones[Math.floor(num / 100)] + ' Hundred ';
        num %= 100;
        if (num > 0) result += 'and ';
      }
      
      if (num >= 20) {
        result += tens[Math.floor(num / 10)] + ' ';
        num %= 10;
        if (num > 0) result += ones[num] + ' ';
      } else if (num >= 10) {
        result += teens[num - 10] + ' ';
      } else if (num > 0) {
        result += ones[num] + ' ';
      }
      
      return result;
    };
    
    if (number === 0) return 'Zero';
    
    const num = Math.abs(Math.round(number));
    let result = '';
    
    if (num >= 10000000) {
      result += convertLessThanThousand(Math.floor(num / 10000000)) + 'Crore ';
      number %= 10000000;
    }
    
    if (num >= 100000) {
      result += convertLessThanThousand(Math.floor(num / 100000)) + 'Lakh ';
      number %= 100000;
    }
    
    if (num >= 1000) {
      result += convertLessThanThousand(Math.floor(num / 1000)) + 'Thousand ';
      number %= 1000;
    }
    
    result += convertLessThanThousand(number);
    
    return result.trim();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Vendor Header */}
        <div className="bg-gray-100 px-6 py-4 border-b">
          <h1 className="text-2xl font-bold text-center">{invoiceData.vendorId?.name}</h1>
          <p className="text-center mt-2">{formatAddress(vendorDetails?.address)}</p>
        </div>

        {/* Three Column Information */}
        <div className="grid grid-cols-3 gap-4 p-6 border-b">
          {/* Bill To Details */}
          <div className="border p-4">
            <h3 className="font-bold mb-2">Bill To:</h3>
            <p>{invoiceData.poId?.invoiceTo?.name}</p>
            <p>{invoiceData.poId?.invoiceTo?.address}</p>
            <p>{invoiceData.poId?.invoiceTo?.city}, {invoiceData.poId?.invoiceTo?.state}</p>
            <p>{invoiceData.poId?.invoiceTo?.pin}</p>
          </div>

          {/* Dispatch To Details */}
          <div className="border p-4">
            <h3 className="font-bold mb-2">Dispatch To:</h3>
            <p>{invoiceData.poId?.dispatchTo?.name}</p>
            <p>{invoiceData.poId?.dispatchTo?.address}</p>
            <p>{invoiceData.poId?.dispatchTo?.city}, {invoiceData.poId?.dispatchTo?.state}</p>
            <p>{invoiceData.poId?.dispatchTo?.pin}</p>
          </div>

          {/* Invoice Details */}
          <div className="border p-4">
            <table className="w-full">
              <tbody>
                <tr><td className="font-bold">Invoice No:</td><td>{invoiceData.invoiceNumber}</td></tr>
                <tr><td className="font-bold">Date:</td><td>{format(new Date(), 'dd MMM yyyy')}</td></tr>
                <tr><td className="font-bold">Place of Supply:</td><td>{invoiceData.poId?.destination}</td></tr>
                <tr><td className="font-bold">PO Date:</td><td>{format(new Date(invoiceData.poId?.poDate), 'dd MMM yyyy')}</td></tr>
                <tr><td className="font-bold">PO Number:</td><td>{invoiceData.poId?.poCode}</td></tr>
              </tbody>
            </table>
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

        {/* Tax and Total Calculations */}
        <div className="grid grid-cols-2 gap-4 px-6 py-4">
          {/* Tax Breakdown */}
          <div className="border p-4">
            <h3 className="font-bold mb-2">Tax Details</h3>
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-4 py-2 text-left">Tax Type</th>
                  <th className="border px-4 py-2 text-right">Rate</th>
                  <th className="border px-4 py-2 text-right">Taxable Amount</th>
                  <th className="border px-4 py-2 text-right">Tax Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.taxType === 'igst' ? (
                  // Group by IGST rates
                  Object.values(invoiceData.items.reduce((acc, item) => {
                    const rate = item.igstRate;
                    if (!acc[rate]) {
                      acc[rate] = {
                        rate,
                        taxableAmount: 0,
                        taxAmount: 0
                      };
                    }
                    acc[rate].taxableAmount += item.baseAmount;
                    acc[rate].taxAmount += item.igstAmount;
                    return acc;
                  }, {})).map((group, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2">IGST</td>
                      <td className="border px-4 py-2 text-right">{group.rate}%</td>
                      <td className="border px-4 py-2 text-right">₹{group.taxableAmount.toFixed(2)}</td>
                      <td className="border px-4 py-2 text-right">₹{group.taxAmount.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  // Group by CGST/SGST rates
                  <>
                    {Object.values(invoiceData.items.reduce((acc, item) => {
                      const key = `${item.cgstRate}-${item.sgstRate}`;
                      if (!acc[key]) {
                        acc[key] = {
                          cgstRate: item.cgstRate,
                          sgstRate: item.sgstRate,
                          taxableAmount: 0,
                          cgstAmount: 0,
                          sgstAmount: 0
                        };
                      }
                      acc[key].taxableAmount += item.baseAmount;
                      acc[key].cgstAmount += item.cgstAmount;
                      acc[key].sgstAmount += item.sgstAmount;
                      return acc;
                    }, {})).map((group, index) => (
                      <React.Fragment key={index}>
                        <tr>
                          <td className="border px-4 py-2">CGST</td>
                          <td className="border px-4 py-2 text-right">{group.cgstRate}%</td>
                          <td className="border px-4 py-2 text-right">₹{group.taxableAmount.toFixed(2)}</td>
                          <td className="border px-4 py-2 text-right">₹{group.cgstAmount.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td className="border px-4 py-2">SGST</td>
                          <td className="border px-4 py-2 text-right">{group.sgstRate}%</td>
                          <td className="border px-4 py-2 text-right">₹{group.taxableAmount.toFixed(2)}</td>
                          <td className="border px-4 py-2 text-right">₹{group.sgstAmount.toFixed(2)}</td>
                        </tr>
                      </React.Fragment>
                    ))}
                    <tr className="font-bold bg-gray-50">
                      <td className="border px-4 py-2" colSpan="2">Total</td>
                      <td className="border px-4 py-2 text-right">₹{invoiceData.subTotal.toFixed(2)}</td>
                      <td className="border px-4 py-2 text-right">
                        ₹{(invoiceData.cgstAmount + invoiceData.sgstAmount).toFixed(2)}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Total Calculations */}
          <div className="border p-4">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="font-bold">Sub Total:</td>
                  <td className="text-right">₹{invoiceData.subTotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="font-bold">Total Tax:</td>
                  <td className="text-right">₹{(invoiceData.cgstAmount + invoiceData.sgstAmount).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="font-bold">Round Off:</td>
                  <td className="text-right">₹{(Math.round(invoiceData.totalAmount) - invoiceData.totalAmount).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="font-bold">Final Amount:</td>
                  <td className="text-right">₹{Math.round(invoiceData.totalAmount).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="font-bold">Received Amount:</td>
                  <td className="text-right">₹0.00</td>
                </tr>
                <tr className="font-bold">
                  <td>Balance:</td>
                  <td className="text-right">₹{Math.round(invoiceData.totalAmount).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Amount in Words */}
        <div className="px-6 py-4 border-t">
          <p className="font-bold">Amount in Words:</p>
          <p>{numberToWords(Math.round(invoiceData.totalAmount))} Rupees Only</p>
        </div>

        {/* Terms and Conditions */}
        <div className="px-6 py-4 border-t">
          <h3 className="font-bold mb-2">Terms and Conditions:</h3>
          <p>{invoiceData.poId?.paymentTerms}</p>
          <p>{invoiceData.poId?.deliveryTerms}</p>
        </div>

        {/* Bank Details */}
        <div className="px-6 py-4 border-t">
          <h3 className="font-bold mb-2">Bank Details:</h3>
          <table className="w-full max-w-md">
            <tbody>
              <tr><td className="font-bold">Bank Name:</td><td>{invoiceData.vendorId?.bankDetails?.name}</td></tr>
              <tr><td className="font-bold">Branch:</td><td>{invoiceData.vendorId?.bankDetails?.branchName}</td></tr>
              <tr><td className="font-bold">Account No:</td><td>{invoiceData.vendorId?.bankDetails?.accountNumber}</td></tr>
              <tr><td className="font-bold">IFSC Code:</td><td>{invoiceData.vendorId?.bankDetails?.ifscCode}</td></tr>
            </tbody>
          </table>
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