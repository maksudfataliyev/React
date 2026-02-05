import { authHttp } from "./httpClient";

export async function getCartItems(language?: string): Promise<any> {
  const path = language ? `/getAll?lang=${encodeURIComponent(language)}` : `/getAll`;
  const data = await authHttp.get(path);
  return data;
}

export async function increaseQuantity(cartItemId: string): Promise<any> {
  // send cartItemId (cart row id) so backend can increase the right row
  const data = await authHttp.post(`/increase`, { cartItemId });
  return data;
}

export async function decreaseQuantity(cartItemId: string): Promise<any> {
  // send cartItemId (cart row id) so backend can decrease the right row
  const data = await authHttp.post(`/decrease`, { cartItemId });
  return data;
}

export async function addItem(productId: string): Promise<any> {
  const data = await authHttp.post(`/add`, { productId });
  return data;
}

export async function removeItem(productId: string): Promise<any> {
  console.log('Removing item with productId:', productId);
  const data = await authHttp.delete(`/delete/${productId}`);
  console.log('removeItem response:', data);
  return data;
}

