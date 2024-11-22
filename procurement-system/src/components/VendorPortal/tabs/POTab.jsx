import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  AlertCircle, 
  Clock, 
  Package, 
  CheckCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { baseURL } from '../../../utils/endpoint';

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    created: { color: 'yellow', icon: Clock },
    accepted: { color: 'green', icon: CheckCircle },
    completed: { color: 'blue', icon: Package },
    cancelled: { color: 'red', icon: AlertCircle }
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig.created;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
      bg-${config.color}-100 text-${config.color}-800`}>
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const POViewModal = ({ isOpen, onClose, po }) => {
  if (!isOpen || !po) return null;

  // Calculate total amount
  const totalAmount = po.items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Purchase Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-4">
          {/* PO Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold mb-2">PO Information</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">PO Number:</span> {po.poCode}</p>
                <p><span className="text-gray-600">PO Date:</span> {format(new Date(po.poDate), 'dd MMM yyyy')}</p>
                <p><span className="text-gray-600">Valid Until:</span> {format(new Date(po.validUpto), 'dd MMM yyyy')}</p>
                <p><span className="text-gray-600">Delivery Date:</span> {format(new Date(po.deliveryDate), 'dd MMM yyyy')}</p>
                <p><span className="text-gray-600">Status:</span> 
                  <StatusBadge status={po.status} />
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Delivery Information</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Dispatch Through:</span> {po.dispatchThrough || 'Not specified'}</p>
                <p><span className="text-gray-600">Destination:</span> {po.destination || 'Not specified'}</p>
                <p><span className="text-gray-600">Terms of Delivery:</span> {po.deliveryTerms || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Part Code</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Quantity</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Unit Price</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {po.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{item.partCode}</td>
                      <td className="px-4 py-2">{item.quantity}</td>
                      <td className="px-4 py-2">₹{item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-2">₹{item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan="3" className="px-4 py-2 text-right">Total Amount:</td>
                    <td className="px-4 py-2">₹{totalAmount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Payment Terms</h3>
              <p className="text-sm">{po.paymentTerms || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm">{po.poNarration || 'No additional notes'}</p>
            </div>
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

const PurchaseOrdersTab = ({ vendorDetails }) => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPO, setSelectedPO] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    if (vendorDetails?._id) {
      fetchPurchaseOrders();
    }
  }, [vendorDetails]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${baseURL}/vendors/purchase-orders/${vendorDetails._id}`);
      setPurchaseOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch purchase orders');
      console.error('Purchase Orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPO = (po) => {
    setSelectedPO(po);
    setIsViewModalOpen(true);
  };

  const handleAcceptPO = async (poId) => {
    try {
      await axios.put(`${baseURL}/purchase-orders/${poId}/accept`);
      fetchPurchaseOrders(); // Refresh the list
    } catch (err) {
      console.error('Error accepting PO:', err);
      // You might want to show an error notification here
    }
  };

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = 
      po.poCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Active Purchase Orders</h2>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search POs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="created">Created</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="p-4">
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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">PO Number</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Delivery Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPOs.map((po) => (
                  <tr key={po._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{po.poCode}</td>
                    <td className="px-4 py-3">{format(new Date(po.poDate), 'dd MMM yyyy')}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={po.status} />
                    </td>
                    <td className="px-4 py-3">{format(new Date(po.deliveryDate), 'dd MMM yyyy')}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewPO(po)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPOs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No purchase orders found matching your criteria
              </div>
            )}
          </div>
        )}
      </div>

      <POViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        po={selectedPO}
      />
    </div>
  );
};

export default PurchaseOrdersTab;