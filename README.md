# AXIOMS - Accelerated Inventory and Order Management System

A comprehensive web-based inventory and order management system designed for VanBrothers Merchandise, a small physical merchandise shop.

## 📋 Overview

AXIOMS is a single-admin prototype application that enables efficient recording and management of products, customers, orders, and installment payments for physical store transactions. The system focuses on transaction recording rather than online payment processing - all payments are handled physically in-store.

## 🏗️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4.0
- **UI Components**: shadcn/ui component library
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: Supabase Auth with email/password
- **Routing**: React Router v6
- **State Management**: React Context API
- **PDF Generation**: jsPDF with jsPDF-AutoTable
- **Notifications**: Sonner toast library
- **Icons**: Lucide React

## 🗂️ Project Structure

```
/src
├── /app
│   ├── /components
│   │   ├── /ui              # shadcn/ui components (button, card, table, etc.)
│   │   ├── /figma           # Figma-specific components
│   │   ├── Layout.tsx       # Main app layout with sidebar navigation
│   │   ├── LoadingWrapper.tsx
│   │   └── ProtectedRoute.tsx
│   ├── /context
│   │   ├── AppContext.tsx   # Global state management for products, customers, orders
│   │   └── AuthContext.tsx  # Authentication state and session management
│   ├── /pages
│   │   ├── DashboardPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── CustomersPage.tsx
│   │   ├── OrdersPage.tsx
│   │   ├── CreateCashOrderPage.tsx
│   │   ├── CreateInstallmentOrderPage.tsx
│   │   ├── InstallmentsPage.tsx
│   │   ├── InstallmentDetailsPage.tsx
│   │   ├── ReportsPage.tsx
│   │   └── LoginPage.tsx
│   └── App.tsx              # Root component with routing
├── /lib
│   ├── supabaseClient.ts    # Supabase initialization
│   ├── supabaseHelpers.ts   # Database CRUD operations
│   └── supabaseTypes.ts     # TypeScript type definitions
└── /styles
    ├── index.css
    ├── tailwind.css
    ├── theme.css
    └── fonts.css
```

## ✨ Core Features

### 1. **Authentication**
- Secure email/password authentication via Supabase Auth
- Session management with automatic token refresh
- Protected routes that redirect to login when unauthenticated
- Persistent sessions across page refreshes

### 2. **Dashboard**
- Real-time business metrics and KPIs
- Dynamic trend calculations comparing last 30 days vs previous 30 days
- Visual trend indicators (arrows and percentages)
- Quick stats: Total Products, Customers, Orders, Active Installments
- Recent order activity feed
- Quick action buttons for creating new orders

### 3. **Product Management**
- Full CRUD operations (Create, Read, Update, Archive)
- 4-digit product codes (PRD0001, PRD0002, etc.)
- Automatic ID generation (dual-layer: frontend + database triggers)
- Search functionality by product name or code
- Stock tracking with low-stock indicators
- Product archiving (soft delete)
- Refresh button to sync latest data

### 4. **Customer Management**
- Complete customer database
- Sequential customer IDs (CUST0001, CUST0002, etc.)
- Contact information storage (phone, address)
- Search functionality by name or customer ID
- Customer archiving capability
- Refresh button to sync latest data

### 5. **Order Management**

#### Cash Orders
- Single-step order creation
- Multi-product selection with quantities
- Automatic total calculation
- Order status tracking (active, completed, cancelled)
- Order expansion to view itemized details

#### Installment Orders
- Fixed installment rules:
  - Admin-configurable interest percentage
  - Fixed 2% downpayment
  - 50-day payment duration
- Automatic calculations:
  - Downpayment amount
  - Daily payment amount
  - Total cost with interest
- Manual payment tracking by admin
- Payment history with dates and amounts
- Progress indicators and remaining balance display

### 6. **Installment Payment Tracking**
- Dedicated installment management page
- Payment recording with date stamps
- Automatic balance recalculation
- Payment history timeline
- Status indicators (active, completed)
- Detailed view of each installment plan

### 7. **Reports & Analytics**

#### Product Inventory Report
- Complete product listing with prices and stock levels
- Low stock item identification
- Total inventory value calculation
- PDF export capability

#### Sales Summary Report
- All orders overview (cash and installment)
- Customer and product details per order
- Date-based organization
- Order type filtering
- PDF export capability

#### Installment Payment Summary
- All installment orders tracking
- Total collected vs outstanding balance
- Payment progress per order
- PDF export capability

### 8. **PDF Export Features**
- Professional PDF formatting with consistent fonts (Helvetica)
- Company branding (AXIOMS - VanBrothers Merchandise)
- Auto-generated dates
- Structured tables with proper styling
- Summary statistics on each report
- Downloadable files with descriptive names

## 🔐 Database Schema

### Tables

#### `products`
- `id` (UUID, primary key)
- `item_code` (text, unique, e.g., "PRD0001")
- `item_name` (text)
- `price` (numeric)
- `stock` (integer)
- `archived` (boolean, default false)
- `created_at` (timestamp)

#### `customers`
- `id` (UUID, primary key)
- `customer_id` (text, unique, e.g., "CUST0001")
- `full_name` (text)
- `phone` (text)
- `address` (text)
- `archived` (boolean, default false)
- `created_at` (timestamp)

#### `orders`
- `id` (UUID, primary key)
- `customer_id` (UUID, foreign key → customers)
- `order_type` (text: 'cash' | 'installment')
- `order_date` (text)
- `total_cost` (numeric)
- `status` (text: 'active' | 'completed' | 'cancelled')
- `items` (jsonb array) - stores product details
- `interest_rate` (numeric, for installments)
- `total_collected` (numeric, for installments)
- `created_at` (timestamp)

