import { getProductImageUrl } from "./getImageUrl";

const API_BASE_URL = 'http://localhost:5146/api'; 

export interface OrderItemResponse {
  productId: string;
  productTitle: string;
  productImage: string;
  originalPrice: number;
  discount: number | null;
  finalPrice: number;
  quantity: number;
}

export interface OrderResponse {
  orderId: number;
  totalAmount: number;
  purchaseDate: string;
  items: OrderItemResponse[];
}

export interface PurchaseHistoryResponse {
  totalOrders: number;
  totalSpent: number;
  orders: OrderResponse[];
}

export const orderService = {

  async checkout(username: string): Promise<OrderResponse> {
    const response = await fetch(`${API_BASE_URL}/orders/${username}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Checkout failed');
    }

    const order: OrderResponse = await response.json();

    // Fix image URLs
    order.items = order.items.map(item => ({
      ...item,
      productImage: getProductImageUrl(item.productImage),
    }));

    return order;
  },

  async getPurchaseHistory(username: string): Promise<PurchaseHistoryResponse> {
    const response = await fetch(`${API_BASE_URL}/orders/${username}/history`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch purchase history');
    }

    const history: PurchaseHistoryResponse = await response.json();

    // Fix images in all orders
    history.orders = history.orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        productImage: getProductImageUrl(item.productImage),
      })),
    }));

    return history;
  },

  async getOrder(username: string, orderId: number): Promise<OrderResponse> {
    const response = await fetch(`${API_BASE_URL}/orders/${username}/order/${orderId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch order');
    }

    const order: OrderResponse = await response.json();

    // Fix images
    order.items = order.items.map(item => ({
      ...item,
      productImage: getProductImageUrl(item.productImage),
    }));

    return order;
  },

  async checkoutDirect(username: string, cartItems: any[]): Promise<OrderResponse> {
    const response = await fetch(`${API_BASE_URL}/orders/${username}/checkout-direct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity ?? 1,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Checkout failed');
    }

    const order: OrderResponse = await response.json();

    // Fix images
    order.items = order.items.map(item => ({
      ...item,
      productImage: getProductImageUrl(item.productImage),
    }));

    return order;
  },

};
