import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/themes';

export default function Profile() {
  const router = useRouter();
  const { theme } = useTheme();

  const menuItems = [
    { title: 'Order', icon: 'shopping-bag', lib: Feather, route: '/order' },
    { title: 'Purchase Details', icon: 'receipt', lib: MaterialIcons, route: '/purchase-details' },
    { title: 'Address', icon: 'location-on', lib: MaterialIcons, route: '/address' },
    { title: 'Card Information', icon: 'credit-card', lib: Feather, route: '/card-information' },
    { title: 'Theme', icon: 'color-lens', lib: MaterialIcons, route: '/theme-toggle' },
    { title: 'About', icon: 'info-outline', lib: MaterialIcons, route: '/about' },
    { title: 'Help', icon: 'help-outline', lib: MaterialIcons, route: '/help' },
    { title: 'Logout', icon: 'logout', lib: MaterialIcons, color: theme.primary, route: '/signin' },
  ];

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

      <ScrollView contentContainerStyle={styles.content}>
        <div style={styles.profileSection}>
          <View style={[styles.imageContainer, { borderColor: theme.primary }]}>
             <Image 
                source={{ uri: 'https://www.pngkey.com/png/full/119-1195864_avatar-transparent-female-cartoon.png' }}
                style={styles.profileImage} 
              />
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>Luna diva</Text>
        </div>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Pressable 
              key={index} 
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
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
    flexDirection: 'row',
    alignItems: 'center',
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
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  menuContainer: {
    width: '100%',
    paddingHorizontal: 25,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  menuText: {
    fontSize: 18,
    fontWeight: '400',
  },
});