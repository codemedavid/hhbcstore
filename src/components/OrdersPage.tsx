import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, RefreshCw } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';

interface OrdersPageProps {
  onBack: () => void;
}

const OrdersPage: React.FC<OrdersPageProps> = ({ onBack }) => {
  console.log('OrdersPage component rendered');
  const { orders, loading: ordersLoading, fetchOrders, updateOrderStatus, error: ordersError } = useOrders();
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch orders when component mounts
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setIsProcessing(true);
      await updateOrderStatus(orderId, newStatus as any);
      // Refresh orders after status update
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-black transition-colors duration-200"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-semibold text-black">Orders Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchOrders}
                disabled={ordersLoading}
                className="text-gray-600 hover:text-black transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
                title="Refresh orders"
              >
                <RefreshCw className={`h-5 w-5 ${ordersLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug info */}
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="text-sm text-yellow-800">
            Debug: orders.length = {orders.length}, ordersLoading = {ordersLoading.toString()}
          </p>
          <p className="text-sm text-yellow-800">
            Orders error: {ordersError || 'None'}
          </p>
        </div>
        
        {/* Error message */}
        {ordersError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-sm text-red-800 font-medium">Error: {ordersError}</p>
            <p className="text-sm text-red-600 mt-2">
              Please run the database setup script: <code className="bg-red-200 px-2 py-1 rounded">fix-orders-table-complete.sql</code>
            </p>
          </div>
        )}
        
        {ordersLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading orders...</div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">All Orders</h2>
              <p className="text-sm text-gray-500 mt-1">
                {orders.length} order{orders.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
                <p className="mt-1 text-sm text-gray-500">No orders have been placed yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.order_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{order.customer_name}</div>
                            <div className="text-gray-500">{order.contact_number}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-medium">₱{order.total_amount.toFixed(2)}</div>
                          {order.voucher_code && (
                            <div className="text-xs text-green-600">
                              Voucher: {order.voucher_code}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            disabled={isProcessing}
                            className={`px-2 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-pink-500 ${getStatusColor(order.status)}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              // TODO: Implement order details view
                              alert(`Order details for ${order.order_number}`);
                            }}
                            className="text-pink-600 hover:text-pink-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
