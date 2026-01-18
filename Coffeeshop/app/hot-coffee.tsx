import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HotCoffeeDetails() {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState('M');

  const sizes = ['S', 'M', 'L'];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={36} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>Hot Coffee</Text>
        <Pressable>
          <Ionicons name="heart-outline" size={32} color="#E67E22" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: 'https://static.vecteezy.com/system/resources/thumbnails/036/303/390/small/ai-generated-steaming-coffee-cup-hot-beverage-illustration-transparent-background-coffee-mug-clipart-hot-drink-graphic-brewed-coffee-icon-cafe-latte-png.png' }} 
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Descriptions</Text>
          <Text style={styles.descriptionText}>
            Freshly brewed hot coffee made from premium roasted beans. A classic, comforting beverage served steaming hot to jumpstart your morning or power your afternoon.
          </Text>

          <View style={styles.sizeSelector}>
            {sizes.map((size) => (
              <Pressable
                key={size}
                onPress={() => setSelectedSize(size)}
                style={[
                  styles.sizeButton,
                  selectedSize === size && styles.selectedSizeButton
                ]}
              >
                <Text style={[
                  styles.sizeText,
                  selectedSize === size && styles.selectedSizeText
                ]}>
                  {size}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.quantityContainer}>
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityText}>01</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.addToCartButton}>
          <Text style={styles.buttonText}>Add to Cart</Text>
        </Pressable>
      </View>
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
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 15,
  },
  descriptionText: {
    color: '#94A3B8',
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
    backgroundColor: '#1E293B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedSizeButton: {
    backgroundColor: '#E67E22',
  },
  sizeText: {
    color: '#94A3B8',
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
    backgroundColor: '#1E293B',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quantityText: {
    color: 'white',
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
    backgroundColor: '#E67E22',
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