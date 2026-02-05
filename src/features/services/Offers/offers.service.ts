import { authHttp } from './httpClient';

export interface OfferItemPayload {
  offeredProductId: string;
  quantity: number;
}

export interface CreateBarterPayload {
  requestedProductId: string;
  note?: string | null;
  price?: number | null;
  items: OfferItemPayload[];
}

export interface SendOfferPayload {
  message?: string | null;
  items?: OfferItemPayload[] | null;
  price?: number | null;
}

export async function createBarter(payload: CreateBarterPayload): Promise<any> {
  return await authHttp.post('/create', payload);
}

export async function getMyBarters(): Promise<any> {
  return await authHttp.get('/myBarters');
}

export async function getBarterByProductId(productId: string): Promise<any> {
  const url = `/getBarterByProductId/${encodeURIComponent(String(productId))}`;
  return await authHttp.get(url);
}

export async function sendOffer(productId: string, payload: SendOfferPayload): Promise<any> {
  const url = `/${encodeURIComponent(String(productId))}/offers`;
  return await authHttp.post(url, payload);
}

export async function acceptOffer(offerId: string): Promise<any> {
  const url = `/offers/${encodeURIComponent(String(offerId))}/accept`;
  return await authHttp.post(url, {});
}

export async function rejectOffer(offerId: string): Promise<any> {
  const url = `/offers/${encodeURIComponent(String(offerId))}/reject`;
  return await authHttp.post(url, {});
}

export async function counterOffer(offerId: string, payload: SendOfferPayload): Promise<any> {
  const url = `/offers/${encodeURIComponent(String(offerId))}/counter`;
  return await authHttp.post(url, payload);
}

export async function getReceivedOffers(): Promise<any> {
  return await authHttp.get('/received');
}

export async function getSentOffers(): Promise<any> {
  return await authHttp.get('/sent');
}
