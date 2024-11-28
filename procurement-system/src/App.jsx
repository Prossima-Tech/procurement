import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/authentication/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginPage from './components/authentication/Login';
import RegisterPage from './components/authentication/Register';
import UnauthorizedPage from './components/authentication/Unauthorized';
import ExternalForm from './components/orders/ExternalForm';
import InternalForm from './components/orders/InternalForm';
import ManagerDashboard from './components/Manager/ManagerDashboard';
import { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import VendorRegistration from './components/authentication/VendorRegistration';
import VendorDashboard from './components/VendorPortal/VendorDashboard';
import ExternalVendorQuoteForm from './components/Rfq/ExternalVendorQuoteForm';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <TokenExpirationChecker>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/external-form" element={<ExternalForm />} />
              <Route path="/internal-form" element={<InternalForm />} />
              <Route path="/vendor-registration" element={<VendorRegistration />} />
              <Route path="/vendor-quote/:vendorId/:rfqId" element={<ExternalVendorQuoteForm />} />
              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <RoleBasedComponent />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </TokenExpirationChecker>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

// New component to render different components based on user role
function RoleBasedComponent() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'admin':
      return <Layout />;
    case 'manager':
      return <ManagerDashboard />;
    case 'employee':
      return <InternalForm />;
    case 'vendor':
      return <VendorDashboard />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
}

function TokenExpirationChecker({ children }) {
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokenExpiration = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp * 1000 < Date.now()) {
            logout();
          }
        } catch (error) {
          console.error('Error checking token expiration:', error);
          logout();
        }
      }
    };

    const intervalId = setInterval(checkTokenExpiration, 60000);
    checkTokenExpiration();

    return () => clearInterval(intervalId);
  }, [logout, isAuthenticated]);

  return children;
}

export default App;