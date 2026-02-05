import { useContext, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, DollarSign, Send } from 'lucide-react';
import { useOffers } from '@/contexts/OffersContext';
import { toast } from '@/hooks/use-toast';
import { AuthContext } from '@/features/auth/contexts/AuthProvider';
import { apiCallWithManualRefresh } from '@/shared/apiWithManualRefresh';
import { getProductsByClientId } from '@/features/services/product/products.service';
import { useLanguage } from '@/contexts/LanguageContext';

interface MakeOfferDialogProps {
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
    seller: string;
    sellerId?: string;
  };
  children: React.ReactNode;
}

export const MakeOfferDialog = ({ product, children }: MakeOfferDialogProps) => {
  const { t } = useLanguage();
  const offers = (t as any)?.offers ?? {};
  const [open, setOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const { user } = useContext(AuthContext);
  const { addOffer } = useOffers();

  // New state for barter
  const [mode, setMode] = useState<'price' | 'barter'>('price');
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [isLoadingUserProducts, setIsLoadingUserProducts] = useState(false);
  const [selectedOfferProductId, setSelectedOfferProductId] = useState<string | null>(null);
  const [offerTopUp, setOfferTopUp] = useState(''); // optional cash to add on top of offered product
  const [offerNote, setOfferNote] = useState('');
  // keep quantity per-product so editing one row doesn't affect others
  // keep quantity as string per-product so editing doesn't jump/collapse caret — parse+clamp on blur
  const [pendingQuantities, setPendingQuantities] = useState<Record<string, string>>({});

  useEffect(() => {
    // When dialog opens and barter mode is relevant, fetch current user's products
    if (!open) return;
    const fetchUserProducts = async () => {
      const clientId = (user as any)?.client_profile_id ?? (user as any)?.clientProfileId ?? (user as any)?.client_profile_id ?? null;
      if (!clientId) {
        setUserProducts([]);
        return;
      }
      setIsLoadingUserProducts(true);
      try {
        const res = await apiCallWithManualRefresh(() => getProductsByClientId(String(clientId), { page: 1, pageSize: 50, lang: undefined }));
        const rawItems = res?.data?.items ?? res?.items ?? res?.data ?? [];
        const normalized = Array.isArray(rawItems) ? rawItems.map((it: any) => ({
          ...it,
          images: Array.isArray(it.images) && it.images.length > 0 ? it.images : (it.mainImage ? [it.mainImage] : []),
          image: it.mainImage ?? (Array.isArray(it.images) && it.images[0]) ?? '/placeholder.svg',
          name: it.productTitle ?? it.title ?? it.name ?? '',
          id: it.id ?? it.productId ?? it._id ?? String(Math.random()),
          price: it.price ?? it.priceAmount ?? it.listPrice ?? 0,
        })) : [];
        setUserProducts(normalized);
        // ensure we have a default string quantity for each product (avoid shared numeric state)
        setPendingQuantities(prev => {
          const next = { ...prev } as Record<string, string>;
          normalized.forEach((it: any) => {
            const id = String(it.id);
            if (!next[id]) next[id] = '1';
          });
          return next;
        });
        // if nothing selected yet, pick first available
        if (normalized.length > 0 && !selectedOfferProductId) setSelectedOfferProductId(String(normalized[0].id));
      } catch (err) {
        console.error('[MakeOfferDialog] failed to fetch user products', err);
        setUserProducts([]);
      } finally {
        setIsLoadingUserProducts(false);
      }
    };

    // Only fetch when barter mode is active or we may prefetch to speed UX
    if (mode === 'barter') void fetchUserProducts();
  }, [open, mode, user]);

  const handleSubmitOffer = () => {
    if (!user) return;

    if (mode === 'price') {
      const price = parseFloat(offerPrice);
      if (!price || price <= 0) {
        toast({
          title: 'Invalid offer',
          description: 'Please enter a valid price',
          variant: 'destructive',
        });
        return;
      }

      addOffer({
        from: `${user.name} ${user.surname}`,
        fromId: user.userId,
        type: 'price',
        amount: price,
        forItem: product.name,
        forItemId: product.id,
        forItemImage: product.image,
        forItemPrice: product.price,
        sellerId: product.sellerId || 'seller-1',
        status: 'pending',
        note: offerNote || undefined,
      });

      toast({
        title: 'Offer sent!',
        description: `Your offer of ₼${price} has been sent to the seller.`,
      });

      setOfferPrice('');
      setOpen(false);
      return;
    }

    // barter flow
    if (userProducts.length === 0) {
      toast({ title: 'No items', description: "You don't have any products to offer for barter.", variant: 'destructive' });
      return;
    }

    if (!selectedOfferProductId) {
      toast({ title: 'Select item', description: 'Please select one of your products to offer in barter', variant: 'destructive' });
      return;
    }

    const offered = userProducts.find(u => String(u.id) === String(selectedOfferProductId));
    if (!offered) {
      toast({ title: 'Invalid selection', description: 'Selected product not found', variant: 'destructive' });
      return;
    }

    const topUp = parseFloat(offerTopUp) || 0;

    // compute parsed quantity from pendingQuantities for the selected product
    const rawQty = pendingQuantities[String(selectedOfferProductId)] ?? '1';
    let parsedQty = parseInt(String(rawQty), 10);
    if (Number.isNaN(parsedQty) || parsedQty < 1) parsedQty = 1;

    addOffer({
      from: `${user.name} ${user.surname}`,
      fromId: user.userId,
      type: 'barter',
      item: offered.name || offered.title || 'Offered item',
      // include offeredProductId for backend mapping
      offeredProductId: String(offered.id ?? offered.productId ?? offered._id ?? ''),
      itemImage: offered.image || (Array.isArray(offered.images) ? offered.images[0] : offered.image) || '/placeholder.svg',
      amount: topUp > 0 ? topUp : undefined,
      quantity: parsedQty > 0 ? parsedQty : undefined,
      forItem: product.name,
      forItemId: product.id,
      forItemImage: product.image,
      forItemPrice: product.price,
      sellerId: product.sellerId || 'seller-1',
      status: 'pending',
      note: offerNote || undefined,
    });

    toast({ title: 'Barter offer sent', description: `You offered "${offered.name}"${topUp > 0 ? ` + ₼${topUp}` : ''}` });
    setOfferTopUp('');
    setSelectedOfferProductId(null);
    setOfferNote('');
    // clear per-product quantities
    setPendingQuantities({});
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            {offers.makeOfferTitle || 'Make an Offer'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground truncate">{product.name}</h4>
              <p className="text-sm text-muted-foreground">{offers.listedAt ? String(offers.listedAt).replace('{price}', String(product.price)) : `Listed at ₼${product.price}`}</p>
              <p className="text-xs text-muted-foreground">{(offers.sellerLabel || 'Seller')}: {product.seller}</p>
            </div>
          </div>

          {/* Mode selector: Price or Barter */}
          <div className="flex gap-2">
            <Button variant={mode === 'price' ? 'hero' : 'outline'} size="sm" onClick={() => setMode('price')}>{offers.modePrice || 'Price'}</Button>
            <Button variant={mode === 'barter' ? 'hero' : 'outline'} size="sm" onClick={() => setMode('barter')}>{offers.modeBarter || 'Barter'}</Button>
          </div>

          {mode === 'price' ? (
            <div>
              <Label htmlFor="offer-price" className="text-sm font-medium">
                {offers.yourOfferPrice || 'Your Offer Price (₼)'}
              </Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="offer-price"
                  type="number"
                  placeholder={offers.enterYourOffer || 'Enter your offer'}
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="mt-4">
                <Label htmlFor="offer-note" className="text-sm font-medium">{offers.noteOptional || 'Note (optional)'}</Label>
                <textarea id="offer-note" className="w-full mt-2 p-2 border rounded" placeholder={offers.noteOptional ? '' : 'Add a message for the seller'} value={offerNote} onChange={(e) => setOfferNote(e.target.value)} />
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-2">{offers.selectYourProduct || 'Select one of your products to offer in exchange'}</p>
              {isLoadingUserProducts ? (
                <p className="text-sm text-muted-foreground">{offers.loadingYourProducts || 'Loading your products...'}</p>
              ) : userProducts.length === 0 ? (
                <p className="text-sm text-destructive">{offers.noProductsForBarter || "You don't have any products available for barter."}</p>
              ) : (
                <div className="space-y-2">
                  {/* Scrollable list for user products */}
                  <div className="max-h-64 overflow-y-auto pr-2">
                    <div className="space-y-2">
                      {userProducts.map((up) => (
                        <label key={up.id} className="flex items-center gap-3 p-2 border rounded cursor-pointer">
                          <input type="radio" name="offerProduct" checked={String(selectedOfferProductId) === String(up.id)} onChange={() => setSelectedOfferProductId(String(up.id))} />
                          <img src={up.image} alt={up.name} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-foreground truncate">{up.name}</div>
                            <div className="text-xs text-muted-foreground">₼{up.price}</div>
                          </div>
                          <div className="ml-2 w-24">
                            <Label className="text-xs text-muted-foreground">{offers.qty || 'Qty'}</Label>
                            <Input
                              type="text"
                              inputMode="numeric"
                              pattern="\d*"
                              value={pendingQuantities[String(up.id)] ?? '1'}
                              onChange={(e) => {
                                const raw = String(e.target.value || '');
                                const digits = raw.replace(/\D+/g, '');
                                // strip leading zeros so value never starts with 0 while typing
                                const normalized = digits.replace(/^0+/, '');
                                setPendingQuantities(prev => ({ ...prev, [String(up.id)]: normalized }));
                              }}
                              onClick={(e) => e.stopPropagation()}
                              onFocus={(e) => e.stopPropagation()}
                              onBlur={(e) => {
                                // normalize on blur: empty or invalid => 1
                                const raw = String(e.target.value || '').trim();
                                let parsed = parseInt(raw, 10);
                                if (Number.isNaN(parsed) || parsed < 1) parsed = 1;
                                setPendingQuantities(prev => ({ ...prev, [String(up.id)]: String(parsed) }));
                              }}
                              className="w-full mt-1 p-1 border rounded text-sm"
                            />
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="barter-topup" className="text-sm font-medium">{offers.optionalCashToAdd || 'Optional cash to add (₼)'}</Label>
                    <div className="relative mt-2">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="barter-topup"
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        placeholder="0"
                        value={offerTopUp}
                        onChange={(e) => {
                          const raw = String(e.target.value || '');
                          const digits = raw.replace(/\D+/g, '');
                          // strip leading zeros so value doesn't start with 0
                          const normalized = digits.replace(/^0+/, '');
                          setOfferTopUp(normalized);
                        }}
                        onBlur={() => {
                          // show 0 if empty
                          if (!offerTopUp || offerTopUp.trim() === '') setOfferTopUp('0');
                        }}
                        className="pl-9"
                      />
                    </div>
                    <div className="mt-3">
                      <Label htmlFor="offer-note" className="text-sm font-medium">{offers.noteOptional || 'Note (optional)'}</Label>
                      <textarea id="offer-note" className="w-full mt-2 p-2 border rounded" placeholder={offers.noteOptional ? '' : 'Add a message for the seller'} value={offerNote} onChange={(e) => setOfferNote(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              {offers.cancel || 'Cancel'}
            </Button>
            <Button
              variant="hero"
              className="flex-1 gap-2"
              onClick={handleSubmitOffer}
              disabled={(
                mode === 'price' ? !(offerPrice && parseFloat(offerPrice) > 0) : (userProducts.length === 0 || !selectedOfferProductId)
              )}
            >
              <Send className="w-4 h-4" />
              {mode === 'price' ? (offers.sendOffer || 'Send Offer') : (offers.sendBarter || 'Send Barter')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
