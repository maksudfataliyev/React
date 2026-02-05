import { authHttp } from "./httpClient";

export async function addReview(productId?: string, rating?: number, comment?: string, images?: string[], lang?: string): Promise<any> {
  const payload: any = { productId, rating, comment, images };
  console.log("Add review payload:", payload);
  const url = `/create${lang ? `?lang=${encodeURIComponent(lang)}&language=${encodeURIComponent(lang)}` : ''}`;
  const response = await authHttp.post(url, payload);
  return response;
}

export async function editReview(id: string, rating?: number, comment?: string, images?: string[], lang?: string): Promise<any> {
  const payload: any = { id, rating, comment, images };
  console.log("Edit review payload:", payload);
  const url = `/update/${id}${lang ? `?lang=${encodeURIComponent(lang)}&language=${encodeURIComponent(lang)}` : ''}`;
  const response = await authHttp.put(url, payload);
  return response;
}

export async function deleteReview(id: string, lang?: string): Promise<any> {
  console.log("Delete review id:", id);
  const url = `/delete/${id}${lang ? `?lang=${encodeURIComponent(lang)}&language=${encodeURIComponent(lang)}` : ''}`;
  const response = await authHttp.delete(url, { headers: { "Content-Type": "application/json" } });
  return response;
}

export async function getByProductId(ProductId: string, lang?: string): Promise<any> {
  const url = `/getByProductId/${ProductId}${lang ? `?lang=${encodeURIComponent(lang)}&language=${encodeURIComponent(lang)}` : ''}`;
  const data = await authHttp.get(url);
  return data;
}

export async function getClientReviews(lang?: string): Promise<any> {
  const url = `/getClientReviews${lang ? `?lang=${encodeURIComponent(lang)}&language=${encodeURIComponent(lang)}` : ''}`;
  const data = await authHttp.get(url);
  console.log("Client reviews data:", data);
  return data;
}