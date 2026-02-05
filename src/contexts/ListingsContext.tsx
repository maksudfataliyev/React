import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContext } from '@/features/auth/contexts/AuthProvider';

export type ListingStatus =  'pending_review' | 'approved' | 'rejected' | 'active' | 'sold';

export interface Listing {
  id: string;
  userId: string;
  // UI fields
  name: string;
  category: string;
  // condition can be a UI string or API numeric code
  condition: string | number;
  price: number;
  // optional discounted price (UI) and API field name
  discountedPrice?: number;
  discountPrice?: number;
  description: string;
  images: string[];
  // API fields
  mainImage?: string;
  categoryName?: string;
  isBarterAvailable?: boolean;
  sellerName?: string;
  isInCart?: boolean;
  isInComparison?: boolean;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  weight?: number;
  material?: string;
  color?: string;
  // optional list of selected attribute values (attributeId -> valueId)
  attributes?: { attributeId: string; valueId: string }[];
  acceptsBarter: boolean;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  reviewNote?: string;
}

interface ListingsContextType {
  listings: Listing[];
  addListing: (listing: Omit<Listing, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => Listing;
  getListingsByUser: () => Listing[];
  updateListingStatus: (id: string, status: ListingStatus, note?: string) => void;
}

const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

const LISTINGS_KEY = 'yeni_nefes_listings';

export const ListingsProvider = ({ children }: { children: ReactNode }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const { user } = useContext(AuthContext); 

  useEffect(() => {
    const storedListings = localStorage.getItem(LISTINGS_KEY);
    if (storedListings) {
      try {
        setListings(JSON.parse(storedListings));
      } catch {
        localStorage.removeItem(LISTINGS_KEY);
      }
    }
  }, []);

  const saveListings = (newListings: Listing[]) => {
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(newListings));
    setListings(newListings);
  };

  const addListing = (listingData: Omit<Listing, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>): Listing => {
    // normalize fields so both UI and API names are supported
    // normalize attributes if provided in various shapes
    const rawAttrs = (listingData as any).attributes;
    const normalizedAttributes = Array.isArray(rawAttrs)
      ? rawAttrs.map((a: any) => ({
          attributeId: a.attributeId ?? a.id ?? a.attributeId ?? '',
          valueId: a.valueId ?? a.value ?? a.valueId ?? '',
        })).filter((x: any) => x.attributeId && x.valueId)
      : undefined;
    const newListing: Listing = {
      ...listingData,
      id: crypto.randomUUID(),
      userId: user?.userId || '',
      // prefer UI 'name' but also keep API 'title' if present elsewhere
      name: (listingData as any).name ?? (listingData as any).title ?? '',
      // keep both category and categoryName
      category: (listingData as any).category ?? (listingData as any).categoryName ?? '',
      categoryName: (listingData as any).categoryName ?? (listingData as any).category ?? undefined,
      // map discounted price names
      discountedPrice: (listingData as any).discountedPrice ?? (listingData as any).discountPrice ?? undefined,
      discountPrice: (listingData as any).discountPrice ?? (listingData as any).discountedPrice ?? undefined,
      // map barter flag
      isBarterAvailable: (listingData as any).isBarterAvailable ?? (listingData as any).acceptsBarter ?? false,
      acceptsBarter: (listingData as any).acceptsBarter ?? (listingData as any).isBarterAvailable ?? false,
      mainImage: (listingData as any).mainImage ?? undefined,
      sellerName: (listingData as any).sellerName ?? undefined,
      isInCart: (listingData as any).isInCart ?? false,
      isInComparison: (listingData as any).isInComparison ?? false,
      // assign normalized attributes
      attributes: normalizedAttributes ?? undefined,
      status: 'pending_review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // ensure dimensions object exists
      dimensions: listingData.dimensions ?? { width: 0, height: 0, depth: 0 },
    };
    
    saveListings([...listings, newListing]);
    return newListing;
  };

  const getListingsByUser = (): Listing[] => {
    if (!user) return [];
    return listings
      .filter(listing => listing.userId === user.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const updateListingStatus = (id: string, status: ListingStatus, note?: string) => {
    const updatedListings = listings.map(listing => 
      listing.id === id 
        ? { ...listing, status, reviewNote: note, updatedAt: new Date().toISOString() }
        : listing
    );
    saveListings(updatedListings);
  };

  return (
    <ListingsContext.Provider value={{ listings, addListing, getListingsByUser, updateListingStatus }}>
      {children}
    </ListingsContext.Provider>
  );
};

export const useListings = () => {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error('useListings must be used within a ListingsProvider');
  }
  return context;
};
