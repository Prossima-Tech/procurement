import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Components/layout/Layout';
import Dashboard from './Pages/Dashboard';
import Inventory from './Pages/Inventory';
import Items from './Pages/Items';
import PurchaseOrders from './Pages/PurchaseOrders';
import Reports from './Pages/Reports';
import Settings from './Pages/Settings';
import CreatePO from './Pages/createPO';
import Vendors from './Pages/Vendors';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/items" element={<Items />} />
          <Route path="/create-po" element={<CreatePO />} />
          <Route path="/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/vendors" element={<Vendors />} />
        </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;