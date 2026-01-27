import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, TextInput, Platform, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme } from './contexts/ThemeContext';

export default function Help() {
  const router = useRouter();
  const { theme } = useTheme();

  const faqs = [
    { question: "How can I track my order?", answer: "Go to 'Purchase Details' in your profile to see real-time status." },
    { question: "Can I change my delivery address?", answer: "Addresses can be updated in the 'Address' section before the order is processed." },
    { question: "What payment methods do you accept?", answer: "We accept all major credit cards, Apple Pay, and Google Pay." },
    { question: "Is there a loyalty program?", answer: "Yes! You earn coffee beans for every purchase which can be redeemed for free drinks." },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={36} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Help Center</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
          <Feather name="search" size={20} color={theme.textMuted} />
          <TextInput 
            placeholder="Search for help..." 
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Frequently Asked Questions</Text>

        {faqs.map((faq, index) => (
          <View key={index} style={[styles.faqCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.question, { color: theme.primary }]}>{faq.question}</Text>
            <Text style={[styles.answer, { color: theme.text }]}>{faq.answer}</Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>Still need help?</Text>
        
        <Pressable style={[styles.contactButton, { backgroundColor: theme.primary }]}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#FFF" />
          <Text style={styles.contactButtonText}>Contact Support</Text>
        </Pressable>

        <Pressable style={[styles.contactButton, { backgroundColor: theme.accent, marginTop: 12 }]}>
          <Ionicons name="mail-outline" size={20} color={theme.text} />
          <Text style={[styles.contactButtonText, { color: theme.text }]}>Email Us</Text>
        </Pressable>
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
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 55,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 25,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  faqCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  question: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },
  contactButton: {
    flexDirection: 'row',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});