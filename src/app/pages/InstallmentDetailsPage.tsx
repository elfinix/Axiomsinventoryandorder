import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, CheckCircle, Circle, AlertCircle, Package } from 'lucide-react';

export const InstallmentDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { orders, customers, products, markPaymentAsPaid } = useAppContext();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPaymentDay, setSelectedPaymentDay] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');

  const order = orders.find(o => o.id === orderId);
  const customer = customers.find(c => c.id === order?.customerId);

  if (!order || !customer) {
    return (
      <div>
        <p className="text-gray-500">Order not found</p>
        <Button onClick={() => navigate('/installments')} className="mt-4" type="button">
          Back to Installments
        </Button>
      </div>
    );
  }

  const handleMarkPaidClick = (day: number) => {
    setSelectedPaymentDay(day);
    setConfirmDialogOpen(true);
  };

  const handleConfirmMarkPaid = () => {
    if (selectedPaymentDay !== null) {
      markPaymentAsPaid(order.id, selectedPaymentDay, paymentMethod, notes);
      setConfirmDialogOpen(false);
      setSelectedPaymentDay(null);
      setPaymentMethod('Cash');
      setNotes('');
    }
  };

  const handleCancelMarkPaid = () => {
    setConfirmDialogOpen(false);
    setSelectedPaymentDay(null);
    setPaymentMethod('Cash');
    setNotes('');
  };

  const remainingBalance = order.totalCost - (order.totalCollected || 0);
  const paidDays = order.payments?.filter(p => p.paid).length || 0;

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate('/installments')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Installments
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{customer.fullName}</CardTitle>
              <p className="text-gray-600 mt-1">{customer.address}</p>
              <p className="text-gray-600">{customer.contactNumber}</p>
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
        <CardContent className="space-y-6">
          {/* Order Items */}
          <div>
            <h3 className="text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Items
            </h3>
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2 text-sm text-gray-600">Product</th>
                    <th className="text-right px-4 py-2 text-sm text-gray-600">Unit Price</th>
                    <th className="text-right px-4 py-2 text-sm text-gray-600">Quantity</th>
                    <th className="text-right px-4 py-2 text-sm text-gray-600">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200 last:border-0 bg-white">
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
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="text-gray-900">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="text-gray-900">{order.orderDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Rate:</span>
                <span className="text-gray-900">{order.interestRate}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cost:</span>
                <span className="text-gray-900">₱{order.totalCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Downpayment:</span>
                <span className="text-gray-900">₱{order.downpayment?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Collected:</span>
                <span className="text-green-600">
                  ₱{(order.totalCollected || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Remaining Balance:</span>
                <span className="text-orange-600">₱{remainingBalance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Schedule (50 Days)</CardTitle>
          <p className="text-gray-600 text-sm mt-1">
            Daily Payment: ₱{order.dailyPayment?.toFixed(2)} | Paid: {paidDays}/50 days
          </p>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Paid</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.payments?.map(payment => (
                  <TableRow key={payment.day}>
                    <TableCell>Day {payment.day}</TableCell>
                    <TableCell>₱{payment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {payment.paid ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>Paid</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Circle className="w-4 h-4" />
                          <span>Unpaid</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{payment.datePaid || '-'}</TableCell>
                    <TableCell>{payment.paymentMethod || '-'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{payment.notes || '-'}</TableCell>
                    <TableCell className="text-right">
                      {!payment.paid && order.status !== 'completed' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkPaidClick(payment.day)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Mark as Paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Confirm Payment
            </DialogTitle>
            <DialogDescription className="text-left pt-4">
              Are you sure you want to mark this payment as paid?
            </DialogDescription>
          </DialogHeader>
          
          {selectedPaymentDay !== null && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payment Day:</span>
                <span className="font-semibold text-gray-900">Day {selectedPaymentDay}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="font-semibold text-green-600">₱{order.dailyPayment?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Customer:</span>
                <span className="font-medium text-gray-900">{customer.fullName}</span>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p>This action will record the payment and update the total collected amount.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <SelectTrigger>
                  <SelectValue>{paymentMethod}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Debit Card">Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any notes about the payment"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelMarkPaid}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmMarkPaid}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};