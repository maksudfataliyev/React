import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import type { Phone, Earbuds, Watch, Case, Headphone, Cable } from './data/products';
import './App.css';
import './locales/i18'
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Header from './components/Header';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

type Product = Phone | Earbuds | Watch | Case | Headphone | Cable;

function App(): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  const addToCart = (product: Product): void => {
    const updatedCart = [...cart, product];
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const isAuthenticated = localStorage.getItem('loggedInUser') !== null;

  const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  const location = useLocation();
  const showHeader = !['/login', '/register'].includes(location.pathname);

  return (
    <>
      {showHeader && <Header cart={cart} />}

      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/products"
          element={
            <PrivateRoute>
              <Products />
            </PrivateRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <PrivateRoute>
              <ProductDetail addToCart={addToCart} />
            </PrivateRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <PrivateRoute>
              <Contact />
            </PrivateRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <Cart cart={cart} setCart={setCart} />
            </PrivateRoute>
          }
        />
      </Routes>
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
