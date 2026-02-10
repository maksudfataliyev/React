import AsyncStorage from '@react-native-async-storage/async-storage';
import { OrderItem } from '../constants/order-history';

const ORDER_PREFIX = 'orders_';

export const orderService = {
  saveOrder: async (userId: string, order: OrderItem): Promise<void> => {
    try {
      const key = `${ORDER_PREFIX}${userId}`;
      const existingData = await AsyncStorage.getItem(key);
      const orders = existingData ? JSON.parse(existingData) : [];
      const updatedOrders = [order, ...orders];
      await AsyncStorage.setItem(key, JSON.stringify(updatedOrders));
    } catch (error) {
      console.error(error);
    }
  },

  getOrders: async (userId: string): Promise<OrderItem[]> => {
    try {
      const key = `${ORDER_PREFIX}${userId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }
};