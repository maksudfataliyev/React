import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, Platform, StatusBar, TextInput, Alert, Modal, FlatList } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userSchema, UserFormData } from "../schemas/user-schema";
import { countries, formatLocalNumber, CountryCode } from '../constants/countrycodes';

export default function PersonalInfo() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countries[0]);
  const [showPicker, setShowPicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    mode: "onChange",
    defaultValues: { 
      name: '', phone: '', town: '', zip: '', street: '', 
      email: '', password: '', confirmPassword: '' 
    }
  });

  useEffect(() => {
    (async () => {
      const userData = await AsyncStorage.getItem("currentUser");
      if (userData) {
        const parsed = JSON.parse(userData);
        const rawPhone = parsed.phone.replace(selectedCountry.code, "").trim();
        reset({ ...parsed, phone: formatLocalNumber(rawPhone), confirmPassword: parsed.password });
      }
    })();
  }, []);

  const getBorderStyle = (error: any) => ({
    borderColor: error ? '#FF3B30' : 'transparent',
    borderWidth: 1.5,
  });

  const ErrorMsg = ({ name }: { name: keyof UserFormData }) => (
    errors[name] ? <Text style={styles.inlineError}>{errors[name]?.message}</Text> : null
  );

  const onUpdate = async (data: UserFormData) => {
    try {
      const cleanNumber = data.phone.replace(selectedCountry.code, "").replace(/\s/g, "");
      const finalData = { ...data, phone: `${selectedCountry.code} ${cleanNumber}` };
      
      await AsyncStorage.setItem("currentUser", JSON.stringify(finalData));
      
      const allUsersJSON = await AsyncStorage.getItem("allUsers");
      if (allUsersJSON) {
        const users = JSON.parse(allUsersJSON);
        const updatedUsers = users.map((u: any) => u.email === data.email ? finalData : u);
        await AsyncStorage.setItem("allUsers", JSON.stringify(updatedUsers));
      }

      Alert.alert("Success", "Profile updated!", [
        { text: "OK", onPress: () => router.replace('/profile') }
      ]);
    } catch (e) {
      Alert.alert("Error", "Save failed");
    }
  };

  return (
    <SafeAreaView style={[styles.mainSafeArea, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <Modal visible={showPicker} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Country</Text>
            <FlatList
              data={countries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable style={styles.countryOption} onPress={() => { setSelectedCountry(item); setShowPicker(false); }}>
                  <Text style={styles.flagText}>{item.flag}</Text>
                  <Text style={[styles.countryName, { color: theme.text }]}>{item.name} ({item.code})</Text>
                </Pressable>
              )}
            />
            <Pressable style={styles.closeBtn} onPress={() => setShowPicker(false)}>
              <Text style={{ color: theme.primary, fontWeight: '800' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={styles.topNav}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={36} color={theme.text} />
        </Pressable>
        <Text style={[styles.navTitle, { color: theme.text }]}>Personal Info</Text>
        <View style={{ width: 36 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>EMAIL ADDRESS</Text>
          <Controller control={control} name="email" render={({ field: { value } }) => (
            <TextInput style={[styles.inputBox, { backgroundColor: theme.card, color: theme.textMuted, opacity: 0.6 }]} value={value} editable={false} />
          )} />

          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>FULL NAME</Text>
          <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
            <View style={styles.fieldWrapper}>
              <TextInput style={[styles.inputBox, { backgroundColor: theme.card, color: theme.text }, getBorderStyle(errors.name)]} value={value} onChangeText={(text) => onChange(text.replace(/[^a-zA-Z\s]/g, ""))} />
              <ErrorMsg name="name" />
            </View>
          )} />

          <View style={styles.horizontalRow}>
            <View style={styles.flexHalf}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>NEW PASSWORD</Text>
              <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
                <View style={styles.fieldWrapper}>
                  <View style={[styles.passwordInputContainer, { backgroundColor: theme.card }, getBorderStyle(errors.password)]}>
                    <TextInput 
                      style={[styles.passwordInput, { color: theme.text }]} 
                      value={value} 
                      onChangeText={onChange} 
                      secureTextEntry={!showPassword} 
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                      <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={theme.textMuted} />
                    </Pressable>
                  </View>
                  <ErrorMsg name="password" />
                </View>
              )} />
            </View>
            <View style={styles.spacerCol} />
            <View style={styles.flexHalf}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>CONFIRM</Text>
              <Controller control={control} name="confirmPassword" render={({ field: { onChange, value } }) => (
                <View style={styles.fieldWrapper}>
                   <View style={[styles.passwordInputContainer, { backgroundColor: theme.card }, getBorderStyle(errors.confirmPassword)]}>
                    <TextInput 
                      style={[styles.passwordInput, { color: theme.text }]} 
                      value={value} 
                      onChangeText={onChange} 
                      secureTextEntry={!showConfirmPassword} 
                    />
                    <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                      <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color={theme.textMuted} />
                    </Pressable>
                  </View>
                  <ErrorMsg name="confirmPassword" />
                </View>
              )} />
            </View>
          </View>

          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>PHONE NUMBER</Text>
          <View style={styles.fieldWrapper}>
            <View style={styles.phoneRow}>
              <Pressable style={[styles.countryPicker, { backgroundColor: theme.card }]} onPress={() => setShowPicker(true)}>
                <Text style={styles.flagText}>{selectedCountry.flag}</Text>
                <Text style={[styles.codeText, { color: theme.text }]}>{selectedCountry.code}</Text>
              </Pressable>
              <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
                <TextInput 
                  style={[styles.inputBox, { backgroundColor: theme.card, color: theme.text, flex: 1, marginBottom: 0 }, getBorderStyle(errors.phone)]} 
                  value={value} 
                  onChangeText={(text) => onChange(formatLocalNumber(text))} 
                  keyboardType="phone-pad" 
                  maxLength={12} 
                />
              )} />
            </View>
            <ErrorMsg name="phone" />
          </View>

          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>STREET ADDRESS</Text>
          <Controller control={control} name="street" render={({ field: { onChange, value } }) => (
            <View style={styles.fieldWrapper}>
              <TextInput style={[styles.inputBox, { backgroundColor: theme.card, color: theme.text }, getBorderStyle(errors.street)]} value={value} onChangeText={onChange} />
              <ErrorMsg name="street" />
            </View>
          )} />

          <View style={styles.horizontalRow}>
            <View style={styles.flexThree}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>CITY</Text>
              <Controller control={control} name="town" render={({ field: { onChange, value } }) => (
                <View style={styles.fieldWrapper}>
                  <TextInput style={[styles.inputBox, { backgroundColor: theme.card, color: theme.text }, getBorderStyle(errors.town)]} value={value} onChangeText={(text) => onChange(text.replace(/[^a-zA-Z\s]/g, ""))} />
                  <ErrorMsg name="town" />
                </View>
              )} />
            </View>
            <View style={styles.spacerCol} />
            <View style={styles.flexTwo}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>ZIP</Text>
              <Controller control={control} name="zip" render={({ field: { onChange, value } }) => (
                <View style={styles.fieldWrapper}>
                  <TextInput style={[styles.inputBox, { backgroundColor: theme.card, color: theme.text }, getBorderStyle(errors.zip)]} value={value} onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ""))} keyboardType="number-pad" maxLength={6} />
                  <ErrorMsg name="zip" />
                </View>
              )} />
            </View>
          </View>
        </View>

        <Pressable style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={handleSubmit(onUpdate)}>
          <Text style={styles.submitBtnText}>Save Changes</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainSafeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  formContainer: {
    marginBottom: 20,
    marginTop: 10,
  },
  topNav: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  navTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  horizontalRow: {
    flexDirection: 'row',
  },
  fieldWrapper: {
    marginBottom: 20,
  },
  flexHalf: {
    flex: 1,
  },
  flexThree: {
    flex: 1.5,
  },
  flexTwo: {
    flex: 1,
  },
  spacerCol: {
    width: 12,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  inputBox: {
    borderRadius: 18,
    borderWidth: 1.5,
    fontSize: 16,
    fontWeight: '600',
    padding: 18,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    padding: 18,
  },
  eyeIcon: {
    paddingRight: 15,
  },
  phoneRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  countryPicker: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'transparent',
    flexDirection: 'row',
    height: 62,
    marginRight: 10,
    paddingHorizontal: 12,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 6,
  },
  flagText: {
    fontSize: 22,
  },
  submitBtn: {
    alignItems: 'center',
    borderRadius: 18,
    elevation: 4,
    marginTop: 15,
    padding: 20,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
  },
  inlineError: {
    color: '#FF3B30',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
    marginTop: 4,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '50%',
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  countryOption: {
    alignItems: 'center',
    borderBottomColor: '#ccc',
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    paddingVertical: 15,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  closeBtn: {
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
});