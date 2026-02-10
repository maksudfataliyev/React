import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, SafeAreaView, Platform, StatusBar, Alert } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function Profile() {
  const router = useRouter();
  const { theme } = useTheme();
  const [userName, setUserName] = useState('Guest');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userId, setUserId] = useState('guest');

  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        try {
          const userData = await AsyncStorage.getItem("currentUser");
          if (userData) {
            const parsed = JSON.parse(userData);
            const id = parsed.id || parsed.email || 'guest';
            setUserId(id);
            setUserName(parsed.name || 'User');

            const savedImage = await AsyncStorage.getItem(`profileImage_${id}`);
            setProfileImage(savedImage);
          }
        } catch (e) {
          console.error(e);
        }
      };
      loadUserData();
    }, [])
  );

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is required.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      setProfileImage(selectedUri);
      await AsyncStorage.setItem(`profileImage_${userId}`, selectedUri);
    }
  };

  const removeImage = async () => {
    if (!profileImage) return;
    
    Alert.alert("Remove Photo", "Are you sure you want to delete your profile picture?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          setProfileImage(null);
          await AsyncStorage.removeItem(`profileImage_${userId}`);
        } 
      }
    ]);
  };

  const menuItems = [
    { title: 'Order', icon: 'shopping-bag', lib: Feather, route: '/order' },
    { title: 'Purchase History', icon: 'receipt', lib: Ionicons, route: '/purchase-history' },
    { title: 'Personal information', icon: 'person-outline', lib: Ionicons, route: '/personal-info' },
    { title: 'Card Information', icon: 'card-outline', lib: Ionicons, route: '/card-information' },
    { title: 'Theme', icon: 'color-palette-outline', lib: Ionicons, route: '/theme-toggle' },
    { title: 'About', icon: 'information-circle-outline', lib: Ionicons, route: '/about' },
    { title: 'Help', icon: 'help-circle-outline', lib: Ionicons, route: '/help' },
    { title: 'Logout', icon: 'log-out-outline', lib: Ionicons, color: '#FF4B4B', route: 'logout' },
  ];

  const handleMenuPress = async (item: any) => {
    if (item.title === 'Logout') {
      await AsyncStorage.removeItem("userToken");
      router.replace("/");
    } else {
      router.push(item.route);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <View style={styles.imageContainer}>
            <View style={styles.imageWrapper}>
              <Image 
                source={profileImage ? { uri: profileImage } : require('@/assets/images/user.png')}
                style={styles.profileImage} 
              />
            </View>

            <Pressable 
              onPress={pickImage} 
              style={[styles.actionBadge, styles.brushBadge, { backgroundColor: theme.primary }]}
            >
              <MaterialCommunityIcons name="brush" size={16} color="#FFF" />
            </Pressable>

            {profileImage && (
              <Pressable 
                onPress={removeImage} 
                style={[styles.actionBadge, styles.trashBadge, { backgroundColor: '#FF4B4B' }]}
              >
                <Feather name="trash-2" size={16} color="#FFF" />
              </Pressable>
            )}
          </View>
          
          <Text style={[styles.userName, { color: theme.text }]}>{userName}</Text>
          <Text style={[styles.userStatus, { color: theme.textMuted }]}>Coffee Enthusiast</Text>
        </View>

        <View style={[styles.menuWrapper, { backgroundColor: theme.card }]}>
          {menuItems.map((item, index) => (
            <View key={index}>
              <Pressable style={styles.menuItem} onPress={() => handleMenuPress(item)}>
                <View style={styles.menuLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: (item.color || theme.primary) + '15' }]}>
                    <item.lib name={item.icon as any} size={20} color={item.color || theme.primary} />
                  </View>
                  <Text style={[styles.menuText, { color: item.color || theme.text }]}>{item.title}</Text>
                </View>
                {item.title !== 'Logout' && <Feather name="chevron-right" size={20} color={theme.textMuted} />}
              </Pressable>
              {index < menuItems.length - 1 && <View style={[styles.divider, { backgroundColor: theme.background }]} />}
            </View>
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
    paddingHorizontal: 16,
    height: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 30,
    borderRadius: 24,
    marginBottom: 25,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 15,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  profileImage: {
    height: '100%',
    width: '100%',
  },
  actionBadge: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  brushBadge: {
    bottom: 0,
    right: 0,
  },
  trashBadge: {
    bottom: 0,
    left: 0,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
  },
  userStatus: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  menuWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
});