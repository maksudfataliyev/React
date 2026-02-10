import AsyncStorage from '@react-native-async-storage/async-storage';
import { CardFormData } from '../schemas/card-schema';

export const cardService = {
  getStorageKey: (email: string) => `@card_info_${email}`,

  getCards: async (email: string): Promise<CardFormData[]> => {
    try {
      const json = await AsyncStorage.getItem(cardService.getStorageKey(email));
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  },

  saveCard: async (email: string, newCard: CardFormData): Promise<{ success: boolean; message: string }> => {
    try {
      const cards = await cardService.getCards(email);
      
      const isDuplicate = cards.some(c => 
        c.cardNumber.replace(/\s/g, '') === newCard.cardNumber.replace(/\s/g, '')
      );

      if (isDuplicate) {
        return { success: false, message: "This card is already linked to your account." };
      }

      const updatedCards = [...cards, { ...newCard, id: Date.now().toString() }];
      await AsyncStorage.setItem(cardService.getStorageKey(email), JSON.stringify(updatedCards));
      return { success: true, message: "Card saved successfully." };
    } catch {
      return { success: false, message: "Storage error. Please try again." };
    }
  },

  deleteCard: async (email: string, cardId: string): Promise<CardFormData[]> => {
    const cards = await cardService.getCards(email);
    const updated = cards.filter(c => c.id !== cardId);
    await AsyncStorage.setItem(cardService.getStorageKey(email), JSON.stringify(updated));
    return updated;
  }
};