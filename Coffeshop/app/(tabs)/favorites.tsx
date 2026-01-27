import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function Favorite() {
  const router = useRouter();
  const { theme } = useTheme();

  const mixedCoffee = [
    { id: '1', name: 'Mixed Coffee', price: '$2.00', rating: '4.5', image: 'https://freepngimg.com/download/temp_webp/147528-cappuccino-latte-png-free-photo.webp' },
    { id: '2', name: 'Mixed Coffee', price: '$2.00', rating: '4.5', image: 'https://freepngimg.com/download/temp_webp/147528-cappuccino-latte-png-free-photo.webp' },
  ];

  const cappuccino = [
    { id: '3', name: 'Cappuccino', price: '$2.00', rating: '4.5', image: 'https://static.vecteezy.com/system/resources/previews/042/654/751/non_2x/ai-generated-layered-latte-macchiato-in-a-clear-glass-free-png.png' },
  ];

  const CoffeeCard = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.ratingBadge}>
        <Ionicons name="star" size={12} color={theme.primary} />
        <Text style={[styles.ratingText, { color: theme.text }]}>{item.rating}</Text>
      </View>
      <Image source={{ uri: item.image }} style={styles.coffeeImage} />
      <View style={styles.cardFooter}>
        <Text style={[styles.priceText, { color: theme.text }]}>{item.price}</Text>
        <Pressable>
          <Ionicons name="add-circle" size={24} color={theme.primary} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={36} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Favorite</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Mixed coffee</Text>
        <View style={styles.grid}>
          {mixedCoffee.map((item) => (
            <CoffeeCard key={item.id} item={item} />
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Cappuccino</Text>
        <View style={styles.grid}>
          {cappuccino.map((item) => (
            <CoffeeCard key={item.id} item={item} />
          ))}
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
    fontWeight: '400',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 24,
    marginTop: 25,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  card: {
    width: '47%',
    borderRadius: 20,
    padding: 12,
    position: 'relative',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 1,
  },
  ratingText: {
    fontSize: 12,
  },
  coffeeImage: {
    width: '100%',
    height: 140,
    borderRadius: 15,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '600',
  },
});