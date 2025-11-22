import '../src/index.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect, type JSX } from 'react';
import './App.css';
import './locales/i18';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Account from './pages/Account';
import Header from './components/Header';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import OrderHistory from './pages/OrderHistory';
import Footer from './components/Footer';
import { applyTheme } from './components/theme';
import type { Product } from './components/productsService';

function App(): JSX.Element {
  const username = localStorage.getItem('loggedInUser');

  const [cart, setCart] = useState<Product[]>(() => {
    try {
      const stored = username ? localStorage.getItem(`cart_${username}`) : null;
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addToCart = (product: Product): void => {
    const updatedCart = [...cart, product];
    setCart(updatedCart);
    if (username) {
      localStorage.setItem(`cart_${username}`, JSON.stringify(updatedCart));
    }
  };

  const isAuthenticated = username !== null;

  const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  const location = useLocation();
  const showHeader = !['/login', '/register'].includes(location.pathname);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    applyTheme(savedTheme);
  }, []);

  return (
    <>
      {showHeader && <Header cart={cart} />}
      
      <Routes>
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
        <Route path="/products/:id" element={<PrivateRoute><ProductDetail addToCart={addToCart} /></PrivateRoute>} />
        <Route path="/cart" element={<PrivateRoute><Cart cart={cart} setCart={setCart} /></PrivateRoute>} />
        <Route path="/account" element={<PrivateRoute><Account /></PrivateRoute>} />
        <Route path="/order-history" element={<OrderHistory />} />
      </Routes>

      {showHeader && <Footer />}
    </>
  );
}

export default function WrappedApp(): JSX.Element {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}