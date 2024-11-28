import React from 'react';
import { format } from 'date-fns';
import StatusBadge from '../../utils/StatusBadge';

const POViewModal = ({ isOpen, onClose, po, handleAcceptPO }) => {
  if (!isOpen || !po) return null;

  // Calculate total amount
  const totalAmount = po.items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Purchase Order Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-4">
          {/* PO Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* ... rest of the modal content remains the same ... */}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-2">
          {po.status === 'created' && (
            <button
              onClick={() => {
                handleAcceptPO(po._id);
                onClose();
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Accept PO
            </button>
          )}
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

export default POViewModal;