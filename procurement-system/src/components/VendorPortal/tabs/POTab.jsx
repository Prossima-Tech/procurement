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