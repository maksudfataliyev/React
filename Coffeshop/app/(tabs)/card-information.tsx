import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Image, ScrollView, SafeAreaView, Platform, StatusBar, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { cardSchema, CardFormData } from '../schemas/card-schema';
import { cardService } from '../utils/CardService';

export default function CardInformation() {
  const { theme } = useTheme();
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState<CardFormData[]>([]);

  const { control, handleSubmit, setValue, reset, formState: { errors } } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    mode: "onChange",
    defaultValues: { cardNumber: '', holderName: '', expiryDate: '', cvv: '', cardImage: '' }
  });

  useEffect(() => {
    const init = async () => {
      const userData = await AsyncStorage.getItem("currentUser");
      if (userData) {
        const { email } = JSON.parse(userData);
        setUserEmail(email);
        const cards = await cardService.getCards(email);
        setSavedCards(cards);
      }
    };
    init();
  }, []);

  const formatCardNumber = (t: string) => t.replace(/\D/g, '').match(/.{1,4}/g)?.join(' ').slice(0, 19) || '';
  const formatExpiry = (t: string) => {
    const c = t.replace(/\D/g, '');
    return c.length > 2 ? `${c.slice(0, 2)}/${c.slice(2, 4)}` : c;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.2,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      setValue('cardImage', uri);
    }
  };

  const onSubmit = async (data: CardFormData) => {
    if (!userEmail) return;
    const response = await cardService.saveCard(userEmail, data);
    
    if (response.success) {
      reset();
      setImage(null);
      setSavedCards(await cardService.getCards(userEmail));
      Alert.alert("Success", response.message);
    } else {
      Alert.alert("Notice", response.message);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete", "Remove this card?", [
      { text: "Cancel" },
      { text: "Delete", style: 'destructive', onPress: async () => {
        const updated = await cardService.deleteCard(userEmail!, id);
        setSavedCards(updated);
      }}
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={36} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Card Management</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Add New Card</Text>
          
          <Pressable onPress={pickImage} style={[styles.imagePicker, { borderColor: theme.primary, backgroundColor: theme.card }]}>
            {image ? (
              <Image source={{ uri: image }} style={styles.fullImage} resizeMode="cover" />
            ) : (
              <View style={styles.center}>
                <Ionicons name="camera-outline" size={40} color={theme.primary} />
                <Text style={{ color: theme.textMuted, marginTop: 8 }}>Upload Card Image</Text>
              </View>
            )}
          </Pressable>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>CARD NUMBER</Text>
            <Controller control={control} name="cardNumber" render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.card, borderColor: errors.cardNumber ? '#FF3B30' : 'transparent' }]}
                keyboardType="numeric"
                maxLength={19}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor={theme.textMuted}
                onChangeText={(text) => onChange(formatCardNumber(text))}
                value={value}
              />
            )} />
            {errors.cardNumber && <Text style={styles.error}>{errors.cardNumber.message}</Text>}

            <Text style={styles.label}>CARD HOLDER</Text>
            <Controller control={control} name="holderName" render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.card, borderColor: errors.holderName ? '#FF3B30' : 'transparent' }]}
                placeholder="Full Name"
                placeholderTextColor={theme.textMuted}
                onChangeText={onChange}
                value={value}
              />
            )} />

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>EXPIRY</Text>
                <Controller control={control} name="expiryDate" render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, { color: theme.text, backgroundColor: theme.card, borderColor: errors.expiryDate ? '#FF3B30' : 'transparent' }]}
                    placeholder="MM/YY"
                    placeholderTextColor={theme.textMuted}
                    maxLength={5}
                    keyboardType="numeric"
                    onChangeText={(text) => onChange(formatExpiry(text))}
                    value={value}
                  />
                )} />
              </View>
              <View style={styles.spacer} />
              <View style={styles.flex1}>
                <Text style={styles.label}>CVV</Text>
                <Controller control={control} name="cvv" render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, { color: theme.text, backgroundColor: theme.card, borderColor: errors.cvv ? '#FF3B30' : 'transparent' }]}
                    placeholder="000"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                    onChangeText={onChange}
                    value={value}
                  />
                )} />
              </View>
            </View>

            <Pressable style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSubmit(onSubmit)}>
              <Text style={styles.saveBtnText}>Save Card</Text>
            </Pressable>
          </View>
        </View>

        {savedCards.length > 0 && (
          <View style={styles.listContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Saved Cards</Text>
            {savedCards.map((card) => (
              <View key={card.id} style={[styles.cardItem, { backgroundColor: theme.card }]}>
                <View style={styles.imageContainer}>
                  {card.cardImage ? (
                    <Image 
                      source={{ uri: card.cardImage }} 
                      style={styles.cardThumb} 
                      resizeMode="cover" 
                    />
                  ) : (
                    <Ionicons name="card" size={24} color={theme.primary} />
                  )}
                </View>

                <View style={styles.flex1}>
                  <Text style={[styles.cardNumberText, { color: theme.text }]}>**** **** **** {card.cardNumber.slice(-4)}</Text>
                  <Text style={[styles.cardSubText, { color: theme.textMuted }]}>{card.holderName.toUpperCase()}</Text>
                </View>
                
                <Pressable onPress={() => handleDelete(card.id!)}>
                  <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                </Pressable>
              </View>
            ))}
          </View>
        )}
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
    fontSize: 20,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 36,
  },
  scrollContent: {
    padding: 24,
  },
  formContainer: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  imagePicker: {
    height: 180,
    width: '100%',
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 25,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  center: {
    alignItems: 'center',
  },
  fieldGroup: {
    width: '100%',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#8e8e93',
    marginTop: 15,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  spacer: {
    width: 15,
  },
  error: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 4,
  },
  saveBtn: {
    marginTop: 30,
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
  },
  listContainer: {
    paddingBottom: 40,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  imageContainer: {
    width: 50,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginRight: 15,
  },
  cardThumb: {
    width: '100%',
    height: '100%',
  },
  cardNumberText: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubText: {
    fontSize: 12,
    marginTop: 2,
  },
}); 