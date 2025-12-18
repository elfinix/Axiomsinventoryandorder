import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { LoadingWrapper } from './components/LoadingWrapper';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from './components/ui/sonner';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { CustomersPage } from './pages/CustomersPage';
import { OrdersPage } from './pages/OrdersPage';
import { CreateCashOrderPage } from './pages/CreateCashOrderPage';
import { CreateInstallmentOrderPage } from './pages/CreateInstallmentOrderPage';
import { InstallmentsPage } from './pages/InstallmentsPage';
import { InstallmentDetailsPage } from './pages/InstallmentDetailsPage';
import { ReportsPage } from './pages/ReportsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <LoadingWrapper>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DashboardPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProductsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <CustomersPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <OrdersPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/create-cash"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <CreateCashOrderPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/create-installment"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <CreateInstallmentOrderPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/installments"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <InstallmentsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/installments/:orderId"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <InstallmentDetailsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ReportsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </LoadingWrapper>
          <Toaster />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}