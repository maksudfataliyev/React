import { authHttp } from './httpClient';
import { extractApiErrors } from '@/shared/utils/errorExtract';

export interface CheckoutRequestDto {
    currency?: string; // e.g. 'AZN'
    // method can be a numeric enum value or a string like 'GooglePay'; strings will be normalized
    method?: number | string;
    gatewayTransactionId?: string;
    // Optional customer/contact overrides
    clientFullName?: string;
    clientEmail?: string;
    clientPhone?: string;
    // Optional delivery address overrides
    deliveryAddress?: string;
    deliveryCity?: string;
    deliveryAddressDetails?: string;
    // Delivery method enum: can be numeric (backend enum) or string like 'delivery'|'pickup'|'other'
    deliveryMethod?: number | string;
    // explicit delivery price (numeric)
    deliveryPrice?: number;
}

export interface CheckoutSummary {
    OrderId: string;
    ReceiptId: string;
    OrderPaymentId: string;
    Status: string;
    Currency: string;
    Total: number;
    Payment: {
        Method: string;
        Status: string;
        GatewayTransactionId: string;
    };
    Items: Array<{ ProductVariantId: string; Quantity: number }>;
    Note?: string;
}

export interface CheckoutResponse {
    isSuccess: boolean;
    message?: string;
    data?: CheckoutSummary;
}

export async function checkout(payload: CheckoutRequestDto): Promise<CheckoutResponse> {
    try {
        console.log("Checkout payload:", payload);
        // Normalize method: backend expects numeric enum; convert from string when necessary
        const normalizeMethod = (m: unknown): number | undefined => {
            if (typeof m === 'number') return m;
            if (typeof m !== 'string') return undefined;
            const map: Record<string, number> = {
                cash: 0,
                creditcard: 1,
                banktransfer: 2,
                paypal: 3,
                googlepay: 4,
                applepay: 5,
                other: 99,
            };
            const key = m.replace(/\s+/g, '').toLowerCase();
            return map[key];
        };

        // Normalize deliveryMethod: backend DeliveryMethod enum -> Unknown=0, Delivery=1, Pickup=2, Other=3
        const normalizeDeliveryMethod = (d: unknown): number | undefined => {
            if (typeof d === 'number') return d;
            if (typeof d !== 'string') return undefined;
            const key = d.replace(/\s+/g, '').toLowerCase();
            const map: Record<string, number> = {
                unknown: 0,
                delivery: 1,
                pickup: 2,
                other: 3,
                // common synonyms
                'sellerdelivery': 1,
                'seller': 1,
                'pick-up': 2,
                'pick': 2,
            };
            return map[key] ?? undefined;
        };
        const normalized = { ...payload } as any;
        if (typeof normalized.method !== 'undefined') {
            const num = normalizeMethod(normalized.method);
            if (typeof num === 'number') normalized.method = num; else delete normalized.method; // fallback: omit
        }
        if (typeof normalized.deliveryMethod !== 'undefined') {
            const dm = normalizeDeliveryMethod(normalized.deliveryMethod);
            if (typeof dm === 'number') normalized.deliveryMethod = dm; else delete normalized.deliveryMethod;
        }
        if (typeof normalized.deliveryPrice !== 'undefined') {
            // ensure numeric value
            const p = Number(normalized.deliveryPrice);
            if (!Number.isFinite(p)) delete normalized.deliveryPrice; else normalized.deliveryPrice = p;
        }
        const { data } = await authHttp.post<CheckoutResponse>('', normalized);
        console.log("Checkout response data:", data);
        return data;
    } catch (e: any) {
        console.error('Checkout error:', e?.response?.data || e);
        const msgs = extractApiErrors(e);
        return { isSuccess: false, message: msgs.length ? msgs.join(' | ') : (e?.response?.data?.message || e.message) };
    }
}
