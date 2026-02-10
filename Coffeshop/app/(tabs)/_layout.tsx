import React, { useState, useCallback } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabLayout() {
  const { theme } = useTheme();
  const [cartCount, setCartCount] = useState<number | undefined>(undefined);

useFocusEffect(
  useCallback(() => {
    const getCartCount = async () => {
      try {
        const userData = await AsyncStorage.getItem("currentUser");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          const userId = parsedUser.id || parsedUser.email;
          const cartData = await AsyncStorage.getItem(`cart_${userId}`);
          
          if (cartData) {
            const items = JSON.parse(cartData);
            const totalQuantity = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
            
            setCartCount(totalQuantity > 0 ? totalQuantity : undefined);
          } else {
            setCartCount(undefined);
          }
        }
      } catch (e) {
        setCartCount(undefined);
      }
    };

    getCartCount();
    const interval = setInterval(getCartCount, 1500);
    return () => clearInterval(interval);
  }, [])
);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopWidth: 1,
          borderTopColor: theme.accent,
          height: 60,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen name="order" options={{ href: null }} />
      <Tabs.Screen name="card-information" options={{ href: null }} />
      <Tabs.Screen name="help" options={{ href: null }} />
      <Tabs.Screen name="personal-info" options={{ href: null }} />
      <Tabs.Screen name="purchase-history" options={{ href: null }} />
      <Tabs.Screen name="theme-toggle" options={{ href: null }} />
      <Tabs.Screen name="about" options={{ href: null }} />

      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "heart" : "heart-outline"} size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarBadge: cartCount,
          tabBarBadgeStyle: {
            backgroundColor: theme.primary,
            color: 'white',
            fontSize: 10,
            lineHeight: 15,
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "cart" : "cart-outline"} size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}