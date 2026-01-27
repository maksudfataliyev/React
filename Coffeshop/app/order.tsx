import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './contexts/ThemeContext';

export default function CoffeeShop() {
  const router = useRouter();
  const { theme } = useTheme();

  const categories = ['Cappuccino', 'Macchiato', 'Hot coffee', 'Latte'];
  
  const coffeeItems = [
    { id: '1', name: 'Cappuccino', price: '$2.00', image: 'https://freepngimg.com/download/temp_webp/147528-cappuccino-latte-png-free-photo.webp' ,route: '/cappuccino' },
    { id: '2', name: 'Macchiato', price: '$2.00', image: 'https://static.vecteezy.com/system/resources/previews/042/654/751/non_2x/ai-generated-layered-latte-macchiato-in-a-clear-glass-free-png.png', route: '/macchiato' },
    { id: '3', name: 'Hot coffee', price: '$2.00', image: 'https://static.vecteezy.com/system/resources/thumbnails/036/303/390/small/ai-generated-steaming-coffee-cup-hot-beverage-illustration-transparent-background-coffee-mug-clipart-hot-drink-graphic-brewed-coffee-icon-cafe-latte-png.png', route:'/hot-coffee' },
    { id: '4', name: 'Black Coffee', price: '$2.00', image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_c6632dc4ff0224fc546b2bf5c2bb2a55.webp', route: '/black-coffee' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={36} color={theme.text} />
        </Pressable>
        <Text style={[styles.logoText, { color: theme.text }]}>
          <Text style={{ color: theme.primary }}>Coffee</Text>Shop
        </Text>
        <Image 
          source={{ uri: 'https://www.pngkey.com/png/full/119-1195864_avatar-transparent-female-cartoon.png' }} 
          style={styles.avatarSmall} 
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.card }]} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((cat, index) => (
            <Pressable 
              key={index} 
              style={[
                styles.categoryChip, 
                { backgroundColor: theme.card },
                index === 0 && { backgroundColor: theme.primary }
              ]}
            >
              <Text style={[
                styles.categoryText, 
                { color: theme.textMuted },
                index === 0 && styles.activeCategoryText
              ]}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.grid}>
          {coffeeItems.map((item) => (
            <View key={item.id} style={[styles.card, { backgroundColor: theme.card }]}>
                <Pressable onPress={() => router.push(item.route as any )}>
                    <Image source={{ uri: item.image }} style={styles.coffeeImage}/>
                </Pressable>
              <Pressable style={styles.addButton}>
                <Ionicons name="add-circle" size={24} color={theme.primary} />
              </Pressable>
              <Text style={[styles.priceText, { color: theme.text }]}>{item.price}</Text>
            </View>
          ))}
        </View>

        <View style={styles.specialSection}>
          <Text style={[styles.specialTitle, { color: theme.text }]}>Special for you</Text>
          <View style={[styles.specialCard, { backgroundColor: theme.card }]}>
            <View>
              <Text style={[styles.specialName, { color: theme.text }]}>Hot coffee</Text>
              <Text style={[styles.specialPrice, { color: theme.text }]}>$1.50</Text>
            </View>
            <Image source={{ uri: 'https://static.vecteezy.com/system/resources/thumbnails/036/303/390/small/ai-generated-steaming-coffee-cup-hot-beverage-illustration-transparent-background-coffee-mug-clipart-hot-drink-graphic-brewed-coffee-icon-cafe-latte-png.png' }} style={styles.specialImage} />
          </View>
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
    marginVertical: 15,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatarSmall: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  searchBar: {
    height: 50,
    borderRadius: 15,
  },
  categoryScroll: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
  },
  categoryText: {
    fontWeight: '500',
  },
  activeCategoryText: {
    color: 'white',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  card: {
    width: '46%',
    borderRadius: 20,
    padding: 12,
    marginBottom: 20,
    position: 'relative',
  },
  coffeeImage: {
    width: '100%',
    height: 120,
    borderRadius: 15,
    marginBottom: 10,
  },
  addButton: {
    position: 'absolute',
    right: 10,
    bottom: 15,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '600',
  },
  specialSection: {
    paddingHorizontal: 20,
    marginTop: 10,
    paddingBottom: 100,
  },
  specialTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 15,
  },
  specialCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specialName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  specialPrice: {
    fontSize: 22,
    marginTop: 10,
  },
  specialImage: {
    width: 120,
    height: 80,
    borderRadius: 10,
  }
});