import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, Platform, StatusBar, ScrollView, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './contexts/ThemeContext';

export default function PaymentMethod() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedMethod, setSelectedMethod] = useState('visa');

  const methods = [
    { id: 'visa', image: 'https://static.vecteezy.com/system/resources/previews/020/975/576/non_2x/visa-logo-visa-icon-transparent-free-png.png', route: '/payment' },
    { id: 'mastercard', image: 'https://pnghdpro.com/wp-content/themes/pnghdpro/download/social-media-and-brands/mastercard-logo.png', route: '/payment' },
    { id: 'apple', image: 'https://download.logo.wine/logo/Apple_Pay/Apple_Pay-Logo.wine.png', route: '/confirmation' },
    { id: 'google', image: 'https://download.logo.wine/logo/Google_Pay/Google_Pay-Logo.wine.png', route: '/confirmation' },
  ];

  const handleProceed = () => {
    const selected = methods.find(m => m.id === selectedMethod);
    if (selected) {
      router.push(selected.route as any);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={36} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Payment Method</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.subHeader}>
          <Text style={[styles.subTitle, { color: theme.text }]}>Payment</Text>
          <Pressable style={styles.addCardBtn}>
            <Ionicons name="add-circle-outline" size={20} color={theme.textMuted} />
            <Text style={[styles.addCardText, { color: theme.textMuted }]}>Add your card</Text>
          </Pressable>
        </View>

        {methods.map((method) => (
          <Pressable
            key={method.id}
            onPress={() => setSelectedMethod(method.id)}
            style={[
              styles.methodCard,
              { backgroundColor: theme.card },
              selectedMethod === method.id && { borderColor: theme.primary }
            ]}
          >
            <Image 
              source={{ uri: method.image }} 
              style={styles.logoLarge} 
              resizeMode="contain" 
            />
          </Pressable>
        ))}

        <View style={styles.footerSpace}>
          <Pressable 
            style={[styles.actionButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]} 
            onPress={handleProceed}
          >
            <Text style={styles.buttonText}>Proceed with payment</Text>
          </Pressable>
        </View>
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
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 18,
  },
  addCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  addCardText: {
    fontSize: 14,
  },
  methodCard: {
    height: 120,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  logoLarge: {
    width: '70%',
    height: 60,
  },
  footerSpace: {
    marginTop: 20,
    paddingBottom: 20,
  },
  actionButton: {
    height: 65,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});