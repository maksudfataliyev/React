import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Trash2, X, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCartItems as fetchCartItemsFromApi } from '@/features/services/Cart/Cart.service';
import { apiCallWithManualRefresh } from '@/shared/apiWithManualRefresh';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const CartSheet = () => {
  const { items, removeFromCart, clearCart, itemCount, total, increaseQuantity, decreaseQuantity, refreshCart } = useCart();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleCheckout = () => {
    setOpen(false);
    if (items.length > 0) {
      navigate('/checkout', { state: { fromCart: true } });
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeFromCart(id);
      toast({ title: 'Removed', description: 'Item removed from cart' });
    } catch (e) {
      console.error('[CartSheet] remove error', e);
      toast({ title: 'Error', description: 'Failed to remove item', variant: 'destructive' });
    }
  };

  const handleIncrease = async (id: string) => {
    try {
      await increaseQuantity(id);
    } catch (e) {
      console.error('[CartSheet] increase error', e);
      toast({ title: 'Error', description: 'Failed to increase quantity', variant: 'destructive' });
    }
  };

  const handleDecrease = async (id: string) => {
    try {
      await decreaseQuantity(id);
    } catch (e) {
      console.error('[CartSheet] decrease error', e);
      toast({ title: 'Error', description: 'Failed to decrease quantity', variant: 'destructive' });
    }
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      // when opening the cart sheet, fetch from server and log payload/response for debugging
      void (async () => {
        try {
          const payload = { lang: language };
          console.log('[CartSheet] cart fetch payload', payload);
          const resp = await apiCallWithManualRefresh(() => fetchCartItemsFromApi(language));
          console.log('[CartSheet] cart API raw response', resp);
        } catch (err) {
          console.error('[CartSheet] cart API error', err);
        } finally {
          // ensure context state is refreshed after the API call
          void refreshCart();
        }
      })();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {t.cart?.title || 'Shopping Cart'} ({itemCount})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t.cart?.empty || 'Your cart is empty'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const stock = Number(item.inStock ?? 0);
                const qty = Number(item.quantity ?? 1);
                const canIncrease = stock <= 0 ? false : qty < stock;
                const canDecrease = qty > 1;
                const outOfStock = stock <= 0;

                return (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.condition}</p>
                      <p className="text-primary font-display font-semibold">₼{item.price}</p>
                      {outOfStock && (
                        <div className="text-xs text-destructive mt-1">{t.cart?.outOfStock || 'Out of stock'}</div>
                      )}
                      {!outOfStock && stock > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">{`${t.cart?.inStock || 'Stock'}: ${stock}`}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleDecrease(item.id)} disabled={!canDecrease} title={!canDecrease ? 'Minimum quantity reached' : ''}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center">{qty}</span>
                      <Button variant="outline" size="icon" onClick={() => handleIncrease(item.id)} disabled={!canIncrease} title={!canIncrease ? (outOfStock ? 'Out of stock' : 'Reached stock limit') : ''}>
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border pt-4 space-y-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>{t.checkout?.total || 'Total'}</span>
              <span className="text-primary font-display">₼{total}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={clearCart}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {t.cart?.clear || 'Clear'}
              </Button>
              <Button
                variant="hero"
                onClick={handleCheckout}
                className="flex-1"
              >
                {t.cart?.checkout || 'Checkout'}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
