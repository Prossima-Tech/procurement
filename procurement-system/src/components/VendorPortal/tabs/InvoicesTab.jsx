import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  AlertCircle,
  Clock,
  Package,
  CheckCircle,
  FilePlus2,
  ReceiptText,
  FileDown
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { baseURL } from '../../../utils/endpoint';
import CreateInvoiceModal from '../CreateInvoiceModal';
import ViewInvoiceModal from '../ViewInvoiceModal';
import { toast, ToastContainer } from 'react-toastify';
// import StatusBadge from '../../../utils/StatusBadge';
const InvoicesTab = ({ vendorDetails }) => {
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [isViewInvoiceModalOpen, setIsViewInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    if (vendorDetails?._id) {
      fetchVendorGRNs();
    }
  }, [vendorDetails]);

  const fetchVendorGRNs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/grn/vendor/${vendorDetails._id}`);
      setGrns(response.data.data);
      console.log("grns",response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch GRNs');
      console.error('GRN fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'yellow', icon: Clock },
      approved: { color: 'green', icon: CheckCircle },
      rejected: { color: 'red', icon: AlertCircle },
      completed: { color: 'blue', icon: Package },
      invoice_created: { color: 'purple', icon: ReceiptText },
      inspection_in_progress: { color: 'orange', icon: Clock }
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
        bg-${config.color}-100 text-${config.color}-800`}>
        <Icon className="h-3 w-3" />
        {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </span>
    );
  };

  const filteredGRNs = grns.filter(grn => {
    const matchesSearch = 
      grn.grnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grn.purchaseOrder?.poNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || grn.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = (grn) => {
    setSelectedGRN(grn);
    setIsCreateInvoiceModalOpen(true);
  };

  const handleViewInvoice = async (grn) => {
    try {
      console.log("grn for invoiceId",grn);
      const response = await axios.get(`${baseURL}/invoice/${grn.invoiceId._id}`);
      setSelectedInvoice(response.data.data);
      console.log("selected invoice",response.data.data);
      console.log("selected vendor",vendorDetails);
      setIsViewInvoiceModalOpen(true);
    } catch (error) {
      console.error('Error fetching invoice:', error);
    }
  };

  const getToken = () => localStorage.getItem('token');

  const handlePrintInvoice = async (invoiceId) => {
    console.log("invoiceId",invoiceId);
    toast.info(`Generating PDF... ${invoiceId._id}`);
    try {
      const response = await axios.get(
        `${baseURL}/invoice/generatePdf/${invoiceId._id}`,
        {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Accept': 'application/pdf'
          },
          responseType: 'blob'
        }
      );

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow">
      <ToastContainer/>
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {/* <h2 className="text-lg font-semibold">Invoices & GRNs</h2> */}
          </div>
          <div className="flex gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search GRNs..."
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="inspection_in_progress">Inspection In Progress</option>
              <option value="invoice_created">Invoice Created</option>
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
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Invoice Number</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">PO No.</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">PO Receive Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Invoice Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredGRNs.map((grn) => (
                    <tr key={grn._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{grn.invoiceNumber}</td>
                      <td className="px-4 py-3">{grn.purchaseOrder?.poCode || 'N/A'}</td>
                      <td className="px-4 py-3">
                        {format(new Date(grn.receivedDate), 'dd MMM yyyy')}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(grn.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {grn.invoiceId ? 
                          `₹${Math.round(grn.invoiceId.totalAmount).toFixed(2)}` : 
                          <span className="text-gray-500 italic">Invoice not generated</span>
                        }
                      </td>
                      <td className="px-1 py-1">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCreateInvoice(grn)}
                            disabled={grn.status !== 'approved'}
                            className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md border
                              ${grn.status === 'approved'
                                ? 'text-green-600 hover:text-green-700 border-green-600 hover:bg-green-50'
                                : 'text-gray-400 border-gray-300 cursor-not-allowed bg-gray-50'
                              }`}
                            title={grn.status !== 'approved' ? 'GRN must be approved to create invoice' : ''}
                          >
                            <FilePlus2 className="h-4 w-4" />
                            Create
                          </button>

                          <button
                            onClick={() => handleViewInvoice(grn)}
                            disabled={!grn.invoiceId}
                            className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md border
                              ${grn.invoiceId
                                ? 'text-purple-600 hover:text-purple-700 border-purple-600 hover:bg-purple-50'
                                : 'text-gray-400 border-gray-300 cursor-not-allowed bg-gray-50'
                              }`}
                            title={!grn.invoiceId ? 'No invoice available' : ''}
                          >
                            <ReceiptText className="h-4 w-4" />
                            View
                          </button>
                            
                          {grn.invoiceId && (
                            <button
                              onClick={() => handlePrintInvoice(grn.invoiceId)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md border
                                text-green-600 hover:text-green-700 border-green-600 hover:bg-green-50"
                              title="Download Invoice PDF"
                            >
                              <FileDown className="h-4 w-4" />
                              Print
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredGRNs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No GRNs found matching your criteria
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CreateInvoiceModal
        isOpen={isCreateInvoiceModalOpen}
        onClose={() => {
          setIsCreateInvoiceModalOpen(false);
          setSelectedGRN(null);
          fetchVendorGRNs();
        }}
        grnData={selectedGRN}
      />

      <ViewInvoiceModal
        isOpen={isViewInvoiceModalOpen}
        onClose={() => {
          setIsViewInvoiceModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoiceData={selectedInvoice}
        vendorDetails={vendorDetails}
      />
    </>
  );
};

export default InvoicesTab;