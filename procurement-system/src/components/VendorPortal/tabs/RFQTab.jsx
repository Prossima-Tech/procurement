
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