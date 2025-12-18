import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Package, Users, ShoppingCart, CreditCard, TrendingUp, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { products, customers, orders } = useAppContext();

  const activeProducts = products.filter(p => !p.archived).length;
  const activeCustomers = customers.filter(c => !c.archived).length;
  const totalOrders = orders.length;
  const activeInstallments = orders.filter(
    o => o.orderType === 'installment' && o.status === 'active'
  ).length;

  // Calculate revenue
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalCost, 0);
  const cashOrders = orders.filter(o => o.orderType === 'cash').length;

  const recentOrders = orders.slice(-5).reverse();

  // Calculate real trends based on time periods
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Recent period orders (last 30 days)
  const recentPeriodOrders = orders.filter(o => {
    const orderDate = new Date(o.orderDate);
    return orderDate >= thirtyDaysAgo;
  });

  // Previous period orders (31-60 days ago)
  const previousPeriodOrders = orders.filter(o => {
    const orderDate = new Date(o.orderDate);
    return orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo;
  });

  // Calculate trends
  const calculateTrend = (current: number, previous: number): { change: string; trending: 'up' | 'down' } => {
    if (previous === 0) {
      return current > 0 ? { change: '+100%', trending: 'up' } : { change: '0%', trending: 'up' };
    }
    const percentChange = ((current - previous) / previous) * 100;
    const isUp = percentChange >= 0;
    return {
      change: `${isUp ? '+' : ''}${percentChange.toFixed(1)}%`,
      trending: isUp ? 'up' : 'down'
    };
  };

  // Calculate unique customers in each period
  const recentCustomers = new Set(recentPeriodOrders.map(o => o.customerId)).size;
  const previousCustomers = new Set(previousPeriodOrders.map(o => o.customerId)).size;

  // Calculate unique products sold in each period
  const recentProductIds = new Set(recentPeriodOrders.flatMap(o => o.items?.map(i => i.productId) || []));
  const previousProductIds = new Set(previousPeriodOrders.flatMap(o => o.items?.map(i => i.productId) || []));

  // Calculate installments in each period
  const recentInstallments = recentPeriodOrders.filter(o => o.orderType === 'installment' && o.status === 'active').length;
  const previousInstallments = previousPeriodOrders.filter(o => o.orderType === 'installment' && o.status === 'active').length;

  const stats = [
    {
      title: 'Total Products',
      value: activeProducts,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      gradient: 'from-blue-500 to-blue-600',
      ...calculateTrend(recentProductIds.size, previousProductIds.size),
    },
    {
      title: 'Total Customers',
      value: activeCustomers,
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50',
      gradient: 'from-green-500 to-green-600',
      ...calculateTrend(recentCustomers, previousCustomers),
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      gradient: 'from-purple-500 to-purple-600',
      ...calculateTrend(recentPeriodOrders.length, previousPeriodOrders.length),
    },
    {
      title: 'Active Installments',
      value: activeInstallments,
      icon: CreditCard,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      gradient: 'from-orange-500 to-orange-600',
      ...calculateTrend(recentInstallments, previousInstallments),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2 flex items-center gap-3">
            <span>Dashboard</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">Live</span>
          </h1>
          <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="w-5 h-5" />
          <span className="text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 overflow-hidden relative group">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`}></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${stat.bg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${stat.trending === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trending === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₱{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cash Orders */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Cash Orders</p>
                <p className="text-2xl font-bold text-gray-900">{cashOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Action */}
        <Link to="/orders" className="block">
          <Card className="border-0 shadow-md hover:shadow-xl transition-all bg-gradient-to-br from-blue-600 to-indigo-600 text-white h-full group">
            <CardContent className="p-6 flex items-center justify-between h-full">
              <div>
                <p className="text-sm text-blue-100 mb-1">Quick Action</p>
                <p className="text-xl font-bold">Create New Order</p>
              </div>
              <ArrowUpRight className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-md">
        <CardHeader className="border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Recent Orders
            </CardTitle>
            <Link to="/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">No recent orders</p>
              <p className="text-sm text-gray-400">Orders will appear here once created</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => {
                const customer = customers.find(c => c.id === order.customerId);
                const productsList = order.items?.map(item => `${item.productName} (${item.quantity}x)`).join(', ') || 'N/A';
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${order.orderType === 'cash' ? 'bg-green-100' : 'bg-blue-100'}`}>
                        {order.orderType === 'cash' ? (
                          <ShoppingCart className={`w-5 h-5 ${order.orderType === 'cash' ? 'text-green-600' : 'text-blue-600'}`} />
                        ) : (
                          <CreditCard className={`w-5 h-5 ${order.orderType === 'cash' ? 'text-green-600' : 'text-blue-600'}`} />
                        )}
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">{customer?.fullName || 'Unknown Customer'}</p>
                        <p className="text-sm text-gray-600">
                          {productsList}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-gray-900 font-bold">₱{order.totalCost.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{order.orderDate}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.orderType === 'cash' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {order.orderType}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};