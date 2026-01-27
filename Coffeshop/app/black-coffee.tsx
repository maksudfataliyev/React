import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './contexts/ThemeContext';

export default function BlackCoffeeDetails() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedSize, setSelectedSize] = useState('M');

  const sizes = ['S', 'M', 'L'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={36} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Black Coffee</Text>
        <Pressable>
          <Ionicons name="heart-outline" size={32} color={theme.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_c6632dc4ff0224fc546b2bf5c2bb2a55.webp' }} 
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Descriptions</Text>
          <Text style={[styles.descriptionText, { color: theme.textMuted }]}>
            A bold and smooth black coffee brewed to perfection. This pure extraction highlights the natural flavor profile of the beans without any added milk or sugar.
          </Text>

          <View style={styles.sizeSelector}>
            {sizes.map((size) => (
              <Pressable
                key={size}
                onPress={() => setSelectedSize(size)}
                style={[
                  styles.sizeButton,
                  { backgroundColor: theme.card },
                  selectedSize === size && { backgroundColor: theme.primary }
                ]}
              >
                <Text style={[
                  styles.sizeText,
                  { color: theme.textMuted },
                  selectedSize === size && styles.selectedSizeText
                ]}>
                  {size}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.quantityContainer}>
            <View style={[styles.quantityBadge, { backgroundColor: theme.card }]}>
              <Text style={[styles.quantityText, { color: theme.text }]}>01</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={[styles.addToCartButton, { backgroundColor: theme.primary }]}>
          <Text style={styles.buttonText}>Add to Cart</Text>
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
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  heroImage: {
    width: '90%',
    height: 280,
  },
  detailsContainer: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  sizeSelector: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
  },
  sizeButton: {
    width: 65,
    height: 35,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedSizeText: {
    color: 'white',
  },
  quantityContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  addToCartButton: {
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});