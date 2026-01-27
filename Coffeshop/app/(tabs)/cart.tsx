import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function Cart() {
  const router = useRouter();
  const { theme } = useTheme();

  const cartItems = [
    { 
      id: '1', 
      name: 'Cappuccino', 
      price: '$4.00', 
      quantity: '02',
      rating: '4.5',
      image: 'https://freepngimg.com/download/temp_webp/147528-cappuccino-latte-png-free-photo.webp' 
    },
    { 
      id: '3', 
      name: 'Hot coffee', 
      price: '$2.00', 
      quantity: '01',
      rating: '4.5',
      image: 'https://static.vecteezy.com/system/resources/thumbnails/036/303/390/small/ai-generated-steaming-coffee-cup-hot-beverage-illustration-transparent-background-coffee-mug-clipart-hot-drink-graphic-brewed-coffee-icon-cafe-latte-png.png' 
    },
  ];

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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.itemWrapper}>
            <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
            <View style={[styles.cartCard, { backgroundColor: theme.card }]}>
              <Image source={{ uri: item.image }} style={styles.cartImage} />
              
              <View style={styles.controlsContainer}>
                <View style={styles.quantityRow}>
                  <Pressable><Text style={[styles.controlText, { color: theme.text }]}>-</Text></Pressable>
                  <Text style={[styles.quantityValue, { color: theme.text, backgroundColor: theme.background }]}>{item.quantity}</Text>
                  <Pressable><Text style={[styles.controlText, { color: theme.text }]}>+</Text></Pressable>
                </View>
                
                <View style={styles.cardFooter}>
                  <Text style={[styles.itemPrice, { color: theme.text }]}>{item.price}</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color={theme.primary} />
                    <Text style={[styles.ratingText, { color: theme.textMuted }]}>{item.rating}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Price</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>$4.00</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Discount</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>5%</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.text, fontSize: 18 }]}>Total</Text>
            <Text style={[styles.summaryValue, { color: theme.text, fontSize: 18 }]}>$3.75</Text>
          </View>
        </View>

        <Pressable style={[styles.payButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]} onPress={() => router.push('/payment-method')}>
          <Text style={styles.payButtonText}>Pay now</Text>
        </Pressable>
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
    fontWeight: '400',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  itemWrapper: {
    marginTop: 20,
  },
  itemName: {
    fontSize: 22,
    marginBottom: 15,
  },
  cartCard: {
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  cartImage: {
    width: 80,
    height: 80,
    borderRadius: 15,
  },
  controlsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 10,
  },
  controlText: {
    fontSize: 20,
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 15,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ratingText: {
    fontSize: 14,
  },
  summaryContainer: {
    marginTop: 30,
    gap: 15,
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
  },
  payButton: {
    height: 70,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  payButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});