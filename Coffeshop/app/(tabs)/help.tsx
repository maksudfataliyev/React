import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, TextInput, Platform, StatusBar, Alert, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { FAQ_DATA } from '../constants/faq-data';

export default function Help() {
  const router = useRouter();
  const { theme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleEmailUs = () => {
    const subject = "Support Request - BrewGo App";
    const body = "Hi Support Team, I need help with...";
    const url = `mailto:support@brewgo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Error", "No email app found on this device.");
      }
    });
  };

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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
          <Feather name="search" size={20} color={theme.textMuted} />
          <TextInput 
            placeholder="Search for help..." 
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.textMuted} />
            </Pressable>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Frequently Asked Questions</Text>

        {filteredFaqs.map((faq) => (
          <Pressable 
            key={faq.id} 
            onPress={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
            style={[styles.faqCard, { backgroundColor: theme.card }]}
          >
            <View style={styles.faqHeader}>
              <Text style={[styles.question, { color: theme.primary }]}>{faq.question}</Text>
              <Ionicons 
                name={expandedId === faq.id ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={theme.textMuted} 
              />
            </View>
            
            {expandedId === faq.id && (
              <View style={styles.answerContainer}>
                <Text style={[styles.answer, { color: theme.text }]}>{faq.answer}</Text>
              </View>
            )}
          </Pressable>
        ))}

        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Still need help?</Text>

        <Pressable 
          style={[styles.emailButton, { backgroundColor: theme.primary }]}
          onPress={handleEmailUs}
        >
          <Ionicons name="mail-outline" size={20} color="#FFF" />
          <Text style={styles.emailButtonText}>Email Us</Text>
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
    paddingVertical: 12,
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
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  faqCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  question: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    marginRight: 10,
  },
  answerContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.1)',
  },
  answer: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 18,
    gap: 10,
  },
  emailButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});