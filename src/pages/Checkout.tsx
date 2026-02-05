import { useState, useMemo, useContext, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Truck, CreditCard, MapPin, Check, User, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { OrderTracking } from '@/components/ui/order-tracking';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOrders, Order } from '@/contexts/OrderContext';
import { useCart } from '@/contexts/CartContext';
import { AuthContext } from '@/features/auth/contexts/AuthProvider';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { checkout as checkoutApi } from '@/features/payment/checkout.service';
import GooglePayButton from '@google-pay/button-react';
import { apiCallWithManualRefresh } from '@/shared/apiWithManualRefresh';

// Mirror backend DeliveryMethod enum so TypeScript enforces correct values in the client
export enum DeliveryMethod {
  Unknown = 0,
  Delivery = 1,
  Pickup = 2,
  Other = 3,
}

const Checkout = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useContext(AuthContext);
  const { addOrder } = useOrders();
  const { items: cartItems, clearCart, refreshCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const fromCart = location.state?.fromCart;
  const productId = location.state?.productId;

  type CheckoutItem = { id: string; name: string; price: number; image: string; quantity: number; originalPrice?: number; discountPrice?: number };
  const checkoutItems = useMemo<CheckoutItem[]>(() => {
    if (fromCart && cartItems.length > 0) {
      return cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: Number(item.quantity ?? 1),
        originalPrice: item.originalPrice,
        discountPrice: item.discountPrice,
      }));
    }
    return [];
  }, [fromCart, cartItems]);

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'sameDay'>('standard');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrders, setPlacedOrders] = useState<Order[]>([]);
  // Google Pay helper states
  const [googlePayAvailable, setGooglePayAvailable] = useState(false);
  const [googlePayLoading, setGooglePayLoading] = useState(false);

  const phoneRegex = /^\+994\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const checkoutSchema = z.object({
    fullName: z.string()
      .min(3, t.checkout.validation?.fullNameMin || 'Full name must be at least 3 characters')
      .max(100, t.checkout.validation?.fullNameMax || 'Full name cannot exceed 100 characters'),
    email: z.string()
      .regex(emailRegex, t.checkout.validation?.invalidEmail || 'Invalid email address'),
    phone: z.string()
      .regex(phoneRegex, t.auth?.errors?.phoneInvalidFormat || 'Format: +994 XX XXX XX XX'),
    street: z.string()
      .min(5, t.checkout.validation?.streetMin || 'Street address must be at least 5 characters')
      .max(200, t.checkout.validation?.streetMax || 'Street address cannot exceed 200 characters'),
    city: z.string().min(2),
    addressDetails: z.string().max(500).optional(),
  });

  type CheckoutFormValues = z.infer<typeof checkoutSchema>;

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user ? `${user.name} ${user.surname}` : '',
      email: user?.email || '',
      phone: user?.phone_number || '',
      street: '',
      city: 'Bakı',
      addressDetails: '',
    } as CheckoutFormValues,
  });

  const formatPhoneNumber = (value: string) => {
    let cleaned = value.replace(/[^\d+]/g, '');

    if (!cleaned.startsWith('+994')) {
      if (cleaned.startsWith('994')) {
        cleaned = '+' + cleaned;
      } else if (cleaned.startsWith('0')) {
        cleaned = '+994' + cleaned.substring(1);
      } else if (!cleaned.startsWith('+')) {
        cleaned = '+994' + cleaned;
      }
    }

    const digits = cleaned.replace('+994', '').replace(/\D/g, '');
    let formatted = '+994';

    if (digits.length > 0) {
      formatted += ' ' + digits.substring(0, 2);
    }
    if (digits.length > 2) {
      formatted += ' ' + digits.substring(2, 5);
    }
    if (digits.length > 5) {
      formatted += ' ' + digits.substring(5, 7);
    }
    if (digits.length > 7) {
      formatted += ' ' + digits.substring(7, 9);
    }

    return formatted;
  };

  const shippingPrices: Record<string, number> = {
    standard: 15,
    express: 35,
    sameDay: 60,
  };

  // Map local shipping method to backend DeliveryMethod enum
  const mapToDeliveryMethod = (method: 'standard' | 'express' | 'sameDay' | string): DeliveryMethod => {
    // YeniNefesAdminFeaturesApi.Core.Enums.DeliveryMethod: Unknown=0, Delivery=1, Pickup=2, Other=3
    if (!method) return DeliveryMethod.Unknown;
    const m = String(method).toLowerCase();
    if (m === 'standard' || m === 'express' || m === 'sameday' || m === 'sameday') return DeliveryMethod.Delivery;
    if (m === 'pickup') return DeliveryMethod.Pickup;
    return DeliveryMethod.Other;
  };

  // try to detect Google Pay availability using PaymentRequest where supported
  useEffect(() => {
    const detect = async () => {
      try {
        if (typeof window !== 'undefined' && 'PaymentRequest' in window) {
          const localSubtotal = checkoutItems.reduce((s, it) => s + it.price, 0);
          const localShipping = shippingPrices[shippingMethod] ?? 0;
          const localTotal = localSubtotal + localShipping;
          const methodData: any = [{ supportedMethods: 'https://google.com/pay', data: {} }];
          const details = { total: { label: 'Total', amount: { currency: 'AZN', value: String(localTotal || 0) } } };
          // canMakePayment is not present in all implementations; guard it
          const req: any = new (window as any).PaymentRequest(methodData, details);
          if (typeof req.canMakePayment === 'function') {
            const can = await req.canMakePayment();
            setGooglePayAvailable(Boolean(can));
          }
        }
      } catch (e) {
        // detection failed — keep googlePayAvailable false
        setGooglePayAvailable(false);
      }
    };
    void detect();
  }, [checkoutItems, shippingMethod]);

  // runtime validator — returns true when required fields present, shows info toast for first missing
  const validateFormValues = (values: Partial<CheckoutFormValues>) => {
    if (!values.fullName || String(values.fullName).trim().length === 0) {
      toast({ title: t.checkout.validation?.fullNameMin || 'Missing full name', description: t.checkout.fullName || 'Please provide your full name', variant: 'default' });
      return false;
    }
    if (!values.email || String(values.email).trim().length === 0) {
      toast({ title: t.checkout.validation?.invalidEmail || 'Missing email', description: t.auth?.email || 'Please provide your email', variant: 'default' });
      return false;
    }
    if (!values.phone || String(values.phone).trim().length === 0) {
      toast({ title: t.auth?.errors?.phoneInvalidFormat || 'Missing phone', description: t.auth?.phone || 'Please provide your phone', variant: 'default' });
      return false;
    }
    if (!values.street || String(values.street).trim().length === 0) {
      toast({ title: t.checkout.validation?.streetMin || 'Missing street', description: t.checkout.street || 'Please provide a street address', variant: 'default' });
      return false;
    }
    if (!values.city || String(values.city).trim().length === 0) {
      toast({ title: 'Missing city', description: t.checkout.city || 'Please provide a city', variant: 'default' });
      return false;
    }
    return true;
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container-custom py-20 text-center">
          <p className="text-muted-foreground mb-4">{t.checkout.loginRequired || 'Please login to continue'}</p>
          <Link to="/auth">
            <Button variant="hero">{t.nav.login}</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <Layout>
        <div className="container-custom py-20 text-center">
          <p className="text-muted-foreground">{t.checkout.noProduct || 'No items to checkout'}</p>
          <Link to="/catalog">
            <Button variant="outline" className="mt-4">
              {t.compare.browseCatalog}
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * (item.quantity ?? 1)), 0);
  const shippingCost = shippingPrices[shippingMethod];
  const total = subtotal + shippingCost;

  const onSubmit = async (data: CheckoutFormValues, options?: { skipBackend?: boolean }) => {
    const orders: Order[] = [];
    if (!validateFormValues(data)) return;

    // Build backend payload unless explicitly skipped
    const deliveryMethodNumeric = mapToDeliveryMethod(shippingMethod);
    const payloadBase: any = {
      currency: 'AZN',
      method: options?.skipBackend ? 'manual' : 'card',
      gatewayTransactionId: undefined,
      clientFullName: data.fullName,
      clientEmail: data.email,
      clientPhone: data.phone,
      deliveryAddress: data.street,
      deliveryCity: data.city,
      deliveryAddressDetails: data.addressDetails || '',
      deliveryMethod: deliveryMethodNumeric,
      deliveryPrice: shippingCost,
    };

    if (!options?.skipBackend) {
      try {
        const resp = await apiCallWithManualRefresh(() => checkoutApi(payloadBase));
        if (!resp?.isSuccess) {
          const msg = resp?.message ?? 'Checkout failed';
          toast({ title: 'Payment failed', description: msg, variant: 'destructive' });
          return;
        }
      } catch (err) {
        console.error('[Checkout] checkout API failed', err);
        toast({ title: 'Payment error', description: 'Failed to complete checkout', variant: 'destructive' });
        return;
      }
    }

    // compute total quantity so we can split shipping cost proportionally
    const totalQuantity = checkoutItems.reduce((s, it) => s + (it.quantity ?? 1), 0) || 1;
    checkoutItems.forEach(item => {
      const qty = item.quantity ?? 1;
      const shippingShare = (shippingCost * qty) / totalQuantity;
      const lineTotal = (item.price * qty) + shippingShare;
      const order = addOrder({
        productId: item.id,
        productName: item.name,
        productImage: item.image,
        productPrice: item.price,
        quantity: qty,
        shippingMethod,
        shippingCost: shippingShare,
        total: lineTotal,
        address: {
          fullName: data.fullName,
          street: data.street,
          city: data.city,
          phone: data.phone,
          email: data.email,
          addressDetails: data.addressDetails || '',
        },
      });
      orders.push(order);
    });

    if (fromCart) {
      try {
        try { await refreshCart(); } catch (_) { }
      } catch (_) { }
    }

    setPlacedOrders(orders);
    setOrderPlaced(true);
    toast({ title: t.checkout.orderPlaced || 'Order placed successfully!', description: '', variant: 'default' });
    setTimeout(() => navigate('/dashboard?tab=orders'), 100);
  };

  const orderSteps = [
    { name: t.checkout.orderPlacedStep, timestamp: placedOrders.length > 0 ? new Date(placedOrders[0].createdAt).toLocaleString() : new Date().toLocaleString(), isCompleted: true },
    { name: t.checkout.confirmed, timestamp: t.checkout.pending, isCompleted: false },
    { name: t.checkout.shipped, timestamp: t.checkout.pending, isCompleted: false },
    { name: t.checkout.outForDelivery, timestamp: t.checkout.pending, isCompleted: false },
    { name: t.checkout.delivered, timestamp: t.checkout.pending, isCompleted: false },
  ];

  if (orderPlaced && placedOrders.length > 0) {
    return (
      <Layout>
        <div className="container-custom py-8 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-sage-dark" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              {t.checkout.thankYou}
            </h1>
            <p className="text-muted-foreground">{t.checkout.orderConfirmation}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {placedOrders.length} {placedOrders.length === 1 ? 'order' : 'orders'} placed
            </p>
          </motion.div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t.checkout.orderTracking}</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTracking steps={orderSteps} />
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t.checkout.orderSummary}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4">
                {placedOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <img
                      src={order.productImage}
                      alt={order.productName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{order.productName}</p>
                      <p className="text-sm text-muted-foreground">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <p className="text-primary font-display">₼{order.productPrice}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.checkout.shipping}</span>
                  <span>₼{shippingCost}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>{t.checkout.total}</span>
                  <span className="text-primary">₼{total}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <h4 className="font-semibold text-foreground mb-2">{t.checkout.deliveryAddress || 'Delivery Address'}</h4>
                <p className="text-sm text-muted-foreground">{placedOrders[0].address.fullName}</p>
                <p className="text-sm text-muted-foreground">{placedOrders[0].address.street}</p>
                <p className="text-sm text-muted-foreground">{placedOrders[0].address.city}</p>
                <p className="text-sm text-muted-foreground">{placedOrders[0].address.phone}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Link to="/catalog" className="flex-1">
              <Button variant="outline" className="w-full">
                {t.checkout.continueShopping}
              </Button>
            </Link>
            <Link to="/dashboard?tab=orders" className="flex-1">
              <Button variant="hero" className="w-full">
                {t.checkout.viewOrders}
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t.checkout.backToProduct || 'Back'}
        </Button>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {t.checkout.contactInfo || 'Contact Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">{t.checkout.fullName || 'Full Name'} *</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      className={cn(form.formState.errors.fullName && "border-destructive")}
                      {...form.register("fullName")}
                    />
                    {form.formState.errors.fullName && (
                      <p className="text-xs text-destructive mt-1">{form.formState.errors.fullName.message}</p>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">{t.auth.email} *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          className={cn("pl-10", form.formState.errors.email && "border-destructive")}
                          placeholder="you@example.com"
                          {...form.register("email")}
                        />
                      </div>
                      {form.formState.errors.email && (
                        <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">{t.auth.phone} *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          className={cn("pl-10", form.formState.errors.phone && "border-destructive")}
                          placeholder="+994 XX XXX XX XX"
                          {...form.register("phone", {
                            onChange: (e) => {
                              e.target.value = formatPhoneNumber(e.target.value);
                            }
                          })}
                        />
                      </div>
                      {form.formState.errors.phone && (
                        <p className="text-xs text-destructive mt-1">{form.formState.errors.phone.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {t.checkout.shippingAddress}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="street">{t.checkout.street} *</Label>
                    <Input
                      id="street"
                      placeholder={t.checkout.streetPlaceholder}
                      className={cn(form.formState.errors.street && "border-destructive")}
                      {...form.register("street")}
                    />
                    {form.formState.errors.street && (
                      <p className="text-xs text-destructive mt-1">{form.formState.errors.street.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="city">{t.checkout.city}</Label>
                    <Input id="city" value="Bakı" disabled {...form.register("city")} />
                  </div>
                  <div>
                    <Label htmlFor="addressDetails">{t.checkout.addressDetails || 'Address details'}</Label>
                    <Input id="addressDetails" placeholder={t.checkout.addressDetailsPlaceholder || 'Apt, floor, entrance...'} {...form.register('addressDetails')} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    {t.checkout.shippingMethod}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={shippingMethod} onValueChange={(v) => setShippingMethod(v as 'standard' | 'express' | 'sameDay')}>
                    <div className="space-y-3">
                      <Label
                        htmlFor="standard"
                        className={cn(
                          "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all",
                          shippingMethod === 'standard' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="standard" id="standard" />
                          <div>
                            <p className="font-medium">{t.shipping.standard}</p>
                            <p className="text-sm text-muted-foreground">{t.shipping.standardDuration}</p>
                          </div>
                        </div>
                        <span className="font-display font-semibold">₼15</span>
                      </Label>
                      <Label
                        htmlFor="express"
                        className={cn(
                          "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all",
                          shippingMethod === 'express' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="express" id="express" />
                          <div>
                            <p className="font-medium">{t.shipping.express}</p>
                            <p className="text-sm text-muted-foreground">{t.shipping.expressDuration}</p>
                          </div>
                        </div>
                        <span className="font-display font-semibold">₼35</span>
                      </Label>
                      <Label
                        htmlFor="sameDay"
                        className={cn(
                          "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all",
                          shippingMethod === 'sameDay' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="sameDay" id="sameDay" />
                          <div>
                            <p className="font-medium">{t.shipping.sameDay}</p>
                            <p className="text-sm text-muted-foreground">{t.shipping.sameDayDuration}</p>
                          </div>
                        </div>
                        <span className="font-display font-semibold">₼60</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>{t.checkout.orderSummary}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                    {checkoutItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground line-clamp-2 text-sm">{item.name}</p>
                          <div className="flex items-center gap-3">
                            {/* unit price / discount */}
                            {item.discountPrice && item.discountPrice > 0 ? (
                              <div className="flex items-baseline gap-2">
                                <p className="text-primary font-display">₼{item.discountPrice}</p>
                                {item.originalPrice ? (
                                  <p className="text-xs text-muted-foreground line-through">₼{item.originalPrice}</p>
                                ) : null}
                              </div>
                            ) : (
                              <p className="text-primary font-display">₼{item.price}</p>
                            )}
                            {/* quantity and line total */}
                            <span className="text-sm text-muted-foreground">×{item.quantity}</span>
                            <span className="ml-auto font-semibold text-foreground">₼{(item.price * (item.quantity ?? 1)).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.checkout.subtotal} ({checkoutItems.length} items)</span>
                      <span>₼{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.checkout.shipping}</span>
                      <span>₼{shippingCost}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t border-border pt-3">
                      <span>{t.checkout.total}</span>
                      <span className="text-primary">₼{total}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <GooglePayButton
                      environment="TEST"
                      buttonType="checkout"
                      buttonBorderType="no_border"
                      buttonSizeMode="fill"
                      style={{ width: "100%", height: 40 }}
                      buttonColor="black"
                      paymentRequest={{
                        apiVersion: 2,
                        apiVersionMinor: 0,
                        allowedPaymentMethods: [
                          {
                            type: 'CARD',
                            parameters: {
                              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                              allowedCardNetworks: ['MASTERCARD', 'VISA'],
                            },
                            tokenizationSpecification: {
                              type: 'PAYMENT_GATEWAY',
                              parameters: {
                                gateway: 'example',
                                gatewayMerchantId: 'exampleGatewayMerchantId',
                              },
                            },
                          },
                        ],
                        merchantInfo: {
                          merchantId: '01234567890123456789',
                          merchantName: 'YeniNefes Inc',
                        },
                        transactionInfo: {
                          totalPriceStatus: 'FINAL',
                          totalPrice: String(total),
                          currencyCode: 'AZN',
                        },
                      }}
                      onLoadPaymentData={async (paymentData: any) => {
                        console.log('Google Pay payment data', paymentData);
                        setGooglePayLoading(true);
                        try {
                          // extract token/gateway id from common Google Pay shapes
                          let token: string | undefined = undefined;
                          try {
                            token = paymentData?.paymentMethodData?.tokenizationData?.token;
                          } catch (e) {
                            // ignore
                          }
                          if (!token) {
                            try {
                              // sometimes token is nested as JSON string
                              const raw = paymentData?.paymentMethodData?.tokenizationData?.token || paymentData?.paymentMethodData?.tokenizationData;
                              token = typeof raw === 'string' ? raw : JSON.stringify(raw);
                            } catch (e) {
                              token = undefined;
                            }
                          }

                          const values = form.getValues();
                          const payload: any = {
                            currency: 'AZN',
                            method: 'googlepay',
                            gatewayTransactionId: token ?? undefined,
                            clientFullName: values.fullName,
                            clientEmail: values.email,
                            clientPhone: values.phone,
                            deliveryAddress: values.street,
                            deliveryCity: values.city,
                            deliveryAddressDetails: values.addressDetails || '',
                            deliveryMethod: mapToDeliveryMethod(shippingMethod),
                            deliveryPrice: shippingCost,
                          };

                          const resp = await apiCallWithManualRefresh(() => checkoutApi(payload));
                          console.log('checkout API response', resp);
                          if (resp?.isSuccess) {
                            toast({ title: 'Payment successful', description: 'Order placed via Google Pay', variant: 'default' });
                            // create local order records
                            await onSubmit(values as CheckoutFormValues, { skipBackend: true });
                          } else {
                            const msg = resp?.message ?? 'Payment failed';
                            toast({ title: 'Payment failed', description: msg, variant: 'destructive' });
                          }
                        } catch (err) {
                          console.error('Google Pay checkout error', err);
                          toast({ title: 'Payment error', description: 'Failed to complete Google Pay checkout', variant: 'destructive' });
                        } finally {
                          setGooglePayLoading(false);
                        }
                      }}
                    />
                  </div>

                  <Link to="/shipping" className="block mt-4">
                    <Button variant="link" className="w-full text-sm">
                      {t.checkout.learnAboutShipping}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Checkout;