import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, SafeAreaView, Platform, StatusBar, Modal, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { CoffeeItem } from '../constants/coffee-data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cartService } from '../utils/CartService';

export default function Favorite() {
  const router = useRouter();
  const { theme } = useTheme();
  
  const [favItems, setFavItems] = useState<CoffeeItem[]>([]);
  const [userId, setUserId] = useState('guest');
  const [selectedCoffee, setSelectedCoffee] = useState<CoffeeItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadFavorites = async () => {
        const userData = await AsyncStorage.getItem("currentUser");
        const id = userData ? JSON.parse(userData).id || JSON.parse(userData).email : 'guest';
        setUserId(id);
        const data = await AsyncStorage.getItem(`favorites_${id}`);
        setFavItems(data ? JSON.parse(data) : []);
      };
      loadFavorites();
    }, [])
  );

  const toggleFav = async (item: CoffeeItem) => {
    const isExist = favItems.find(f => f.id === item.id);
    const updated = isExist 
      ? favItems.filter(f => f.id !== item.id) 
      : [...favItems, item];
    
    setFavItems(updated);
    await AsyncStorage.setItem(`favorites_${userId}`, JSON.stringify(updated));
    
    if (isExist && modalVisible) {
      setModalVisible(false);
    }
  };

  const openDetails = (item: CoffeeItem) => {
    setSelectedCoffee(item);
    setModalVisible(true);
  };

  const handleAddToCart = async (item?: CoffeeItem) => {
    const target = item || selectedCoffee;
    if (target && userId) {
      await cartService.addToCart(userId, target);
      if (modalVisible) setModalVisible(false);
      Alert.alert("Success", `${target.name} added to cart`);
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
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Favorites</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {favItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-dislike-outline" size={100} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Favorites Yet</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>Items you heart will appear here.</Text>
            <Pressable 
              style={[styles.browseButton, { backgroundColor: theme.primary }]} 
              onPress={() => router.push('/(tabs)/order')}
            >
              <Text style={styles.browseText}>Browse Coffee</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.grid}>
            {favItems.map((item) => (
              <Pressable 
                key={item.id} 
                style={[styles.favCard, { backgroundColor: theme.card }]}
                onPress={() => openDetails(item)}
              >
                <Image source={{ uri: item.image }} style={styles.favImage} resizeMode="contain" />
                <View style={styles.favInfo}>
                  <Text style={[styles.favName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.favCategory, { color: theme.textMuted }]}>{item.category}</Text>
                  <View style={styles.favFooter}>
                    <Text style={[styles.favPrice, { color: theme.primary }]}>{item.price}</Text>
                    <Pressable 
                      style={[styles.favAdd, { backgroundColor: theme.primary }]}
                      onPress={() => handleAddToCart(item)}
                    >
                      <Ionicons name="cart-outline" size={18} color="white" />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
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
                  name={selectedCoffee && favItems.some(f => f.id === selectedCoffee.id) ? "heart" : "heart-outline"} 
                  size={26} 
                  color={selectedCoffee && favItems.some(f => f.id === selectedCoffee.id) ? "#FF4B4B" : theme.text} 
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
                    onPress={() => handleAddToCart()}
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
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  favCard: {
    width: '47%',
    borderRadius: 24,
    padding: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  favImage: {
    width: '100%',
    height: 120,
    marginBottom: 10
  },
  favInfo: {
    paddingHorizontal: 2
  },
  favName: {
    fontSize: 16,
    fontWeight: '700'
  },
  favCategory: {
    fontSize: 12,
    marginBottom: 10
  },
  favFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  favPrice: {
    fontSize: 17,
    fontWeight: '800'
  },
  favAdd: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 20
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 40
  },
  browseButton: {
    marginTop: 30,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 15
  },
  browseText: {
    color: 'white',
    fontWeight: '700'
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