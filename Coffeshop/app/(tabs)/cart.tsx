import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cartService, CartItem } from '../utils/CartService';

export default function Cart() {
  const router = useRouter();
  const { theme } = useTheme();
  const [items, setItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string>('guest');

  const loadCart = async () => {
    const userData = await AsyncStorage.getItem("currentUser");
    const id = userData ? JSON.parse(userData).id || JSON.parse(userData).email : 'guest';
    setUserId(id);
    const cartData = await cartService.getCart(id);
    setItems(cartData);
  };

  useFocusEffect(useCallback(() => { loadCart(); }, []));

  const changeQty = async (id: string, delta: number) => {
    const updated = await cartService.updateQuantity(userId, id, delta);
    setItems(updated);
  };

  const totals = items.reduce((acc, item) => {
    const price = parseFloat(item.price.replace('$', ''));
    return acc + (price * item.quantity);
  }, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={36} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My cart</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ color: theme.textMuted }}>Your cart is empty</Text>
          </View>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.itemWrapper}>
              <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
              <View style={[styles.cartCard, { backgroundColor: theme.card }]}>
                <Image source={{ uri: item.image }} style={styles.cartImage} />
                <View style={styles.controlsContainer}>
                  <View style={styles.quantityRow}>
                    <Pressable onPress={() => changeQty(item.id, -1)}>
                      <Ionicons name="remove-circle-outline" size={28} color={theme.text} />
                    </Pressable>
                    <Text style={[styles.quantityValue, { color: theme.text, backgroundColor: theme.background }]}>
                      {item.quantity < 10 ? `0${item.quantity}` : item.quantity}
                    </Text>
                    <Pressable onPress={() => changeQty(item.id, 1)}>
                      <Ionicons name="add-circle-outline" size={28} color={theme.text} />
                    </Pressable>
                  </View>
                  <View style={styles.cardFooter}>
                    <Text style={[styles.itemPrice, { color: theme.text }]}>
                      ${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}
                    </Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#FBBE21" />
                      <Text style={[styles.ratingText, { color: theme.textMuted }]}>{item.rating}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}

        {items.length > 0 && (
          <>
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Subtotal</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>${totals.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.text, fontSize: 18, fontWeight: '700' }]}>Total</Text>
                <Text style={[styles.summaryValue, { color: theme.text, fontSize: 18, fontWeight: '700' }]}>${totals.toFixed(2)}</Text>
              </View>
            </View>

            <Pressable style={[styles.payButton, { backgroundColor: theme.primary }]} onPress={() => router.push('/payment-method')}>
              <Text style={styles.payButtonText}>Pay now</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
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
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  empty: {
    alignItems: 'center',
    marginTop: 100,
  },
  itemWrapper: {
    marginTop: 20,
  },
  itemName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  cartCard: {
    borderRadius: 24,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartImage: {
    width: 90,
    height: 90,
    borderRadius: 20,
  },
  controlsContainer: {
    flex: 1,
    marginLeft: 15,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '800',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryContainer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  payButton: {
    height: 65,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
});