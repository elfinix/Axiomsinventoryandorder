import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FileText, Download, TrendingUp, DollarSign, Package, CreditCard, BarChart3, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const ReportsPage: React.FC = () => {
  const { products, customers, orders } = useAppContext();

  const activeProducts = products.filter(p => !p.archived);
  const activeCustomers = customers.filter(c => !c.archived);

  const totalSales = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalCost, 0);

  const cashSales = orders
    .filter(o => o.orderType === 'cash' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalCost, 0);

  const installmentSales = orders
    .filter(o => o.orderType === 'installment' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalCost, 0);

  const totalCollectedFromInstallments = orders
    .filter(o => o.orderType === 'installment')
    .reduce((sum, o) => sum + (o.totalCollected || 0), 0);

  const outstandingBalance = installmentSales - totalCollectedFromInstallments;

  const exportProductListPDF = () => {
    const doc = new jsPDF();
    
    // Set consistent font
    doc.setFont('helvetica', 'normal');
    
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('AXIOMS - VanBrothers Merchandise', 14, 15);
    doc.setFontSize(14);
    doc.text('Product Inventory Report', 14, 25);
    
    // Summary Stats
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 35);
    doc.text(`Total Products: ${activeProducts.length}`, 14, 42);
    doc.text(`Total Inventory Value: ₱${activeProducts.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0).toLocaleString()}`, 14, 49);
    doc.text(`Low Stock Items: ${activeProducts.filter(p => p.stock && p.stock < 10).length}`, 14, 56);

    // Table
    autoTable(doc, {
      head: [['Item Code', 'Item Name', 'Price', 'Stock', 'Status']],
      body: activeProducts.map(product => {
        const isLowStock = product.stock && product.stock < 10;
        return [
          product.itemCode,
          product.itemName,
          `₱${product.price.toLocaleString()}`,
          product.stock || 'N/A',
          isLowStock ? 'Low Stock' : 'In Stock'
        ];
      }),
      startY: 65,
      theme: 'grid',
      headStyles: { 
        fillColor: [59, 130, 246],
        font: 'helvetica',
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 9,
        font: 'helvetica',
        fontStyle: 'normal'
      }
    });

    doc.save('product_inventory_report.pdf');
  };

  const exportSalesReportPDF = () => {
    const doc = new jsPDF();
    
    // Set consistent font
    doc.setFont('helvetica', 'normal');
    
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('AXIOMS - VanBrothers Merchandise', 14, 15);
    doc.setFontSize(14);
    doc.text('Sales Summary Report', 14, 25);
    
    // Summary Stats
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 35);
    doc.text(`Total Sales: ₱${totalSales.toLocaleString()}`, 14, 42);
    doc.text(`Cash Sales: ₱${cashSales.toLocaleString()}`, 14, 49);
    doc.text(`Installment Sales: ₱${installmentSales.toLocaleString()}`, 14, 56);

    // Table
    autoTable(doc, {
      head: [['Order ID', 'Customer', 'Products', 'Type', 'Date', 'Amount']],
      body: orders
        .filter(o => o.status !== 'cancelled')
        .map(order => {
          const customer = customers.find(c => c.id === order.customerId);
          const productNames = order.items?.map(item => `${item.productName} (${item.quantity}x)`).join(', ') || 'N/A';
          return [
            order.id.slice(0, 8),
            customer?.fullName || 'Unknown',
            productNames,
            order.orderType,
            order.orderDate,
            `₱${order.totalCost.toLocaleString()}`
          ];
        }),
      startY: 65,
      theme: 'grid',
      headStyles: { 
        fillColor: [16, 185, 129],
        font: 'helvetica',
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 8,
        font: 'helvetica',
        fontStyle: 'normal'
      }
    });

    doc.save('sales_summary_report.pdf');
  };

  const exportInstallmentSummaryPDF = () => {
    const doc = new jsPDF();
    
    // Set consistent font
    doc.setFont('helvetica', 'normal');
    
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('AXIOMS - VanBrothers Merchandise', 14, 15);
    doc.setFontSize(14);
    doc.text('Installment Payment Summary', 14, 25);
    
    // Summary Stats
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 35);
    doc.text(`Total Installment Sales: ₱${installmentSales.toLocaleString()}`, 14, 42);
    doc.text(`Total Collected: ₱${totalCollectedFromInstallments.toLocaleString()}`, 14, 49);
    doc.text(`Outstanding Balance: ₱${outstandingBalance.toLocaleString()}`, 14, 56);

    // Table
    autoTable(doc, {
      head: [['Order ID', 'Customer', 'Products', 'Total Cost', 'Collected', 'Remaining', 'Status']],
      body: orders
        .filter(o => o.orderType === 'installment')
        .map(order => {
          const customer = customers.find(c => c.id === order.customerId);
          const productNames = order.items?.map(item => `${item.productName} (${item.quantity}x)`).join(', ') || 'N/A';
          const remaining = order.totalCost - (order.totalCollected || 0);
          return [
            order.id.slice(0, 8),
            customer?.fullName || 'Unknown',
            productNames,
            `₱${order.totalCost.toLocaleString()}`,
            `₱${(order.totalCollected || 0).toLocaleString()}`,
            `₱${remaining.toLocaleString()}`,
            order.status
          ];
        }),
      startY: 65,
      theme: 'grid',
      headStyles: { 
        fillColor: [147, 51, 234],
        font: 'helvetica',
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 8,
        font: 'helvetica',
        fontStyle: 'normal'
      }
    });

    doc.save('installment_payment_summary.pdf');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2 flex items-center gap-2">
          <FileText className="w-8 h-8 text-blue-600" />
          Reports & Analytics
        </h1>
        <p className="text-gray-600">Generate comprehensive business reports and insights</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">₱{totalSales.toLocaleString()}</p>
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
                <p className="text-sm text-gray-600 mb-1">Cash Sales</p>
                <p className="text-2xl font-bold text-gray-900">₱{cashSales.toLocaleString()}</p>
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
                <p className="text-sm text-gray-600 mb-1">Installment Sales</p>
                <p className="text-2xl font-bold text-gray-900">₱{installmentSales.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-xl">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Card className="border-0 shadow-md overflow-hidden">
        <Tabs defaultValue="products" className="w-full">
          <div className="bg-white px-6 pt-6 pb-0">
            <TabsList className="h-auto p-1 bg-transparent border-b border-gray-200 rounded-none w-full justify-start">
              <TabsTrigger 
                value="products" 
                className="rounded-t-lg rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 px-6 py-3"
              >
                <Package className="w-4 h-4 mr-2" />
                Product List
              </TabsTrigger>
              <TabsTrigger 
                value="sales" 
                className="rounded-t-lg rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 px-6 py-3"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Sales Report
              </TabsTrigger>
              <TabsTrigger 
                value="installments" 
                className="rounded-t-lg rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 px-6 py-3"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Installment Summary
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Product List Report */}
          <TabsContent value="products" className="m-0 mt-0">
            <CardHeader className="bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Product Inventory Report
                </CardTitle>
                <Button 
                  onClick={exportProductListPDF}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  type="button"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Product Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-sm text-gray-600 mb-1 font-medium">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{activeProducts.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                  <p className="text-sm text-gray-600 mb-1 font-medium">Total Inventory Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₱{activeProducts.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
                  <p className="text-sm text-gray-600 mb-1 font-medium">Low Stock Items</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activeProducts.filter(p => p.stock && p.stock < 10).length}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold">Item Code</TableHead>
                      <TableHead className="font-semibold">Item Name</TableHead>
                      <TableHead className="font-semibold">Price</TableHead>
                      <TableHead className="font-semibold">Stock</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No products available
                        </TableCell>
                      </TableRow>
                    ) : (
                      activeProducts.map(product => {
                        const isLowStock = product.stock && product.stock < 10;
                        return (
                          <TableRow key={product.id} className="hover:bg-gray-50">
                            <TableCell>
                              <span className="px-2 py-1 bg-gray-100 rounded text-sm font-medium">
                                {product.itemCode}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium">{product.itemName}</TableCell>
                            <TableCell className="font-semibold text-green-600">
                              ₱{product.price.toLocaleString()}
                            </TableCell>
                            <TableCell className={isLowStock ? 'text-orange-600 font-medium' : ''}>
                              {product.stock || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {isLowStock ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                  <AlertCircle className="w-3 h-3" />
                                  Low Stock
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  In Stock
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </TabsContent>

          {/* Sales Report */}
          <TabsContent value="sales" className="m-0">
            <CardHeader className="bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Sales Summary Report
                </CardTitle>
                <Button 
                  onClick={exportSalesReportPDF}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  type="button"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-gray-600 font-medium">Total Sales</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">₱{totalSales.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-gray-600 font-medium">Cash Sales</p>
                  </div>
                  <p className="text-2xl font-bold text-green-900">₱{cashSales.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                    <p className="text-sm text-gray-600 font-medium">Installment Sales</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">₱{installmentSales.toLocaleString()}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold">Order ID</TableHead>
                      <TableHead className="font-semibold">Customer</TableHead>
                      <TableHead className="font-semibold">Products</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders
                      .filter(o => o.status !== 'cancelled')
                      .map(order => {
                        const customer = customers.find(c => c.id === order.customerId);
                        const productsList = order.items?.map(item => `${item.productName} (${item.quantity}x)`).join(', ') || 'N/A';
                        return (
                          <TableRow key={order.id} className="hover:bg-gray-50">
                            <TableCell>
                              <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                                {order.id.slice(0, 8)}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium">{customer?.fullName || 'Unknown'}</TableCell>
                            <TableCell className="text-sm text-gray-700">{productsList}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                order.orderType === 'cash' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {order.orderType}
                              </span>
                            </TableCell>
                            <TableCell className="text-gray-600">{order.orderDate}</TableCell>
                            <TableCell className="font-semibold text-green-600">
                              ₱{order.totalCost.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </TabsContent>

          {/* Installment Summary Report */}
          <TabsContent value="installments" className="m-0">
            <CardHeader className="bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  Installment Payment Summary
                </CardTitle>
                <Button 
                  onClick={exportInstallmentSummaryPDF}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  type="button"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    <p className="text-sm text-gray-600 font-medium">Total Installment Sales</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">₱{installmentSales.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-gray-600 font-medium">Total Collected</p>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    ₱{totalCollectedFromInstallments.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <p className="text-sm text-gray-600 font-medium">Outstanding Balance</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">
                    ₱{outstandingBalance.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold">Order ID</TableHead>
                      <TableHead className="font-semibold">Customer</TableHead>
                      <TableHead className="font-semibold">Products</TableHead>
                      <TableHead className="font-semibold">Total Cost</TableHead>
                      <TableHead className="font-semibold">Collected</TableHead>
                      <TableHead className="font-semibold">Remaining</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders
                      .filter(o => o.orderType === 'installment')
                      .map(order => {
                        const customer = customers.find(c => c.id === order.customerId);
                        const productsList = order.items?.map(item => `${item.productName} (${item.quantity}x)`).join(', ') || 'N/A';
                        const remaining = order.totalCost - (order.totalCollected || 0);
                        return (
                          <TableRow key={order.id} className="hover:bg-gray-50">
                            <TableCell>
                              <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                                {order.id.slice(0, 8)}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium">{customer?.fullName || 'Unknown'}</TableCell>
                            <TableCell className="text-sm text-gray-700">{productsList}</TableCell>
                            <TableCell className="font-semibold">₱{order.totalCost.toLocaleString()}</TableCell>
                            <TableCell className="text-green-600 font-semibold">
                              ₱{(order.totalCollected || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-orange-600 font-semibold">
                              ₱{remaining.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'completed' 
                                  ? 'bg-green-100 text-green-700' 
                                  : order.status === 'active'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {order.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};