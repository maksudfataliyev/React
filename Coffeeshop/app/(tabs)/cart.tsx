import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Cart() {
  const router = useRouter();

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
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() =>router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={36} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>My cart</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.itemWrapper}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.cartCard}>
              <Image source={{ uri: item.image }} style={styles.cartImage} />
              
              <View style={styles.controlsContainer}>
                <View style={styles.quantityRow}>
                  <Pressable><Text style={styles.controlText}>-</Text></Pressable>
                  <Text style={styles.quantityValue}>{item.quantity}</Text>
                  <Pressable><Text style={styles.controlText}>+</Text></Pressable>
                </View>
                
                <View style={styles.cardFooter}>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#E67E22" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Price</Text>
            <Text style={styles.summaryValue}>$4.00</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount</Text>
            <Text style={styles.summaryValue}>5%</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: 'white', fontSize: 18 }]}>Total</Text>
            <Text style={[styles.summaryValue, { color: 'white', fontSize: 18 }]}>$3.75</Text>
          </View>
        </View>

        <Pressable style={styles.payButton} onPress={() => router.push('/payment-method')}>
          <Text style={styles.payButtonText}>Pay now</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
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
    color: 'white',
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
    color: 'white',
    fontSize: 22,
    marginBottom: 15,
  },
  cartCard: {
    backgroundColor: '#1E293B',
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
    color: 'white',
    fontSize: 20,
  },
  quantityValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: '#0F172A',
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
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ratingText: {
    color: '#94A3B8',
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
    color: '#94A3B8',
    fontSize: 16,
  },
  summaryValue: {
    color: 'white',
    fontSize: 16,
  },
  payButton: {
    backgroundColor: '#E67E22',
    height: 70,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#E67E22',
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