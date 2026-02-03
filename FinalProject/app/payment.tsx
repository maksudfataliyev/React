import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, SafeAreaView, Platform, StatusBar, ScrollView, Alert, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './contexts/ThemeContext';
import { cardSchema } from '../app/schemas/card-schema';
import { cardService } from './utils/CardService';

export default function PaymentDetails() {
  const router = useRouter();
  const { theme } = useTheme();

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem("currentUser");
      if (userData) {
        const { email } = JSON.parse(userData);
        setUserEmail(email);
      }
    };
    fetchUser();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.2,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSaveAndPay = async () => {
    if (!userEmail) return;

    const formData = {
      cardNumber: cardNumber,
      holderName: cardName,
      expiryDate: expiry,
      cvv: cvv,
      cardImage: image || '',
    };

    const result = cardSchema.safeParse(formData);

    if (!result.success) {
      Alert.alert("Validation Error", result.error.issues[0].message);
      return;
    }

    const saveResult = await cardService.saveCard(userEmail, formData);

    if (saveResult.success) {
      router.push('/confirmation');
    } else {
      Alert.alert("Notice", saveResult.message);
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/.{1,4}/g);
    setCardNumber(match ? match.join(' ').slice(0, 19) : '');
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    setExpiry(cleaned.length > 2 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}` : cleaned);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={36} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Add New Card</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Pressable 
          onPress={pickImage} 
          style={[styles.imagePicker, { borderColor: theme.primary, backgroundColor: theme.card }]}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera-outline" size={40} color={theme.primary} />
              <Text style={{ color: theme.textMuted, marginTop: 8 }}>Upload Card Image</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.text }]}>Card Number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            placeholder="0000 0000 0000 0000"
            placeholderTextColor={theme.textMuted}
            keyboardType="numeric"
            value={cardNumber}
            onChangeText={formatCardNumber}
            maxLength={19}
          />

          <Text style={[styles.label, { color: theme.text }]}>Card Holder Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            placeholder="Full Name"
            placeholderTextColor={theme.textMuted}
            value={cardName}
            onChangeText={(t) => setCardName(t.replace(/[^a-zA-Z\s]/g, ''))}
          />

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={[styles.label, { color: theme.text }]}>Expiry</Text>
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
            <View style={styles.flex1}>
              <Text style={[styles.label, { color: theme.text }]}>CVV</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
                placeholder="000"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
                secureTextEntry
                value={cvv}
                onChangeText={(t) => setCvv(t.replace(/\D/g, ''))}
                maxLength={3}
              />
            </View>
          </View>

          <Pressable 
            style={[styles.payButton, { backgroundColor: theme.primary }]} 
            onPress={handleSaveAndPay}
          >
            <Text style={styles.payButtonText}>Save & Pay $3.75</Text>
          </Pressable>
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
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  imagePicker: {
    height: 180,
    width: '100%',
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginVertical: 20,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 15,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  flex1: {
    flex: 1,
  },
  payButton: {
    height: 65,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  payButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
  },
});