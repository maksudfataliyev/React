import { authHttp } from "./httpClient";
import type { ProductFilterRequest } from "@/features/services/DTOs/interfaces";

export async function getFilteredProducts(filter?: Partial<ProductFilterRequest> & { lang?: string }): Promise<any> {
  const payload = {
    categoryId: filter?.categoryId ?? null,
    page: filter?.page ?? 1,
    pageSize: filter?.pageSize ?? 20,
    minPrice: (filter as any)?.minPrice ?? null,
    maxPrice: (filter as any)?.maxPrice ?? null,
    isBarterAvailable: (filter as any)?.isBarterAvailable ?? null,
    condition: (filter as any)?.condition ?? null,
    valueIds: filter?.valueIds ?? [''],
  } as any;

  const url = `/filter${filter?.lang ? `?lang=${encodeURIComponent(filter.lang)}&language=${encodeURIComponent(filter.lang)}` : ''}`;
  const config = filter?.lang ? { headers: { 'Accept-Language': filter.lang } } : undefined;
  const response = await authHttp.post(url, payload, config);
  console.log('getFilteredProducts response:', response);
  return response;
}

export async function getProductDetailsById(productId: string, lang?: string): Promise<any> {
  const params = new URLSearchParams();
  if (lang) params.append('lang', String(lang));
  const url = `/details/${encodeURIComponent(String(productId))}${params.toString() ? `?${params.toString()}` : ''}`;
  const config = lang ? { headers: { 'Accept-Language': String(lang) } } : undefined;
  const res = await authHttp.get(url, config);
  return res;
}

export async function addProduct(product: {
  title?: string;
  description?: string;
  clientProfileId?: string | null;
  categoryId?: string | null;
  price?: number;
  discountPrice?: number;
  weight?: number;
  width?: number;
  height?: number;
  depth?: number;
  isBarterAvailable?: boolean;
  images?: string[];
  condition?: number | null;
  inStock?: number | null;
  status?: any;
  sourceLanguage?: string | null;
  valueIds?: string[]; // optional list of attribute value UUIDs
}): Promise<any> {
  // prefer explicit valueIds; if none provided, send an empty array (no placeholders)
  const resolvedValueIds: string[] = Array.isArray(product.valueIds) ? product.valueIds : [];

  const payload = {
    clientProfileId: product.clientProfileId ?? '',
    title: product.title ?? '',
    description: product.description ?? '',
    categoryId: product.categoryId ?? '',
    price: typeof product.price === 'number' ? product.price : 1,
    discountPrice: typeof product.discountPrice === 'number' ? product.discountPrice : 1,
    width: typeof product.width === 'number' ? product.width : 1,
    height: typeof product.height === 'number' ? product.height : 1,
    depth: typeof product.depth === 'number' ? product.depth : 1,
    weight: typeof product.weight === 'number' ? product.weight : 1,
    images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [''],
    inStock: typeof product.inStock === 'number' ? product.inStock : 1,
    condition: typeof product.condition === 'number' ? product.condition : null,
    isBarterAvailable: typeof product.isBarterAvailable === 'boolean' ? product.isBarterAvailable : true,
    valueIds: resolvedValueIds,
    status: typeof product.status !== 'undefined' ? product.status : null,
    sourceLanguage: product.sourceLanguage ?? null,
  } as any;

  const response = await authHttp.post(`/add`, payload);
  return response;
}



export async function searchProductsByTitle(params: { title: string; page?: number; pageSize?: number; lang?: string }): Promise<any> {
  const { title, page = 1, pageSize = 20, lang } = params;
  const payload = {
    title: String(title ?? ''),
    page,
    pageSize,
  } as any;

  const url = `/search-by-title${lang ? `?lang=${encodeURIComponent(lang)}&language=${encodeURIComponent(lang)}` : ''}`;
  const response = await authHttp.post(url, payload);
  console.log('searchProductsByTitle response:', response);
  return response;
}

export async function getProductsByClientId(clientProfileId: string, params?: { page?: number; pageSize?: number; lang?: string }): Promise<any> {
  const payload = {
    clientId: clientProfileId,
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
  } as any;

  const url = `/myProducts${params?.lang ? `?lang=${encodeURIComponent(params.lang)}&language=${encodeURIComponent(params.lang)}` : ''}`;
  const config = params?.lang ? { headers: { 'Accept-Language': params.lang } } : undefined;
  const response = await authHttp.post(url, payload, config);
  console.log('getProductsByClientId response:', response);
  return response;
}

export async function editProduct(productId: string, product: {
  title?: string | null;
  description?: string | null;
  categoryId?: string | null;
  price?: number | null;
  discountPrice?: number | null;
  width?: number | null;
  height?: number | null;
  depth?: number | null;
  weight?: number | null;
  images?: string[] | null;
  inStock?: number | null;
  condition?: number | null;
  isBarterAvailable?: boolean | null;
  valueIds?: string[] | null;
  status?: any;
  sourceLanguage?: string | null;
}): Promise<any> {
  // Build payload with explicit nulls allowed (backend expects keys even when null)
  const payload = {
    title: typeof product.title === 'undefined' ? null : product.title,
    description: typeof product.description === 'undefined' ? null : product.description,
    categoryId: typeof product.categoryId === 'undefined' ? null : product.categoryId,
    price: typeof product.price === 'undefined' ? null : (product.price === null ? null : Number(product.price)),
    discountPrice: typeof product.discountPrice === 'undefined' ? null : (product.discountPrice === null ? null : Number(product.discountPrice)),
    width: typeof product.width === 'undefined' ? null : (product.width === null ? null : Number(product.width)),
    height: typeof product.height === 'undefined' ? null : (product.height === null ? null : Number(product.height)),
    depth: typeof product.depth === 'undefined' ? null : (product.depth === null ? null : Number(product.depth)),
    weight: typeof product.weight === 'undefined' ? null : (product.weight === null ? null : Number(product.weight)),
    images: Array.isArray(product.images) ? product.images : (product.images === null ? [''] : ['']),
    inStock: typeof product.inStock === 'undefined' ? null : (product.inStock === null ? null : Number(product.inStock)),
    condition: typeof product.condition === 'undefined' ? null : (product.condition === null ? null : product.condition),
    isBarterAvailable: typeof product.isBarterAvailable === 'undefined' ? null : (product.isBarterAvailable === null ? null : Boolean(product.isBarterAvailable)),
    valueIds: Array.isArray(product.valueIds) ? product.valueIds : (product.valueIds === null ? [''] : ['']),
    status: typeof product.status === 'undefined' ? null : product.status,
    sourceLanguage: typeof product.sourceLanguage === 'undefined' ? null : product.sourceLanguage,
  } as any;

  // POST to sync endpoint using product id. Backend expects id in path (example: /sync/{id})
  const url = `/${encodeURIComponent(productId)}/sync`;
  // Use PUT for updates to existing products
  const response = await authHttp.put(url, payload);
  return response;
}
