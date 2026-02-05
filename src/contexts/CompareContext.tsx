import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import * as compareService from '../features/services/Comparison/Comparison.service';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiCallWithManualRefresh } from '@/shared/apiWithManualRefresh';

export interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  images?: string[];
  // nested category object (id + name) — kept for display and filtering
  category: {
    id: string;
    name: string;
  } | string;
  // flat helpers (optional)
  categoryId?: string;
  categoryName?: string;
  condition: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  weight?: number;
  material?: string;
  color?: string;
  seller: string;
  description: string;
  acceptsBarter: boolean;
  isInCart?: boolean;
  isInComparison?: boolean;
}

interface CompareContextType {
  compareList: Product[];
  addToCompare: (product: Product) => Promise<void>;
  removeFromCompare: (productId: string) => Promise<void>;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [compareList, setCompareList] = useState<Product[]>([]);
  const { language } = useLanguage() as any;

  // normalize server item into Product
  const normalizeServerItem = (raw: any): Product => {
    // API uses productId, title, mainImage, images, width/height/depth, isBarterAvailable, condition (number), attributes
    const id = raw.productId ?? raw.id ?? raw.product?.productId ?? String(raw.productId ?? raw.id ?? raw.product?.productId ?? '');
    const name = raw.title ?? raw.name ?? raw.product?.title ?? raw.product?.name ?? '';
    const image = raw.mainImage ?? raw.mainImageUrl ?? raw.image ?? (Array.isArray(raw.images) ? raw.images[0] : undefined) ?? '';
    const price = raw.price ?? raw.product?.price ?? raw.discountPrice ?? 0;
    const width = raw.width ?? raw.dimensions?.width ?? raw.product?.width ?? 0;
    const height = raw.height ?? raw.dimensions?.height ?? raw.product?.height ?? 0;
    const depth = raw.depth ?? raw.dimensions?.depth ?? raw.product?.depth ?? 0;
    const acceptsBarter = raw.isBarterAvailable ?? raw.acceptsBarter ?? raw.product?.acceptsBarter ?? false;
    const conditionNum = raw.condition ?? raw.product?.condition ?? null;
    const conditionMapNumeric: Record<number, string> = { 1: 'new', 2: 'likeNew', 3: 'good', 4: 'fair' };
    const condition = typeof conditionNum === 'number' ? (conditionMapNumeric[conditionNum] ?? 'good') : (raw.condition ?? raw.product?.condition ?? 'good');
    const categoryName = raw.categoryName ?? raw.product?.categoryName ?? (raw.category && (raw.category.categoryName ?? raw.category.name)) ?? 'Uncategorized';
    const seller = raw.seller ?? raw.product?.seller ?? raw.ownerName ?? '';

    // attributes extraction for material/color
    const attrs = raw.attributes ?? raw.product?.attributes ?? [];
    const getAttrValue = (arr: any[] | undefined, keywords: string[]) => {
      if (!Array.isArray(arr)) return undefined;
      const lowKeys = keywords.map(k => k.toLowerCase());
      const found = arr.find((a: any) => {
        const an = String(a.attributeName ?? a.attributeNameEn ?? a.attributeNameRu ?? '').toLowerCase();
        return lowKeys.some(k => an.includes(k));
      });
      if (!found) return undefined;
      return found.value ?? found.valueEn ?? found.valueRu ?? undefined;
    };
    const color = getAttrValue(attrs, ['color', 'цвет']);
    const material = getAttrValue(attrs, ['material', 'материал', 'wood', 'metal', 'дерев', 'древес']);

    return {
      id,
      name,
      image,
      images: raw.images ?? raw.product?.images ?? [],
      price,
      discountPrice: raw.discountPrice ?? raw.product?.discountPrice,
      category: categoryName,
      categoryName,
      condition,
      dimensions: { width, height, depth },
      weight: raw.weight ?? raw.product?.weight,
      material,
      color,
      seller,
      description: raw.description ?? raw.product?.description ?? '',
      acceptsBarter,
      isInCart: false,
      isInComparison: true,
    };
  };

  async function loadCompareFromServer() {
    try {
      console.log('[CompareContext] loading compare from server');
      const res = await apiCallWithManualRefresh(() => compareService.getComparisonItems(language));

      console.log('[CompareContext] load compare response', res);
      const payload = res?.data?.data ?? res?.data ?? res;
      const items: Product[] = [];

      // payload may be category-wrapped or flat array
      if (Array.isArray(payload)) {
        // if category grouping returned
        for (const cat of payload) {
          const catName = cat.categoryName ?? cat.category ?? 'Uncategorized';
          if (Array.isArray(cat.items)) {
            for (const it of cat.items) {
              const normalized = normalizeServerItem({ ...it, categoryName: catName });
              items.push(normalized);
            }
          } else if (Array.isArray(cat)) {
            for (const it of cat) {
              items.push(normalizeServerItem(it));
            }
          }
        }
      }
      // dedupe by id in case server returns same product multiple times across categories
      const dedupedById: Record<string, Product> = {};
      for (const it of items) {
        dedupedById[String(it.id)] = it;
      }
      const uniqueItems = Object.values(dedupedById);
      console.debug('[CompareContext] fetched items', { rawCount: items.length, uniqueCount: uniqueItems.length });
      setCompareList(uniqueItems);
    } catch (e) {
      // fallback: keep local list
      console.warn('[CompareContext] load compare failed', e);
    }
  }

  useEffect(() => {
    // Only load from server on initial mount, not after every clear
    // void loadCompareFromServer();
  }, [language]);

  const addToCompare = async (product: Product) => {
    try {
      if (isInCompare(product.id)) return;
      console.log('[CompareContext] adding to compare', product);
      const res = await apiCallWithManualRefresh(() => compareService.addItem(product.id));
      // if success, optimistically add (server returns updated list in some implementations)
      if (res && (res.data?.data || res.data)) {
        // try to reload from server
        await loadCompareFromServer();
        return;
      }
      setCompareList(prev => [...prev, product]);
    } catch (e) {
      console.warn('[CompareContext] add failed', e);
    }
  };

  const removeFromCompare = async (productId: string) => {
    // optimistic update
    const prev = compareList;
    setCompareList(prev => prev.filter(p => p.id !== productId));
    try {
      const res = await apiCallWithManualRefresh(() => compareService.removeItem(productId));
      if (res && (res.data?.data || res.data)) {
        // server returned updated list or success: reload authoritative state
        await loadCompareFromServer();
        return;
      }
      // if no response data, keep optimistic state
    } catch (e) {
      console.warn('[CompareContext] remove failed, restoring previous state', e);
      // restore previous state on failure
      setCompareList(prev);
    }
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (productId: string) => {
    return compareList.some(p => p.id === productId);
  };

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
