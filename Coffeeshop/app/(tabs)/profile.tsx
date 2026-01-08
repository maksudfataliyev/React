import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

export default function Profile() {
  const router = useRouter();

  const menuItems = [
    { title: 'Order', icon: 'shopping-bag', lib: Feather, route: '/order' },
    { title: 'Purchase Details', icon: 'receipt', lib: MaterialIcons, route: '/purchase-details' },
    { title: 'Address', icon: 'location-on', lib: MaterialIcons, route: '/address' },
    { title: 'Payment Method', icon: 'payment', lib: MaterialIcons, route: '/payment' },
    { title: 'About', icon: 'info-outline', lib: MaterialIcons, route: '/about' },
    { title: 'Help', icon: 'help-outline', lib: MaterialIcons, route: '/help' },
    { title: 'Logout', icon: 'logout', lib: MaterialIcons, color: '#E67E22', route: '/signin' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={36} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.imageContainer}>
             <Image 
                source={{ uri: 'https://www.pngkey.com/png/full/119-1195864_avatar-transparent-female-cartoon.png' }}
                style={styles.profileImage} 
              />
          </View>
          <Text style={styles.userName}>Luna diva</Text>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Pressable 
              key={index} 
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.menuLeft}>
                <item.lib name={item.icon as any} size={24} color={item.color || "#E67E22"} />
                <Text style={styles.menuText}>{item.title}</Text>
              </View>
              {item.title !== 'Logout' && (
                <Ionicons name="arrow-forward-circle-outline" size={24} color="white" />
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
    borderColor: '#E67E22',
    overflow: 'hidden',
    marginBottom: 10,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  userName: {
    color: 'white',
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
    color: 'white',
    fontSize: 18,
    fontWeight: '400',
  },
});