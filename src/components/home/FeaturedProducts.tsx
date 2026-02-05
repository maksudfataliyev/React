import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { useEffect, useState } from 'react';
import { getFilteredProducts } from '@/features/services/product/products.service';
import { apiCallWithManualRefresh } from '@/shared/apiWithManualRefresh';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export const FeaturedProducts = () => {
  const { t, language } = useLanguage() as any;
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res: any = await apiCallWithManualRefresh(() => getFilteredProducts({ lang: language }));
        const items = res?.data?.items ?? res?.items ?? res?.data ?? [];

        if (Array.isArray(items) && items.length > 0) {
          const mapped = items.map((it: any) => ({
            id: it.id ?? String(Math.random()),
            name: it.productTitle ?? it.title ?? it.name ?? '',
            description: it.description ?? '',
            image: it.mainImage ?? it.image ?? (it.images && it.images[0]) ?? '/placeholder.svg',
            images: Array.isArray(it.images) ? it.images : [],
            price: it.price ?? 0,
            discountPrice: (typeof it.discountPrice === 'number') ? it.discountPrice : (it.discountedPrice ?? 0),
            condition: it.condition ?? '',
            dimensions: {
              width: it.width ?? it.dimensions?.width ?? 0,
              height: it.height ?? it.dimensions?.height ?? 0,
              depth: it.depth ?? it.dimensions?.depth ?? 0,
            },
            acceptsBarter: it.isBarterAvailable ?? false,
            seller: it.storeName ?? it.sellerName ?? '',
            category: it.category ?? it.categoryName ?? null,
            isInCart: it.isInCart ?? false,
            isInComparison: it.isInComparison ?? false,
            raw: it,
          }));
          setFeaturedProducts(mapped.slice(0, 4));
        } else {
          // no items returned — show empty list (do not fallback to mock data)
          setFeaturedProducts([]);
        }
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to load featured products', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [language]);

  return (
    <section className="py-20">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            {t.catalog.title}
          </h2>
          <Link to="/catalog">
            <Button variant="ghost" className="gap-2">
              {t.catalog.all}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-card rounded-xl h-56" />
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="py-12 bg-card border border-border rounded-xl text-center">
            <p className="text-lg font-semibold text-foreground mb-2">{t.catalog.noProducts || 'No products found'}</p>
            <p className="text-sm text-muted-foreground mb-4">{t.catalog.noProductsDescription || 'There are no products matching your selection.'}</p>
            <Link to="/catalog">
              <Button variant="outline">{t.catalog.browseCatalog || 'Browse Catalog'}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
