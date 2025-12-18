import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Eye, CreditCard, TrendingUp, DollarSign, Calendar, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const InstallmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, customers, products, loadOrders } = useAppContext();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const installmentOrders = orders.filter(o => o.orderType === 'installment');
  const activeInstallments = installmentOrders.filter(o => o.status === 'active');
  const completedInstallments = installmentOrders.filter(o => o.status === 'completed');
  
  const totalOutstanding = installmentOrders.reduce((sum, order) => {
    return sum + (order.totalCost - (order.totalCollected || 0));
  }, 0);
  
  const totalCollected = installmentOrders.reduce((sum, order) => {
    return sum + (order.totalCollected || 0);
  }, 0);

  const getProgressPercentage = (order: typeof orders[0]) => {
    if (!order.totalCost || !order.totalCollected) return 0;
    return Math.min((order.totalCollected / order.totalCost) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-blue-600" />
            Installment Payment Tracking
          </h1>
          <p className="text-gray-600">Monitor and manage all installment payment schedules</p>
        </div>
        <Button 
          onClick={() => {
            setIsRefreshing(true);
            loadOrders()
              .then(() => {
                setIsRefreshing(false);
                toast.success('Installments refreshed');
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Installments</p>
                <p className="text-2xl font-bold text-gray-900">{installmentOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Active</p>
                <p className="text-2xl font-bold text-gray-900">{activeInstallments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Collected</p>
                <p className="text-2xl font-bold text-gray-900">₱{totalCollected.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-xl">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Outstanding</p>
                <p className="text-2xl font-bold text-gray-900">₱{totalOutstanding.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Installments List */}
      <div className="grid gap-6">
        {installmentOrders.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="bg-gray-100 p-4 rounded-full">
                  <CreditCard className="w-12 h-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-900 mb-1">No installment orders found</p>
                  <p className="text-sm text-gray-500">Create an installment order to start tracking payments</p>
                </div>
                <Button 
                  onClick={() => navigate('/orders/create-installment')} 
                  className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  type="button"
                >
                  Create Installment Order
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          installmentOrders.map(order => {
            const customer = customers.find(c => c.id === order.customerId);
            const productsList = order.items?.map(item => `${item.productName} (${item.quantity}x)`).join(', ') || 'N/A';
            const progress = getProgressPercentage(order);
            const remainingBalance = order.totalCost - (order.totalCollected || 0);
            const paidDays = order.payments?.filter(p => p.paid).length || 0;

            return (
              <Card key={order.id} className="border-0 shadow-md hover:shadow-lg transition-all overflow-hidden">
                <div className={`h-2 ${order.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}></div>
                <CardHeader className="bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${order.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'}`}>
                        {order.status === 'completed' ? (
                          <CheckCircle className={`w-6 h-6 ${order.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`} />
                        ) : (
                          <CreditCard className={`w-6 h-6 ${order.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`} />
                        )}
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {customer?.fullName || 'Unknown Customer'}
                        </CardTitle>
                        <p className="text-gray-600 text-sm mt-1 flex items-center gap-2">
                          <span>{productsList}</span>
                          <span className="text-gray-400">•</span>
                          <span className="font-mono text-xs bg-gray-200 px-2 py-0.5 rounded">#{order.id.slice(0, 8)}</span>
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Summary Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          <p className="text-xs text-gray-600 font-medium">Total Cost</p>
                        </div>
                        <p className="text-xl font-bold text-gray-900">₱{order.totalCost.toLocaleString()}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <p className="text-xs text-gray-600 font-medium">Total Collected</p>
                        </div>
                        <p className="text-xl font-bold text-green-600">
                          ₱{(order.totalCollected || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <p className="text-xs text-gray-600 font-medium">Remaining</p>
                        </div>
                        <p className="text-xl font-bold text-orange-600">₱{remainingBalance.toLocaleString()}</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-purple-600" />
                          <p className="text-xs text-gray-600 font-medium">Days Paid</p>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{paidDays} <span className="text-sm text-gray-500">/ 50</span></p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-gray-700 font-medium">Payment Progress</span>
                        <span className="text-blue-600 font-bold">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Daily Payment Info & Action */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Daily Payment Amount</p>
                          <p className="text-2xl font-bold text-blue-900">₱{order.dailyPayment?.toFixed(2) || 0}</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => navigate(`/installments/${order.id}`)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};