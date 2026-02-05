import { useContext, useState, useEffect, ChangeEvent } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Scale, RefreshCw, Check, User, Plus, Send, Trash2, Star, ImagePlus, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompare } from '@/contexts/CompareContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { MakeOfferDialog } from '@/components/MakeOfferDialog';
import { AuthContext } from '@/features/auth/contexts/AuthProvider';
import { apiCallWithManualRefresh } from '@/shared/apiWithManualRefresh';
import { createConversation } from '@/features/services/Chat/chat.service';
import { PhoneCall } from 'lucide-react';

import { getProductDetailsById } from '@/features/services/product/products.service';
import { addReview as apiAddReview, getByProductId as fetchReviewsByProduct, editReview as apiEditReview, deleteReview as apiDeleteReview } from '@/features/services/Reviews/Reviews.service';
import { uploadImage } from '@/shared/utils/imagePost';

const getConditionLabel = (condition: string | number, t: ReturnType<typeof useLanguage>['t']) => {
  const conditionMap: Record<string, string> = {
    new: t.catalog.new,
    likeNew: t.catalog.likeNew,
    good: t.catalog.good,
    fair: t.catalog.fair,
    poor: t.catalog.poor,
  };

  const conditionMapNumber: Record<number, string> = {
    1: t.catalog.new,
    2: t.catalog.likeNew,
    3: t.catalog.good,
    4: t.catalog.fair,
    5: t.catalog.poor,
  };

  if (typeof condition === 'number') return conditionMapNumber[condition] ?? String(condition);
  return conditionMap[condition] || String(condition);
};

const getCategoryLabel = (category: any, t: ReturnType<typeof useLanguage>['t']) => {
  if (!category) return '';
  if (typeof category === 'object') return category.categoryName ?? category.name ?? '';
  return t.catalog.categories?.[category as keyof typeof t.catalog.categories] || String(category);
};

const ProductDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { t, language } = useLanguage();
  const { addToCompare, isInCompare } = useCompare();
  const { isAuthenticated, user } = useContext(AuthContext);
  const { items, addToCart, refreshCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewFiles, setReviewFiles] = useState<File[]>([]);
  const [reviewFilePreviews, setReviewFilePreviews] = useState<string[]>([]);

  // Edit state for existing reviews (only available to review owner)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editingRating, setEditingRating] = useState<number>(0);
  const [editingComment, setEditingComment] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeletingReview, setIsDeletingReview] = useState(false);
  // Image editing buffers for inline review editor
  const [editingExistingImages, setEditingExistingImages] = useState<string[]>([]);
  const [editingNewFiles, setEditingNewFiles] = useState<File[]>([]);
  const [editingNewPreviews, setEditingNewPreviews] = useState<string[]>([]);

  const getUserClientProfileId = () => {
    const u = user as any;
    return u?.client_profile_id ?? u?.clientProfileId ?? u?.client?.profileId ?? u?.client?.clientProfileId ?? u?.clientId ?? u?.client?.id ?? null;
  };

  const getReviewClientProfileId = (r: any) => {
    return r?.clientProfileId ?? r?.client_profile_id ?? r?.client?.profileId ?? r?.client?.clientProfileId ?? r?.clientId ?? r?.client?.id ?? null;
  };

  const getCurrentUserId = () => {
    const u = user as any;
    return u?.id ?? u?.sub ?? u?.clientId ?? u?.client?.id ?? u?.clientId ?? null;
  };

  const isReviewOwner = (r: any) => {
    const userClientProfileId = getUserClientProfileId();
    const reviewClientProfileId = getReviewClientProfileId(r);
    console.debug('[ProductDetail] clientProfileId compare', { userClientProfileId, reviewClientProfileId });
    return !!(userClientProfileId && reviewClientProfileId && String(userClientProfileId) === String(reviewClientProfileId));
  };

  const handleEditClick = (r: any) => {
    setEditingReviewId(r.id ?? `${r.userId}-${r.createdAt}`);
    setEditingRating(Number(r.rating ?? r.rate ?? 0));
    setEditingComment(r.comment ?? '');
    // initialize image lists: copy server images and clear new-file buffers
    setEditingExistingImages(Array.isArray(r.images) ? (r.images as string[]).slice() : []);
    setEditingNewFiles([]);
    setEditingNewPreviews([]);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditingRating(0);
    setEditingComment('');
    // revoke preview URLs created for new files
    for (const p of editingNewPreviews) try { URL.revokeObjectURL(p); } catch (_) { }
    setEditingExistingImages([]);
    setEditingNewFiles([]);
    setEditingNewPreviews([]);
  };

  const handleSaveEdit = async (reviewId: string) => {
    if (!reviewId) return;
    if (!editingRating || editingRating < 1) {
      toast({ title: 'Error', description: 'Please choose a rating', variant: 'destructive' });
      return;
    }
    setIsSavingEdit(true);
    try {
      // Re-upload any existing images (so backend receives fresh hosted URLs), then upload newly selected files
      const reuploadedExisting: string[] = [];
      for (const url of editingExistingImages || []) {
        if (!url) continue;
        try {
          // try to fetch the image (works for blob:, data: and http(s) urls)
          const res = await fetch(url);
          const blob = await res.blob();
          const ext = blob.type?.split('/')?.[1] ?? 'jpg';
          const name = (url.split('/').pop() || `image`).split('?')[0];
          const file = new File([blob], `${name}.${ext}`.replace(/\.+$/, ''), { type: blob.type });
          const r = await apiCallWithManualRefresh(() => uploadImage(file));
          const rr = r as any;
          const uploaded = typeof rr === 'string' ? rr : (rr?.data ?? rr?.url ?? rr?.data?.url ?? rr?.data?.result ?? null);
          if (uploaded) reuploadedExisting.push(String(uploaded));
          else reuploadedExisting.push(url);
        } catch (err) {
          // if fetch/upload fails, fall back to original URL
          console.warn('[ProductDetail] failed to reupload existing image, keeping original URL', url, err);
          reuploadedExisting.push(url);
        }
      }

      // Upload newly selected files
      const uploadedUrls: string[] = [];
      if (editingNewFiles && editingNewFiles.length > 0) {
        for (const f of editingNewFiles) {
          try {
            const r = await apiCallWithManualRefresh(() => uploadImage(f));
            const rr = r as any;
            const url = typeof rr === 'string' ? rr : (rr?.data ?? rr?.url ?? rr?.data?.url ?? rr?.data?.result ?? null);
            if (url) uploadedUrls.push(String(url));
          } catch (upErr) {
            console.error('Failed to upload edited review image', upErr);
            throw upErr;
          }
        }
      }

      const finalImages = [...reuploadedExisting, ...uploadedUrls];
      // Send finalImages array explicitly. If it's empty the server should remove all images.
      await apiCallWithManualRefresh(() => apiEditReview(String(reviewId), editingRating, editingComment || undefined, finalImages, language));
      // refresh reviews
      const res = await apiCallWithManualRefresh(() => fetchReviewsByProduct(String(resolvedId), language));
      const items = res?.data?.data ?? res?.data ?? res?.items ?? res?.data?.items ?? [];
      setReviews(Array.isArray(items) ? items : []);
      console.log("Edited review, refreshed reviews:", items);
      toast({ title: 'Success', description: 'Review updated' });
      // cleanup previews
      for (const p of editingNewPreviews) try { URL.revokeObjectURL(p); } catch (_) { }
      handleCancelEdit();
    } catch (e) {
      console.error('[ProductDetail] saveEdit error', e);
      toast({ title: 'Error', description: 'Failed to save review', variant: 'destructive' });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!reviewId) return;
    if (!confirm('Are you sure you want to delete this review?')) return;
    setIsDeletingReview(true);
    try {
      await apiCallWithManualRefresh(() => apiDeleteReview(String(reviewId), language));
      const res = await apiCallWithManualRefresh(() => fetchReviewsByProduct(String(resolvedId), language));
      const items = res?.data?.data ?? res?.data ?? res?.items ?? res?.data?.items ?? [];
      setReviews(Array.isArray(items) ? items : []);
      toast({ title: 'Success', description: 'Review deleted' });
    } catch (e) {
      console.error('[ProductDetail] deleteReview error', e);
      toast({ title: 'Error', description: 'Failed to delete review', variant: 'destructive' });
    } finally {
      setIsDeletingReview(false);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const existing = reviewFiles.slice();
    const existingPreviews = reviewFilePreviews.slice();
    for (const f of Array.from(files)) {
      if (existing.length >= 5) break; // limit 5
      existing.push(f);
      existingPreviews.push(URL.createObjectURL(f));
    }
    setReviewFiles(existing);
    setReviewFilePreviews(existingPreviews);
    // reset input value so same file can be selected again if removed
    e.currentTarget.value = '';
  };

  const removeImage = (index: number) => {
    const newFiles = reviewFiles.filter((_, i) => i !== index);
    const newPreviews = reviewFilePreviews.filter((_, i) => i !== index);
    // revoke the removed preview URL
    try { URL.revokeObjectURL(reviewFilePreviews[index]); } catch (e) { /* ignore */ }
    setReviewFiles(newFiles);
    setReviewFilePreviews(newPreviews);
  };

  // Resolve product id: prefer route param `id`, otherwise fallback to query param `?id=...`
  const paramId = searchParams.get('id');
  const resolvedId = id ?? paramId ?? null;

  useEffect(() => {
    const load = async () => {
      if (!resolvedId) return;
      setIsLoadingProduct(true);
      try {
        // include language when fetching details so backend can return localized fields
        const resp = await apiCallWithManualRefresh(() => getProductDetailsById(String(resolvedId), language));
        console.log('Product details response:', resp);
        let item = resp?.data?.data ?? resp?.data ?? resp;
        if (item && typeof item === 'object' && Array.isArray(item.items) && item.items.length > 0) item = item.items[0];
        if (Array.isArray(item)) item = item[0];

        if (item) {
          const mapped = {
            id: item.id,
            name: item.productTitle ?? item.title ?? item.name ?? '',
            description: item.description ?? '',
            image: item.mainImage ?? item.image ?? (item.images && item.images[0]) ?? '/placeholder.svg',
            images: Array.isArray(item.images) ? item.images : [],
            price: item.price ?? 0,
            discountPrice: item.discountPrice ?? 0,
            condition: typeof item.condition === 'number' ? item.condition : (item.condition ?? ''),
            status: item.status ?? item.state ?? null,
            dimensions: {
              width: item.width ?? item.dimensions?.width ?? 0,
              height: item.height ?? item.dimensions?.height ?? 0,
              depth: item.depth ?? item.dimensions?.depth ?? 0,
            },
            acceptsBarter: item.isBarterAvailable ?? false,
            seller: (item.seller && typeof item.seller === 'object') ? (item.seller.name ?? item.seller.sellerName ?? item.seller.storeName ?? '') : (item.seller ?? item.storeName ?? item.sellerName ?? ''),
            category: item.category && typeof item.category === 'object' ? item.category : (item.category ?? ''),
            categoryId: item.category && typeof item.category === 'object' ? String(item.category.id ?? '') : String(item.category ?? ''),
            categoryName: item.category && typeof item.category === 'object' ? String(item.category.categoryName ?? item.category.name ?? '') : String(item.category ?? ''),
            isInCart: item.isInCart ?? false,
            inStock: Number(item.inStock ?? item.stock ?? item.quantity ?? 0) || 0,
            isInComparison: item.isInComparison ?? false,
            weight: item.weight ?? undefined,
            material: undefined,
            sellerId: item.sellerId,
            color: undefined,
          };

          // try to extract material/color from attributes if present
          const attrs = item.attributes ?? item.attributeValues ?? item.attributeValueList ?? [];
          if (Array.isArray(attrs) && attrs.length > 0) {
            for (const av of attrs) {
              const base = String(av.valueEn ?? av.valueBase ?? av.value ?? av.label ?? '').trim().toLowerCase();
              if (base.includes('color')) {
                mapped.color = String(av.value ?? av.valueEn ?? av.valueBase ?? '');
              }
              if (base.includes('metal') || base.includes('material') || base.includes('wood') || base.includes('plastic')) {
                mapped.material = String(av.value ?? av.valueEn ?? av.valueBase ?? '');
              }
            }
          }

          setProduct(mapped);
        }
      } catch (err) {
        console.error('Failed to load product details', err);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    void load();
  }, [resolvedId, language]);

  // load reviews for product
  useEffect(() => {
    const loadReviews = async () => {
      if (!resolvedId) return;
      setIsLoadingReviews(true);
      try {
        const res = await apiCallWithManualRefresh(() => fetchReviewsByProduct(String(resolvedId), language));
        const items = res?.data?.data ?? res?.data ?? res?.items ?? res?.data?.items ?? [];
        setReviews(Array.isArray(items) ? items : []);
        console.log("[ProductDetail] loaded reviews:", items);
      } catch (e) {
        console.error('[ProductDetail] loadReviews error', e);
      } finally {
        setIsLoadingReviews(false);
      }
    };
    void loadReviews();
  }, [resolvedId, language]);

  const inCompare = product ? isInCompare(product.id) : false;
  // consider product.isInCart flag (from product details) or cart rows (.productId or .id)
  const inCart = product ? (product.isInCart === true || items.some(item => String(item.productId ?? item.id) === String(product.id))) : false;

  const stockNumber = Number(product?.inStock ?? product?.in_stock ?? 0);

  // Debug: why Add to Cart disabled
  try {
    console.debug('[ProductDetail] add-to-cart disabled check', { productId: product?.id, inStock: product?.inStock, stockNumber, inCart, itemsCount: items?.length, itemsSample: items?.slice(0, 5) });
  } catch (_) { }


  // Determine whether current user already has a review for this product (by clientProfileId)
  const hasOwnedReview = (() => {
    const userClientProfileId = getUserClientProfileId();
    if (!userClientProfileId) return false;
    return reviews.some(r => {
      const rcid = getReviewClientProfileId(r);
      return rcid && String(rcid) === String(userClientProfileId);
    });
  })();

  // determine if current user is the owner/seller of this product
  const isOwner = (() => {
    if (!product || !user) return false;
    const currentId = getCurrentUserId();
    const userClientProfileId = getUserClientProfileId();
    const sellerId = product?.sellerId ?? product?.seller?.id ?? null;
    if (!sellerId) return false;
    return Boolean(
      (currentId && String(currentId) === String(sellerId)) ||
      (userClientProfileId && String(userClientProfileId) === String(sellerId))
    );
  })();

  const [selectedImage, setSelectedImage] = useState(0);

  const productImages = product?.images || (product ? [product.image] : []);

  const renderStars = (r: number, clickable = false, onSelect?: (n: number) => void) => (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1;
        const filled = i < Math.round(r);
        return (
          <button
            key={i}
            type={clickable ? 'button' : 'button'}
            onClick={clickable ? (() => onSelect && onSelect(idx)) : undefined}
            className={cn('p-0 m-0 mr-1', clickable ? 'hover:opacity-80' : '')}
            aria-label={clickable ? `Rate ${idx} stars` : undefined}
          >
            <Star className={cn('w-4 h-4', filled ? 'text-yellow-400' : 'text-muted-foreground')} />
          </button>
        );
      })}
    </div>
  );

  const handleAddEditingFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const existingCount = editingExistingImages.length;
    const fileArray = Array.from(files);
    const toAdd: File[] = [];
    const toAddPreviews: string[] = [];
    for (const f of fileArray) {
      if (toAdd.length + existingCount >= 5) break;
      toAdd.push(f);
      toAddPreviews.push(URL.createObjectURL(f));
    }
    if (toAdd.length === 0) {
      // nothing to add (limit reached)
      (e.currentTarget as HTMLInputElement).value = '';
      return;
    }
    setEditingNewFiles(prev => [...prev, ...toAdd]);
    setEditingNewPreviews(prev => {
      const next = [...prev, ...toAddPreviews];
      console.debug('[ProductDetail] added editing previews', { next });
      return next;
    });
    (e.currentTarget as HTMLInputElement).value = '';
  };

  const removeEditingExistingImage = (idx: number) => {
    setEditingExistingImages(prev => prev.filter((_, i) => i !== idx));
  };

  const removeEditingNewFile = (idx: number) => {
    setEditingNewFiles(prev => prev.filter((_, i) => i !== idx));
    setEditingNewPreviews(prev => {
      try { URL.revokeObjectURL(prev[idx]); } catch (_) { }
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmitReview = async () => {
    if (!resolvedId) return;
    // Prevent product owners from submitting reviews for their own product
    try {
      const currentId = getCurrentUserId();
      const userClientProfileId = getUserClientProfileId();
      const sellerId = product?.sellerId ?? product?.seller?.id ?? null;
      if (sellerId && ((currentId && String(currentId) === String(sellerId)) || (userClientProfileId && String(userClientProfileId) === String(sellerId)))) {
        toast({ title: 'Not allowed', description: 'You cannot post comments on your own product', variant: 'destructive' });
        return;
      }
    } catch (_) { /* ignore */ }
    if (!reviewRating || reviewRating < 1) {
      toast({ title: 'Error', description: 'Please select a rating', variant: 'destructive' });
      return;
    }
    setIsSubmittingReview(true);
    try {
      // upload selected files first and collect URLs
      let uploadedUrls: string[] = [];
      if (reviewFiles && reviewFiles.length > 0) {
        const urls: string[] = [];
        for (const f of reviewFiles) {
          try {
            const r = await apiCallWithManualRefresh(() => uploadImage(f));
            // uploadImage may return different shapes; normalize safely using any
            const rr = r as any;
            const url = typeof rr === 'string' ? rr : (rr?.data ?? rr?.url ?? rr?.data?.url ?? rr?.data?.result ?? null);
            if (url) urls.push(String(url));
          } catch (upErr) {
            console.error('Failed to upload review image', upErr);
            throw upErr;
          }
        }
        uploadedUrls = urls;
      }

      // If the current user already has a review (by clientProfileId), update it instead of creating a duplicate
      const userClientProfileId = getUserClientProfileId();
      const existingOwned = reviews.find(r => {
        const rcid = getReviewClientProfileId(r);
        return rcid && userClientProfileId && String(rcid) === String(userClientProfileId);
      });

      if (existingOwned) {
        // derive a stable review id from common fields
        const reviewId = existingOwned?.id ?? existingOwned?.reviewId ?? existingOwned?._id ?? null;
        if (reviewId) {
          await apiCallWithManualRefresh(() => apiEditReview(String(reviewId), reviewRating, reviewComment || undefined, uploadedUrls.length > 0 ? uploadedUrls : undefined, language));
        } else {
          // We couldn't find a numeric/string id for the existing review — avoid silently creating a duplicate.
          // Fallback: warn user and attempt to create (best-effort) but inform about possible duplicate.
          toast({ title: 'Warning', description: 'Could not determine existing review id — submitting may create a duplicate' });
          await apiCallWithManualRefresh(() => apiAddReview(String(resolvedId), reviewRating, reviewComment || undefined, uploadedUrls.length > 0 ? uploadedUrls : undefined, language));
        }
      } else {
        await apiCallWithManualRefresh(() => apiAddReview(String(resolvedId), reviewRating, reviewComment || undefined, uploadedUrls.length > 0 ? uploadedUrls : undefined, language));
      }
      setReviewRating(0);
      setReviewComment('');
      setReviewFiles([]);
      setReviewFilePreviews([]);
      // refresh
      const res = await apiCallWithManualRefresh(() => fetchReviewsByProduct(String(resolvedId), language));
      const items = res?.data?.data ?? res?.data ?? res?.items ?? res?.data?.items ?? [];
      console.log("Submitted review, refreshed reviews:", items);
      setReviews(Array.isArray(items) ? items : []);
      toast({ title: 'Success', description: existingOwned ? 'Review updated' : 'Review submitted' });
    } catch (e) {
      console.error('[ProductDetail] submitReview error', e);
      toast({ title: 'Error', description: 'Failed to submit review', variant: 'destructive' });
    } finally {
      setIsSubmittingReview(false);
    }
  };



  const [isStartingChat, setIsStartingChat] = useState(false);
  const handleStartConversation = async () => {
    if (!isAuthenticated) {
      toast({ title: 'Login Required', description: 'Please login to start chat' });
      navigate('/auth');
      return;
    }
    const participantId = product.sellerId;
    console.log('Starting conversation with participantId:', product);
    if (!participantId) {
      toast({ title: 'Error', description: 'Seller not available for chat', variant: 'destructive' });
      return;
    }
    setIsStartingChat(true);
    try {
      const resp = await apiCallWithManualRefresh(() => createConversation(String(participantId)));
      console.log('Create conversation response:', resp);
      const payload = resp?.data ?? resp ?? null;
      const conv = payload?.data ?? payload ?? null;
      const convId = conv?.id ?? conv?.conversationId ?? null;
      if (!convId) throw new Error('No conversation id returned');
      navigate(`/chat/${convId}`);
    } catch (e) {
      console.error('Failed to start conversation', e);
      toast({ title: 'Error', description: 'Failed to start chat', variant: 'destructive' });
    } finally {
      setIsStartingChat(false);
    }
  }

    // Prefill leave-review form with existing owned review (if any) so user edits instead of creating another
    useEffect(() => {
      if (!user) return;
      const userClientProfileId = getUserClientProfileId();
      if (!userClientProfileId) return;
      const existing = reviews.find(r => {
        const rcid = getReviewClientProfileId(r);
        return rcid && String(rcid) === String(userClientProfileId);
      });
      if (existing) {
        setReviewRating(Number(existing.rating ?? existing.rate ?? 0));
        setReviewComment(existing.comment ?? '');
      }
    }, [reviews, user]);

    if (isLoadingProduct) {
      return (
        <Layout>
          <div className="container-custom py-20 text-center">
            <p className="text-muted-foreground">{t.common.loading}</p>
          </div>
        </Layout>
      );
    }

    if (!product) {
      return (
        <Layout>
          <div className="container-custom py-20 text-center">
            <p className="text-muted-foreground">{t.product.notFound}</p>
            <Link to="/catalog">
              <Button variant="outline" className="mt-4">
                {t.common.back}
              </Button>
            </Link>
          </div>
        </Layout>
      );
    }

    const conditionLabel = getConditionLabel(product.condition, t);
    const categoryLabel = getCategoryLabel(product.category, t);

    const handleAddToCompare = () => {
      if (!isAuthenticated) {
        toast({ title: 'Login Required', description: 'Please login to compare' });
        navigate('/auth');
        return;
      }

      addToCompare(product);
      toast({
        title: 'Added to compare',
        description: `${product.name} has been added to comparison`,
      });
    };

    const handleMakeOfferClick = () => {
      if (!isAuthenticated) {
        toast({
          title: 'Login Required',
          description: 'Please login to make an offer',
        });
        navigate('/auth');
        return;
      }
    };

    const handleAddToCart = async () => {
      if (!isAuthenticated) {
        toast({ title: 'Login Required', description: 'Please login to add items to cart' });
        navigate('/auth');
        return;
      }
      setIsAddingToCart(true);
      try {
        // Build minimal CartItem expected by CartContext
        const cartItem = {
          id: String(product.id),
          name: product.name ?? '',
          price: Number(product.price ?? 0) || 0,
          image: product.image ?? '/placeholder.svg',
          category: product.categoryName ?? product.category ?? '',
          condition: product.condition ?? '',
          dimensions: '',
          quantity: 1,
        };

        await addToCart(cartItem);
        // ensure cart is fresh (context should have updated, but force-refresh if needed)
        try { await refreshCart(); } catch (_) { }
        // Optimistically mark product as in-cart so UI updates immediately
        try { setProduct(prev => prev ? { ...prev, isInCart: true } : prev); } catch (_) { }
        toast({ title: t.cart?.addToCart || 'Added to Cart', description: product.name });
      } catch (e) {
        console.error('[ProductDetail] add to cart error', e);
        toast({ title: 'Error', description: 'Failed to add to cart', variant: 'destructive' });
      } finally {
        setIsAddingToCart(false);
      }
    };

    return (
      <Layout>
        <div className="container-custom py-8">
          <Link to="/catalog">
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t.common.back}
            </Button>
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="w-full aspect-square object-cover rounded-2xl shadow-medium"
                />
                {product.acceptsBarter && (
                  <Badge className="absolute top-4 left-4 bg-sage text-sage-dark">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    {t.product.barterLabel}
                  </Badge>
                )}
              </div>

              {productImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                        selectedImage === index
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Badge variant="outline" className="mb-4">
                {categoryLabel}
              </Badge>

              <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <span className="font-display text-4xl font-bold text-primary ">
                  {product.discountPrice && product.discountPrice > 0 ? (
                    <>
                      <span className="text-sm text-muted-foreground line-through mr-2">₼{product.price}</span>
                      <span>₼{product.discountPrice}</span>
                    </>
                  ) : (
                    <>₼{product.price}</>
                  )}
                </span>
                <Badge variant="secondary">
                  {conditionLabel}
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-3 p-4 bg-muted rounded-xl mb-6">
                <div className="flex items-center gap-3">
                  {/* link to seller profile when sellerId is available */}
                  {product?.sellerId ? (
                    <Link to={`/seller/${product.sellerId}`} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t.product.seller}</p>
                        <p className="font-semibold text-foreground">{product.seller}</p>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t.product.seller}</p>
                        <p className="font-semibold text-foreground">{product.seller}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isOwner && product.acceptsBarter && stockNumber > 0 && (
                    isAuthenticated ? (
                      <MakeOfferDialog product={{ ...product, sellerId: product.sellerId }}>
                        <Button size="sm" variant="outline">{t.offers.makeOfferTitle}</Button>
                      </MakeOfferDialog>
                    ) : (
                      <Button size="sm" variant="outline" onClick={handleMakeOfferClick}>{t.offers.makeOfferTitle}</Button>
                    )
                  )}

                  {!isOwner && (
                    <Button size="sm" variant="secondary" onClick={handleStartConversation} disabled={isStartingChat}>
                      <PhoneCall className="w-4 h-4 mr-2" />
                      {isStartingChat ? 'Starting...' : t.product.contactSeller}
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-card rounded-xl border border-border">
                  <p className="text-sm text-muted-foreground">{t.upload.width}</p>
                  <p className="font-display font-semibold text-foreground">{product.dimensions.width} cm</p>
                </div>
                <div className="text-center p-4 bg-card rounded-xl border border-border">
                  <p className="text-sm text-muted-foreground">{t.upload.height}</p>
                  <p className="font-display font-semibold text-foreground">{product.dimensions.height} cm</p>
                </div>
                <div className="text-center p-4 bg-card rounded-xl border border-border">
                  <p className="text-sm text-muted-foreground">{t.upload.depth}</p>
                  <p className="font-display font-semibold text-foreground">{product.dimensions.depth} cm</p>
                </div>
              </div>
              {/* Stock-dependent actions: show Out of stock when unavailable, otherwise show normal action buttons */}
              {Number(product?.inStock ?? 0) <= 0 ? (
                <div className="mb-4 flex justify-center">
                  <div className="w-full sm:max-w-xl">
                    <Button variant="destructive" size="lg" className="w-full py-4 text-lg flex items-center justify-center" disabled>
                      <X className="w-5 h-5 mr-2" />
                      {(t.cart as any)?.outOfStock ?? 'Out of stock'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="flex-1">
                    {!isOwner ? (
                      <Button
                        variant={inCart ? "outline" : "hero"}
                        size="lg"
                        className="w-full py-4"
                        onClick={handleAddToCart}
                        disabled={inCart || isAddingToCart || stockNumber <= 0}
                      >
                        {inCart ? <Check className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                        {inCart ? (t.cart?.inCart ?? 'In Cart') : (t.cart?.addToCart || 'Add to Cart')}
                      </Button>
                    ) : (
                      null
                    )}
                  </div>
                  {!isOwner && (product.acceptsBarter && stockNumber > 0 && isAuthenticated) && (
                    <MakeOfferDialog product={{ ...product, sellerId: product.sellerId }}>
                      <Button variant="sage" size="lg" className="flex-1 py-4">
                        <RefreshCw className="w-5 h-5 mr-2" />
                        {t.product?.makeOffer || 'Make Barter Offer'}
                      </Button>
                    </MakeOfferDialog>
                  )}
                  {!isOwner && (product.acceptsBarter && stockNumber > 0 && !isAuthenticated) && (
                    <Button variant="sage" size="lg" className="flex-1 py-4" onClick={handleMakeOfferClick}>
                      <RefreshCw className="w-5 h-5 mr-2" />
                      {t.product?.makeOffer || 'Make Barter Offer'}
                    </Button>
                  )}
                </div>
              )}

              {!isOwner && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleAddToCompare}
                  disabled={inCompare}
                >
                  {inCompare ? (
                    <>
                      <Check className="w-4 h-4" />
                      {(t.product as any)?.addedToCompare ?? 'Added to Compare'}
                    </>
                  ) : (
                    <>
                      <Scale className="w-4 h-4" />
                      {t.product?.addToCompare}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="description" className="mt-12">
            <TabsList>
              <TabsTrigger value="description">{t.product.description}</TabsTrigger>
              <TabsTrigger value="specifications">{t.product.specifications}</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <dl className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-muted-foreground">{t.catalog.category}</dt>
                    <dd className="font-semibold text-foreground">{categoryLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">{t.product.condition}</dt>
                    <dd className="font-semibold text-foreground">{conditionLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">{t.product.dimensions}</dt>
                    <dd className="font-semibold text-foreground">
                      {product.dimensions.width} × {product.dimensions.height} × {product.dimensions.depth} cm
                    </dd>
                  </div>
                  {product.weight && (
                    <div>
                      <dt className="text-sm text-muted-foreground">{t.product.weight}</dt>
                      <dd className="font-semibold text-foreground">{product.weight} kg</dd>
                    </div>
                  )}
                  {product.material && (
                    <div>
                      <dt className="text-sm text-muted-foreground">{t.product.material}</dt>
                      <dd className="font-semibold text-foreground capitalize">{product.material}</dd>
                    </div>
                  )}
                  {product.color && (
                    <div>
                      <dt className="text-sm text-muted-foreground">{t.product.color}</dt>
                      <dd className="font-semibold text-foreground capitalize">{product.color}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm text-muted-foreground">{t.product.barter}</dt>
                    <dd className="font-semibold text-foreground">
                      {product.acceptsBarter ? t.product.yes : t.product.no}
                    </dd>
                  </div>
                </dl>
              </div>
            </TabsContent>
          </Tabs>

          {/* Reviews section */}
          <div className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">{(t.product as any)?.reviews || 'Reviews'}</h2>

            <div className="grid gap-4 md:grid-cols-2 mb-6">
              {!isOwner ? (
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-2">{(t.product as any)?.leaveReview || 'Leave a review'}</p>
                  <div className="mb-3">{renderStars(reviewRating, true, (n) => setReviewRating(n))}</div>
                  <Textarea placeholder={t.product?.writeReviewPlaceholder || 'Write your review...'} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={4} className="mb-3" />
                  <div className="mb-3">
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                      {reviewFilePreviews.map((p, index) => (
                        <div key={p} className="relative aspect-square">
                          <img src={p} alt={`Upload ${index + 1}`} className="w-full h-full object-cover rounded-xl border border-border" />
                          <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {reviewFilePreviews.length < 5 && (
                        <label className="aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                          <ImagePlus className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-xs text-muted-foreground text-center px-2">{t.upload?.dragDrop || 'Drag & drop or click to upload'}</span>
                          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" onClick={handleSubmitReview} disabled={isSubmittingReview || hasOwnedReview}>
                      {isSubmittingReview ? 'Posting...' : ((t.product as any)?.postReview || 'Post Review')}
                    </Button>
                    {hasOwnedReview && (
                      <p className="text-xs text-muted-foreground">{t.product.ownedReview || 'You already have a review — use the Edit button in "All reviews" to update it.'}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl p-4 text-sm text-muted-foreground">
                  You cannot post comments on your own product.
                </div>
              )}

              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-2">{(t.product as any)?.allReviews || 'All reviews'}</p>
                <div className="max-h-48 overflow-y-auto pr-2">
                  {isLoadingReviews ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : reviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t.product.noReviews || 'No reviews yet'}</p>
                  ) : (
                    <div className="space-y-3">
                      {reviews.map((r) => {
                        const owner = isReviewOwner(r);
                        // Debug ownership check to help identify why owner controls may not appear
                        console.debug('[ProductDetail] review ownership', {
                          reviewId: r?.id,
                          reviewUserId: r?.userId ?? r?.user?.id ?? null,
                          reviewClientId: r?.client?.id ?? r?.clientId ?? null,
                          reviewClientProfileId: r?.clientProfileId ?? r?.client?.profileId ?? null,
                          currentUserId: getCurrentUserId(),
                          currentUserClientProfileId: (user as any)?.clientProfileId ?? (user as any)?.client?.profileId ?? null,
                          owner,
                        });

                        return (
                          <div key={r.id || `${r.userId}-${r.createdAt}`} className="p-3 bg-muted/30 rounded">
                            {/* If editing this review, show inline edit form */}
                            {editingReviewId === (r.id ?? `${r.userId}-${r.createdAt}`) ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="font-semibold text-foreground">{r.userName ?? r.user?.name ?? r.clientName ?? 'User'}</div>
                                    <div className="text-xs text-muted-foreground">{new Date(r.createdAt || r.createdAtUtc || Date.now()).toLocaleDateString()}</div>
                                  </div>
                                  <div>{renderStars(editingRating, true, (n) => setEditingRating(n))}</div>
                                </div>
                                <Textarea value={editingComment} onChange={(e) => setEditingComment(e.target.value)} rows={3} />

                                {/* existing images from server (can remove) */}
                                {editingExistingImages.length > 0 && (
                                  <div className="mt-2 grid grid-cols-4 gap-2">
                                    {editingExistingImages.map((url, i) => (
                                      <div key={url} className="relative">
                                        <img src={url} alt={`existing-${i}`} className="w-full h-20 object-cover rounded" />
                                        <button type="button" onClick={() => removeEditingExistingImage(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* previews of newly added files */}
                                {editingNewPreviews.length > 0 && (
                                  <div className="mt-2 grid grid-cols-4 gap-2">
                                    {editingNewPreviews.map((p, i) => (
                                      <div key={p} className="relative">
                                        <img src={p} alt={`new-${i}`} className="w-full h-20 object-cover rounded" />
                                        <button type="button" onClick={() => removeEditingNewFile(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="mt-2">
                                  <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 border border-border rounded">
                                    <ImagePlus className="w-4 h-4" />
                                    <span className="text-sm text-muted-foreground">Add images</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleAddEditingFiles} />
                                  </label>
                                </div>

                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleSaveEdit(r.id ?? `${r.userId}-${r.createdAt}`)} disabled={isSavingEdit}>{isSavingEdit ? 'Saving...' : 'Save'}</Button>
                                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-3">
                                    <div className="font-semibold text-foreground">{r.userName ?? r.user?.name ?? r.clientName ?? 'User'}</div>
                                    <div className="text-xs text-muted-foreground">{new Date(r.createdAt || r.createdAtUtc || Date.now()).toLocaleDateString()}</div>
                                  </div>
                                  <div>{renderStars(Number(r.rating ?? r.rate ?? 0))}</div>
                                </div>
                                {r.comment && <div className="text-sm text-muted-foreground">{r.comment}</div>}
                                {Array.isArray(r.images) && r.images.length > 0 && (
                                  <div className="mt-2 flex gap-2">
                                    {r.images.map((imgUrl: string, i: number) => (
                                      <img key={i} src={imgUrl} className="w-16 h-16 object-cover rounded" alt={`review-img-${i}`} />
                                    ))}
                                  </div>
                                )}

                                {/* Owner controls */}
                                {owner && (
                                  <div className="flex gap-2 mt-2">
                                    <Button size="sm" onClick={() => handleEditClick(r)}>Edit</Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDeleteReview(r.id ?? `${r.userId}-${r.createdAt}`)} disabled={isDeletingReview}><Trash2 className="w-4 h-4 mr-1" />Delete</Button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  };

  export default ProductDetail;

// --- image-edit helpers (missing definitions) ---
