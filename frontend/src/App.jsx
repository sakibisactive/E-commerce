import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Components
import { Navbar } from './components/Navbar';

// Storefront Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Wishlist } from './pages/Wishlist';
import { Checkout } from './pages/Checkout';

// Auth Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VerifyEmail } from './pages/VerifyEmail';

// Profile Page
import { Profile } from './pages/Profile';

// Payment Callbacks Redirect pages
import { CheckoutSuccess, CheckoutFail, CheckoutCancel } from './pages/CheckoutRedirects';

// Admin Dashboards
import { AdminDashboard } from './pages/AdminDashboard';

// Protected Route wrapper for Authenticated users
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '80px 0', textAlignment: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Admin Route wrapper
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '80px 0', textAlignment: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

function AppContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flexGrow: 1 }}>
        <Routes>
          {/* Public Views */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Customer Protected Views */}
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* Payment gateways redirection landing pages */}
          <Route path="/checkout/success" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />
          <Route path="/checkout/fail" element={<ProtectedRoute><CheckoutFail /></ProtectedRoute>} />
          <Route path="/checkout/cancel" element={<ProtectedRoute><CheckoutCancel /></ProtectedRoute>} />

          {/* Admin Protected Views */}
          <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
