import { authHttp } from "./httpClient";


export async function getClientOrders(): Promise<any> {
  const response = await authHttp.get(`/getClientOrders`);
  return response;
}

export async function getById(orderId: string): Promise<any> {
  const data = await authHttp.get(`/getById/${orderId}`);
  return data;
}

export type GetStatsOptions = {
  language?: string;
  page?: number;
  pageSize?: number;
};

export async function getStats(options?: GetStatsOptions): Promise<any> {
  const parts: string[] = [];
  if (options?.language) parts.push(`language=${encodeURIComponent(options.language)}`);
  if (typeof options?.page === 'number') parts.push(`page=${encodeURIComponent(String(options.page))}`);
  if (typeof options?.pageSize === 'number') parts.push(`pageSize=${encodeURIComponent(String(options.pageSize))}`);
  const query = parts.length ? `?${parts.join('&')}` : '';
  const data = await authHttp.get(`/summary${query}`);
  return data;
}