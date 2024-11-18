import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Truck, 
  ClipboardCheck, 
  ShoppingCart, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  MapPin, 
  Wallet,
  Package,
  Search,
  Filter,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { baseURL } from '../../utils/endpoint';
import axios from 'axios';
import { format } from 'date-fns';
import VendorQuoteForm from '../orders/VendorQuoteForm';

// First, add the CustomCard component at the top of the file
const CustomCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
    {children}
  </div>
);

// Tab Components
const PurchaseOrdersTab = ({ poLoading, poError, purchaseOrders, handleViewPO }) => (
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
            className="pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>
    </div>
    <div className="p-4">
      {poLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : poError ? (
        <div className="flex items-center justify-center gap-2 text-red-500 py-4">
          <AlertCircle className="h-5 w-5" />
          <span>{poError}</span>
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
              {purchaseOrders.map((po) => (
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
        </div>
      )}
    </div>
  </div>
);

const RFQTab = ({ vendorDetails }) => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    if (vendorDetails?._id) {
      fetchVendorRfqs();
    }
  }, [vendorDetails]);

  const fetchVendorRfqs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/rfq/vendor/${vendorDetails._id}`);
      console.log("RFQs response:", response.data);
      setRfqs(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch RFQs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQuoteForm = (rfq) => {
    const vendorData = rfq.selectedVendors.find(v => v.vendor === vendorDetails._id);
    if (vendorData) {
      setSelectedRfq(rfq);
      setSelectedVendor(vendorData);
      setIsQuoteFormOpen(true);
    }
  };

  const handleCloseQuoteForm = () => {
    setIsQuoteFormOpen(false);
    setSelectedRfq(null);
    setSelectedVendor(null);
    fetchVendorRfqs(); // Refresh the list after submission
  };

  // Check if vendor has already submitted a quote
  const hasSubmittedQuote = (rfq) => {
    return rfq.vendorQuotes?.some(quote => quote.vendor === vendorDetails._id);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">RFQ & Quotations</h2>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search RFQs..."
              className="pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            Filter
          </button>
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">RFQ Number</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Items</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Deadline</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rfqs.map((rfq) => {
                  const isInvited = rfq.selectedVendors.some(v => v.vendor === vendorDetails._id);
                  const quoteSubmitted = hasSubmittedQuote(rfq);
                  
                  return (
                    <tr key={rfq._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{rfq.rfqNumber}</td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {rfq.items.map((item, index) => (
                            <div key={item._id} className="text-sm">
                              {item.name} ({item.quantity})
                              {item.itemCode && ` - ${item.itemCode}`}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={rfq.status} />
                      </td>
                      <td className="px-4 py-3">
                        {format(new Date(rfq.submissionDeadline), 'dd MMM yyyy')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewRfq(rfq)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          {isInvited && rfq.status === 'published' && !quoteSubmitted && (
                            <button
                              onClick={() => handleOpenQuoteForm(rfq)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                              <ClipboardCheck className="h-4 w-4" />
                              Submit Quote
                            </button>
                          )}
                          {quoteSubmitted && (
                            <span className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500">
                              <CheckCircle className="h-4 w-4" />
                              Quote Submitted
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isQuoteFormOpen && selectedRfq && selectedVendor && (
        <VendorQuoteForm
          isOpen={isQuoteFormOpen}
          onClose={handleCloseQuoteForm}
          rfq={selectedRfq}
          vendor={selectedVendor}
        />
      )}
    </div>
  );
};

const InvoicesTab = () => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-4 border-b">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold">Invoices</h2>
      </div>
    </div>
    {/* Rest of your Invoices content */}
  </div>
);

const DeliveriesTab = () => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-4 border-b">
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold">Deliveries</h2>
      </div>
    </div>
    {/* Rest of your Deliveries content */}
  </div>
);

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

// Main Component
const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('pos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendorDetails, setVendorDetails] = useState({
    name: 'Acme Corporation',
    vendorCode: 'V001',
    email: 'contact@acme.com',
    contactNumber: '+1 234-567-8900',
    mobileNumber: '+1 234-567-8901',
    contactPerson: 'John Doe',
    gstNumber: 'GST123456789',
    panNumber: 'PAN123456789',
    address: {
      line1: '123 Business Street',
      line2: 'Suite 456',
      city: 'Tech City',
      state: 'State',
      pinCode: '12345'
    },
    bankDetails: {
      name: 'Business Bank',
      branchName: 'Main Branch',
      accountNumber: '1234567890',
      ifscCode: 'IFSC0001234'
    }
  });
  const [showVendorDetails, setShowVendorDetails] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [poLoading, setPoLoading] = useState(false);
  const [poError, setPoError] = useState(null);
  const { user } = useAuth();
  const [selectedPO, setSelectedPO] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);


useEffect(() => {
    fetchVendorDetails();
}, [user]);

const fetchVendorDetails = async () => {
    try {
        setLoading(true);
        setError(null);

        // console.log("user.id",user.id);
        const response = await axios.get(
            `${baseURL}/vendors/getVendorByUserId/${user.id}`,
            // {
            //     headers: { 'Authorization': `Bearer ${getToken()}` }
            // }
        );
        setVendorDetails(response.data);
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch vendor details');
        console.error('Vendor details fetch error:', err);
    } finally {
        setLoading(false);
    }
};
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      if (activeTab === 'pos') {
        setPoLoading(true);
        setPoError(null);
        try {
        //   console.log("Vendor ID",vendorDetails);
          const response = await axios.get(`${baseURL}/vendors/purchase-orders/${vendorDetails._id}`);
        //   console.log("Purchase Orders",response.data);
          setPurchaseOrders(response.data);
        } catch (error) {
          setPoError(error.response?.data?.message || 'Failed to fetch purchase orders');
        } finally {
          setPoLoading(false);
        }
      }
    };

    fetchPurchaseOrders();
  }, [activeTab, vendorDetails.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  const statsCards = [
    { icon: ShoppingCart, title: 'Active POs', value: '12', color: 'text-blue-500' },
    { icon: ClipboardCheck, title: 'Pending RFQs', value: '5', color: 'text-green-500' },
    { icon: FileText, title: 'Pending Invoices', value: '3', color: 'text-yellow-500' },
    { icon: Truck, title: 'Deliveries Due', value: '7', color: 'text-purple-500' }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      created: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      // Add more status colors as needed
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const handleViewPO = (po) => {
    setSelectedPO(po);
    setIsViewModalOpen(true);
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
                  <p><span className="text-gray-600">PO Date:</span> {formatDate(po.poDate)}</p>
                  <p><span className="text-gray-600">Valid Until:</span> {formatDate(po.validUpto)}</p>
                  <p><span className="text-gray-600">Delivery Date:</span> {formatDate(po.deliveryDate)}</p>
                  <p><span className="text-gray-600">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>
                      {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                    </span>
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

  const tabs = [
    { id: 'pos', label: 'Purchase Orders', icon: ShoppingCart },
    { id: 'rfq', label: 'RFQ & Quotations', icon: ClipboardCheck },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'deliveries', label: 'Deliveries', icon: Truck }
  ];

  return (
    <div className="w-full p-6 bg-gray-100">
      {/* Vendor Profile Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Welcome, {vendorDetails?.name}</h1>
          <button
            onClick={() => setShowVendorDetails(!showVendorDetails)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            {showVendorDetails ? (
              <>Hide Details <ChevronUp className="h-4 w-4" /></>
            ) : (
              <>View Details <ChevronDown className="h-4 w-4" /></>
            )}
          </button>
        </div>

        {showVendorDetails && (
          <CustomCard className="transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Contact Information */}
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact Information
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-medium">{vendorDetails?.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500">Contact:</span>
                    <span className="font-medium">{vendorDetails?.contactNumber}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500">Mobile:</span>
                    <span className="font-medium">{vendorDetails?.mobileNumber}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500">Contact Person:</span>
                    <span className="font-medium">{vendorDetails?.contactPerson}</span>
                  </p>
                </div>
              </div>

              {/* Company Details */}
              <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company Details
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500">Vendor Code:</span>
                    <span className="font-medium">{vendorDetails?.vendorCode}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500">GST:</span>
                    <span className="font-medium">{vendorDetails?.gstNumber || 'N/A'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500">PAN:</span>
                    <span className="font-medium">{vendorDetails?.panNumber || 'N/A'}</span>
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </h3>
                <div className="space-y-2 text-gray-600">
                  {vendorDetails?.address?.line1 && (
                    <p className="flex items-center gap-2">
                      <span className="font-medium">{vendorDetails.address.line1}</span>
                    </p>
                  )}
                  {vendorDetails?.address?.line2 && (
                    <p className="flex items-center gap-2">
                      <span className="font-medium">{vendorDetails.address.line2}</span>
                    </p>
                  )}
                  {(vendorDetails?.address?.city || vendorDetails?.address?.state) && (
                    <p className="flex items-center gap-2">
                      <span className="font-medium">
                        {[
                          vendorDetails.address.city,
                          vendorDetails.address.state,
                          vendorDetails.address.pinCode
                        ].filter(Boolean).join(', ')}
                      </span>
                    </p>
                  )}
                  {!vendorDetails?.address?.line1 && (
                    <p className="text-gray-500">No address provided</p>
                  )}
                </div>
              </div>

              {/* Bank Details */}
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
                <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Bank Details
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500">Bank:</span>
                    <span className="font-medium">{vendorDetails?.bankDetails?.name || 'N/A'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500">Branch:</span>
                    <span className="font-medium">{vendorDetails?.bankDetails?.branchName || 'N/A'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500">Account:</span>
                    <span className="font-medium">{vendorDetails?.bankDetails?.accountNumber || 'N/A'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500">IFSC:</span>
                    <span className="font-medium">{vendorDetails?.bankDetails?.ifscCode || 'N/A'}</span>
                  </p>
                </div>
              </div>
            </div>
          </CustomCard>
        )}
      </div>
    {JSON.stringify(vendorDetails)}
      {/* Tabs Section */}
      <div className="mb-6">
        <div className="flex space-x-1 border-b">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors
                ${activeTab === id 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {activeTab === 'pos' && (
            <PurchaseOrdersTab
              poLoading={poLoading}
              poError={poError}
              purchaseOrders={purchaseOrders}
              handleViewPO={handleViewPO}
            />
          )}
          {activeTab === 'rfq' && <RFQTab vendorDetails={vendorDetails} />}
          {activeTab === 'invoices' && <InvoicesTab />}
          {activeTab === 'deliveries' && <DeliveriesTab />}
        </div>
      </div>

      <POViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        po={selectedPO}
      />
    </div>
  );
};

export default VendorDashboard;