import React from "react";
import { format } from "date-fns";

const POViewModal = ({ isOpen, onClose, po, handleAcceptPO }) => {
  // if (!po) return null;
  if (!isOpen || !po) return null;
  const totalAmount = po.items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">Purchase Order Details</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6">
          <div className="border border-black p-4 rounded-lg">
            {/* Header Section */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold">KING SECURITY GUARDS SERVICES (P) LTD.</h1>
                <p>378, VISHWASH KHAND, GOMTI NAGAR, LUCKNOW, UTTAR PRADESH, 226010</p>
                <p>Phone: 05224044139</p>
                <p>Email: corporate@kingsecguard.com</p>
              </div>
            </div>

            {/* Purchase Order Title with lines */}
            <div className="my-4">
              <hr className="border-t border-black"/>
              <h2 className="text-lg font-bold text-center my-2">PURCHASE ORDER</h2>
              <hr className="border-t border-black"/>
            </div>

            {/* Invoice & Dispatch Details */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* Left Section */}
              <div>
                <p><strong>Invoice To:</strong></p>
                <hr className="border-t border-black my-1 w-1/2"/>
                <p>{po.invoiceTo.name}</p>
                <p>{po.invoiceTo.branchName}</p>
                <p>{po.invoiceTo.address}</p>
                <p>{`${po.invoiceTo.city}, ${po.invoiceTo.state}, ${po.invoiceTo.pin}`}</p>

                <p className="mt-4"><strong>Dispatch To:</strong></p>
                <hr className="border-t border-black my-1 w-1/2"/>
                <p>{po.dispatchTo.name}</p>
                <p>{po.dispatchTo.branchName}</p>
                <p>{po.dispatchTo.address}</p>
                <p>{`${po.dispatchTo.city}, ${po.dispatchTo.state}, ${po.dispatchTo.pin}`}</p>
              </div>

              {/* Right Section */}
              <div>
                <p><strong>Order No.:</strong> {po.poCode}</p>
                <p><strong>Order Date:</strong> {format(new Date(po.poDate), "dd MMM yyyy")}</p>
                <p><strong>GST No.:</strong> 99AABCD4071DZZP</p>
                <p><strong>Supplier Ref.:</strong> {po.supplierRef}</p>
                <p><strong>Other Ref.:</strong> {po.otherRef}</p>
                <p><strong>Destination:</strong> {po.destination}</p>
                <p><strong>Dispatch Through:</strong> {po.dispatchThrough}</p>
                <p><strong>Project ID:</strong> {po.projectId}</p>
                <p><strong>Unit Name:</strong> CORPORATE OFFICE-UP-G-NON BILLABLE</p>
                <p><strong>Terms of Payment:</strong> {po.paymentTerms}</p>
                <p><strong>Terms of Delivery:</strong> {po.deliveryTerms}</p>
                <p><strong>Date of Delivery:</strong> {format(new Date(po.deliveryDate), "dd MMM yyyy")}</p>
              </div>
            </div>

            {/* Updated Item Details section */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Item Details</h3>
              <table className="w-full border-collapse border border-black mt-2">
                <thead>
                  <tr>
                    <th className="border border-black p-2">S.No</th>
                    <th className="border border-black p-2">PART CODE</th>
                    <th className="border border-black p-2">QTY</th>
                    <th className="border border-black p-2">PENDING QTY</th>
                    <th className="border border-black p-2">DELIVERED QTY</th>
                    <th className="border border-black p-2">UNIT PRICE</th>
                    <th className="border border-black p-2">TOTAL PRICE</th>
                  </tr>
                </thead>
                <tbody>
                  {po.items.map((item, index) => (
                    <tr key={item._id}>
                      <td className="border border-black p-2 text-center">{index + 1}</td>
                      <td className="border border-black p-2">{item.partCode}</td>
                      <td className="border border-black p-2 text-right">{item.quantity}</td>
                      <td className="border border-black p-2 text-right">{item.pendingQuantity}</td>
                      <td className="border border-black p-2 text-right">{item.deliveredQuantity}</td>
                      <td className="border border-black p-2 text-right">₹{item.unitPrice.toFixed(2)}</td>
                      <td className="border border-black p-2 text-right">₹{item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="6" className="border border-black p-2 text-right font-bold">Total Amount:</td>
                    <td className="border border-black p-2 text-right font-bold">₹{totalAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Additional PO Details */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>PO Status:</strong> {po.status}</p>
                  <p><strong>Delivery Status:</strong> {po.deliveryStatus}</p>
                  <p><strong>Valid Until:</strong> {format(new Date(po.validUpto), "dd MMM yyyy")}</p>
                  <p><strong>PO Narration:</strong> {po.poNarration}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POViewModal  ;
