import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Eye, 
  AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { baseURL } from '../../../utils/endpoint';
import StatusBadge from '../../../utils/StatusBadge';
import POViewModal from '../POViewModal';

const POTab = ({ vendorDetails }) => {
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
    }
  };

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = po.poCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Active Purchase Orders</h2>
          </div>
          <div className="flex gap-3">
            {/* Search */}
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
            {/* Status Filter */}
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

        {/* Content */}
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
      </div>

      <POViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        po={selectedPO}
        handleAcceptPO={handleAcceptPO}
      />
    </>
  );
};

export default POTab;