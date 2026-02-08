import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, Platform, StatusBar, ScrollView, Image } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './contexts/ThemeContext';


export default function PaymentMethod() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const [selectedMethod, setSelectedMethod] = useState('visa');

  const methods = [
    { id: 'visa', image: 'https://static.vecteezy.com/system/resources/previews/020/975/576/non_2x/visa-logo-visa-icon-transparent-free-png.png' },
    { id: 'mastercard', image: 'https://pnghdpro.com/wp-content/themes/pnghdpro/download/social-media-and-brands/mastercard-logo.png' },
    { id: 'apple', image: 'https://download.logo.wine/logo/Apple_Pay/Apple_Pay-Logo.wine.png' },
    { id: 'google', image: 'https://download.logo.wine/logo/Google_Pay/Google_Pay-Logo.wine.png' },
  ];

  const handleProceed = () => {
  const navigationParams = params.buyNowItem ? { buyNowItem: params.buyNowItem } : {};
  if (selectedMethod === 'apple' || selectedMethod === 'google') {
    router.push({
      pathname: '/confirmation',
      params: navigationParams
    });
  } else {
    router.push({
      pathname: '/select-card',
      params: navigationParams
    });
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
          <Pressable style={styles.addCardBtn} onPress={() => router.push('/payment')}>
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
            <Image source={{ uri: method.image }} style={styles.logoLarge} resizeMode="contain" />
          </Pressable>
        ))}

        <View style={styles.footerSpace}>
          <Pressable 
            style={[styles.actionButton, { backgroundColor: theme.primary }]} 
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
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 25,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  addCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addCardText: {
    fontSize: 14,
    fontWeight: '500',
  },
  methodCard: {
    height: 110,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2.5,
    borderColor: 'transparent',
  },
  logoLarge: {
    width: '65%',
    height: 50,
  },
  footerSpace: {
    marginTop: 30,
  },
  actionButton: {
    height: 65,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
  },
});