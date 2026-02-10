import AsyncStorage from '@react-native-async-storage/async-storage';
import { CoffeeItem } from '../constants/coffee-data';

export const getFavorites = async (userId: string): Promise<CoffeeItem[]> => {
  try {
    const data = await AsyncStorage.getItem(`favorites_${userId}`);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const toggleFavorite = async (userId: string, item: CoffeeItem) => {
  try {
    const favorites = await getFavorites(userId);
    const isExist = favorites.find((f) => f.id === item.id);
    
    let newFavorites;
    if (isExist) {
      newFavorites = favorites.filter((f) => f.id !== item.id);
    } else {
      newFavorites = [...favorites, item];
    }
    
    await AsyncStorage.setItem(`favorites_${userId}`, JSON.stringify(newFavorites));
    return newFavorites;
  } catch (e) {
    console.error("Error toggling favorite", e);
    return [];
  }
};