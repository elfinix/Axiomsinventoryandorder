-- ============================================
-- AXIOMS - Enable Realtime Subscriptions
-- ============================================
-- Run this script in Supabase SQL Editor to enable real-time updates
-- This allows the UI to automatically update when data changes

-- Enable Realtime for Products table
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- Enable Realtime for Orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Enable Realtime for Order Items table
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;

-- Enable Realtime for Payments table
ALTER PUBLICATION supabase_realtime ADD TABLE payments;

-- Enable Realtime for Customers table (helpful for order creation)
ALTER PUBLICATION supabase_realtime ADD TABLE customers;

-- Verify Realtime is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- You should see:
-- customers
-- order_items
-- orders
-- payments
-- products
