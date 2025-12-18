import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext, Payment, OrderItem } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Plus, Trash2, ShoppingCart } from 'lucide-react';

export const CreateInstallmentOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { customers, products, addOrder } = useAppContext();
  const [customerId, setCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [interestRate, setInterestRate] = useState('');

  const activeCustomers = customers.filter(c => !c.archived);
  const activeProducts = products.filter(p => !p.archived);

  const handleAddToCart = () => {
    if (!selectedProductId) return;

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const quantityNum = parseInt(quantity) || 1;
    if (quantityNum < 1) return;

    // Check if product already in cart
    const existingItemIndex = cartItems.findIndex(item => item.productId === selectedProductId);

    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += quantityNum;
      updatedCart[existingItemIndex].totalPrice = 
        updatedCart[existingItemIndex].quantity * updatedCart[existingItemIndex].unitPrice;
      setCartItems(updatedCart);
    } else {
      // Add new item to cart
      const newItem: OrderItem = {
        productId: product.id,
        productName: product.itemName,
        quantity: quantityNum,
        unitPrice: product.price,
        totalPrice: product.price * quantityNum,
      };
      setCartItems([...cartItems, newItem]);
    }

    // Reset selection
    setSelectedProductId('');
    setQuantity('1');
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(cartItems.filter(item => item.productId !== productId));
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(cartItems.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: newQuantity * item.unitPrice,
        };
      }
      return item;
    }));
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const downpayment = subtotal * 0.02; // 2% fixed downpayment
  const interestAmount = (subtotal * parseFloat(interestRate || '0')) / 100;
  const totalCost = subtotal + interestAmount;
  const remainingAfterDownpayment = totalCost - downpayment;
  const dailyPayment = remainingAfterDownpayment / 50; // 50 days fixed

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || cartItems.length === 0 || !interestRate) return;

    // Create payment schedule for 50 days
    const payments: Payment[] = Array.from({ length: 50 }, (_, i) => ({
      day: i + 1,
      amount: dailyPayment,
      paid: false,
    }));

    addOrder({
      customerId,
      items: cartItems,
      orderType: 'installment',
      orderDate: new Date().toISOString().split('T')[0],
      status: 'active',
      totalCost,
      interestRate: parseFloat(interestRate),
      downpayment,
      dailyPayment,
      totalCollected: downpayment, // Downpayment is collected upfront
      payments,
    });

    navigate('/orders');
  };

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate('/orders')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Orders
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Product Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Create Installment Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Selection */}
              <div className="space-y-2">
                <Label htmlFor="customer">Select Customer</Label>
                <Select value={customerId} onValueChange={setCustomerId} required>
                  <SelectTrigger id="customer">
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCustomers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <Label htmlFor="interestRate">Installment Interest (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  placeholder="Enter interest percentage"
                  value={interestRate}
                  onChange={e => setInterestRate(e.target.value)}
                  required
                />
              </div>

              {/* Product Selection */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-gray-900">Add Products to Order</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="product">Select Product</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger id="product">
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeProducts.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.itemName} - ₱{product.price.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    type="number"
                    min="1"
                  />
                </div>

                <Button 
                  type="button" 
                  onClick={handleAddToCart}
                  disabled={!selectedProductId}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>

              {/* Cart Items */}
              {cartItems.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Cart Items ({cartItems.length})
                  </h3>
                  <div className="space-y-2">
                    {cartItems.map(item => (
                      <div 
                        key={item.productId}
                        className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-600">
                            ₱{item.unitPrice.toLocaleString()} × {item.quantity} = ₱{item.totalPrice.toLocaleString()}
                          </p>
                        </div>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleUpdateQuantity(item.productId, parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromCart(item.productId)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No items in cart</p>
                  <p className="text-sm">Add products to create an order</p>
                </div>
              ) : (
                <>
                  {interestRate && (
                    <>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="text-blue-900 mb-3">Installment Summary</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Items:</span>
                            <span className="text-gray-900">{cartItems.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Total Quantity:</span>
                            <span className="text-gray-900">
                              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Subtotal:</span>
                            <span className="text-gray-900">₱{subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Interest ({interestRate}%):</span>
                            <span className="text-gray-900">₱{interestAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-gray-900">Total Cost:</span>
                            <span className="text-gray-900">₱{totalCost.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-gray-900 mb-3">Payment Details</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Downpayment (2%):</span>
                            <span className="text-gray-900">₱{downpayment.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Installment Duration:</span>
                            <span className="text-gray-900">50 days</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Daily Payment:</span>
                            <span className="text-gray-900">₱{dailyPayment.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-2">
                    <Button 
                      type="submit" 
                      disabled={!customerId || cartItems.length === 0 || !interestRate}
                      className="w-full"
                    >
                      Save Installment Order
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/orders')}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
