import { useState, useEffect, useContext } from 'react';
import { TrendingUp, Package, DollarSign, Calendar, Filter, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSales, Sale } from '@/contexts/SalesContext';
import { cn } from '@/lib/utils';
import { AuthContext } from '@/features/auth/contexts/AuthProvider';
import { getStats } from '@/features/services/Order/Order.service';
import { apiCallWithManualRefresh } from '@/shared/apiWithManualRefresh';

const Sales = () => {
  const languageCtx = useLanguage();
  const { t } = languageCtx as any;
  // try common keys for the current locale (lang / language / locale / code)
  const lang = (languageCtx as any).lang ?? (languageCtx as any).language ?? (languageCtx as any).locale ?? (languageCtx as any).code ?? 'en';

  const { isAuthenticated } = useContext(AuthContext);
  const { getSalesByUser, getSalesByPeriod } = useSales();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'all'>('all');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Use the provided API response (mapped) as the data source for this page.
  // Falls back to the existing SalesContext functions if the API data isn't available.
  const [apiSales, setApiSales] = useState<Sale[]>([]);
  const [apiTotals, setApiTotals] = useState<any | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const totalPages = totalCount && pageSize ? Math.max(1, Math.ceil(totalCount / pageSize)) : null;

  // when language changes, reset to first page
  useEffect(() => {
    setPage(1);
  }, [lang]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const resp = await apiCallWithManualRefresh(() => getStats({ language: lang, page, pageSize }));
        console.log('Fetched sales summary', resp);
        if (!mounted) return;

        const raw = resp?.data?.data ?? resp?.data ?? resp;

        let totals: any = raw?.totals ?? null;
        let orders: any[] = [];

        if (Array.isArray(raw?.items) && raw.items.length > 0 && (raw.items[0].data || raw.items[0].totals)) {
          const first = raw.items[0];
          totals = first.totals ?? totals;
          orders = Array.isArray(first.data) ? first.data : [];
        } else if (Array.isArray(raw?.data) && raw?.totals) {
          // shape: { totals, data: [...] }
          totals = raw.totals;
          orders = Array.isArray(raw.data) ? raw.data : [];
        } else if (Array.isArray(raw?.orders)) {
          orders = raw.orders;
        } else if (Array.isArray(raw?.data)) {
          orders = raw.data;
        }

        // read total count / meta from common locations
        const foundTotalCount = raw?.total ?? raw?.totalCount ?? raw?.meta?.total ?? raw?.meta?.totalCount ?? raw?.items?.[0]?.total ?? raw?.items?.[0]?.totalCount ?? null;

        if (orders.length > 0) {
          const mapped: Sale[] = orders.map((o: any) => {
            const firstItem = o.items && o.items.length ? o.items[0] : null;
            return {
              id: o.id,
              createdAt: o.createdAt,
              total: o.totalAmount ?? o.revenue ?? 0,
              // new fields from API
              itemsCount: o.itemsCount ?? (o.items?.length ?? 0),
              revenue: o.revenue ?? (o.totalAmount ?? 0),
              profit: o.profit ?? 0,
              // keep first item preview fields
              productImage: firstItem?.images?.[0] ?? '',
              productName: firstItem?.title ?? '',
              buyerName: o.buyer?.name ?? '',
              buyerEmail: o.buyer?.email ?? '',
              // only include buyerAddress when provided by API; support older buyer.address or new delivery* fields
              buyerAddress: (o.buyer?.address) ? {
                city: o.buyer.address.city ?? '',
                street: o.buyer.address.street ?? '',
                addressDetails: o.buyer.address.addressDetails ?? '',
                zipCode: o.buyer.address.zipCode ?? '',
              } : (o.deliveryAddress || o.deliveryCity || o.deliveryAddressDetails) ? {
                city: o.deliveryCity ?? '',
                street: o.deliveryAddress ?? '',
                addressDetails: o.deliveryAddressDetails ?? '',
                zipCode: o.deliveryZipCode ?? '',
              } : undefined,
              // preserve full items for detail view
              items: o.items ?? [],
              productPrice: firstItem?.price ?? 0,
              shippingPrice: 0,
              status: 'confirmed'
            } as Sale;
          });

          setApiSales(mapped);
          setApiTotals(totals);
          setTotalCount(typeof foundTotalCount === 'number' ? foundTotalCount : null);
        } else {
          // no orders, still set totals and totalCount if present
          setApiSales([]);
          setApiTotals(totals);
          setTotalCount(typeof foundTotalCount === 'number' ? foundTotalCount : null);
        }
      } catch (err) {
        console.error('Failed to fetch sales summary', err);
      }
    })();

    return () => { mounted = false; };
  }, [lang, page, pageSize]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  // Prefer API sales if present, otherwise fall back to SalesContext helpers.
  const sales = apiSales && apiSales.length > 0
    ? apiSales
    : (period === 'all' ? getSalesByUser() : getSalesByPeriod(period as 'week' | 'month' | 'year'));

  // Compute totals, prefer API totals when available (respecting selected period)
  const totalRevenue = apiTotals
    ? (period === 'all' ? apiTotals.overall.revenue : apiTotals[period]?.revenue ?? 0)
    : sales.reduce((sum, sale) => sum + (sale.total ?? 0), 0);

  const totalOrders = apiTotals ? (period === 'all' ? apiTotals.overall.orders : apiTotals[period]?.orders ?? sales.length) : sales.length;

  const confirmedOrders = apiSales && apiSales.length > 0
    ? apiSales.filter(s => s.status === 'confirmed' || s.status === 'shipped' || s.status === 'delivered').length
    : sales.filter(s => s.status === 'confirmed' || s.status === 'shipped' || s.status === 'delivered').length;

  const getStatusLabel = (status: Sale['status']) => {
    const labels: Record<string, string> = {
      confirmed: t.sales?.confirmed || 'Confirmed',
      shipped: t.sales?.shipped || 'Shipped',
      delivered: t.sales?.delivered || 'Delivered',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: Sale['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-orange-100 text-orange-700';
      case 'delivered': return 'bg-sage text-sage-dark';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) return null;

  return (
    <Layout>
      <div className="container-custom py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-1">
              {t.sales?.title || 'My Sales'}
            </h1>
            <p className="text-muted-foreground">
              {t.sales?.subtitle || 'Track your sales and revenue'}
            </p>
          </div>
          <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.sales?.allTime || 'All Time'}</SelectItem>
              <SelectItem value="week">{t.sales?.thisWeek || 'This Week'}</SelectItem>
              <SelectItem value="month">{t.sales?.thisMonth || 'This Month'}</SelectItem>
              <SelectItem value="year">{t.sales?.thisYear || 'This Year'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{t.sales?.totalRevenue || 'Total Revenue'}</span>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">₼{totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-sage/20 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-sage-dark" />
              </div>
              <span className="text-sm text-muted-foreground">{t.sales?.totalOrders || 'Total Orders'}</span>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{totalOrders}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-sage/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-sage-dark" />
              </div>
              <span className="text-sm text-muted-foreground">{t.sales?.confirmed || 'Confirmed'}</span>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{confirmedOrders}</p>
          </div>
        </div>

        {sales.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              {t.sales?.noSales || 'No sales yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t.sales?.noSalesDesc || 'When someone buys your furniture, it will appear here.'}
            </p>
            <Button onClick={() => navigate('/upload')} variant="hero">
              {t.nav?.upload || 'List Furniture'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-sm text-muted-foreground font-medium">
              <div className="col-span-4">{t.sales?.product || 'Product'}</div>
              <div className="col-span-2">{t.sales?.buyer || 'Buyer'}</div>
              <div className="col-span-2">{t.sales?.date || 'Date'}</div>
              <div className="col-span-2">{t.sales?.amount || 'Amount'}</div>
              <div className="col-span-2">{t.sales?.status || 'Status'}</div>
            </div>
            
            {sales.map((sale) => (
              <div
                key={sale.id}
                onClick={() => setSelectedSale(selectedSale?.id === sale.id ? null : sale)}
                className={cn(
                  "bg-card border rounded-xl p-4 cursor-pointer transition-all",
                  selectedSale?.id === sale.id ? "border-primary shadow-md" : "border-border hover:border-primary/50"
                )}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                    <img
                      src={sale.productImage}
                      alt={sale.productName}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-foreground truncate">{sale.productName}</h4>
                      <p className="text-sm text-muted-foreground md:hidden">
                        {sale.buyerName} • {formatDate(sale.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block col-span-2 text-foreground">{sale.buyerName}</div>
                  <div className="hidden md:block col-span-2 text-muted-foreground text-sm">
                    {formatDate(sale.createdAt)}
                  </div>
                  <div className="col-span-6 md:col-span-2 font-display font-semibold text-primary">
                    ₼{sale.total.toFixed(2)}
                  </div>
                  <div className="col-span-6 md:col-span-2 flex items-center justify-end md:justify-start gap-2">
                    <Badge className={getStatusColor(sale.status)}>
                      {getStatusLabel(sale.status)}
                    </Badge>
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                {selectedSale?.id === sale.id && (
                  <div className="mt-4 pt-4 border-t border-border grid sm:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-foreground mb-2">
                        {t.sales?.buyerInfo || 'Buyer Information'}
                      </h5>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">{t.auth?.email || 'Email'}:</span> {sale.buyerEmail}</p>
                        {sale.buyerAddress ? (
                          <>
                            <p><span className="text-muted-foreground">{t.checkout?.city || 'City'}:</span> {sale.buyerAddress.city || '—'}</p>
                            <p><span className="text-muted-foreground">{t.checkout?.street || 'Street'}:</span> {sale.buyerAddress.street || '—'}</p>
                            {sale.buyerAddress.addressDetails && (
                              <p><span className="text-muted-foreground">{t.auth?.addressDetails || 'Details'}:</span> {sale.buyerAddress.addressDetails}</p>
                            )}
                            {sale.buyerAddress.zipCode && (
                              <p><span className="text-muted-foreground">{t.auth?.zipCode || 'Zip'}:</span> {sale.buyerAddress.zipCode}</p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">{t.auth.noAddressProvided || 'No address provided'}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground mb-2">
                        {t.sales?.orderDetails || 'Order Details'}
                      </h5>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">{t.sales?.orderId || 'Order ID'}:</span> #{sale.id.slice(0, 8).toUpperCase()}</p>
                        <p><span className="text-muted-foreground">{t.sales?.product || 'Product'}:</span> ₼{sale.productPrice.toFixed(2)}</p>
                        <p><span className="text-muted-foreground">{t.checkout?.shipping || 'Shipping'}:</span> ₼{sale.shippingPrice.toFixed(2)}</p>
                        <p className="font-semibold"><span className="text-muted-foreground">{t.checkout?.total || 'Total'}:</span> ₼{sale.total.toFixed(2)}</p>

                        {/* show API-provided fields */}
                        {(sale as any).itemsCount !== undefined && (
                          <p className="text-sm text-muted-foreground">{t.sales?.items || 'Items'}: {(sale as any).itemsCount}</p>
                        )}
                        {(sale as any).revenue !== undefined && (
                          <p className="text-sm text-muted-foreground">{t.sales?.revenue || 'Revenue'}: ₼{(sale as any).revenue}</p>
                        )}
                        {(sale as any).profit !== undefined && (
                          <p className="text-sm text-muted-foreground">{t.sales?.profit || 'Profit'}: ₼{(sale as any).profit}</p>
                        )}

                        {/* list all items in the order */}
                        {(sale as any).items && (sale as any).items.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {(sale as any).items.map((it: any) => (
                              <div key={it.id} className="flex items-center gap-3">
                                <img src={it.images?.[0]} alt={it.title} className="w-10 h-10 object-cover rounded" />
                                <div className="min-w-0">
                                  <div className="text-sm text-foreground truncate">{it.title}</div>
                                  <div className="text-xs text-muted-foreground">Qty: {it.quantity} • ₼{it.lineTotal.toFixed(2)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination controls */}
            <div className="flex items-center justify-between mt-4 px-4">
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>{t.pagination?.prev || 'Prev'}</Button>
                <Button variant="secondary" size="sm" disabled={totalCount !== null && page >= (totalPages ?? 1)} onClick={() => setPage(p => p + 1)}>{t.pagination?.next || 'Next'}</Button>
                <span className="text-sm text-muted-foreground">{t.pagination.page || 'Page'} {page}{totalPages ? ` of ${totalPages}` : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">{t.pagination?.perPage || 'Per page'}</label>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="bg-transparent border border-border rounded px-2 py-1 text-sm">
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
           </div>
         )}
       </div>
     </Layout>
   );
 };

 export default Sales;
