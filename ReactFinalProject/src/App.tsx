import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import type { Phone, Earbuds, Watch, Case, Headphone, Cable } from './data/products';
import './App.css';
import './locales/i18';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Header from './components/Header';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Footer from './components/Footer';
type Product = Phone | Earbuds | Watch | Case | Headphone | Cable;

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

  return (
    <>
      {showHeader && <Header cart={cart} />}

      <Routes>
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
        <Route path="/products/:id" element={<PrivateRoute><ProductDetail addToCart={addToCart} /></PrivateRoute>} />
        <Route path="/contact" element={<PrivateRoute><Contact /></PrivateRoute>} />
        <Route path="/cart" element={<PrivateRoute><Cart cart={cart} setCart={setCart} /></PrivateRoute>} />
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
