import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Product {
  id: string;
  itemCode: string;
  itemName: string;
  price: number;
  stock?: number;
  archived?: boolean;
}

export interface Customer {
  id: string;
  fullName: string;
  address: string;
  contactNumber: string;
  archived?: boolean;
}

// New interface for order line items (multiple products per order)
export interface OrderItem {
  id?: string;
  productId: string;
  productName: string; // Store product name for historical record
  quantity: number;
  unitPrice: number; // Store unit price at time of order for historical record
  totalPrice: number; // quantity * unitPrice
}

export interface Order {
  id: string;
  customerId: string;
  // Removed single product fields, replaced with items array
  items: OrderItem[]; // Multiple products per order
  orderType: 'cash' | 'installment';
  orderDate: string;
  status: 'active' | 'completed' | 'cancelled';
  totalCost: number; // Total of all items + interest
  // Installment specific fields
  interestRate?: number;
  downpayment?: number;
  dailyPayment?: number;
  totalCollected?: number;
  payments?: Payment[];
}

export interface Payment {
  id?: string;
  day: number;
  amount: number;
  paid: boolean;
  datePaid?: string;
  paymentMethod?: string; // Added for payment method tracking
  notes?: string; // Added for payment notes
}

interface AppContextType {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  addOrder: (order: Omit<Order, 'id'>) => Promise<void>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getCustomerById: (id: string) => Customer | undefined;
  getOrderById: (id: string) => Order | undefined;
  markPaymentAsPaid: (orderId: string, day: number, paymentMethod?: string, notes?: string) => Promise<void>;
  refreshData: () => Promise<void>;
  loadProducts: () => Promise<void>;
  loadCustomers: () => Promise<void>;
  loadOrders: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data from Supabase
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedProducts: Product[] = (data || []).map(p => ({
        id: p.id,
        itemCode: p.item_code,
        itemName: p.item_name,
        price: p.price,
        stock: p.stock,
        archived: !!p.deleted_at,
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedCustomers: Customer[] = (data || []).map(c => ({
        id: c.id,
        fullName: c.full_name,
        address: c.address,
        contactNumber: c.contact_number,
        archived: !!c.deleted_at,
      }));

      setCustomers(mappedCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    }
  };

  const fetchOrders = async () => {
    try {
      // Fetch orders with order items
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch payments for installment orders
      const orderIds = (ordersData || []).map(o => o.id);
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .in('order_id', orderIds)
        .order('day', { ascending: true });

      if (paymentsError) throw paymentsError;

      // Map orders with items and payments
      const mappedOrders: Order[] = (ordersData || []).map(o => {
        const orderPayments = (paymentsData || [])
          .filter(p => p.order_id === o.id)
          .map(p => ({
            id: p.id,
            day: p.day,
            amount: p.amount,
            paid: p.paid,
            datePaid: p.date_paid || undefined,
            paymentMethod: p.payment_method || undefined,
            notes: p.notes || undefined,
          }));

        return {
          id: o.id,
          customerId: o.customer_id,
          items: (o.order_items || []).map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            productName: item.product_name,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalPrice: item.total_price,
          })),
          orderType: o.order_type,
          orderDate: o.order_date,
          status: o.status,
          totalCost: o.total_cost,
          interestRate: o.interest_rate || undefined,
          downpayment: o.downpayment || undefined,
          dailyPayment: o.daily_payment || undefined,
          totalCollected: o.total_collected,
          payments: orderPayments.length > 0 ? orderPayments : undefined,
        };
      });

      setOrders(mappedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchProducts(), fetchCustomers(), fetchOrders()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();

    // Setup realtime subscriptions
    const channels: RealtimeChannel[] = [];

    // Subscribe to products changes
    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          console.log('Products change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newProduct: Product = {
              id: payload.new.id,
              itemCode: payload.new.item_code,
              itemName: payload.new.item_name,
              price: payload.new.price,
              stock: payload.new.stock,
              archived: !!payload.new.deleted_at,
            };
            setProducts(prev => [newProduct, ...prev]);
            toast.info(`New product added: ${newProduct.itemName} (${newProduct.itemCode})`);
          } else if (payload.eventType === 'UPDATE') {
            const updatedProduct: Product = {
              id: payload.new.id,
              itemCode: payload.new.item_code,
              itemName: payload.new.item_name,
              price: payload.new.price,
              stock: payload.new.stock,
              archived: !!payload.new.deleted_at,
            };
            setProducts(prev =>
              prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
            );
            
            // Only show toast if not archived (soft delete)
            if (!updatedProduct.archived) {
              toast.info(`Product updated: ${updatedProduct.itemName}`);
            }
          } else if (payload.eventType === 'DELETE') {
            setProducts(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    channels.push(productsChannel);

    // Subscribe to orders changes
    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Orders change received:', payload);
          // Refetch orders to get complete data with items and payments
          fetchOrders();
          
          if (payload.eventType === 'INSERT') {
            toast.info('New order created');
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.status === 'completed') {
              toast.success('Order completed!');
            } else if (payload.new.status === 'cancelled') {
              toast.info('Order cancelled');
            }
          }
        }
      )
      .subscribe();

    channels.push(ordersChannel);

