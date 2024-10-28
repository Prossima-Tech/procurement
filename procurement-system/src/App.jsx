
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
              </ThemeProvider>
            </AuthProvider>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;