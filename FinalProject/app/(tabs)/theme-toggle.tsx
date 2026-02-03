import React from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const router = useRouter();
  const { isDarkMode, theme, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons 
            name="arrow-back-circle-outline" 
            size={36} 
            color={theme.text} 
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Theme</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.row}>
            <View style={styles.info}>
              <Ionicons 
                name={isDarkMode ? "moon" : "sunny"} 
                size={24} 
                color={theme.primary} 
              />
              <Text style={[styles.modeText, { color: theme.text }]}>
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </View>
            
            <Pressable 
              onPress={toggleTheme}
              style={[
                styles.toggleTrack, 
                { backgroundColor: isDarkMode ? theme.primary : '#CBD5E1' }
              ]}
            >
              <View style={[
                styles.toggleThumb, 
                { alignSelf: isDarkMode ? 'flex-end' : 'flex-start' }
              ]} />
            </Pressable>
          </View>
        </View>
      </View>
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
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  card: {
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  modeText: {
    fontSize: 18,
    fontWeight: '500',
  },
  toggleTrack: {
    width: 50,
    height: 28,
    borderRadius: 15,
    padding: 4,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
});