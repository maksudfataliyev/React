import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, Pressable, SafeAreaView, 
  Platform, StatusBar, ActivityIndicator 
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from './contexts/ThemeContext';
import { cartService } from './utils/CartService';
import { orderService } from './utils/OrderService';

interface OrderProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function Confirmation() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  
  const [userId, setUserId] = useState<string>('guest');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUserId = async () => {
      const userData = await AsyncStorage.getItem("currentUser");
      if (userData) {
        const parsed = JSON.parse(userData);
        setUserId(parsed.id || parsed.email || 'guest');
      }
    };
    getUserId();
  }, []);

  const handleFinish = async () => {
    setLoading(true);
    console.log("DEBUG: Params received ->", params); // check your terminal!

    try {
      let products: OrderProduct[] = [];
      let subtotal = 0;
      let displayImage = "";

      // 1. Process Buy Now
      if (params.buyNowItem) {
        try {
          const item = JSON.parse(params.buyNowItem as string);
          
          // Fix: Ensure price is ALWAYS a number even if it contains '$'
          const rawPrice = item.price;
          const priceNum = typeof rawPrice === 'string' 
            ? parseFloat(rawPrice.replace(/[^0-9.]/g, '')) 
            : rawPrice;

          products = [{
            id: String(item.id || Date.now()),
            name: item.name || 'Coffee Item',
            price: priceNum || 0,
            quantity: 1
          }];
          
          subtotal = priceNum;
          displayImage = item.image || "";
          console.log("DEBUG: Buy Now processed successfully");
        } catch (err) {
          console.error("DEBUG: Buy Now JSON Parse Failed", err);
        }
      } 
      
      // 2. Process Cart (only if Buy Now didn't happen)
      if (products.length === 0) {
        const cartItems = await cartService.getCart(userId);
        if (cartItems.length > 0) {
          products = cartItems.map(i => ({
            id: i.id,
            name: i.name,
            price: typeof i.price === 'string' ? parseFloat(i.price.replace(/[^0-9.]/g, '')) : i.price,
            quantity: i.quantity
          }));
          subtotal = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
          displayImage = cartItems[0].image;
        }
      }

      // 3. Final Save
      if (products.length > 0) {
        const orderToSave = {
          id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          date: new Date().toLocaleDateString('en-GB'),
          status: "Completed" as const, // Must match OrderItem type exactly
          image: displayImage,
          products: products,
          subtotal: subtotal,
          deliveryFee: 2.00,
          total: subtotal + 2.00
        };

        console.log("DEBUG: Attempting to save order...", orderToSave);
        await orderService.saveOrder(userId, orderToSave);
        
        if (!params.buyNowItem) {
          await cartService.clearCart(userId);
        }
      } else {
        console.log("DEBUG: No products found to save");
      }

      router.push('/(tabs)/profile');
    } catch (e) {
      console.error("DEBUG: Save failed", e);
      router.push('/(tabs)/profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={[styles.statusCircle, { backgroundColor: theme.primary }]}>
          <Ionicons name="checkmark" size={100} color="white" />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Order Accepted</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Your order is being prepared!
        </Text>
      </View>
      <View style={styles.footer}>
        <Pressable onPress={handleFinish} disabled={loading} style={[styles.button, { backgroundColor: theme.primary }]}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Thank You</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  statusCircle: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: 'center' },
  footer: { padding: 30 },
  button: { height: 55, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '700' },
});