    // Subscribe to order_items changes
    const orderItemsChannel = supabase
      .channel('order-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items',
        },
        () => {
          console.log('Order items changed, refreshing orders');
          fetchOrders();
        }
      )
      .subscribe();

    channels.push(orderItemsChannel);

    // Subscribe to payments changes
    const paymentsChannel = supabase
      .channel('payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
        },
        (payload) => {
          console.log('Payments change received:', payload);
          fetchOrders(); // Refetch orders to update payment data
          
          if (payload.eventType === 'UPDATE' && payload.new.paid === true) {
            toast.success(`Payment marked as paid for Day ${payload.new.day}`);
          }
        }
      )
      .subscribe();

    channels.push(paymentsChannel);

    // Subscribe to customers changes (helpful for order creation)
    const customersChannel = supabase
      .channel('customers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
        },
        (payload) => {
          console.log('Customers change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newCustomer: Customer = {
              id: payload.new.id,
              fullName: payload.new.full_name,
              address: payload.new.address,
              contactNumber: payload.new.contact_number,
              archived: !!payload.new.deleted_at,
            };
            setCustomers(prev => [newCustomer, ...prev]);
            toast.info(`New customer added: ${newCustomer.fullName}`);
          } else if (payload.eventType === 'UPDATE') {
            const updatedCustomer: Customer = {
              id: payload.new.id,
              fullName: payload.new.full_name,
              address: payload.new.address,
              contactNumber: payload.new.contact_number,
              archived: !!payload.new.deleted_at,
            };
            setCustomers(prev =>
              prev.map(c => (c.id === updatedCustomer.id ? updatedCustomer : c))
            );
            
            if (!updatedCustomer.archived) {
              toast.info(`Customer updated: ${updatedCustomer.fullName}`);
            }
          } else if (payload.eventType === 'DELETE') {
            setCustomers(prev => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    channels.push(customersChannel);

    // Cleanup subscriptions on unmount
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          item_code: product.itemCode,
          item_name: product.itemName,
          price: product.price,
          stock: product.stock || 0,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Product added successfully');
      await fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
      throw error;
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      const updateData: any = {};
      if (product.itemCode !== undefined) updateData.item_code = product.itemCode;
      if (product.itemName !== undefined) updateData.item_name = product.itemName;
      if (product.price !== undefined) updateData.price = product.price;
      if (product.stock !== undefined) updateData.stock = product.stock;
      if (product.archived !== undefined) {
        updateData.deleted_at = product.archived ? new Date().toISOString() : null;
      }

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Product updated successfully');
      await fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
      throw error;
    }
  };

  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          full_name: customer.fullName,
          address: customer.address,
          contact_number: customer.contactNumber,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Customer added successfully');
      await fetchCustomers();
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Failed to add customer');
      throw error;
    }
  };

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    try {
      const updateData: any = {};
      if (customer.fullName !== undefined) updateData.full_name = customer.fullName;
      if (customer.address !== undefined) updateData.address = customer.address;
      if (customer.contactNumber !== undefined) updateData.contact_number = customer.contactNumber;
      if (customer.archived !== undefined) {
        updateData.deleted_at = customer.archived ? new Date().toISOString() : null;
      }

      const { error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Customer updated successfully');
      await fetchCustomers();
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
      throw error;
    }
  };

  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      // Insert order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: order.customerId,
          order_type: order.orderType,
          order_date: order.orderDate,
          status: order.status,
          total_cost: order.totalCost,
          interest_rate: order.interestRate || null,
          downpayment: order.downpayment || null,
          daily_payment: order.dailyPayment || null,
          total_collected: order.totalCollected || 0,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = order.items.map(item => ({
        order_id: orderData.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // If installment order, create payment schedule
      if (order.orderType === 'installment' && order.payments) {
        const payments = order.payments.map(payment => ({
          order_id: orderData.id,
          day: payment.day,
          amount: payment.amount,
          paid: payment.paid,
          date_paid: payment.datePaid || null,
          payment_method: payment.paymentMethod || null,
          notes: payment.notes || null,
        }));

        const { error: paymentsError } = await supabase
          .from('payments')
          .insert(payments);

        if (paymentsError) throw paymentsError;
      }

      toast.success('Order created successfully');
      await fetchOrders();
    } catch (error) {
      console.error('Error adding order:', error);
      toast.error('Failed to create order');
      throw error;
    }
  };

  const updateOrder = async (id: string, order: Partial<Order>) => {
    try {
      const updateData: any = {};
      if (order.status !== undefined) updateData.status = order.status;
      if (order.totalCollected !== undefined) updateData.total_collected = order.totalCollected;

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Order updated successfully');
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
      throw error;
    }
  };

  const markPaymentAsPaid = async (orderId: string, day: number, paymentMethod?: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          paid: true,
          date_paid: new Date().toISOString().split('T')[0],
          payment_method: paymentMethod || null,
          notes: notes || null,
        })
        .eq('order_id', orderId)
        .eq('day', day);

      if (error) throw error;

      toast.success('Payment marked as paid');
      await fetchOrders();
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      toast.error('Failed to mark payment as paid');
      throw error;
    }
  };

  const getProductById = (id: string) => products.find(p => p.id === id);
  const getCustomerById = (id: string) => customers.find(c => c.id === id);
  const getOrderById = (id: string) => orders.find(o => o.id === id);

  return (
    <AppContext.Provider
      value={{
        products,
        customers,
        orders,
        loading,
        addProduct,
        updateProduct,
        addCustomer,
        updateCustomer,
        addOrder,
        updateOrder,
        getProductById,
        getCustomerById,
        getOrderById,
        markPaymentAsPaid,
        refreshData,
        loadProducts: fetchProducts,
        loadCustomers: fetchCustomers,
        loadOrders: fetchOrders,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};