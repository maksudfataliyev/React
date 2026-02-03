import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, SafeAreaView, Platform, StatusBar, TextInput, Modal, Alert } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { coffeeItems, CoffeeItem } from '../constants/coffee-data'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cartService } from '../utils/CartService';

export default function Order() {
  const router = useRouter();
  const { theme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategories, setActiveCategories] = useState<string[]>(['All']);
  const [selectedCoffee, setSelectedCoffee] = useState<CoffeeItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userName, setUserName] = useState('Guest');
  const [favorites, setFavorites] = useState<CoffeeItem[]>([]);
  const [userId, setUserId] = useState('guest');

  const categories = useMemo(() => {
    const dynamicCategories = coffeeItems.map(item => item.category);
    return ['All', ...new Set(dynamicCategories)];
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const userData = await AsyncStorage.getItem("currentUser");
          let currentId = 'guest';
          if (userData) {
            const parsed = JSON.parse(userData);
            setUserName(parsed.name?.split(' ')[0] || 'User');
            currentId = parsed.id || parsed.email || 'guest';
            setUserId(currentId);
          }
          const favData = await AsyncStorage.getItem(`favorites_${currentId}`);
          setFavorites(favData ? JSON.parse(favData) : []);
        } catch (e) {
          console.error(e);
        }
      };
      loadData();
    }, [])
  );

  const toggleCategory = (cat: string) => {
    setActiveCategories(prev => {
      if (cat === 'All') return ['All'];
      const newSelection = prev.filter(c => c !== 'All');
      if (newSelection.includes(cat)) {
        const filtered = newSelection.filter(c => c !== cat);
        return filtered.length === 0 ? ['All'] : filtered;
      } else {
        return [...newSelection, cat];
      }
    });
  };

  const toggleFav = async (item: CoffeeItem) => {
    const isExist = favorites.find(f => f.id === item.id);
    const newFavs = isExist ? favorites.filter(f => f.id !== item.id) : [...favorites, item];
    setFavorites(newFavs);
    await AsyncStorage.setItem(`favorites_${userId}`, JSON.stringify(newFavs));
  };

  const filteredItems = useMemo(() => {
    return coffeeItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategories.includes('All') || activeCategories.includes(item.category);
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategories]);

  const handleAddToCart = async () => {
    if (selectedCoffee && userId) {
      await cartService.addToCart(userId, selectedCoffee);
      setModalVisible(false);
      Alert.alert("Success", `${selectedCoffee.name} added to cart`);
    }
  };

  const handleBuyNow = () => {
    if (selectedCoffee) {
      setModalVisible(false);
      router.push({
        pathname: "/payment-method",
        params: { buyNowItem: JSON.stringify(selectedCoffee) }
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={theme.text} />
          </Pressable>
          <View>
            <Text style={[styles.welcomeText, { color: theme.textMuted }]}>Good morning, {userName}</Text>
            <Text style={[styles.logoText, { color: theme.text }]}>Find your <Text style={{ color: theme.primary }}>Coffee</Text></Text>
          </View>
        </View>
        <Image source={{ uri: 'https://www.pngkey.com/png/full/119-1195864_avatar-transparent-female-cartoon.png' }} style={styles.avatarSmall} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
            <Ionicons name="search" size={20} color={theme.textMuted} style={styles.searchIcon} />
            <TextInput 
              placeholder="Search coffee..." 
              placeholderTextColor={theme.textMuted} 
              style={[styles.searchInput, { color: theme.text }]} 
              value={searchQuery} 
              onChangeText={setSearchQuery} 
            />
          </View>
        </View>

        <View style={{ backgroundColor: theme.background, paddingVertical: 10 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((cat) => (
              <Pressable 
                key={cat} 
                onPress={() => toggleCategory(cat)} 
                style={[
                  styles.categoryChip, 
                  { backgroundColor: theme.card }, 
                  activeCategories.includes(cat) && { backgroundColor: theme.primary }
                ]}
              >
                <Text style={[
                  styles.categoryText, 
                  { color: theme.textMuted }, 
                  activeCategories.includes(cat) && { color: 'white' }
                ]}>{cat}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.grid}>
          {filteredItems.map((item) => (
            <Pressable 
              key={item.id} 
              style={[styles.card, { backgroundColor: theme.card }]} 
              onPress={() => { setSelectedCoffee(item); setModalVisible(true); }}
            >
              <Image source={{ uri: item.image }} style={styles.coffeeImage} resizeMode="contain" />
              <Text style={[styles.itemTitle, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.itemSub, { color: theme.textMuted }]}>With Oat Milk</Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.priceText, { color: theme.text }]}>{item.price}</Text>
                <View style={[styles.addButton, { backgroundColor: theme.primary }]}>
                  <Ionicons name="add" size={20} color="white" />
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="chevron-down" size={30} color={theme.text} />
              </Pressable>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Details</Text>
              <Pressable onPress={() => selectedCoffee && toggleFav(selectedCoffee)}>
                <Ionicons 
                  name={selectedCoffee && favorites.some(f => f.id === selectedCoffee.id) ? "heart" : "heart-outline"} 
                  size={26} 
                  color={selectedCoffee && favorites.some(f => f.id === selectedCoffee.id) ? "#FF4B4B" : theme.text} 
                />
              </Pressable>
            </View>
            {selectedCoffee && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image source={{ uri: selectedCoffee.image }} style={styles.modalImage} resizeMode="contain" />
                <Text style={[styles.modalCoffeeName, { color: theme.text }]}>{selectedCoffee.name}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={18} color="#FBBE21" />
                  <Text style={[styles.ratingText, { color: theme.text }]}>{selectedCoffee.rating}</Text>
                </View>
                <Text style={[styles.descriptionHeader, { color: theme.text }]}>Description</Text>
                <Text style={[styles.descriptionText, { color: theme.textMuted }]}>{selectedCoffee.description}</Text>
                
                <View style={styles.modalFooter}>
                  <Pressable 
                    style={[styles.cartButton, { borderColor: theme.primary }]}
                    onPress={handleAddToCart}
                  >
                    <Text style={[styles.cartButtonText, { color: theme.primary }]}>Add to Cart</Text>
                  </Pressable>
                  <Pressable 
                    style={[styles.buyButton, { backgroundColor: theme.primary }]}
                    onPress={handleBuyNow}
                  >
                    <Text style={styles.buyButtonText}>Buy Now</Text>
                  </Pressable>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 10
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backButton: {
    marginRight: 15
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '500'
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2
  },
  avatarSmall: {
    width: 45,
    height: 45,
    borderRadius: 15
  },
  searchSection: {
    paddingHorizontal: 24,
    marginTop: 15
  },
  searchBar: {
    height: 55,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15
  },
  searchIcon: {
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500'
  },
  categoryScroll: {
    paddingLeft: 24
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginRight: 12
  },
  categoryText: {
    fontWeight: '700',
    fontSize: 14
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 10
  },
  card: {
    width: '47%',
    borderRadius: 24,
    padding: 12,
    marginBottom: 20
  },
  coffeeImage: {
    width: '100%',
    height: 130,
    borderRadius: 20,
    marginBottom: 12
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700'
  },
  itemSub: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800'
  },
  addButton: {
    width: 35,
    height: 35,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    height: '85%',
    padding: 24
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700'
  },
  modalImage: {
    width: '100%',
    height: 250,
    borderRadius: 25,
    marginBottom: 20
  },
  modalCoffeeName: {
    fontSize: 28,
    fontWeight: '800'
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10
  },
  ratingText: {
    fontWeight: '700',
    marginLeft: 5,
    fontSize: 16
  },
  descriptionHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    gap: 12
  },
  cartButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center'
  },
  cartButtonText: {
    fontWeight: '800',
    fontSize: 16
  },
  buyButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center'
  },
  buyButtonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16
  }
});