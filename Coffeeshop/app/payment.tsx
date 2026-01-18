import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, SafeAreaView, Platform, StatusBar, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { paymentSchema } from '../app/Schemas/paymentSchema';

export default function PaymentDetails() {
  const router = useRouter();
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('Name Surname');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const validateAndPay = () => {
    const result = paymentSchema.safeParse({
      cardNumber,
      cardName,
      expiry,
      cvv
    });

    if (!result.success) {
      const firstError = result.error.issues[0];
      if (firstError) {
        Alert.alert("Validation Error", firstError.message);
      }
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
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={36} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Card Number</Text>
          <TextInput
            style={styles.input}
            placeholder="0000 0000 0000 0000"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={cardNumber}
            onChangeText={formatCardNumber}
            maxLength={19}
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Card Holder Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Name"
            placeholderTextColor="#94A3B8"
            value={cardName}
            onChangeText={handleNameChange}
            autoCorrect={false}
            spellCheck={false}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Expiry Date</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/YY"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={expiry}
              onChangeText={formatExpiry}
              maxLength={5}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={styles.input}
              placeholder="000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              secureTextEntry
              value={cvv}
              onChangeText={(text) => setCvv(text.replace(/\D/g, ''))}
              maxLength={3}
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Your order has been accepted. Your order has been accepted. Your order has been accepted
          </Text>
        </View>

        <Pressable style={styles.payButton} onPress={validateAndPay}>
          <Text style={styles.payButtonText}>Pay $3.75</Text>
        </Pressable>
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
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 15,
    padding: 18,
    color: 'white',
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
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },
  payButton: {
    backgroundColor: '#E67E22',
    height: 65,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#E67E22',
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