import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Pressable, 
  Image, 
  ScrollView, 
  SafeAreaView, 
  Platform, 
  StatusBar,
  Alert 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './contexts/ThemeContext';
import { cardSchema, CardFormData } from '../app/schemas/card-schema';

export default function CardInformation() {
  const { theme } = useTheme();
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);

  const { control, handleSubmit, setValue, reset, formState: { errors } } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardNumber: '',
      holderName: '',
      expiryDate: '',
      cvv: '',
      cardImage: ''
    }
  });

  useEffect(() => {
    (async () => {
      try {
        const savedData = await AsyncStorage.getItem('@card_info');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          reset({
            cardNumber: parsed.cardNumber,
            holderName: parsed.holderName,
            expiryDate: parsed.expiryDate,
            cvv: parsed.cvv,
            cardImage: '' 
          });
        }
      } catch (e) {
        console.error("Failed to load card data", e);
      }
    })();
  }, [reset]);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const matched = cleaned.match(/.{1,4}/g);
    return matched ? matched.join(' ').slice(0, 19) : cleaned;
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "We need access to your gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      const uri = result.assets[0].uri;
      setImage(uri);
      setValue('cardImage', uri);
    }
  };

  const onSubmit = async (data: CardFormData) => {
    try {
      const { cardImage, ...dataToSave } = data;
      await AsyncStorage.setItem('@card_info', JSON.stringify(dataToSave));
      Alert.alert("Success", "Card information updated (Image not stored)");
      router.back();
    } catch (e) {
      Alert.alert("Error", "Failed to save card information");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={36} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Card Information</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Pressable 
          onPress={pickImage} 
          style={[styles.imagePicker, { borderColor: theme.primary, backgroundColor: theme.background }]}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera-outline" size={40} color={theme.primary} />
              <Text style={{ color: theme.text, marginTop: 8 }}>Upload Card Image</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.text }]}>Card Number</Text>
          <Controller
            control={control}
            name="cardNumber"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.primary }]}
                keyboardType="numeric"
                maxLength={19}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor={theme.text + '80'}
                onChangeText={(text) => onChange(formatCardNumber(text))}
                value={value}
              />
            )}
          />
          {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber.message}</Text>}

          <Text style={[styles.label, { color: theme.text }]}>Holder Name</Text>
          <Controller
            control={control}
            name="holderName"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.primary }]}
                placeholder="LUNA DIVA"
                placeholderTextColor={theme.text + '80'}
                onChangeText={(text) => onChange(text.replace(/[^a-zA-Z\s]/g, ''))}
                value={value}
              />
            )}
          />
          {errors.holderName && <Text style={styles.errorText}>{errors.holderName.message}</Text>}

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.text }]}>Expiry Date</Text>
              <Controller
                control={control}
                name="expiryDate"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.primary }]}
                    placeholder="MM/YY"
                    placeholderTextColor={theme.text + '80'}
                    maxLength={5}
                    keyboardType="numeric"
                    onChangeText={(text) => onChange(formatExpiry(text))}
                    value={value}
                  />
                )}
              />
              {errors.expiryDate && <Text style={styles.errorText}>{errors.expiryDate.message}</Text>}
            </View>
            
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={[styles.label, { color: theme.text }]}>CVV</Text>
              <Controller
                control={control}
                name="cvv"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.primary }]}
                    placeholder="000"
                    placeholderTextColor={theme.text + '80'}
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                    onChangeText={(text) => onChange(text.replace(/\D/g, ''))}
                    value={value}
                  />
                )}
              />
              {errors.cvv && <Text style={styles.errorText}>{errors.cvv.message}</Text>}
            </View>
          </View>

          <Pressable 
            style={[styles.submitBtn, { backgroundColor: theme.primary }]}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.submitBtnText}>Save Changes</Text>
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
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
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
    fontSize: 14,
    marginBottom: 8,
    marginTop: 15,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 12,
    marginTop: 4,
  },
  submitBtn: {
    marginTop: 40,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});