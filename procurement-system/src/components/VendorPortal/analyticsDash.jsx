// Add after vendor details section and before tabs
import { ShoppingCart, IndianRupee, Timer, Star } from 'lucide-react';

const AnalyticsDashboard = () => {
  // Hardcoded data for now
  const metrics = {
      activePos: 12,
      totalPoValue: 1250000,
      pendingDeliveries: 5,
      onTimeDeliveryRate: 92,
      averageResponseTime: 24, // hours
      qualityRating: 4.5,
      monthlyTrend: {
          delivered: 28,
          pending: 4,
          delayed: 2
      },
      paymentStatus: {
          paid: 850000,
          pending: 400000
      }
  };

  return (
      <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Performance Dashboard</h2>
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Active POs */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                      <div>
                          <p className="text-gray-500 text-sm">Active POs</p>
                          <h3 className="text-2xl font-bold text-blue-600">{metrics.activePos}</h3>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-full">
                          <ShoppingCart className="h-6 w-6 text-blue-500" />
                      </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Last updated today</p>
              </div>

              {/* Total PO Value */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                      <div>
                          <p className="text-gray-500 text-sm">Total PO Value</p>
                          <h3 className="text-2xl font-bold text-green-600">
                              ₹{(metrics.totalPoValue).toLocaleString()}
                          </h3>
                      </div>
                      <div className="bg-green-50 p-3 rounded-full">
                          <IndianRupee className="h-6 w-6 text-green-500" />
                      </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Current month</p>
              </div>

              {/* Delivery Performance */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                      <div>
                          <p className="text-gray-500 text-sm">On-Time Delivery</p>
                          <h3 className="text-2xl font-bold text-purple-600">{metrics.onTimeDeliveryRate}%</h3>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-full">
                          <Timer className="h-6 w-6 text-purple-500" />
                      </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
              </div>

              {/* Quality Rating */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                      <div>
                          <p className="text-gray-500 text-sm">Quality Rating</p>
                          <h3 className="text-2xl font-bold text-yellow-600">{metrics.qualityRating}/5</h3>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-full">
                          <Star className="h-6 w-6 text-yellow-500" />
                      </div>
                  </div>
                  <div className="flex items-center mt-2">
                      {[...Array(5)].map((_, i) => (
                          <Star 
                              key={i}
                              className={`h-4 w-4 ${i < Math.floor(metrics.qualityRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                      ))}
                  </div>
              </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Delivery Status */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="font-semibold mb-4">Monthly Delivery Status</h3>
                  <div className="flex items-center justify-between mb-4">
                      <div className="space-y-2">
                          <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-sm">Delivered ({metrics.monthlyTrend.delivered})</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <span className="text-sm">Pending ({metrics.monthlyTrend.pending})</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <span className="text-sm">Delayed ({metrics.monthlyTrend.delayed})</span>
                          </div>
                      </div>
                      <div className="w-24 h-24">
                          {/* Add a simple pie chart visualization here */}
                      </div>
                  </div>
              </div>

              {/* Payment Status */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="font-semibold mb-4">Payment Overview</h3>
                  <div className="space-y-4">
                      <div>
                          <div className="flex justify-between text-sm mb-1">
                              <span>Received</span>
                              <span className="text-green-600">₹{metrics.paymentStatus.paid.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${(metrics.paymentStatus.paid / (metrics.paymentStatus.paid + metrics.paymentStatus.pending)) * 100}%` }}
                              ></div>
                          </div>
                      </div>
                      <div>
                          <div className="flex justify-between text-sm mb-1">
                              <span>Pending</span>
                              <span className="text-yellow-600">₹{metrics.paymentStatus.pending.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                  className="bg-yellow-500 h-2 rounded-full"
                                  style={{ width: `${(metrics.paymentStatus.pending / (metrics.paymentStatus.paid + metrics.paymentStatus.pending)) * 100}%` }}
                              ></div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
};
export default AnalyticsDashboard;