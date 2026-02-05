import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/products/ProductCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiCallWithManualRefresh } from '@/shared/apiWithManualRefresh';
import { getProfileWithProducts } from '@/features/services/ProfileServices/profile.service';

const PAGE_SIZE = 12;

export const Seller = () => {
  const { sellerId } = useParams();
  const { language, t } = useLanguage();
  const [seller, setSeller] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSeller = async () => {
      if (!sellerId) return;
      setIsLoading(true);
      try {
        // prefer unified endpoint that returns profile + products
        const resp = await apiCallWithManualRefresh(() => getProfileWithProducts(String(sellerId)));
        const payload = resp?.data ?? resp ?? {};
        const profile = payload?.profile ?? payload?.data?.profile ?? null;
        const productsList = payload?.products ?? payload?.data?.products ?? [];
        setSeller(profile);
        const list = Array.isArray(productsList) ? productsList : [];
        setProducts(list);
        setTotalPages(Math.max(1, Math.ceil(list.length / PAGE_SIZE)));
      } catch (err) {
        console.error('[Seller] failed to fetch seller info', err);
        setSeller(null);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchSeller();
  }, [sellerId]);

  // paginate products client-side (products array is set by getProfileWithProducts)
  const displayedProducts = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!sellerId) {
    return (
      <Layout>
        <div className="container-custom py-8">
          <p className="text-destructive">Seller id not provided</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-8">
        <div className="flex items-center gap-6 mb-6">
          <Avatar className="h-20 w-20 border">
            <AvatarImage src={seller?.profileImage ?? seller?.image ?? '/placeholder.svg'} alt={seller?.name ?? seller?.username} />
            <AvatarFallback>{(seller?.name ?? seller?.username ?? 'S').charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold">
              {`${seller?.name ?? seller?.username ?? 'Seller'}${seller?.surname ? ' ' + seller.surname : ''}`}
            </h1>
            {seller?.bio && <p className="text-sm text-muted-foreground">{seller.bio}</p>}

            <div className="mt-2 flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary">{t?.dashboard?.seller || 'Seller'}</Badge>
              {seller?.city && (
                <span className="text-sm text-muted-foreground">{seller.city}{seller?.zipCode ? `, ${seller.zipCode}` : ''}</span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
              {seller?.email && (
                <div>
                  <div className="text-foreground font-medium">{(t.seller as any)?.emailLabel ?? t.auth?.email ?? 'Email'}</div>
                  <div>{seller.email}</div>
                </div>
              )}

              {seller?.phoneNumber && (
                <div>
                  <div className="text-foreground font-medium">{(t.seller as any)?.phoneLabel ?? t.auth?.phone ?? 'Phone'}</div>
                  <div>{seller.phoneNumber}</div>
                </div>
              )}

              {seller?.street && (
                <div>
                  <div className="text-foreground font-medium">{t.upload?.street ?? 'Street'}</div>
                  <div>{seller.street}</div>
                </div>
              )}

              {seller?.addressDetails && (
                <div>
                  <div className="text-foreground font-medium">{t.checkout?.addressDetails ?? 'Address details'}</div>
                  <div>{seller.addressDetails}</div>
                </div>
              )}

              <div>
                <div className="text-foreground font-medium">{t.dashboard?.memberSince ?? 'Joined'}</div>
                <div>{seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString() : '-'}</div>
              </div>
            </div>
          </div>
          <div className="ml-auto">
            <Link to="/chat/new" state={{ sellerId }}>
              <Button>{t.product?.contactSeller ?? 'Contact'}</Button>
            </Link>
          </div>
        </div>

        <h2 className="font-semibold text-lg mb-4">{t?.dashboard?.listings ?? 'Listings'}</h2>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">{(t.common as any)?.loading ?? 'Loading...'}</p>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <p className="text-muted-foreground">{t.catalog?.noProducts ?? 'No products found'}</p>
            <Link to="/catalog">
              <Button variant="outline" className="mt-4">{t.compare?.browseCatalog ?? 'Browse Catalog'}</Button>
            </Link>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedProducts.map((p: any) => (
                <ProductCard key={p.id ?? p.productId} product={p} />
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">{`Page ${page} of ${totalPages}`}</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setPage((s) => Math.max(1, s - 1))} disabled={page <= 1}>{(t.pagination as any)?.prev ?? 'Prev'}</Button>
                <Button variant="outline" onClick={() => setPage((s) => s + 1)} disabled={page >= totalPages}>{(t.pagination as any)?.next ?? 'Next'}</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Seller;