#### `payments`
- `id` (UUID, primary key)
- `order_id` (UUID, foreign key → orders)
- `payment_date` (text)
- `amount` (numeric)
- `created_at` (timestamp)

### Database Triggers
- Automatic ID generation for products (PRD0001, PRD0002, ...)
- Automatic ID generation for customers (CUST0001, CUST0002, ...)
- Sequential number assignment with zero-padding

## 🎨 UI/UX Features

### Design System
- Modern gradient themes
- Consistent color palette
- Professional card-based layouts
- Responsive design (desktop and mobile)
- Hover effects and transitions
- Icon-based visual hierarchy (Lucide icons)

### User Experience
- Toast notifications for all actions (success/error feedback)
- Loading states with spinners
- Search and filter capabilities
- Expandable table rows for detailed views
- Tabbed interfaces for data organization
- Refresh buttons on all list pages
- Empty states with helpful messaging
- Confirmation dialogs for destructive actions

### Accessibility
- Semantic HTML structure
- Proper form labels
- Keyboard navigation support
- Clear visual feedback
- Descriptive button titles

## 🚀 Key Functionalities

### Automatic ID Generation
- **Dual-layer approach**: Frontend JavaScript + PostgreSQL triggers
- **Product codes**: PRD0001, PRD0002, PRD0003...
- **Customer IDs**: CUST0001, CUST0002, CUST0003...
- **Order IDs**: UUID-based with readable truncated display
- **Sequential numbering**: Automatic increment with zero-padding

### Multi-Product Orders
- Add multiple products to a single order
- Individual quantity selection per product
- Real-time subtotal calculation
- Product name and price stored in order (prevents data loss if product is archived)

### Installment Calculations
```
Principal = Order Total
Interest Amount = Principal × (Interest Rate / 100)
Total with Interest = Principal + Interest Amount
Downpayment = Total with Interest × 0.02
Amount After Downpayment = Total with Interest - Downpayment
Daily Payment = Amount After Downpayment / 50
```

### Data Persistence
- All data stored in Supabase PostgreSQL
- Real-time sync with manual refresh buttons
- Optimistic UI updates with error rollback
- Session persistence across page reloads

### Trend Analytics
- Time-based comparison (30-day periods)
- Automatic percentage calculation
- Dynamic trend direction (up/down arrows)
- Color-coded indicators (green for growth, red for decline)

## 📊 Reporting Capabilities

### 1. Product Inventory Report
- Lists all active (non-archived) products
- Shows: Item Code, Name, Price, Stock, Status
- Identifies low stock items (< 10 units)
- Calculates total inventory value
- Exports to PDF with timestamp

### 2. Sales Summary Report
- All non-cancelled orders
- Shows: Order ID, Customer, Products, Type, Date, Amount
- Breaks down by cash vs installment
- Displays total sales figures
- Exports to PDF with detailed table

### 3. Installment Payment Summary
- All installment orders
- Shows: Order ID, Customer, Products, Total Cost, Collected, Remaining, Status
- Tracks payment progress
- Calculates outstanding balances
- Exports to PDF with payment details

## 🔄 State Management

### AppContext
Manages global application state:
- `products`: Array of all products
- `customers`: Array of all customers
- `orders`: Array of all orders
- `loading`: Loading state boolean
- CRUD functions for each entity
- Individual load functions (`loadProducts`, `loadCustomers`, `loadOrders`)

### AuthContext
Manages authentication state:
- `user`: Current authenticated user
- `session`: Supabase session object
- `loading`: Auth loading state
- `signIn`: Email/password login
- `signOut`: Logout function
- Automatic session restoration

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+ and npm/yarn
- Supabase account and project
- Email configured in Supabase Auth

### Environment Variables
Create a `.env` file:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup
1. Create the four tables (products, customers, orders, payments)
2. Run the auto-ID generation SQL triggers
3. Set up proper Row Level Security (RLS) policies
4. Enable email authentication in Supabase Auth settings

### Running the Application
```bash
npm install
npm run dev
```

## 🔒 Security Features

- Email/password authentication required for all pages
- Protected routes with automatic redirect
- Session-based authorization
- Supabase Row Level Security policies
- No sensitive data in frontend code
- Secure credential storage in Supabase

## 📝 Notes

- **Single Admin System**: Designed for one administrator user
- **No Online Payments**: All payment processing happens physically in-store
- **Transaction Recording Only**: System records what happened, doesn't process transactions
- **Installment Rules**: Fixed at 2% downpayment, 50-day duration, admin-set interest rate
- **No Email Notifications**: System doesn't send emails to customers
- **Manual Payment Tracking**: Admin manually marks payments as received

## 🎯 Use Cases

1. **Store Owner**: Track inventory, customers, and sales in one place
2. **Order Processing**: Quick cash order creation at point of sale
3. **Installment Plans**: Set up payment plans with automatic calculations
4. **Payment Collection**: Track installment payments as customers pay
5. **Business Reporting**: Generate PDF reports for accounting/analysis
6. **Inventory Management**: Monitor stock levels and prevent stockouts
7. **Customer Database**: Maintain customer contact information
8. **Sales Analytics**: Review business trends and performance metrics

## 📄 License

This project uses components from [shadcn/ui](https://ui.shadcn.com/) under the [MIT License](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md).

---

**AXIOMS** - Simplifying inventory and order management for small businesses.
