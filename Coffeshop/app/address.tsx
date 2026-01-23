import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme } from '../app/context/ThemeContext';

export default function Address() {
  const router = useRouter();
  const { theme } = useTheme();

  const addressDetails = [
    { title: 'Town', value: 'New city town', icon: 'map-pin', lib: Feather },
    { title: 'Luna diva', value: 'Luna diva', icon: 'person-outline', lib: Ionicons },
    { title: 'Call/Phone', value: '+91910000000000', icon: 'phone', lib: Feather },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={36} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Address</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.listContainer}>
          {addressDetails.map((item, index) => (
            <Pressable key={index} style={[styles.listItem, { borderBottomColor: theme.accent }]}>
              <View style={styles.itemLeft}>
                <View style={styles.iconWrapper}>
                  <item.lib name={item.icon as any} size={22} color={theme.primary} />
                </View>
                <View style={styles.textGroup}>
                  <Text style={[styles.mainText, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.subText, { color: theme.textMuted }]}>{item.value}</Text>
                </View>
              </View>
              <Ionicons name="arrow-forward-circle-outline" size={24} color={theme.textMuted} />
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
    marginBottom: 20,
  },
  headerTitle: {
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
    borderBottomWidth: 0.5,
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
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
  },
});