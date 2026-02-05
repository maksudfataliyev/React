import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContext } from '@/features/auth/contexts/AuthProvider';
import { getStats } from '@/features/services/Order/Order.service';
import { apiCallWithManualRefresh } from '@/shared/apiWithManualRefresh';

export interface Sale {
  id: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  shippingMethod: string;
  shippingPrice: number;
  total: number;
  // support orders without address
  buyerAddress?: {
    street?: string;
    city?: string;
    addressDetails?: string;
    zipCode?: string;
  };
  // optional fields coming from API summary
  itemsCount?: number;
  revenue?: number;
  profit?: number;
  items?: Array<{
    id: string;
    productId: string;
    title: string;
    price: number;
    effectivePrice?: number;
    quantity: number;
    lineTotal: number;
    images?: string[];
  }>;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: string;
}

interface SalesContextType {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => Sale;
  getSalesByUser: () => Sale[];
  getSalesByPeriod: (period: 'week' | 'month' | 'year') => Sale[];
  updateSaleStatus: (id: string, status: Sale['status']) => void;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

const SALES_KEY = 'yeni_nefes_sales';

export const SalesProvider = ({ children }: { children: ReactNode }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const storedSales = localStorage.getItem(SALES_KEY);
    if (storedSales) {
      try {
        const parsed = JSON.parse(storedSales);
        setSales(parsed);
      } catch {
        localStorage.removeItem(SALES_KEY);
      }
    }
  }, []);

  const saveSales = (newSales: Sale[]) => {
    localStorage.setItem(SALES_KEY, JSON.stringify(newSales));
    setSales(newSales);
  };

  // Fetch sales summary/orders from server and map into Sale[] when user is present
  useEffect(() => {
    let mounted = true;
    if (!user) return;

    (async () => {
      try {
        const resp = await apiCallWithManualRefresh(() => getStats());
        if (!mounted) return;
        // support nested axios response: resp.data.data or resp.data or resp
        const payload = resp?.data?.data ?? resp?.data ?? resp;
        if (!payload?.orders || !Array.isArray(payload.orders)) return;

        const mapped: Sale[] = payload.orders.map((o: any) => {
          const firstItem = o.items && o.items.length ? o.items[0] : null;
          return {
            id: o.id,
            sellerId: user.userId || '',
            buyerId: o.buyer?.id ?? '',
            buyerName: o.buyer?.name ?? '',
            buyerEmail: o.buyer?.email ?? '',
            productId: firstItem?.productId ?? '',
            productName: firstItem?.title ?? '',
            productImage: firstItem?.images?.[0] ?? '',
            productPrice: firstItem?.price ?? 0,
            shippingMethod: '',
            shippingPrice: o.shippingPrice ?? 0,
            total: o.totalAmount ?? o.revenue ?? 0,
            itemsCount: o.itemsCount ?? (Array.isArray(o.items) ? o.items.length : 0),
            revenue: o.revenue ?? (o.totalAmount ?? 0),
            profit: o.profit ?? 0,
            items: Array.isArray(o.items) ? o.items.map((it: any) => ({
              id: it.id,
              productId: it.productId,
              title: it.title,
              price: it.price ?? 0,
              effectivePrice: it.effectivePrice ?? it.price ?? 0,
              quantity: it.quantity ?? 1,
              lineTotal: it.lineTotal ?? ((it.price ?? 0) * (it.quantity ?? 1)),
              images: Array.isArray(it.images) ? it.images : [],
            })) : [],
            status: (o.status as any) ?? 'confirmed',
            createdAt: o.createdAt,
          } as Sale;
        });

        saveSales(mapped);
      } catch (err) {
        // keep existing local sales if fetch fails
        console.error('Failed to load sales from server', err);
      }
    })();

    return () => { mounted = false; };
  }, [user]);

  const addSale = (saleData: Omit<Sale, 'id' | 'createdAt'>): Sale => {
    const newSale: Sale = {
      ...saleData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    } as Sale;

    saveSales([...sales, newSale]);
    return newSale;
  };

  const getSalesByUser = (): Sale[] => {
    if (!user) return [];
    const userSales = sales.filter(sale => sale.sellerId === user.userId);
    return userSales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getSalesByPeriod = (period: 'week' | 'month' | 'year'): Sale[] => {
    if (!user) return [];
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    return sales
      .filter(sale => sale.sellerId === user.userId && new Date(sale.createdAt) >= startDate)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const updateSaleStatus = (id: string, status: Sale['status']) => {
    const updatedSales = sales.map(sale => 
      sale.id === id ? { ...sale, status } : sale
    );
    saveSales(updatedSales);
  };

  return (
    <SalesContext.Provider value={{ sales, addSale, getSalesByUser, getSalesByPeriod, updateSaleStatus }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};
