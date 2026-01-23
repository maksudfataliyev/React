import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, SafeAreaView, Platform, StatusBar, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../app/context/ThemeContext';

export default function PaymentDetails() {
  const router = useRouter();
  const { theme } = useTheme();
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('Abdur Rohim Mia');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const validateAndPay = () => {
    const cardNumberRegex = /^\d{4} \d{4} \d{4} \d{4}$/;
    const nameRegex = /^[a-zA-Z\s]+$/;
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvRegex = /^\d{3}$/;

    if (!cardNumberRegex.test(cardNumber)) {
      Alert.alert("Invalid Card", "Enter 16 digits in xxxx xxxx xxxx xxxx format");
      return;
    }
    if (!nameRegex.test(cardName) || cardName.trim().length === 0) {
      Alert.alert("Invalid Name", "Name must contain only letters");
      return;
    }
    if (!expiryRegex.test(expiry)) {
      Alert.alert("Invalid Date", "Use MM/YY format (e.g. 12/25)");
      return;
    }
    if (!cvvRegex.test(cvv)) {
      Alert.alert("Invalid CVV", "Enter exactly 3 numbers");
      return;
    }

    router.push('/confirmation');
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/.{1,4}/g);
    setCardNumber(match ? match.join(' ').slice(0, 19) : '');
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) {
      setExpiry(cleaned);
    } else {
      setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    }
  };

  const handleNameChange = (text: string) => {
    const filteredText = text.replace(/[^a-zA-Z\s]/g, '');
    setCardName(filteredText);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={36} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Payment</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Card Number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            placeholder="0000 0000 0000 0000"
            placeholderTextColor={theme.textMuted}
            keyboardType="numeric"
            value={cardNumber}
            onChangeText={formatCardNumber}
            maxLength={19}
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Card Holder Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            placeholder="Enter Name"
            placeholderTextColor={theme.textMuted}
            value={cardName}
            onChangeText={handleNameChange}
            autoCorrect={false}
            spellCheck={false}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.text }]}>Expiry Date</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              placeholder="MM/YY"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={expiry}
              onChangeText={formatExpiry}
              maxLength={5}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.text }]}>CVV</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              placeholder="000"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              secureTextEntry
              value={cvv}
              onChangeText={(text) => setCvv(text.replace(/\D/g, ''))}
              maxLength={3}
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={[styles.infoText, { color: theme.textMuted }]}>
            Your order has been accepted. Your order has been accepted. Your order has been accepted
          </Text>
        </View>

        <Pressable 
          style={[styles.payButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]} 
          onPress={validateAndPay}
        >
          <Text style={styles.payButtonText}>Pay $3.75</Text>
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
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderRadius: 15,
    padding: 18,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 20,
  },
  infoBox: {
    marginTop: 40,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  payButton: {
    height: 65,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  payButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});