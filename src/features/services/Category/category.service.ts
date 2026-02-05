import { authHttp } from "./httpClient";


export async function getCategories(lang?: string): Promise<any> {
  const url = `/all${lang ? `?lang=${encodeURIComponent(lang)}&language=${encodeURIComponent(lang)}` : ''}`;
  const config = lang ? { headers: { 'Accept-Language': lang } } : undefined;
  const data = await authHttp.get(url, config as any);
  console.log('getCategories response:', data);
  return data;
}

export async function getCategoryAttributesAndValues(lang?: string): Promise<any> {
  const url = `/attributes${lang ? `?lang=${encodeURIComponent(lang)}&language=${encodeURIComponent(lang)}` : ''}`;
  const config = lang ? { headers: { 'Accept-Language': lang } } : undefined;
  const response = await authHttp.get(url, config as any);
  return response;
}