import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Profile() {
  const router = useRouter();
  const { theme } = useTheme();
  const [userName, setUserName] = useState('Guest');

  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        try {
          const userData = await AsyncStorage.getItem("currentUser");
          if (userData) {
            const parsed = JSON.parse(userData);
            setUserName(parsed.name || 'User');
          }
        } catch (e) {
          console.error("Failed to load user name", e);
        }
      };
      loadUserData();
    }, [])
  );

  const menuItems = [
    { title: 'Order', icon: 'shopping-bag', lib: Feather, route: '/order' },
    { title: 'Purchase History', icon: 'receipt', lib: MaterialIcons, route: '/purchase-history' },
    { title: 'Personal information', icon: 'location-on', lib: MaterialIcons, route: '/personal-info' },
    { title: 'Card Information', icon: 'credit-card', lib: Feather, route: '/card-information' },
    { title: 'Theme', icon: 'color-lens', lib: MaterialIcons, route: '/theme-toggle' },
    { title: 'About', icon: 'info-outline', lib: MaterialIcons, route: '/about' },
    { title: 'Help', icon: 'help-outline', lib: MaterialIcons, route: '/help' },
    { title: 'Logout', icon: 'logout', lib: MaterialIcons, color: theme.primary, route: 'logout' },
  ];

  const handleMenuPress = async (item: typeof menuItems[0]) => {
    if (item.title === 'Logout') {
      await AsyncStorage.removeItem("userToken");
      router.replace("/");
    } else {
      router.push(item.route as any);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={36} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={[styles.imageContainer, { borderColor: theme.primary }]}>
             <Image 
                source={require('@/assets/images/user.png')}
                style={styles.profileImage} 
              />
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>{userName}</Text>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Pressable 
              key={index} 
              style={styles.menuItem}
              onPress={() => handleMenuPress(item)}
            >
              <View style={styles.menuLeft}>
                <item.lib name={item.icon as any} size={24} color={item.color || theme.primary} />
                <Text style={[styles.menuText, { color: theme.text }]}>{item.title}</Text>
              </View>
              {item.title !== 'Logout' && (
                <Ionicons name="arrow-forward-circle-outline" size={24} color={theme.text} />
              )}
            </Pressable>
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
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  imageContainer: {
    borderRadius: 50,
    borderWidth: 2,
    height: 100,
    marginBottom: 10,
    overflow: 'hidden',
    width: 100,
  },
  profileImage: {
    height: '100%',
    width: '100%',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  menuContainer: {
    paddingHorizontal: 25,
    width: '100%',
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  menuLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 15,
  },
  menuText: {
    fontSize: 18,
    fontWeight: '400',
  },
});