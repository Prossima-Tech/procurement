
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

import { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/external-form" element={<ExternalForm />} />
        <Route path="/internal-form" element={<InternalForm />} />
        <Route
          path="/*"
          element={
            <AuthProvider>
              <ThemeProvider>
                <TokenExpirationChecker>
                  <Routes>
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="unauthorized" element={<UnauthorizedPage />} />
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Layout />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/*"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <Layout />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="manager/*"
                      element={
                        <ProtectedRoute allowedRoles={['manager', 'admin']}>
                          <Layout />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </TokenExpirationChecker>
              </ThemeProvider>
            </AuthProvider>
          }
        />
      </Routes>
    </Router>
  );
}

function TokenExpirationChecker({ children }) {
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokenExpiration = () => {
      const token = localStorage.getItem('token'); // or however you store your token
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('Token payload:', payload); // Debugging line
          if (payload.exp * 1000 < Date.now()) {
            console.log('Token expired, logging out'); // Debugging line
            logout();
          }
        } catch (error) {
          console.error('Error checking token expiration:', error);
          logout();
        }
      }
    };

    const intervalId = setInterval(checkTokenExpiration, 60000); // Check every minute
    checkTokenExpiration(); // Check immediately

    return () => clearInterval(intervalId);
  }, [logout, isAuthenticated]);

  return children;
}

export default App;