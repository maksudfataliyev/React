import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, Platform, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function About() {
  const router = useRouter();
  const { theme } = useTheme();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={handleBack}>
          <Ionicons name="arrow-back-circle-outline" size={36} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>About Us</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.iconContainer, { backgroundColor: theme.card }]}>
          <MaterialCommunityIcons name="coffee-outline" size={80} color={theme.primary} />
        </View>

        <Text style={[styles.appName, { color: theme.text }]}>Coffee Shop</Text>
        <Text style={[styles.version, { color: theme.textMuted }]}>Version 1.0.2</Text>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>Our Story</Text>
          <Text style={[styles.cardText, { color: theme.text }]}>
            Born from a passion for the perfect brew, Coffee Shop brings the finest beans from 
            around the world directly to your fingertips.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>Our Mission</Text>
          <Text style={[styles.cardText, { color: theme.text }]}>
            To provide a seamless coffee experience while supporting sustainable farming 
            practices and delivering unparalleled quality.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            Made with ❤️ for coffee lovers
          </Text>
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
    fontSize: 22,
    fontWeight: '800',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 100, 
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
  },
  version: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 30,
  },
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  cardText: {
    fontSize: 15,
    lineHeight: 24,
  },
  footer: {
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
});