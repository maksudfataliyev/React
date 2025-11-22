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

// Helper to get auth headers with JWT token
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// Helper to get image URL
function getProductImageUrl(imagePath: string): string {
  if (imagePath.startsWith('http')) return imagePath;
  try {
    return new URL(`../assets/images/${imagePath}`, import.meta.url).href;
  } catch {
    return `/images/${imagePath}`;
  }
}

export const orderService = {
  // Checkout Direct - sends JWT token
  async checkoutDirect(cartItems: any[]): Promise<OrderResponse> {
    const response = await fetch(`${API_BASE_URL}/orders/checkout-direct`, {
      method: 'POST',
      headers: getAuthHeaders(), // ← Sends JWT token
      body: JSON.stringify({
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity ?? 1,
        })),
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please login to checkout');
      }
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

  // Get Purchase History - sends JWT token
  async getPurchaseHistory(): Promise<PurchaseHistoryResponse> {
    const response = await fetch(`${API_BASE_URL}/orders/history`, {
      method: 'GET',
      headers: getAuthHeaders(), // ← Sends JWT token
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please login to view order history');
      }
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

  // Get Specific Order - sends JWT token
  async getOrder(orderId: number): Promise<OrderResponse> {
    const response = await fetch(`${API_BASE_URL}/orders/order/${orderId}`, {
      method: 'GET',
      headers: getAuthHeaders(), // ← Sends JWT token
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please login to view order details');
      }
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
};