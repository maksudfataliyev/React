import { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { Package, MessageSquare, RefreshCw, Settings, Plus, Loader2, Camera, ShoppingBag, MapPin, Check, X, User, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { getProductsByClientId } from '@/features/services/product/products.service';
import { useOrders, Order } from '@/contexts/OrderContext';
import { getClientOrders, getById } from '@/features/services/Order/Order.service';
import { getConversations, createConversation } from '@/features/services/Chat/chat.service';
import { useOffers } from '@/contexts/OffersContext';
import { OrderDetailDialog } from '@/components/OrderDetailDialog';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AuthContext } from '@/features/auth/contexts/AuthProvider';
import { tokenStorage } from '@/shared/tokenStorage';
import { editClientProfile, getClientProfile } from '@/features/services/ProfileServices/profile.service';
import { apiCallWithManualRefresh } from '@/shared/apiWithManualRefresh';
import { ChangePassword } from '@/features/account/services/register.service';
import { uploadImage } from '@/shared/utils/imagePost';
import { getReceivedOffers, getSentOffers, acceptOffer as svcAcceptOffer, rejectOffer as svcRejectOffer } from '@/features/services/Offers/offers.service';

const normalizeApiResult = (res: any) => {
  if (!res) return { success: false, message: undefined, data: undefined };
  const success = res?.isSuccess === true || res?.success === true || res?.data?.isSuccess === true || res?.data?.success === true;
  const message = res?.message ?? res?.data?.message ?? res?.statusMessage ?? undefined;
  const data = res?.data ?? (res && !res.isSuccess && !res.data ? res : undefined);
  return { success, message, data };
};


const Dashboard = () => {
  const { t, language } = useLanguage();
  const { user, isAuthenticated, logout, loading } = useContext(AuthContext) as any;
  const { getOrdersByUser } = useOrders();
  const { getOffersBySeller, getOffersByBuyer } = useOffers();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // use state so we can populate orders from server-side API
  const [userOrders, setUserOrders] = useState<any[]>(getOrdersByUser ? (getOrdersByUser() ?? []) : []);
  const [conversations, setConversations] = useState<any[]>([]);
  const sellerOffers = getOffersBySeller();
  const buyerOffers = getOffersByBuyer();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'listings');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Server-side barters
  const [receivedBarters, setReceivedBarters] = useState<any[]>([]);
  const [sentBarters, setSentBarters] = useState<any[]>([]);
  const [isLoadingBarters, setIsLoadingBarters] = useState(false);

  // Helpers to support multiple API shapes: older fields (status/itemStatus) and newer fields (barterStatus/offerStatus/offerItemStatus)
  const readBarterStatus = (b: any) => {
    if (!b) return null;
    if (typeof b.barterStatus !== 'undefined' && b.barterStatus !== null) return Number(b.barterStatus);
    if (typeof b.status !== 'undefined' && b.status !== null) return Number(b.status);
    return null;
  };
  const readOfferStatus = (o: any) => {
    if (!o) return null;
    if (typeof o.offerStatus !== 'undefined' && o.offerStatus !== null) return Number(o.offerStatus);
    if (typeof o.status !== 'undefined' && o.status !== null) return Number(o.status);
    return null;
  };
  const readOfferItemStatus = (it: any) => {
    if (!it) return null;
    if (typeof it.offerItemStatus !== 'undefined' && it.offerItemStatus !== null) return Number(it.offerItemStatus);
    if (typeof it.itemStatus !== 'undefined' && it.itemStatus !== null) return Number(it.itemStatus);
    return null;
  };

  // compute pending received offers count (from server-side receivedBarters) without useMemo
  const pendingReceivedOffersCount = (() => {
    if (!Array.isArray(receivedBarters)) return 0;
    return receivedBarters.reduce((acc: number, b: any) => {
      const offers = Array.isArray(b.offers) ? b.offers : [];
      const count = offers.filter((o: any) => Number(readOfferStatus(o)) === 0).length;
      return acc + count;
    }, 0);
  })();

  // compute messages count (try to sum unread counts from conversations if available,
  // otherwise fall back to the number of fetched conversations) without useMemo
  const messagesCount = (() => {
    if (!Array.isArray(conversations)) return 0;
    const totalUnread = conversations.reduce((acc: number, c: any) => {
      const maybeUnread = c?.unreadCount ?? c?.unread ?? c?.unreadMessages?.length ?? c?.unreadMessageCount ?? 0;
      const n = Number(maybeUnread) || 0;
      return acc + n;
    }, 0);
    if (totalUnread > 0) return totalUnread;
    return conversations.length;
  })();

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPasswordModal, setShowNewPasswordModal] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // password change validation errors from server, keyed by field (lowercased)
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string[]>>({});

  // Map numeric payment status to friendly label based on YeniNefesAdminFeaturesApi.Core.Enums.PaymentStatus
  const getPaymentStatusLabel = (ps: any) => {
    const n = (typeof ps === 'number') ? ps : Number(ps);
    switch (n) {
      case 1: return (t.dashboard?.paid as string) ?? 'Paid';
      case 2: return (t.dashboard?.failed as string) ?? 'Failed';
      case 3: return (t.dashboard?.refunded as string) ?? 'Refunded';
      default: return String(ps ?? '');
    }
  };

  // Map numeric payment method to friendly label based on YeniNefesAdminFeaturesApi.Core.Enums.PaymentMethod
  const getPaymentMethodLabel = (pm: any) => {
    const n = (typeof pm === 'number') ? pm : Number(pm);
    switch (n) {
      case 0: return (t.checkout?.paymentMethodCash as string) ?? 'Cash';
      case 1: return (t.checkout?.paymentMethodCard as string) ?? 'Credit card';
      case 2: return (t.checkout?.paymentMethodBank as string) ?? 'Bank transfer';
      case 4: return (t.checkout?.paymentMethodPayPal as string) ?? 'PayPal';
      case 99: return (t.checkout?.paymentMethodOther as string) ?? 'Other';
      default: return String(pm ?? '');
    }
  };

  const getListingStatusLabel = (status: any) => {
    const mapListingStatusKey = (raw: any) => {
      if (raw === null || typeof raw === 'undefined') return '';
      const s = String(raw).toLowerCase();
      if (s === '0') return 'active';
      if (s === '1') return 'sold';
      if (s === '2') return 'archived';
      if (['active', 'approved', 'available'].includes(s)) return 'active';
      if (['sold', 'soldout', 'sold_out'].includes(s)) return 'sold';
      if (['archived', 'deleted', 'inactive', 'archieve'].includes(s)) return 'archived';
      if (['pending', 'pending_review', 'under_review', 'pendingreview'].includes(s)) return 'pending';
      return s;
    };

    const key = mapListingStatusKey(status);
    const statusLabels: Record<string, string> = {
      active: t.dashboard.active as string,
      pending: t.dashboard.pending as string,
      sold: t.dashboard.sold as string,
      archived: t.listings?.status?.archived ?? 'Archived',
    };

    return statusLabels[key] || (typeof status === 'string' ? status : String(status));
  };

  // Map numeric barter status (0=pending,1=accepted,2=rejected) to human labels
  const getBarterStatusLabel = (status: any) => {
    const map: Record<number, string> = {
      0: ((t.dashboard as any)?.barterPending as string) ?? 'Pending',
      1: ((t.dashboard as any)?.barterAccepted as string) ?? 'Accepted',
      2: ((t.dashboard as any)?.barterRejected as string) ?? 'Rejected',
    };
    if (status === null || typeof status === 'undefined') return '';
    if (typeof status === 'number') return map[status] ?? String(status);
    const n = Number(status);
    return !isNaN(n) ? (map[n] ?? String(status)) : String(status);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast({ title: 'Avatar selected', description: file.name }); // optional visual feedback

    setIsAvatarLoading(true);
    try {
      const imageUrl = await apiCallWithManualRefresh(() => uploadImage(file));

      try {
        const result = await apiCallWithManualRefresh(() => editClientProfile({ profileImage: imageUrl }));
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to upload avatar', variant: 'destructive' });
    } finally {
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      setIsAvatarLoading(false);
    }

  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const [isSyncLoading, setIsSyncLoading] = useState(false);
  // expanded state per order to show multiple items
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [fetchedProfile, setFetchedProfile] = useState<any>(null);
  const [userFilteredProducts, setUserFilteredProducts] = useState<any[]>([]);
  const [isUserProductsLoading, setIsUserProductsLoading] = useState(false);

  const getClientIdFromUser = () => {
    try {
      if (!user) return null;
      return user.client_profile_id ?? null;
    } catch (e) {
      return null;
    }
  };

  // Server-side barters fetching + action helpers
  const fetchBarters = async () => {
    setIsLoadingBarters(true);
    try {
      console.log('[Dashboard] fetching received/sent barters (lang)', language);
      const [receivedRes, sentRes] = await Promise.all([
        apiCallWithManualRefresh(() => getReceivedOffers()),
        apiCallWithManualRefresh(() => getSentOffers()),
      ]);

      const normalize = (r: any) => {
        if (!r) return [];
        const inner = r?.data ?? r?.items ?? r ?? [];
        return Array.isArray(inner) ? inner : (inner?.data ?? []);
      };

      const received = normalize(receivedRes);
      const sent = normalize(sentRes);

      setReceivedBarters(received);
      setSentBarters(sent);
      console.log('[Dashboard] received barters', received);
      console.log('[Dashboard] sent barters', sent);
    } catch (err) {
    } finally {
      setIsLoadingBarters(false);
    }
  };

  useEffect(() => {
    // fetch barters on mount and when language or user changes
    void fetchBarters();
  }, [user, language]);

  const handleServerAcceptOffer = async (offerId: string) => {
    try {
      setIsLoadingBarters(true);
      await apiCallWithManualRefresh(() => svcAcceptOffer(String(offerId)));
      toast({ title: 'Success', description: 'Offer accepted', variant: 'default' });
      await fetchBarters();
    } catch (err) {
      console.error('[Dashboard] accept offer failed', err);
      toast({ title: 'Error', description: 'Failed to accept offer', variant: 'destructive' });
    } finally {
      setIsLoadingBarters(false);
    }
  };

  const handleServerRejectOffer = async (offerId: string) => {
    try {
      setIsLoadingBarters(true);
      await apiCallWithManualRefresh(() => svcRejectOffer(String(offerId)));
      toast({ title: 'Success', description: 'Offer rejected', variant: 'default' });
      await fetchBarters();
    } catch (err) {
      console.error('[Dashboard] reject offer failed', err);
      toast({ title: 'Error', description: 'Failed to reject offer', variant: 'destructive' });
    } finally {
      setIsLoadingBarters(false);
    }
  };

  // Start or open a conversation with the other party (offerer). Navigates to /chat/:id
  const handleNegotiate = async (offer: any, barter: any) => {
    try {
      // try to derive participant client profile id from common fields
      const candidate = offer?.clientProfileId ?? offer?.client_profile_id ?? offer?.clientId ?? offer?.fromClientId ?? offer?.senderClientProfileId ?? barter?.requestedProductOwnerId ?? barter?.requesterClientProfileId ?? barter?.requesterClientId ?? null;
      if (!candidate) {
        toast({ title: 'Error', description: 'Could not determine participant for negotiation', variant: 'destructive' });
        return;
      }

      setIsLoadingBarters(true);
      const resp = await apiCallWithManualRefresh(() => createConversation(String(candidate)));
      const payload = resp?.data?.data ?? resp?.data ?? resp ?? null;
      const conv = payload?.data ?? payload ?? null;
      const convId = conv?.id ?? conv?.conversationId ?? payload?.id ?? null;
      if (!convId) {
        toast({ title: 'Error', description: 'Failed to start conversation', variant: 'destructive' });
        return;
      }
      navigate(`/chat/${convId}`);
    } catch (err) {
      console.error('[Dashboard] negotiate failed', err);
      toast({ title: 'Error', description: 'Failed to start negotiation', variant: 'destructive' });
    } finally {
      setIsLoadingBarters(false);
    }
  };

  useEffect(() => {
    const fetchUserFiltered = async () => {
      const clientId = getClientIdFromUser();
      if (!clientId) {
        console.debug('[Dashboard] no clientId found on user, skipping filtered products fetch');
        return;
      }
      setIsUserProductsLoading(true);
      try {
        console.log('[Dashboard] fetching user products for clientId', clientId, 'lang', language);
        const res = await apiCallWithManualRefresh(() => getProductsByClientId(String(clientId), { page: 1, pageSize: 20, lang: language }));
        console.log('[Dashboard] filtered products response', res);
        const rawItems = res?.data?.items ?? res?.items ?? res?.data ?? [];
        const normalized = Array.isArray(rawItems) ? rawItems.map((it: any) => ({
          ...it,
          images: Array.isArray(it.images) && it.images.length > 0 ? it.images : (it.mainImage ? [it.mainImage] : []),
          image: it.mainImage ?? (Array.isArray(it.images) && it.images[0]) ?? '/placeholder.svg',
          name: it.productTitle ?? it.name
        })) : [];
        setUserFilteredProducts(normalized);
        console.log('[Dashboard] normalized user filtered products', normalized);
      } catch (err) {
        console.error('[Dashboard] failed to fetch user filtered products', err);
      } finally {
        setIsUserProductsLoading(false);
      }
    };
    void fetchUserFiltered();
  }, [user, language]);

  // Fetch client orders from the server and keep local state in sync
  useEffect(() => {
    // Fetch client orders from the server and keep local state in sync
    let mounted = true;
    const fetchClientOrders = async () => {
      try {
        console.log('[Dashboard] fetching client orders (lang)', language);
        const res = await apiCallWithManualRefresh(() => getClientOrders());
        console.log('[Dashboard] getClientOrders response', res);
        const raw = res?.data ?? res?.items ?? res ?? [];
        const list = Array.isArray(raw) ? raw : (raw?.orders ?? raw?.data ?? []);
        if (mounted) setUserOrders(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('[Dashboard] failed to fetch client orders', err);
      }
    };
    void fetchClientOrders();
    return () => { mounted = false; };
  }, [user, language]);

  // fetch conversations for current client to show in Messages tab
  useEffect(() => {
    let mounted = true;
    const fetchConvs = async () => {
      try {
        console.log('[Dashboard] fetching conversations (lang)', language);
        const res = await apiCallWithManualRefresh(() => getConversations());
        console.log('[Dashboard] getConversations response', res);
        const raw = res?.data ?? res?.items ?? res ?? [];
        const list = Array.isArray(raw) ? raw : (raw?.data ?? raw?.conversations ?? []);
        if (mounted) setConversations(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('[Dashboard] failed to fetch conversations', err);
      }
    };
    void fetchConvs();
    return () => { mounted = false; };
  }, [user, language]);

  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const getFormFieldMessage = (field: string) => {
    if (!formErrors) return null;
    const candidates = [field, field.toLowerCase(), field.charAt(0).toUpperCase() + field.slice(1)];
    for (const k of candidates) {
      const v = formErrors[k];
      if (v && v.length > 0) return v[0];
    }
    return null;
  };

  const getPasswordFieldMessage = (field: string) => {
    if (!passwordErrors) return null;
    const candidates = [field, field.toLowerCase(), field.charAt(0).toUpperCase() + field.slice(1)];
    for (const k of candidates) {
      const v = passwordErrors[k];
      if (v && v.length > 0) return v[0];
    }
    return null;
  };

  // Phone formatting state and helper (same logic as auth)
  const [phoneValue, setPhoneValue] = useState<string>((fetchedProfile?.phoneNumber || (user as any)?.phone_number || (user as any)?.phone) ?? '');

  const formatPhoneNumber = (value: string) => {
    let cleaned = value.replace(/[^\d+]/g, '');

    if (!cleaned.startsWith('+994')) {
      if (cleaned.startsWith('994')) {
        cleaned = '+' + cleaned;
      } else if (cleaned.startsWith('+')) {
        cleaned = '+994' + cleaned.substring(1).replace(/\D/g, '');
      } else {
        cleaned = '+994' + cleaned.replace(/\D/g, '');
      }
    }

    const digits = cleaned.substring(4);
    let formatted = '+994';
    if (digits.length > 0) formatted += ' ' + digits.substring(0, 2);
    if (digits.length > 2) formatted += ' ' + digits.substring(2, 5);
    if (digits.length > 5) formatted += ' ' + digits.substring(5, 7);
    if (digits.length > 7) formatted += ' ' + digits.substring(7, 9);

    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value || '';
    const formatted = formatPhoneNumber(raw);
    setPhoneValue(formatted);
  };

  // keep phoneValue in sync when profile/user loads
  useEffect(() => {
    const initial = (fetchedProfile?.phoneNumber || (user as any)?.phone_number || (user as any)?.phone) ?? '';
    if (initial && initial !== phoneValue) setPhoneValue(initial);
  }, [fetchedProfile, user]);

  const loadProfile = async () => {
    setIsFetchingProfile(true);
    try {
      const res = await apiCallWithManualRefresh(() => getClientProfile());
      console.log('Raw profile response:', res);
      if (res.isSuccess == true) {
        // Normalize profile data
      } else {
        toast({ title: 'Error', description: 'Failed to fetch profile', variant: 'destructive' });
        return;
      }
      setFetchedProfile(res.data);
    } catch (e) {
      toast({ title: 'Error', description: (e as Error).message || 'Failed to fetch profile', variant: 'destructive' });
    } finally {
      setIsFetchingProfile(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'settings') {
      void loadProfile();
    }
  }, [activeTab]);

  useEffect(() => {
    void loadProfile();
  }, []);

  const handleNativeFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);

    const values = {
      name: fd.get('name')?.toString() ?? null,
      surname: fd.get('surname')?.toString() ?? null,
      phoneNumber: (phoneValue && phoneValue.length > 0) ? phoneValue : (fd.get('phone')?.toString() ?? null),
      street: fd.get('street')?.toString() ?? null,
      addressDetails: fd.get('addressDetails')?.toString() ?? null,
      city: fd.get('city')?.toString() ?? null,
      zipCode: fd.get('zipCode')?.toString() ?? null,
    };
    console.log('Form values to save:', values);
    await onSaveAll(values);
  };

  const onSaveAll = async (values) => {
    setIsSyncLoading(true);
    try {
      const payload: any = {
        name: values.name ?? null,
        surname: values.surname ?? null,
        phoneNumber: values.phoneNumber ?? null,
        profileImage: fetchedProfile?.profileImage ?? fetchedProfile?.profile_image ?? null,
        street: values.street ?? null,
        addressDetails: values.addressDetails ?? null,
        city: values.city ?? null,
        zipCode: values.zipCode ?? null,
      };


      const result = await apiCallWithManualRefresh(() => editClientProfile(payload));
      const resultAny: any = result;

      const mapValidation = (obj: any) => {
        const mapped: Record<string, string[]> = {};
        if (!obj || typeof obj !== 'object') return mapped;
        for (const key of Object.keys(obj)) {
          const lower = key.toLowerCase();
          if (['issuccess', 'statuscode', 'message'].includes(lower)) continue;
          const val = obj[key];
          if (Array.isArray(val) && val.length > 0) {
            mapped[lower] = val.map((v: any) => String(v));
          } else if (typeof val === 'string' && val.trim()) {
            mapped[lower] = [val];
          }
        }
        return mapped;
      };

      if (resultAny && resultAny.isSuccess === true) {
        setFormErrors({});
        toast({ title: t.dashboard.profileChanged, description: resultAny.message || t.dashboard.profileChanged });
        if (resultAny.data && typeof resultAny.data === 'object') {
          const d = resultAny.data;
          setFetchedProfile((prev: any) => ({
            ...(prev || {}),
            name: d.name ?? prev?.name,
            surname: d.surname ?? prev?.surname,
            phone: d.phoneNumber ?? d.phone ?? prev?.phone,
            profileImage: d.profileImage ?? d.profile_image ?? prev?.profileImage ?? prev?.profile_image,
            addressLine: d.addressDetails ?? d.addressLine ?? prev?.addressLine,
            address: {
              street: d.street ?? prev?.address?.street,
              city: d.city ?? prev?.address?.city,
              addressDetails: d.addressDetails ?? d.addressLine ?? prev?.address?.addressDetails,
              zipCode: d.zipCode ?? prev?.address?.zipCode,
            },
          }));
        }
        return;
      }

      if (resultAny && (resultAny.isSuccess === false || resultAny.errors || resultAny.data)) {
        const maybeValidation = resultAny.data ?? resultAny.errors ?? resultAny;
        if (maybeValidation && typeof maybeValidation === 'object') {
          const validationSource = (maybeValidation.data && typeof maybeValidation.data === 'object') ? maybeValidation.data : maybeValidation;
          const mapped = mapValidation(validationSource);
          if (Object.keys(mapped).length > 0) {
            setFormErrors(mapped);
            const firstMsgArr = mapped[Object.keys(mapped)[0]];
            const firstMsg = Array.isArray(firstMsgArr) ? firstMsgArr[0] : firstMsgArr;
            toast({ title: 'Validation error', description: firstMsg || resultAny.message || 'Validation failed', variant: 'destructive' });
            return;
          }
        }
      }
      setFormErrors({});
      toast({ title: 'Error', description: resultAny?.message || 'Failed to update profile', variant: 'destructive' });
    } catch (err) {
      const e: any = err;
      console.error('Save profile error:', e);
      const isAxios = e?.isAxiosError === true;
      const respData = isAxios ? (e.response?.data ?? e?.response) : e?.response ?? e?.data ?? null;

      const mapValidation = (obj: any) => {
        const mapped: Record<string, string[]> = {};
        if (!obj || typeof obj !== 'object') return mapped;
        for (const key of Object.keys(obj)) {
          const lower = key.toLowerCase();
          if (['issuccess', 'statuscode', 'message'].includes(lower)) continue;
          const val = obj[key];
          if (Array.isArray(val) && val.length > 0) {
            mapped[lower] = val.map((v: any) => String(v));
          } else if (typeof val === 'string' && val.trim()) {
            mapped[lower] = [val];
          }
        }
        return mapped;
      };

      if (respData && typeof respData === 'object') {
        if (respData.isSuccess === false && respData.data && typeof respData.data === 'object') {
          const mapped = mapValidation(respData.data);
          setFormErrors(mapped);
          const firstMsgArr = mapped[Object.keys(mapped)[0]];
          const firstMsg = Array.isArray(firstMsgArr) ? firstMsgArr[0] : firstMsgArr;
          toast({ title: 'Validation error', description: firstMsg || respData.message || 'Validation failed', variant: 'destructive' });
        } else if (respData.errors && typeof respData.errors === 'object') {
          const mapped = mapValidation(respData.errors);
          setFormErrors(mapped);
          const firstMsgArr = mapped[Object.keys(mapped)[0]];
          const firstMsg = Array.isArray(firstMsgArr) ? firstMsgArr[0] : firstMsgArr;
          toast({ title: 'Validation error', description: firstMsg || respData.message || 'Validation failed', variant: 'destructive' });
        } else {
          const mapped = mapValidation(respData);
          if (Object.keys(mapped).length > 0) {
            setFormErrors(mapped);
            const firstMsgArr = mapped[Object.keys(mapped)[0]];
            const firstMsg = Array.isArray(firstMsgArr) ? firstMsgArr[0] : firstMsgArr;
            toast({ title: 'Validation error', description: firstMsg || 'Validation failed', variant: 'destructive' });
          } else {
            toast({ title: 'Error', description: e?.message || 'Failed to update profile', variant: 'destructive' });
          }
        }
      } else {
        toast({ title: 'Error', description: e?.message || 'Failed to update profile', variant: 'destructive' });
      }
    } finally {
      setIsSyncLoading(false);
    }
  };

  const openChangePassword = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordErrors({});
    setIsChangePasswordOpen(true);
  };
  const closeChangePassword = () => setIsChangePasswordOpen(false);

  const handleChangePasswordSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast({ title: 'Error', description: 'Please fill all password fields', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: 'Error', description: 'New password and confirmation do not match', variant: 'destructive' });
      return;
    }

    setIsChangingPassword(true);
    const extractMessage = (src: any, fallback = 'Validation failed') => {
      if (!src) return fallback;
      const msg = src.message ?? src?.data?.message ?? src?.statusMessage ?? undefined;
      if (msg === undefined || msg === null) return fallback;
      if (typeof msg === 'boolean') return fallback;
      return String(msg);
    };
    try {
      const result = await apiCallWithManualRefresh(() => ChangePassword({ userId: user.userId, oldPassword, newPassword, confirmNewPassword }));
      const resultAny: any = result;
      const normalized = normalizeApiResult(resultAny);
      const mapValidation = (obj: any) => {
        const mapped: Record<string, string[]> = {};
        if (!obj || typeof obj !== 'object') return mapped;
        for (const key of Object.keys(obj)) {
          const lower = key.toLowerCase();
          if (['issuccess', 'statuscode', 'message'].includes(lower)) continue;
          const val = obj[key];
          if (Array.isArray(val) && val.length > 0) {
            mapped[lower] = val.map((v: any) => String(v));
          } else if (typeof val === 'string' && val.trim()) {
            mapped[lower] = [val];
          }
        }
        return mapped;
      };
      if (!normalized.success) {
        const validationSource = (normalized.data && typeof normalized.data === 'object') ? normalized.data : (resultAny?.data ?? resultAny?.errors ?? resultAny);
        const mapped = mapValidation(validationSource);
        if (Object.keys(mapped).length > 0) {
          setPasswordErrors(mapped);
          const firstKey = Object.keys(mapped)[0];
          const firstMsg = mapped[firstKey][0];
          toast({ title: t.checkout?.error || 'Error', description: firstMsg || normalized.message || extractMessage(resultAny), variant: 'destructive' });
          return;
        }
        if (normalized.message) {
          toast({ title: t.checkout?.error || 'Error', description: String(normalized.message), variant: 'destructive' });
          return;
        }
        toast({ title: t.checkout?.error || 'Error', description: extractMessage(resultAny, 'Failed to change password'), variant: 'destructive' });
        return;
      }
      setPasswordErrors({});
      const successDescription = normalized.message ?? (normalized.data && typeof normalized.data === 'object' ? (normalized.data.message ?? undefined) : undefined) ?? (t.dashboard.passwordChanged || 'Password changed successfully');
      toast({ title: t.checkout?.success || 'Success', description: String(successDescription) });
      closeChangePassword();
    } catch (err) {
      const e: any = err;
      const isAxios = e?.isAxiosError === true;
      const respData = isAxios ? (e.response?.data ?? e?.response) : e?.response ?? e?.data ?? null;
      const mapValidation = (obj: any) => {
        const mapped: Record<string, string[]> = {};
        if (!obj || typeof obj !== 'object') return mapped;
        for (const key of Object.keys(obj)) {
          const lower = key.toLowerCase();
          if (['issuccess', 'statuscode', 'message'].includes(lower)) continue;
          const val = obj[key];
          if (Array.isArray(val) && val.length > 0) {
            mapped[lower] = val.map((v: any) => String(v));
          } else if (typeof val === 'string' && val.trim()) {
            mapped[lower] = [val];
          }
        }
        return mapped;
      };
      if (respData && typeof respData === 'object') {
        const validationSource = (respData.data && typeof respData.data === 'object') ? respData.data : (respData.errors && typeof respData.errors === 'object' ? respData.errors : respData);
        const mapped = mapValidation(validationSource);
        if (Object.keys(mapped).length > 0) {
          setPasswordErrors(mapped);
          const firstKey = Object.keys(mapped)[0];
          const firstMsg = mapped[firstKey][0];
          toast({ title: t.checkout?.error || 'Error', description: firstMsg || extractMessage(respData), variant: 'destructive' });
          return;
        }
      }
      toast({ title: t.checkout?.error || 'Error', description: extractMessage(respData, (err as any)?.message || 'Failed to change password'), variant: 'destructive' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const stats = [
    { label: t.dashboard.active, value: 2, color: 'bg-sage' },
    { label: t.dashboard.pending, value: 1, color: 'bg-primary' },
    { label: t.dashboard.sold, value: 5, color: 'bg-muted' },
  ];

  // Redirect based on presence of tokens in localStorage (don't rely on isAuthenticated)
  useEffect(() => {
    try {
      const access = tokenStorage.get();
      const refresh = tokenStorage.getRefresh();
      if (!access && !refresh) {
        try { navigate('/auth'); } catch { }
      }
    } catch {
      try { navigate('/auth'); } catch { }
    }
  }, [navigate]);

  return (
    <Layout>
      <div className="container-custom py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-border">
                <AvatarImage src={fetchedProfile?.profileImage} alt={fetchedProfile?.name} />
                <AvatarFallback className="bg-muted text-muted-foreground text-xl">
                  {fetchedProfile?.name?.charAt(0)}{fetchedProfile?.surname?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={isAvatarLoading}
                className="absolute bottom-0 right-0 p-1 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
              >
                {isAvatarLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-1">
                {t.dashboard.title}
              </h1>
              <p className="text-muted-foreground">
                {t.auth?.welcomeBack || 'Welcome back'}, {fetchedProfile?.name} {fetchedProfile?.surname}!
              </p>
              {fetchedProfile?.createdAt && (
                <p className="text-sm text-muted-foreground">
                  {t.dashboard.memberSince}: {formatDate(fetchedProfile.createdAt)}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={logout}>
              {t.nav.logout}
            </Button>
            <Button variant="outline" onClick={openChangePassword}>
              {t.dashboard.changePassword}
            </Button>
            <Link to="/upload">
              <Button variant="hero">
                <Plus className="w-4 h-4 mr-2" />
                {t.nav.upload}
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto flex-wrap">
            <TabsTrigger value="listings" className="gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">{t.dashboard.active || 'Active'}</span>
              {userFilteredProducts.length > 0 && (
                <Badge className="ml-1 bg-sage text-sage-dark">{userFilteredProducts.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">{t.dashboard.messages}</span>
              {messagesCount > 0 && (
                <Badge className="ml-1 bg-primary text-primary-foreground">{messagesCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="offers" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">{t.dashboard.offers}</span>
              {pendingReceivedOffersCount > 0 && (
                <Badge className="ml-1 bg-sage text-sage-dark">{pendingReceivedOffersCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="myoffers" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">{t.dashboard.myoffers}</span>
              {buyerOffers.length > 0 && (
                <Badge className="ml-1 bg-blue-100 text-blue-700">{buyerOffers.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">{t.dashboard.orders}</span>
              {userOrders.length > 0 && (
                <Badge className="ml-1 bg-primary text-primary-foreground">{userOrders.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">{t.dashboard.settings}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="mt-6">
            {userFilteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">{t.dashboard?.noActiveProducts ?? 'No active products'}</p>
                <Link to="/upload">
                  <Button variant="hero">{t.listings?.uploadFirst || 'Upload now'}</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userFilteredProducts.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl"
                  >
                    <Link to={`/product/${listing.id}`} className="block w-20 h-20 rounded-lg overflow-hidden">
                      <img
                        src={listing.image}
                        alt={listing.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{listing.productTitle}</h3>
                      <p className="text-sm text-muted-foreground">{listing.description.length > 20 ? `${listing.description.slice(0, 20)}...` : listing.description}</p>
                      {listing.discountedPrice != 0 ? (
                        <div>
                          <p className="text-sm text-muted-foreground line-through">₼{listing.discountPrice}</p>
                          <p className="text-sm text-muted-foreground">₼{listing.price}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">₼{listing.price}</p>
                      )}
                    </div>
                    <Badge
                      className={cn(
                        listing.status === 'active' && 'bg-sage text-sage-dark',
                        listing.status === 'sold' && 'bg-sage text-sage-dark',
                        listing.status === 'archived' && 'bg-primary/20 text-primary',
                      )}
                    >
                      {getListingStatusLabel(listing.status)}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Link to={`/product/${listing.id}`}>
                        <Button variant="ghost" size="sm">{t.dashboard?.view ?? 'View'}</Button>
                      </Link>
                      {/* Edit button for quick navigation to upload/edit flow. Pass edit id as query param. */}
                      <Link to={`/upload?edit=${encodeURIComponent(String(listing.id))}`}> 
                        <Button variant="outline" size="sm">{t.dashboard?.edit ?? 'Edit'}</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            {conversations.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t.dashboard?.noChats ?? 'No conversations yet'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {conversations.map((conv: any) => (
                  <div key={conv.id} className="p-4 bg-card border border-border rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{conv.title ?? conv.participantName ?? (Array.isArray(conv.participantIds) ? conv.participantIds.filter((id: string) => id !== (user as any)?.client_profile_id)[0] ?? conv.participantIds[0] : 'Conversation')}</p>
                      <p className="text-sm text-muted-foreground">{conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleString() : (conv.createdAt ? new Date(conv.createdAt).toLocaleString() : '')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/chat/${conv.id}`)}>Open</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="offers" className="mt-6">
            {isLoadingBarters ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : receivedBarters.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t.compare?.noOffersReceived || 'No received barters'}</p>
              </div>
            ) : (
              <>
                {/* Pending Offers Section */}
                <div className="mb-8">
                  <h3 className="font-semibold text-lg mb-2">{t.dashboard?.pendingOffers ?? 'Pending Offers'}</h3>
                  <div className="space-y-4">
                    {receivedBarters.map((b) => (
                      b.offers?.filter((o: any) => Number(readOfferStatus(o)) === 0).map((o: any) => (
                        <div key={b.id + '-' + o.id} className="p-4 bg-card border border-border rounded-xl">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {(b.requestedProductId || b.productImage) ? (
                                <Link to={b.requestedProductId ? `/product/${b.requestedProductId}` : '#'} className="w-16 h-16 block overflow-hidden rounded">
                                  <img
                                    src={b.productImage ?? '/placeholder.svg'}
                                    alt={b.productName ?? `Product ${b.requestedProductId ?? ''}`}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                </Link>
                              ) : (
                                <img src={b.productImage ?? '/placeholder.svg'} alt={b.productName ?? ''} className="w-16 h-16 object-cover rounded" />
                              )}
                              <div className="min-w-0">
                                <div className="font-semibold text-foreground truncate">{b.productName ?? `#${b.requestedProductId ?? b.requestedProductOwnerId ?? ''}`}</div>
                                {b.note && <p className="text-sm text-muted-foreground truncate">{b.note}</p>}
                                <p className="text-sm text-muted-foreground">₼{b.productPrice ?? b.productDiscountPrice ?? ''}</p>
                              </div>
                            </div>
                            <Badge className={cn(
                              readBarterStatus(b) === 1 && 'bg-sage text-sage-dark',
                              readBarterStatus(b) === 2 && 'bg-destructive/20 text-destructive',
                              readBarterStatus(b) === 0 && 'bg-primary/20 text-primary'
                            )}>{getBarterStatusLabel(readBarterStatus(b))}</Badge>
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="font-semibold">{t.dashboard?.offer ?? 'Offer'} ₼{o.price}</div>
                            <Badge className={cn(
                              readOfferStatus(o) === 1 && 'bg-sage text-sage-dark',
                              readOfferStatus(o) === 2 && 'bg-destructive/20 text-destructive',
                              readOfferStatus(o) === 0 && 'bg-primary/20 text-primary'
                            )}>{getBarterStatusLabel(readOfferStatus(o))}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground truncate mb-2">{o.message}</div>
                          {o.items && o.items.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {o.items.map((it: any) => (
                                <div key={it.offeredProductId ?? JSON.stringify(it)} className="flex items-center gap-3">
                                  {(it.offeredProductId || it.offeredProductImage) ? (
                                    <Link to={it.offeredProductId ? `/product/${it.offeredProductId}` : '#'} className="block w-12 h-12 overflow-hidden rounded">
                                      <img src={it.offeredProductImage ?? '/placeholder.svg'} alt={it.offeredProductName ?? it.offeredProductId} className="w-12 h-12 object-cover rounded" />
                                    </Link>
                                  ) : (
                                    <img src={it.offeredProductImage ?? '/placeholder.svg'} alt={it.offeredProductName ?? it.offeredProductId} className="w-12 h-12 object-cover rounded" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm text-foreground truncate">{it.offeredProductName ?? it.offeredProductId ?? `#${it.id ?? ''}`}</div>
                                    <div className="text-xs text-muted-foreground">Qty: {it.quantity ?? 1} {typeof readOfferItemStatus(it) !== 'undefined' && readOfferItemStatus(it) !== null && (
                                      <span className="ml-2">• <span className="text-xs">{getBarterStatusLabel(readOfferItemStatus(it))}</span></span>
                                    )}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="hero" onClick={() => handleServerAcceptOffer(o.id)}>
                              {t.common?.accept ?? 'Accept'}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleServerRejectOffer(o.id)}>
                              {t.common?.reject ?? 'Reject'}
                            </Button>
                          </div>
                        </div>
                      ))
                    ))}
                  </div>
                </div>
                {/* All Offers Section (excluding pending) */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t.dashboard?.allOffers ?? 'All Offers'}</h3>
                  <div className="space-y-4">
                    {receivedBarters.map((b) => (
                      b.offers?.filter((o: any) => Number(readOfferStatus(o)) !== 0).map((o: any) => (
                        <div key={b.id + '-' + o.id} className="p-4 bg-card border border-border rounded-xl">
                          {/* ...repeat the same offer display as above, but without Accept/Reject buttons... */}
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {(b.requestedProductId || b.productImage) ? (
                                <Link to={b.requestedProductId ? `/product/${b.requestedProductId}` : '#'} className="w-16 h-16 block overflow-hidden rounded">
                                  <img
                                    src={b.productImage ?? '/placeholder.svg'}
                                    alt={b.productName ?? `Product ${b.requestedProductId ?? ''}`}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                </Link>
                              ) : (
                                <img src={b.productImage ?? '/placeholder.svg'} alt={b.productName ?? ''} className="w-16 h-16 object-cover rounded" />
                              )}
                              <div className="min-w-0">
                                <div className="font-semibold text-foreground truncate">{b.productName ?? `#${b.requestedProductId ?? b.requestedProductOwnerId ?? ''}`}</div>
                                {b.note && <p className="text-sm text-muted-foreground truncate">{b.note}</p>}
                                <p className="text-sm text-muted-foreground">₼{b.productPrice ?? b.productDiscountPrice ?? ''}</p>
                              </div>
                            </div>
                            <Badge className={cn(
                              readBarterStatus(b) === 1 && 'bg-sage text-sage-dark',
                              readBarterStatus(b) === 2 && 'bg-destructive/20 text-destructive',
                              readBarterStatus(b) === 0 && 'bg-primary/20 text-primary'
                            )}>{getBarterStatusLabel(readBarterStatus(b))}</Badge>
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="font-semibold">{t.dashboard?.offer ?? 'Offer'} ₼{o.price}</div>
                            <Badge className={cn(
                              readOfferStatus(o) === 1 && 'bg-sage text-sage-dark',
                              readOfferStatus(o) === 2 && 'bg-destructive/20 text-destructive',
                              readOfferStatus(o) === 0 && 'bg-primary/20 text-primary'
                            )}>{getBarterStatusLabel(readOfferStatus(o))}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground truncate mb-2">{o.message}</div>
                          {o.items && o.items.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {o.items.map((it: any) => (
                                <div key={it.offeredProductId ?? JSON.stringify(it)} className="flex items-center gap-3">
                                  {(it.offeredProductId || it.offeredProductImage) ? (
                                    <Link to={it.offeredProductId ? `/product/${it.offeredProductId}` : '#'} className="block w-12 h-12 overflow-hidden rounded">
                                      <img src={it.offeredProductImage ?? '/placeholder.svg'} alt={it.offeredProductName ?? it.offeredProductId} className="w-12 h-12 object-cover rounded" />
                                    </Link>
                                  ) : (
                                    <img src={it.offeredProductImage ?? '/placeholder.svg'} alt={it.offeredProductName ?? it.offeredProductId} className="w-12 h-12 object-cover rounded" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm text-foreground truncate">{it.offeredProductName ?? it.offeredProductId ?? `#${it.id ?? ''}`}</div>
                                    <div className="text-xs text-muted-foreground">Qty: {it.quantity ?? 1} {typeof readOfferItemStatus(it) !== 'undefined' && readOfferItemStatus(it) !== null && (
                                      <span className="ml-2">• <span className="text-xs">{getBarterStatusLabel(readOfferItemStatus(it))}</span></span>
                                    )}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="myoffers" className="mt-6">
            {isLoadingBarters ? (
              <p className="text-sm text-muted-foreground">{t.common?.loading || 'Loading...'}</p>
            ) : sentBarters.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t.compare?.noOffersSent || t.compare?.noOffers || "You haven't made any offers yet"}</p>
                <Link to="/catalog">
                  <Button variant="outline" className="mt-4">
                    {t.compare?.browseCatalog || 'Browse Catalog'}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {sentBarters.map((b) => (
                  <div key={b.id} className="p-4 bg-card border border-border rounded-xl">
                    <div className="flex items-start gap-4">
                      {(b.productId || b.requestedProductId || b.product?.id) ? (
                        <Link to={`/product/${b.productId ?? b.requestedProductId ?? b.product?.id}`} className="block w-16 h-16 overflow-hidden rounded-lg">
                          <img src={b.productImage} alt={b.productName} className="w-16 h-16 object-cover rounded-lg" />
                        </Link>
                      ) : (
                        <img src={b.productImage} alt={b.productName} className="w-16 h-16 object-cover rounded-lg" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate">{b.productName}</h4>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">{t.dashboard?.note ?? 'Note'}: {b.note}</p>
                          <Badge className={cn(
                            readBarterStatus(b) === 1 && 'bg-sage text-sage-dark',
                            readBarterStatus(b) === 2 && 'bg-destructive/20 text-destructive',
                            readBarterStatus(b) === 0 && 'bg-primary/20 text-primary'
                          )}>{getBarterStatusLabel(readBarterStatus(b))}</Badge>
                        </div>
                        {b.offers && b.offers.length > 0 && (
                          <p className="text-sm text-muted-foreground mt-2">{t.dashboard?.offered ?? 'Offered'}: ₼{b.offers[0].price} {b.offers[0].items && b.offers[0].items.length > 0 && (
                            <span className="text-xs text-muted-foreground">• {b.offers[0].items.map((it: any) => `${it.offeredProductName ?? it.offeredProductId} x${it.quantity}`).join(', ')}</span>
                          )}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{t.dashboard?.sent ?? 'Sent'}: {new Date(b.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            {userOrders.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t.dashboard.noOrders}</p>
                <Link to="/catalog">
                  <Button variant="outline" className="mt-4">
                    {t.compare?.browseCatalog || 'Browse Catalog'}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.map((order) => {
                  // normalize items array (support different backend shapes)
                  const items = Array.isArray(order.items) && order.items.length > 0
                    ? order.items
                    : Array.isArray(order.orderItems) && order.orderItems.length > 0
                      ? order.orderItems
                      : (order.items ? [order.items] : []);

                  const toggle = () => setExpandedOrders(prev => ({ ...prev, [order.id]: !prev[order.id] }));

                  const getItemTitle = (it: any) => {
                    if (!it) return '';
                    // translations may be present
                    const translations: any[] = it.translations ?? it.translation ?? it.translationsList ?? [];
                    if (Array.isArray(translations) && translations.length > 0 && typeof language === 'string') {
                      const match = translations.find(tr => String(tr.languageCode).toLowerCase().startsWith(String(language).toLowerCase()));
                      if (match && (match.title || match.name)) return match.title ?? match.name;
                    }
                    return it.title ?? it.titleLang ?? it.productName ?? it.name ?? '';
                  };

                  return (
                    <div
                      key={order.id}
                      className="p-4 bg-card border border-border rounded-xl"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{`Order #${String(order.id).slice(0, 8).toUpperCase()}`}</h3>
                          <p className="text-sm text-muted-foreground">{new Date(order.createdAt || order.createdAtUtc || Date.now()).toLocaleString()}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right mr-4">
                            <p className="font-display font-bold text-primary">₼{order.totalAmount ?? order.total ?? order.totalPrice ?? 0}</p>
                            {/* Payment status shown using backend enum mapping (YeniNefesAdminFeaturesApi.Core.Enums.PaymentStatus) */}
                            <Badge className={cn(
                              Number(order.paymentStatus) === 1 && 'bg-sage text-sage-dark',
                              Number(order.paymentStatus) === 2 && 'bg-destructive/20 text-destructive',
                              Number(order.paymentStatus) === 3 && 'bg-muted text-muted-foreground'
                            )}>{getPaymentStatusLabel(order.paymentStatus)}</Badge>
                            {/* Show payment method if available (mapped from YeniNefesAdminFeaturesApi.Core.Enums.PaymentMethod) */}
                            {(order.paymentMethod || order.payment_type || order.paymentMethodId) && (
                              <p className="text-xs text-muted-foreground mt-1">{getPaymentMethodLabel(order.paymentMethod ?? order.payment_type ?? order.paymentMethodId)}</p>
                            )}
                          </div>

                          <div className="flex -space-x-2">
                            {items.slice(0, 5).map((it: any, i: number) => (
                              <img key={i} src={(Array.isArray(it.images) && it.images[0]) || it.image || '/placeholder.svg'} alt={getItemTitle(it)} className="w-12 h-12 object-cover rounded-md border border-border" />
                            ))}
                            {items.length > 5 && (
                              <div className="w-12 h-12 flex items-center justify-center rounded-md border border-border bg-muted text-sm text-foreground">+{items.length - 5}</div>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              // fetch detailed order from API if available, fall back to local order
                              try {
                                const resp = await apiCallWithManualRefresh(() => getById(String(order.id)));
                                console.log('Fetched order details:', resp);
                                const payload = resp?.data ?? resp ?? null;
                                // If API returns an envelope with `.data`, prefer the inner object for the dialog
                                const orderObj = payload && typeof payload === 'object' ? (payload.data ?? payload) : null;
                                setSelectedOrder(orderObj ?? order);
                              } catch (err) {
                                console.error('[Dashboard] failed to fetch order details', err);
                                setSelectedOrder(order);
                              }
                              toggle();
                            }}
                          >
                            {expandedOrders[order.id] ? 'Hide items' : `View ${items.length} item${items.length === 1 ? '' : 's'}`}
                          </Button>
                        </div>
                      </div>

                      {expandedOrders[order.id] && (
                        <div className="mt-3 border-t border-border pt-3 space-y-3">
                          {items.map((it: any) => (
                            <div key={it.id || it.productId || JSON.stringify(it)} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                              {(it.productId || it.id) ? (
                                <Link to={`/product/${it.productId ?? it.id}`} className="block w-16 h-16 overflow-hidden rounded">
                                  <img src={(Array.isArray(it.images) && it.images[0]) || it.image || '/placeholder.svg'} alt={getItemTitle(it)} className="w-16 h-16 object-cover rounded" />
                                </Link>
                              ) : (
                                <img src={(Array.isArray(it.images) && it.images[0]) || it.image || '/placeholder.svg'} alt={getItemTitle(it)} className="w-16 h-16 object-cover rounded" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground line-clamp-2">{getItemTitle(it)}</p>
                                <p className="text-xs text-muted-foreground">Qty: {it.quantity ?? it.qty ?? 1}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-display text-primary">₼{it.effectivePrice ?? it.effective_price ?? it.price ?? 0}</p>
                                <p className="text-xs text-muted-foreground">₼{((it.effectivePrice ?? it.price ?? 0) * (it.quantity ?? 1)).toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
          <OrderDetailDialog
            order={selectedOrder}
            open={!!selectedOrder}
            onOpenChange={(open) => !open && setSelectedOrder(null)}
          />

          <TabsContent value="settings" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-card border border-border rounded-xl p-6 md:col-span-2">
                <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-primary" />
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      {t.checkout?.personalInfo || 'Personal Information'}
                    </h3>
                  </div>
                </h3>
                <form onSubmit={handleNativeFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t.auth?.firstName || 'First Name'}</Label>
                      <Input id="name" name="name" type="text" placeholder="John" disabled={isSyncLoading} defaultValue={(fetchedProfile?.name || (user as any)?.name) ?? ''} />
                      {getFormFieldMessage('Name') && <p className="text-xs text-destructive">{getFormFieldMessage('Name')}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="surname">{t.auth?.lastName || 'Last Name'}</Label>
                      <Input id="surname" name="surname" type="text" placeholder="Doe" disabled={isSyncLoading} defaultValue={(fetchedProfile?.surname || (user as any)?.surname || (user as any)?.lastName) ?? ''} />
                      {getFormFieldMessage('Surname') && <p className="text-xs text-destructive">{getFormFieldMessage('Surname')}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t.auth?.phone || 'Phone'}</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="+994 XX XXX XX XX" disabled={isSyncLoading} value={phoneValue} onChange={handlePhoneChange} />
                      {getFormFieldMessage('phonenumber') && <p className="text-xs text-destructive">{getFormFieldMessage('phonenumber')}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">{t.checkout?.city || 'City'}</Label>
                      <Input id="city" name="city" placeholder="Baku" disabled={isSyncLoading} defaultValue={(fetchedProfile?.city || (user as any)?.city) ?? ''} />
                      {getFormFieldMessage('city') && <p className="text-xs text-destructive">{getFormFieldMessage('city')}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">{t.checkout?.street || 'Street'}</Label>
                      <Input id="street" name="street" placeholder="Street, house, apartment" disabled={isSyncLoading} defaultValue={(fetchedProfile?.street || (user as any)?.address?.street) ?? ''} />
                      {getFormFieldMessage('street') && <p className="text-xs text-destructive">{getFormFieldMessage('street')}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">{t.checkout?.zipCode || 'Zip Code'}</Label>
                      <Input id="zipCode" name="zipCode" placeholder="AZ1000" disabled={isSyncLoading} defaultValue={(fetchedProfile?.zipCode || (user as any)?.zipCode) ?? ''} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressDetails">{t.checkout?.addressDetails || 'Address Details'}</Label>
                    <Input id="addressDetails" name="addressDetails" placeholder="Additional details" disabled={isSyncLoading} defaultValue={(fetchedProfile?.addressDetails || fetchedProfile?.addressDetails || (user as any)?.address?.addressDetails || (user as any)?.addressDetails) ?? ''} />
                    {getFormFieldMessage('addressdetails') && <p className="text-xs text-destructive">{getFormFieldMessage('addressdetails')}</p>}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSyncLoading}>
                    {isSyncLoading ? (t.dashboard.updating || 'Updating...') : (t.dashboard.save || 'Save')}
                  </Button>
                </form>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Change Password Modal */}
        {isChangePasswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={closeChangePassword} />
            <div className="relative w-full max-w-md bg-card border border-border rounded-lg p-6 z-10">
              <h3 className="font-semibold text-foreground mb-4">{t.dashboard.changePassword || 'Change password'}</h3>
              <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">{t.dashboard.currentPassword || 'Current password'}</Label>
                  <div className="relative">
                    <Input id="oldPassword" type={showOldPassword ? 'text' : 'password'} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}  placeholder='**********' />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" onClick={() => setShowOldPassword((v) => !v)}>
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {getPasswordFieldMessage('OldPassword') && <p className="text-xs text-destructive">{getPasswordFieldMessage('OldPassword')}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t.dashboard.newPassword || 'New password'}</Label>
                  <div className="relative">
                    <Input id="newPassword" type={showNewPasswordModal ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder='**********'  />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" onClick={() => setShowNewPasswordModal((v) => !v)}>
                      {showNewPasswordModal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {getPasswordFieldMessage('NewPassword') && <p className="text-xs text-destructive">{getPasswordFieldMessage('NewPassword')}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t.dashboard.confirmNewPassword || 'Confirm new password'}</Label>
                  <div className="relative">
                    <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder='**********' />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" onClick={() => setShowConfirmPassword((v) => !v)}>
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {getPasswordFieldMessage('ConfirmPassword') && <p className="text-xs text-destructive">{getPasswordFieldMessage('ConfirmPassword')}</p>}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" type="button" onClick={closeChangePassword}>Cancel</Button>
                  <Button type="submit" disabled={isChangingPassword}>{isChangingPassword ? 'Saving...' : 'Save'}</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
