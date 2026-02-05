import { authHttp } from "./httpClient";

export async function getComparisonItems(language?: string): Promise<any> {
  const path = language ? `/?lang=${encodeURIComponent(language)}` : `/getAll`;
  const data = await authHttp.get(path);
  console.log(data)
  return data;
}

export async function addItem(productId: string): Promise<any> {
  const data = await authHttp.post(`/add`, { productId });
  return data;
}

export async function removeItem(productId: string): Promise<any> {
  const data = await authHttp.delete(`/remove`, { data: { productId } });
  return data;
}