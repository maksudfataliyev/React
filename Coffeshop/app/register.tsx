import React, { useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet, Alert, ScrollView, Modal, FlatList, Platform, StatusBar } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useTheme } from "./contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, UserFormData } from "./schemas/user-schema";
import { countries, formatLocalNumber, CountryCode } from "./constants/countrycodes";

export default function Register() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countries[0]);
  const [showPicker, setShowPicker] = useState(false);

  const { control, handleSubmit, setError, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    mode: "onChange",
    defaultValues: { 
      email: "", password: "", confirmPassword: "",
      name: "", phone: "", town: "", street: "", zip: "" 
    }
  });

  const getBorderStyle = (error: any) => ({
    borderColor: error ? '#FF3B30' : 'transparent',
    borderWidth: 1.5
  });

  const ErrorMsg = ({ name }: { name: keyof UserFormData | 'root' }) => (
    errors[name] ? <Text style={styles.errorTextSmall}>{errors[name]?.message}</Text> : null
  );

  const onSubmit = async (data: UserFormData) => {
    const existingUsersJSON = await AsyncStorage.getItem("allUsers");
    const users = existingUsersJSON ? JSON.parse(existingUsersJSON) : [];
    
    if (users.some((u: UserFormData) => u.email === data.email)) {
      setError("root", { message: "Account already exists." });
      return;
    }

    const userData = { ...data, phone: `${selectedCountry.code} ${data.phone}` };
    users.push(userData);
    await AsyncStorage.setItem("allUsers", JSON.stringify(users));
    Alert.alert("Success", "Account created!", [{ text: "OK", onPress: () => router.push("/signin") }]);
  };

  return (
    <ScrollView style={{ backgroundColor: theme.background }} showsVerticalScrollIndicator={false}>
      <View style={styles.screenContainer}>
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

        <Text style={[styles.mainTitle, { color: theme.text }]}>New Account</Text>
        
        {errors.root && (
          <View style={styles.alertBanner}>
            <Text style={styles.alertText}>{errors.root.message}</Text>
          </View>
        )}

        <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>LOGIN DETAILS</Text>
        
        <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
          <View style={styles.inputWrapper}>
            <TextInput style={[styles.textInput, { backgroundColor: theme.card, color: theme.text }, getBorderStyle(errors.email)]} placeholder="Email" placeholderTextColor={theme.textMuted} value={value} onChangeText={onChange} autoCapitalize="none" />
            <ErrorMsg name="email" />
          </View>
        )} />
        
        <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
          <View style={styles.inputWrapper}>
            <TextInput style={[styles.textInput, { backgroundColor: theme.card, color: theme.text }, getBorderStyle(errors.password)]} placeholder="Password" placeholderTextColor={theme.textMuted} secureTextEntry value={value} onChangeText={onChange} />
            <ErrorMsg name="password" />
          </View>
        )} />

        <Controller control={control} name="confirmPassword" render={({ field: { onChange, value } }) => (
          <View style={styles.inputWrapper}>
            <TextInput style={[styles.textInput, { backgroundColor: theme.card, color: theme.text }, getBorderStyle(errors.confirmPassword)]} placeholder="Confirm Password" placeholderTextColor={theme.textMuted} secureTextEntry value={value} onChangeText={onChange} />
            <ErrorMsg name="confirmPassword" />
          </View>
        )} />

        <Text style={[styles.sectionHeading, { color: theme.textMuted, marginTop: 10 }]}>PROFILE DETAILS</Text>
        
        <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
          <View style={styles.inputWrapper}>
            <TextInput style={[styles.textInput, { backgroundColor: theme.card, color: theme.text }, getBorderStyle(errors.name)]} placeholder="Full Name" placeholderTextColor={theme.textMuted} value={value} onChangeText={(text) => onChange(text.replace(/[^a-zA-Z\s]/g, ""))} />
            <ErrorMsg name="name" />
          </View>
        )} />

        <View style={styles.inputWrapper}>
          <View style={styles.phoneContainer}>
            <Pressable style={[styles.countryTrigger, { backgroundColor: theme.card }]} onPress={() => setShowPicker(true)}>
              <Text style={styles.flagText}>{selectedCountry.flag}</Text>
              <Text style={[styles.codeText, { color: theme.text }]}>{selectedCountry.code}</Text>
            </Pressable>
            <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
              <TextInput style={[styles.textInput, { backgroundColor: theme.card, color: theme.text, flex: 1 }, getBorderStyle(errors.phone)]} placeholder="50 000 00 00" placeholderTextColor={theme.textMuted} value={value} onChangeText={(text) => onChange(formatLocalNumber(text))} keyboardType="phone-pad" maxLength={12} />
            )} />
          </View>
          <ErrorMsg name="phone" />
        </View>

        <Controller control={control} name="street" render={({ field: { onChange, value } }) => (
          <View style={styles.inputWrapper}>
            <TextInput style={[styles.textInput, { backgroundColor: theme.card, color: theme.text }, getBorderStyle(errors.street)]} placeholder="Street Address" placeholderTextColor={theme.textMuted} value={value} onChangeText={onChange} />
            <ErrorMsg name="street" />
          </View>
        )} />

        <View style={styles.horizontalRow}>
          <View style={[styles.inputWrapper, { flex: 1.5 }]}>
            <Controller control={control} name="town" render={({ field: { onChange, value } }) => (
              <View>
                <TextInput style={[styles.textInput, { backgroundColor: theme.card, color: theme.text }, getBorderStyle(errors.town)]} placeholder="City" placeholderTextColor={theme.textMuted} value={value} onChangeText={(text) => onChange(text.replace(/[^a-zA-Z\s]/g, ""))} />
                <ErrorMsg name="town" />
              </View>
            )} />
          </View>
          <View style={{ width: 12 }} />
          <View style={[styles.inputWrapper, { flex: 1 }]}>
            <Controller control={control} name="zip" render={({ field: { onChange, value } }) => (
              <View>
                <TextInput style={[styles.textInput, { backgroundColor: theme.card, color: theme.text }, getBorderStyle(errors.zip)]} placeholder="ZIP" placeholderTextColor={theme.textMuted} value={value} onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ""))} keyboardType="number-pad" maxLength={6} />
                <ErrorMsg name="zip" />
              </View>
            )} />
          </View>
        </View>

        <Pressable style={[styles.primaryButton, { backgroundColor: theme.primary }]} onPress={handleSubmit(onSubmit)}>
          <Text style={styles.primaryButtonText}>Create Account</Text>
        </Pressable>

        <Pressable style={styles.signInLink} onPress={() => router.push("/signin")}>
          <Text style={[styles.signInText, { color: theme.textMuted }]}>
            Already have an account? <Text style={{ color: theme.primary, fontWeight: '800' }}>Sign In</Text>
          </Text>
        </Pressable>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  horizontalRow: {
    flexDirection: 'row',
  },
  inputWrapper: {
    marginBottom: 16,
  },

  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 32,
    textAlign: "center",
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
  },

  textInput: {
    borderRadius: 16,
    fontSize: 16,
    fontWeight: "500",
    padding: 18,
  },
  phoneContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  countryTrigger: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    height: 60,
    marginRight: 10,
    paddingHorizontal: 16,
  },
  flagText: {
    fontSize: 22,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 6,
  },

  errorTextSmall: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    marginTop: 6,
  },
  alertBanner: {
    backgroundColor: "#FFEBEB",
    borderColor: "rgba(255, 0, 0, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    padding: 14,
  },
  alertText: {
    color: "#D32F2F",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  primaryButton: {
    alignItems: "center",
    borderRadius: 16,
    marginTop: 10,
    padding: 18,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  signInLink: {
    alignItems: 'center',
    marginTop: 25,
  },
  signInText: {
    fontSize: 15,
    fontWeight: '600',
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