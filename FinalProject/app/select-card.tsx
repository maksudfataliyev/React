import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, Platform, StatusBar, ScrollView, Alert, Image } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './contexts/ThemeContext';
import { cardService } from './utils/CardService';
import { CardFormData } from './schemas/card-schema';

export default function SelectCard() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const [cards, setCards] = useState<CardFormData[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      const userData = await AsyncStorage.getItem("currentUser");
      if (userData) {
        const { email } = JSON.parse(userData);
        const savedCards = await cardService.getCards(email);
        setCards(savedCards);
        if (savedCards.length > 0) setSelectedCardId(savedCards[0].id!);
      }
    };
    fetchCards();
  }, []);

  const handleConfirm = () => {
    if (!selectedCardId) {
      Alert.alert("No Card", "Please add a card first.");
      return;
    }
    const navigationParams = params.buyNowItem ? { buyNowItem: params.buyNowItem } : {};
    router.push({
      pathname: '/confirmation',
      params: navigationParams
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={36} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Select Card</Text>
        <Pressable onPress={() => router.push('/payment')}>
          <Ionicons name="add-outline" size={30} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {cards.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ color: theme.textMuted }}>No saved cards found.</Text>
          </View>
        ) : (
          cards.map((card) => (
            <Pressable
              key={card.id}
              onPress={() => setSelectedCardId(card.id!)}
              style={[
                styles.cardItem,
                { backgroundColor: theme.card },
                selectedCardId === card.id && { borderColor: theme.primary, borderWidth: 2 }
              ]}
            >
              <View style={styles.cardRow}>
                <View style={styles.imageContainer}>
                  {card.cardImage ? (
                    <Image 
                      source={{ uri: card.cardImage }} 
                      style={styles.cardThumb} 
                      resizeMode="cover" 
                    />
                  ) : (
                    <Ionicons name="card" size={30} color={theme.primary} />
                  )}
                </View>

                <View style={styles.cardInfo}>
                  <Text style={[styles.cardDigits, { color: theme.text }]}>
                    **** **** **** {card.cardNumber.slice(-4)}
                  </Text>
                  <Text style={[styles.cardName, { color: theme.textMuted }]}>
                    {card.holderName.toUpperCase()}
                  </Text>
                </View>

                {selectedCardId === card.id && (
                  <Ionicons name="checkmark-circle" size={26} color={theme.primary} />
                )}
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={[styles.confirmButton, { backgroundColor: theme.primary }]} 
          onPress={handleConfirm}
        >
          <Text style={styles.buttonText}>Confirm Selection</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  cardItem: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  cardThumb: {
    width: '100%',
    height: '100%',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 15,
  },
  cardDigits: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardName: {
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  confirmButton: {
    height: 65,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
});