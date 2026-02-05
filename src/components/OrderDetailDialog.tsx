import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { OrderTracking } from '@/components/ui/order-tracking';
import { Order } from '@/contexts/OrderContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface OrderDetailDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrderDetailDialog = ({ order, open, onOpenChange }: OrderDetailDialogProps) => {
  const { t } = useLanguage();

  if (!order) return null;

  // Treat order as any because server shape may differ from local Order type
  const o: any = order as any;

  // Normalize common fields with fallbacks
  const idStr = String(o.id ?? o.orderId ?? o.data?.id ?? '');
  const createdAt = o.createdAt ?? o.createdAtUtc ?? o.data?.createdAt ?? o.data?.created_at ?? o.data?.created ?? new Date().toISOString();
  const updatedAt = o.updatedAt ?? o.updatedAtUtc ?? o.data?.updatedAt ?? o.data?.updated_at ?? o.data?.updated ?? createdAt;

  const statusSafe = String(o.status ?? o.payment?.status ?? o.paymentStatus ?? 'placed');
  const shippingMethod = String(o.shippingMethod ?? o.shipping_method ?? 'standard');
  const shippingCost = Number(o.shippingCost ?? o.shipping_cost ?? o.data?.shippingCost ?? 0);
  const totalAmount = Number(o.total ?? o.totalAmount ?? o.data?.totalAmount ?? o.data?.total ?? 0);

  // Items array
  const items: any[] = Array.isArray(o.items) ? o.items : (Array.isArray(o.orderItems) ? o.orderItems : (Array.isArray(o.data?.items) ? o.data.items : []));

  // helper to get translated title for an item
  const getTranslatedTitle = (it: any) => {
    if (!it) return '';
    const translations = it.translations ?? it.translation ?? it.translationsList ?? [];
    if (Array.isArray(translations) && translations.length > 0) {
      const lang = (typeof (t as any).language === 'string') ? (t as any).language : undefined; // fallback
      // try to use language from LanguageContext if available via `it` or `t` object; otherwise prefer first translation
      const match = translations.find((tr: any) => String(tr.languageCode).toLowerCase().startsWith((lang ?? '').toLowerCase()));
      if (match) return match.title ?? match.name ?? it.title ?? it.name ?? '';
      return translations[0].title ?? translations[0].name ?? it.title ?? it.name ?? '';
    }
    return it.title ?? it.name ?? it.productName ?? '';
  };

  const getItemImage = (it: any) => (Array.isArray(it.images) && it.images[0]) || it.image || it.mainImage || '/placeholder.svg';

  const getItemPrice = (it: any) => Number(it.effectivePrice ?? it.price ?? it.unitPrice ?? 0);

  const orderSteps = [
    { name: t.checkout?.orderPlacedStep || 'Order Placed', timestamp: new Date(createdAt).toLocaleString(), isCompleted: true },
    { name: t.checkout?.confirmed || 'Confirmed', timestamp: String(statusSafe) !== 'placed' ? new Date(updatedAt).toLocaleString() : (t.checkout?.pending || 'Pending'), isCompleted: ['confirmed','shipped','outForDelivery','delivered'].includes(String(statusSafe)) },
    { name: t.checkout?.shipped || 'Shipped', timestamp: ['shipped','outForDelivery','delivered'].includes(String(statusSafe)) ? new Date(updatedAt).toLocaleString() : (t.checkout?.pending || 'Pending'), isCompleted: ['shipped','outForDelivery','delivered'].includes(String(statusSafe)) },
    { name: t.checkout?.outForDelivery || 'Out for Delivery', timestamp: ['outForDelivery','delivered'].includes(String(statusSafe)) ? new Date(updatedAt).toLocaleString() : (t.checkout?.pending || 'Pending'), isCompleted: ['outForDelivery','delivered'].includes(String(statusSafe)) },
    { name: t.checkout?.delivered || 'Delivered', timestamp: String(statusSafe) === 'delivered' ? new Date(updatedAt).toLocaleString() : (t.checkout?.pending || 'Pending'), isCompleted: String(statusSafe) === 'delivered' }
  ];

  const shippingMethodLabels: Record<string, string> = {
    standard: t.shipping?.standard || 'Standard Shipping',
    express: t.shipping?.express || 'Express Shipping',
    sameDay: t.shipping?.sameDay || 'Same Day Delivery',
  };

  // Returns a human-readable label for the order status
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'placed':
        return t.checkout?.orderPlacedStep || 'Order Placed';
      case 'confirmed':
        return t.checkout?.confirmed || 'Confirmed';
      case 'shipped':
        return t.checkout?.shipped || 'Shipped';
      case 'outForDelivery':
        return t.checkout?.outForDelivery || 'Out for Delivery';
      case 'delivered':
        return t.checkout?.delivered || 'Delivered';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t.checkout?.orderNumber || 'Order'}: #{idStr.slice(0,8).toUpperCase()}</span>
            <Badge className={cn(
              statusSafe === 'placed' && 'bg-primary/20 text-primary',
              statusSafe === 'confirmed' && 'bg-blue-100 text-blue-700',
              statusSafe === 'shipped' && 'bg-yellow-100 text-yellow-700',
              statusSafe === 'outForDelivery' && 'bg-orange-100 text-orange-700',
              statusSafe === 'delivered' && 'bg-sage text-sage-dark'
            )}>{getStatusLabel(statusSafe)}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t.checkout?.orderTracking || 'Order Tracking'}</h4>
            <OrderTracking steps={orderSteps} />
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">{t.checkout?.items || 'Items'}</h4>
            <div className="space-y-3">
              {items.map((it: any) => (
                <div key={it.id || it.productId || JSON.stringify(it)} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                  <img src={getItemImage(it)} alt={getTranslatedTitle(it)} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground line-clamp-2">{getTranslatedTitle(it)}</p>
                    <p className="text-xs text-muted-foreground">{t.checkout?.qty || 'Qty'}: {it.quantity ?? it.qty ?? 1}</p>
                    {Array.isArray(it.translations) && it.translations.length > 0 && (
                      <p className="text-xs text-muted-foreground">{t.checkout?.translations || 'Translations'}: {it.translations.map((tr: any) => `${tr.languageCode}:${tr.title}`).join(', ')}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-display text-primary">₼{getItemPrice(it)}</p>
                    <p className="text-xs text-muted-foreground">{t.checkout?.lineTotal || 'Line'}: ₼{it.lineTotal ?? (getItemPrice(it) * (it.quantity ?? 1))}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">{t.checkout?.customer || 'Customer'}</h4>
              <p className="text-sm text-muted-foreground">{o.clientFullName ?? o.clientName ?? o.customerName ?? o.address?.fullName ?? o.address?.name ?? o.shippingAddress?.fullName ?? ''}</p>
              <p className="text-sm text-muted-foreground">{o.clientEmail ?? o.email ?? o.address?.email ?? o.shippingAddress?.email ?? ''}</p>
              <p className="text-sm text-muted-foreground">{o.clientPhone ?? o.phone ?? o.address?.phone ?? o.shippingAddress?.phone ?? ''}</p>

              <hr className="my-3" />

              <h4 className="font-semibold text-foreground mb-2">{t.checkout?.deliveryAddress || 'Delivery Address'}</h4>
              <p className="text-sm text-muted-foreground">{o.deliveryAddress ?? o.delivery_address ?? o.address?.street ?? o.shippingAddress?.street ?? ''}</p>
              <p className="text-sm text-muted-foreground">{o.deliveryCity ?? o.delivery_city ?? o.address?.city ?? o.shippingAddress?.city ?? ''}</p>
              <p className="text-sm text-muted-foreground">{o.deliveryAddressDetails ?? o.delivery_address_details ?? o.address?.details ?? ''}</p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">{t.checkout?.orderSummary || 'Order Summary'}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.checkout?.subtotal || 'Subtotal'}</span>
                  <span>₼{items.reduce((s, it) => s + (Number(it.lineTotal ?? (getItemPrice(it) * (it.quantity ?? 1)))), 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{shippingMethodLabels[shippingMethod]}</span>
                  <span>₼{shippingCost}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                  <span>{t.checkout?.total || 'Total'}</span>
                  <span className="text-primary">₼{totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {o.payment && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">{t.checkout?.payment || 'Payment'}</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>{t.checkout?.paymentId || 'Id'}: {o.payment.id}</div>
                <div>{t.checkout?.amount || 'Amount'}: {o.payment.totalAmount} {o.payment.currency}</div>
                <div>{t.checkout?.method || 'Method'}: {o.payment.method}</div>
                <div>{t.checkout?.status || 'Status'}: {o.payment.status}</div>
                <div>{t.checkout?.gatewayTx || 'GatewayTx'}: {o.payment.gatewayTransactionId}</div>
                <div>{t.checkout?.createdAt || 'CreatedAt'}: {String(o.payment.createdAt)}</div>
              </div>
            </div>
          )}

          {o.receipt && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">{t.checkout?.receipt || 'Receipt'}</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>{t.checkout?.receiptId || 'Id'}: {o.receipt.id}</div>
                <div>{t.checkout?.file || 'File'}: {o.receipt.fileName}</div>
                <div>{t.checkout?.issuedAt || 'IssuedAt'}: {String(o.receipt.issuedAt)}</div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
