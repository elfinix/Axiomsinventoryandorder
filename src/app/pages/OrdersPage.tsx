import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext, Order } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, Eye, X, ShoppingCart, CreditCard, DollarSign, CheckCircle, ChevronDown, ChevronRight, Package, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, customers, updateOrder, loadOrders } = useAppContext();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const cashOrders = orders.filter(o => o.orderType === 'cash');
  const installmentOrders = orders.filter(o => o.orderType === 'installment');
  const activeOrders = orders.filter(o => o.status === 'active');
  const completedOrders = orders.filter(o => o.status === 'completed');

  const handleCancelOrder = (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      updateOrder(orderId, { status: 'cancelled' });
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const renderOrderTable = (orderList: Order[]) => (
    <Table>
      <TableHeader className="bg-gray-50">
        <TableRow>
          <TableHead className="font-semibold w-10"></TableHead>
          <TableHead className="font-semibold">Order ID</TableHead>
          <TableHead className="font-semibold">Customer</TableHead>
          <TableHead className="font-semibold">Products</TableHead>
          <TableHead className="font-semibold">Type</TableHead>
          <TableHead className="font-semibold">Date</TableHead>
          <TableHead className="font-semibold">Total Cost</TableHead>
          <TableHead className="font-semibold">Status</TableHead>
          <TableHead className="text-right font-semibold">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orderList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="bg-gray-100 p-4 rounded-full">
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-900 mb-1">No orders found</p>
                  <p className="text-sm text-gray-500">Create your first order to get started</p>
                </div>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          orderList.map(order => {
            const customer = customers.find(c => c.id === order.customerId);
            const isExpanded = expandedOrders.has(order.id);
            const totalItems = order.items.length;
            const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

            return (
              <React.Fragment key={order.id}>
                <TableRow className="hover:bg-gray-50 transition-colors">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleOrderExpansion(order.id)}
                      className="p-0 h-auto hover:bg-transparent"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                      {order.id.slice(0, 8)}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {customer?.fullName || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {totalItems} item{totalItems !== 1 ? 's' : ''} ({totalQuantity} qty)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      order.orderType === 'cash' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {order.orderType === 'cash' ? (
                        <DollarSign className="w-3 h-3" />
                      ) : (
                        <CreditCard className="w-3 h-3" />
                      )}
                      {order.orderType}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">{order.orderDate}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-green-600">
                      ₱{order.totalCost.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {order.orderType === 'installment' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/installments/${order.id}`)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                          title="View installment details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {order.status !== 'cancelled' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelOrder(order.id)}
                          className="hover:bg-red-50 hover:text-red-600"
                          title="Cancel order"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                
                {/* Expanded Row - Product Details */}
                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={9} className="bg-gray-50 p-0">
                      <div className="px-12 py-4">
                        <h4 className="text-gray-900 mb-3 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Order Items
                        </h4>
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="text-left px-4 py-2 text-sm text-gray-600">Product</th>
                                <th className="text-right px-4 py-2 text-sm text-gray-600">Unit Price</th>
                                <th className="text-right px-4 py-2 text-sm text-gray-600">Quantity</th>
                                <th className="text-right px-4 py-2 text-sm text-gray-600">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item, index) => (
                                <tr key={`${order.id}-item-${index}`} className="border-b border-gray-100 last:border-0">
                                  <td className="px-4 py-3 text-gray-900">{item.productName}</td>
                                  <td className="px-4 py-3 text-right text-gray-700">
                                    ₱{item.unitPrice.toLocaleString()}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium">
                                      {item.quantity}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right text-gray-900">
                                    ₱{item.totalPrice.toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-gray-50">
                                <td colSpan={3} className="px-4 py-3 text-right text-gray-900">
                                  Order Total:
                                </td>
                                <td className="px-4 py-3 text-right text-green-600">
                                  ₱{order.totalCost.toLocaleString()}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            Order Management
          </h1>
          <p className="text-gray-600">Track and manage all customer orders</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              setIsRefreshing(true);
              loadOrders()
                .then(() => {
                  setIsRefreshing(false);
                  toast.success('Orders refreshed');
                })
                .catch((error) => {
                  console.error('Refresh error:', error);
                  setIsRefreshing(false);
                });
            }} 
            variant="outline" 
            className="shadow-md"
            type="button"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => navigate('/orders/create-cash')}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
            type="button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Cash Order
          </Button>
          <Button 
            onClick={() => navigate('/orders/create-installment')} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            type="button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Installment Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Cash Orders</p>
                <p className="text-2xl font-bold text-gray-900">{cashOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Installment Orders</p>
                <p className="text-2xl font-bold text-gray-900">{installmentOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">{activeOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table with Tabs */}
      <Card className="border-0 shadow-md overflow-hidden">
        <Tabs defaultValue="all" className="w-full">
          <div className="bg-white px-6 pt-6 pb-0">
            <TabsList className="h-auto p-1 bg-transparent border-b border-gray-200 rounded-none w-full justify-start">
              <TabsTrigger 
                value="all" 
                className="rounded-t-lg rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 px-6 py-3"
              >
                All Orders ({orders.length})
              </TabsTrigger>
              <TabsTrigger 
                value="cash" 
                className="rounded-t-lg rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 px-6 py-3"
              >
                Cash ({cashOrders.length})
              </TabsTrigger>
              <TabsTrigger 
                value="installment" 
                className="rounded-t-lg rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 px-6 py-3"
              >
                Installment ({installmentOrders.length})
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="all" className="m-0 mt-0">
            <div className="overflow-x-auto">
              {renderOrderTable(orders)}
            </div>
          </TabsContent>
          <TabsContent value="cash" className="m-0 mt-0">
            <div className="overflow-x-auto">
              {renderOrderTable(cashOrders)}
            </div>
          </TabsContent>
          <TabsContent value="installment" className="m-0 mt-0">
            <div className="overflow-x-auto">
              {renderOrderTable(installmentOrders)}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};