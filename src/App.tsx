import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CompareProvider } from "@/contexts/CompareContext";
import AuthProvider from "@/features/auth/contexts/AuthProvider";
import { OrderProvider } from "@/contexts/OrderContext";
import { CartProvider } from "@/contexts/CartContext";
import { ListingsProvider } from "@/contexts/ListingsContext";
import { SalesProvider } from "@/contexts/SalesContext";
import { OffersProvider } from "@/contexts/OffersContext";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import Compare from "./pages/Compare";
import AuthPage from "./pages/Auth";
import Shipping from "./pages/Shipping";
import Checkout from "./pages/Checkout";
import ForgotPassword from "./pages/ForgotPassword";
import Sales from "./pages/Sales";
import NotFound from "./pages/NotFound";
import EmailConfirmed from "./pages/EmailConfirmed";
import EmailSent from "./pages/EmailSent";
import ChatWindow from "./components/ChatWindow";
import { tokenStorage } from "@/shared/tokenStorage";
import { manualRefreshToken } from '@/features/auth/services/auth.service';
import React, { useEffect, useState } from 'react';
import Seller from "./pages/Seller";
import { GoogleOAuthProvider } from '@react-oauth/google';
 
(globalThis as any).manualRefreshToken = manualRefreshToken;

const queryClient = new QueryClient();

const isJwtExpired = (token?: string | null) => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return true;
    // atob may throw for malformed token
    const payload = JSON.parse(decodeURIComponent(escape(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))));
    const exp = payload?.exp;
    if (!exp) return true;
    return Date.now() >= Number(exp) * 1000;
  } catch {
    return true;
  }
};

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      try {
        const tok = tokenStorage.get();
        // tok may be string (access token) or object { accessToken, refreshToken }
        const tokAny = tok as any;
        const access = typeof tok === 'string' ? tok : (tokAny?.accessToken ?? null);
        const refresh = typeof tok === 'string' ? null : (tokAny?.refreshToken ?? null);

        if (access && !isJwtExpired(access)) {
          if (mounted) setAllowed(true);
          return;
        }

        // Try refresh if we have a refresh token
        if (refresh) {
          const resp = await manualRefreshToken(refresh);
          if (resp?.isSuccess) {
            if (mounted) setAllowed(true);
            return;
          }
        }
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setChecking(false);
      }
    };

    void checkAuth();
    return () => { mounted = false; };
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) return null; // or a loader component
  if (!allowed) return <Navigate to="/auth" replace />;
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <LanguageProvider>
        <AuthProvider>
          <OrderProvider>
            <CartProvider>
              <ListingsProvider>
                <SalesProvider>
                  <OffersProvider>
                    <CompareProvider>
                      <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        <BrowserRouter>
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/catalog" element={<Catalog />} />
                            <Route path="/seller/:sellerId" element={<Seller />} />
                            <Route path="/product/:id" element={<ProductDetail />} />
                            <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/compare" element={<Compare />} />
                            <Route path="/auth" element={<AuthPage />} />
                            <Route path="/shipping" element={<Shipping />} />
                            <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                            {/* Removed dedicated complete-registration route; use /auth signup flow instead */}
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/email-confirmation" element={<EmailConfirmed />} />
                            <Route path="/email-sent" element={<EmailSent />} />
                            <Route path="/sales" element={<PrivateRoute><Sales /></PrivateRoute>} />
                            <Route path="/chat/:id" element={<PrivateRoute><ChatWindow /></PrivateRoute>} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </BrowserRouter>
                      </TooltipProvider>
                    </CompareProvider>
                  </OffersProvider>
                </SalesProvider>
              </ListingsProvider>
            </CartProvider>
          </OrderProvider>
        </AuthProvider>
      </LanguageProvider>
    </GoogleOAuthProvider>

  </QueryClientProvider>
);

export default App;
