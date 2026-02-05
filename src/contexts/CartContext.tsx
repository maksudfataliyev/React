import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiCallWithManualRefresh } from '@/shared/apiWithManualRefresh';
import { getCartItems, addItem as apiAddItem, increaseQuantity as apiIncreaseQuantity, decreaseQuantity as apiDecreaseQuantity, removeItem as apiRemoveItem } from '@/features/services/Cart/Cart.service';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export interface CartItem {
  id: string;
  // productId is the underlying product's id when server returns a cart row
  productId?: string;
  // available stock for this cart row (if provided by server)
  inStock?: number;
  name: string;
  price: number;
  // originalPrice if product had a non-zero discountPrice
  originalPrice?: number;
  discountPrice?: number;
  image: string;
  category: string;
  condition: string;
  dimensions: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { language } = useLanguage();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const normalize = (raw: any): CartItem => {
    // API shape example:
    // { id, cartItemId, cart_item_id, product: { id, title, price, images: [...] , categoryName }, quantity }
    const id = raw?.id ?? raw?.cartItemId ?? raw?.cart_item_id ?? raw?.product?.id ?? '';
    const product = raw?.product ?? {};
    const productId = product?.id ?? raw?.productId ?? raw?.product_id ?? null;
    const name = product?.title ?? product?.name ?? '';
    // preserve original price and discount price if present
    const originalPrice = Number(product?.price ?? raw?.price ?? 0) || 0;
    const discountPriceRaw = product?.discountPrice ?? product?.discount_price ?? raw?.discountPrice ?? raw?.discount_price ?? null;
    const discountPrice = discountPriceRaw != null ? (Number(discountPriceRaw) || 0) : 0;
    const price = discountPrice > 0 ? discountPrice : originalPrice;
    const images = Array.isArray(product?.images) ? product.images : [];
    const image = images[0] ?? product?.mainImage ?? product?.image ?? '/placeholder.svg';
    const category = product?.categoryName ?? product?.category ?? '';
    const condition = product?.condition ?? raw?.condition ?? '';
    const dimensions = '';
    const quantity = Number(raw?.quantity ?? raw?.qty ?? 1) || 1;
    const inStock = Number(product?.inStock ?? product?.in_stock ?? raw?.inStock ?? raw?.stock ?? 0) || 0;
    return { id: String(id), productId: productId ? String(productId) : undefined, inStock, name, price, originalPrice: originalPrice || undefined, discountPrice: discountPrice || undefined, image, category, condition, dimensions, quantity };
  };

  const loadCartFromServer = async () => {
    setLoading(true);
    try {
      // pass current language so server can return translated fields
      const res = await apiCallWithManualRefresh(() => getCartItems(language));
      console.log('[CartContext] load cart response', res);
      const data = res?.data?.data ?? res?.data ?? res ?? [];
      const itemsArray = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
      const mapped = itemsArray.map(normalize);
      setItems(mapped);
    } catch (e) {
      // Suppressed user-facing toast here (per request). Keep a debug log for diagnostics.
      console.debug('[CartContext] failed to load cart from server', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCartFromServer();
  }, [language]);

  

  const applyResponseToItems = (res: any): boolean => {
    if (!res) return false;
    const data = res?.data?.data ?? res?.data ?? res?.data?.items ?? res?.items ?? res;
    const arr = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : null);
    if (Array.isArray(arr)) {
      setItems(arr.map(normalize));
      return true;
    }
    return false;
  };

  const addToCart = async (item: CartItem) => {
    try {
      const res = await apiCallWithManualRefresh(() => apiAddItem(String(item.id)));
      // if server returned updated items array, use it; otherwise update locally
      if (!applyResponseToItems(res)) {
        setItems(prev => {
          const exists = prev.find(i => i.id === item.id || i.productId === item.id || (i.productId && i.productId === String(item.id)));
          if (!exists) return [...prev, item];
          return prev.map(i => i.id === item.id || i.productId === item.id ? { ...i, quantity: (i.quantity ?? 1) + (item.quantity ?? 1) } : i);
        });
        // try to refresh from server to get translated fields
        void loadCartFromServer();
      }
    } catch (e) {
      console.error('[CartContext] addToCart error', e);
      toast({ title: 'Error', description: 'Failed to add to cart', variant: 'destructive' });
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const res = await apiCallWithManualRefresh(() => apiRemoveItem(String(productId)));
      if (!applyResponseToItems(res)) {
        // if server didn't return full list, just remove locally
        setItems(prev => prev.filter(i => i.id !== productId && i.productId !== productId));
        void loadCartFromServer();
      }
    } catch (e) {
      console.error('[CartContext] removeFromCart error', e);
      toast({ title: 'Error', description: 'Failed to remove item', variant: 'destructive' });
    }
  };

  const clearCart = async () => {
    try {
      // No dedicated clear endpoint; attempt to remove items one by one and clear local state
      const resArr = await Promise.all(items.map(i => apiCallWithManualRefresh(() => apiRemoveItem(String(i.id)))));
      // if any response returned an array, prefer last
      for (const r of resArr) {
        if (applyResponseToItems(r)) return;
      }
      setItems([]);
      // attempt to re-fetch translated cart (likely empty)
      void loadCartFromServer();
    } catch (e) {
      console.error('[CartContext] clearCart error', e);
      toast({ title: 'Error', description: 'Failed to clear cart', variant: 'destructive' });
    }
  };

  const increaseQuantity = async (id: string) => {
    try {
      // id here is the cart item id (cart row id)
      const res = await apiCallWithManualRefresh(() => apiIncreaseQuantity(String(id)));
      if (!applyResponseToItems(res)) {
        setItems(prev => prev.map(i => i.id === id || i.productId === id ? { ...i, quantity: (i.quantity ?? 1) + 1 } : i));
        void loadCartFromServer();
      }
    } catch (e) {
      console.error('[CartContext] increaseQuantity error', e);
      toast({ title: 'Error', description: 'Failed to increase quantity', variant: 'destructive' });
    }
  };

  const decreaseQuantity = async (id: string) => {
    try {
      const res = await apiCallWithManualRefresh(() => apiDecreaseQuantity(String(id)));
      if (!applyResponseToItems(res)) {
        setItems(prev => prev.map(i => i.id === id || i.productId === id ? { ...i, quantity: Math.max(0, (i.quantity ?? 1) - 1) } : i).filter(i => i.quantity && i.quantity > 0));
        void loadCartFromServer();
      }
    } catch (e) {
      console.error('[CartContext] decreaseQuantity error', e);
      toast({ title: 'Error', description: 'Failed to decrease quantity', variant: 'destructive' });
    }
  };

  const itemCount = items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
  const total = items.reduce((sum, item) => sum + ((item.price ?? 0) * (item.quantity ?? 1)), 0);

  // Exposed helper to allow consumers to trigger a reload on demand
  const refreshCart = async () => {
    await loadCartFromServer();
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, itemCount, total, increaseQuantity, decreaseQuantity, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
