import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function Address() {
  const router = useRouter();

  const addressDetails = [
    { title: 'Town', value: 'New city town', icon: 'map-pin', lib: Feather },
    { title: 'Luna diva', value: 'Luna diva', icon: 'person-outline', lib: Ionicons },
    { title: 'Call/Phone', value: '+91910000000000', icon: 'phone', lib: Feather },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={36} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>Address</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.listContainer}>
          {addressDetails.map((item, index) => (
            <Pressable key={index} style={styles.listItem}>
              <View style={styles.itemLeft}>
                <View style={styles.iconWrapper}>
                  <item.lib name={item.icon as any} size={22} color="#E67E22" />
                </View>
                <View style={styles.textGroup}>
                  <Text style={styles.mainText}>{item.title}</Text>
                  <Text style={styles.subText}>{item.value}</Text>
                </View>
              </View>
              <Ionicons name="arrow-forward-circle-outline" size={24} color="#94A3B8" />
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
    marginBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
  },
  listContainer: {
    width: '100%',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 0.2,
    borderBottomColor: '#1E293B',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
  },
  iconWrapper: {
    paddingTop: 2,
  },
  textGroup: {
    flexDirection: 'column',
  },
  mainText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  subText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});