import AsyncStorage from '@react-native-async-storage/async-storage';
import { CoffeeItem } from '../constants/coffee-data';

export interface CartItem extends CoffeeItem {
  quantity: number;
}

const CART_PREFIX = 'cart_';

export const cartService = {
  getCart: async (userId: string): Promise<CartItem[]> => {
    try {
      const data = await AsyncStorage.getItem(`${CART_PREFIX}${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToCart: async (userId: string, item: CoffeeItem): Promise<CartItem[]> => {
    const cart = await cartService.getCart(userId);
    const existingIndex = cart.findIndex((i) => i.id === item.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }

    await AsyncStorage.setItem(`${CART_PREFIX}${userId}`, JSON.stringify(cart));
    return cart;
  },

  updateQuantity: async (userId: string, itemId: string, delta: number): Promise<CartItem[]> => {
    let cart = await cartService.getCart(userId);
    const itemIndex = cart.findIndex((i) => i.id === itemId);

    if (itemIndex > -1) {
      cart[itemIndex].quantity += delta;
      if (cart[itemIndex].quantity <= 0) {
        cart = cart.filter((i) => i.id !== itemId);
      }
    }

    await AsyncStorage.setItem(`${CART_PREFIX}${userId}`, JSON.stringify(cart));
    return cart;
  },

  clearCart: async (userId: string): Promise<void> => {
    await AsyncStorage.removeItem(`${CART_PREFIX}${userId}`);
  }
};