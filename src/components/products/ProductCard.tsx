import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, RefreshCw, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product, useCompare } from '@/contexts/CompareContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiCallWithManualRefresh } from '@/shared/apiWithManualRefresh';
import { cn } from '@/lib/utils';
import { AuthContext } from '@/features/auth/contexts/AuthProvider';
import { toast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

const getConditionLabel = (condition: string | number, t: ReturnType<typeof useLanguage>['t']) => {
  // support both string codes and numeric codes from API
  const conditionMapString: Record<string, string> = {
    new: t.catalog.new,
    likeNew: t.catalog.likeNew,
    good: t.catalog.good,
    fair: t.catalog.fair,
  };

  const conditionMapNumber: Record<number, string> = {
    1: t.catalog.new,
    2: t.catalog.likeNew,
    3: t.catalog.good,
    4: t.catalog.fair,
  };

  if (typeof condition === 'number') return conditionMapNumber[condition] ?? String(condition);
  return conditionMapString[condition] || condition;
};

const getCategoryLabel = (category: any, t: ReturnType<typeof useLanguage>['t']) => {
  if (!category) return '';
  if (typeof category === 'object') return String(category.name ?? category.categoryName ?? '');
  // if it's a string key (category id or slug), try localized labels otherwise return as-is
  return t.catalog.categories?.[category as keyof typeof t.catalog.categories] || String(category);
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { t } = useLanguage();
  const inCompare = isInCompare(product.id);

  const { isAuthenticated } = useContext(AuthContext);

  const sellerId = (product as any).sellerId ?? (product as any).storeId ?? (product as any).userId ?? (product as any).seller?.id ?? null;
  const inStock = Number((product as any).inStock ?? (product as any).stock ?? (product as any).quantity ?? 0);

  // prefer API field names, fall back to existing UI fields
  const name = (product as any).productTitle ?? (product as any).title ?? product.name ?? '';
  const image = (product as any).mainImage ?? product.image ?? ((product as any).images && (product as any).images[0]) ?? '/placeholder.svg';
  const rawPrice = (product as any).price ?? product.price ?? 0;
  const discountPrice = (product as any).discountPrice ?? (product as any).discountedPrice ?? 0;
  const displayPrice = (discountPrice && discountPrice > 0) ? discountPrice : rawPrice;
  const acceptsBarter = (product as any).isBarterAvailable ?? product.acceptsBarter ?? false;
  const seller = (product as any).seller ?? (product as any).storeName ?? (product as any).sellerName ?? '';
  const categoryLabel = getCategoryLabel((product as any).category ?? product.category, t);
  const conditionLabel = getConditionLabel((product as any).condition ?? product.condition ?? '', t);

  // dimensions may be nested or top-level
  const width = (product as any).dimensions?.width ?? (product as any).width ?? 0;
  const height = (product as any).dimensions?.height ?? (product as any).height ?? 0;
  const depth = (product as any).dimensions?.depth ?? (product as any).depth ?? 0;

  const handleCompareClick = async (e: React.MouseEvent) => {
    // Prevent Link navigation and stop propagation to parent elements
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({ title: 'Login Required', description: 'Please login to compare' });
      navigate('/auth');
      return;
    }
    try {
      if (inCompare) {
        await removeFromCompare(product.id);
      } else {
        await addToCompare(product);
      }
    } catch (err) {
      console.warn('[ProductCard] compare toggle failed', err);
    }
  };

  return (
    <Link to={`/product/${product.id}`}>
      <div className="group bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-strong transition-all duration-300 hover:-translate-y-1 border border-border">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
              {categoryLabel}
            </Badge>
            {acceptsBarter && (
              <Badge className={cn(acceptsBarter ? 'bg-sage text-sage-dark' : 'bg-muted text-muted-foreground')}>
                <>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  {t?.product?.barterLabel || 'Barter'}
                </>
              </Badge>
            )}
          </div>

          <Button
            size="icon"
            variant={inCompare ? "default" : "secondary"}
            className={cn(
              "absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity",
              inCompare && "opacity-100"
            )}
            onClick={handleCompareClick}
          >
            {inCompare ? <Check className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
          </Button>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display font-semibold text-foreground line-clamp-1">
              {name}
            </h3>
          </div>

          <p className="text-sm text-muted-foreground mb-3">
            {conditionLabel} • {width}x{height}x{depth} cm
          </p>

          <div className="flex items-center justify-between">
            <span className="font-display text-xl font-bold text-primary">
              {discountPrice && discountPrice > 0 ? (
                <>
                  <span className="text-sm text-muted-foreground line-through mr-2">₼{rawPrice}</span>
                  <span>₼{displayPrice}</span>
                </>
              ) : (
                <>₼{displayPrice}</>
              )}
            </span>
            <div className="flex items-center gap-2">
              {sellerId ? (
                <Link to={`/seller/${sellerId}`} onClick={(e) => { e.stopPropagation(); }} className="text-sm text-muted-foreground hover:underline">
                  {seller}
                </Link>
              ) : (
                <span className="text-sm text-muted-foreground">{seller}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
