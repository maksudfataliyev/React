import React, { useState } from 'react';
import { router, Stack } from "expo-router";
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  Pressable, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Signup() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: ''
  });

  const handleRegister = async () => {
    const { username, email, password, confirmPassword } = form;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (username.length < 3) return Alert.alert("Error", "Username too short");
    if (!emailRegex.test(email)) return Alert.alert("Error", "Invalid email");
    if (password.length < 8) return Alert.alert("Error", "Password must be 8+ chars");
    if (password !== confirmPassword) return Alert.alert("Error", "Passwords don't match");

    try {
      const existingUsers = await AsyncStorage.getItem('users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];

      const userExists = users.find((u: any) => u.username === username);
      if (userExists) return Alert.alert("Error", "Username already taken");

      const emailExists = users.find((u: any) => u.email === email);
      if (emailExists) return Alert.alert("Error", "Email already taken");

      users.push({ username, email, password, company: form.company });
      await AsyncStorage.setItem('users', JSON.stringify(users));
      
      Alert.alert("Success", "Account created!", [
        { text: "OK", onPress: () => router.push("/signin") }
      ]);
    } catch (e) {
      Alert.alert("Error", "Failed to save user data");
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <SafeAreaView style={styles.innerContainer}>
            
            <View style={styles.inputContainer}>
              <TextInput 
                placeholder="Username" 
                placeholderTextColor="#888" 
                style={styles.input}
                underlineColorAndroid="transparent"
                cursorColor="#00D1FF"
                onChangeText={(val) => setForm({...form, username: val})}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput 
                placeholder="Email address" 
                placeholderTextColor="#888" 
                style={styles.input} 
                keyboardType="email-address"
                autoCapitalize="none"
                underlineColorAndroid="transparent"
                cursorColor="#00D1FF"
                onChangeText={(val) => setForm({...form, email: val})}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput 
                placeholder="Company" 
                placeholderTextColor="#888" 
                style={styles.input}
                underlineColorAndroid="transparent"
                cursorColor="#00D1FF"
                onChangeText={(val) => setForm({...form, company: val})}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput 
                placeholder="Password (8+ characters)" 
                placeholderTextColor="#888" 
                style={styles.input} 
                secureTextEntry 
                underlineColorAndroid="transparent"
                cursorColor="#00D1FF"
                onChangeText={(val) => setForm({...form, password: val})}
              />
              <Ionicons name="lock-closed-outline" size={20} color="#666" />
            </View>

            <View style={styles.inputContainer}>
              <TextInput 
                placeholder="Confirm password" 
                placeholderTextColor="#888" 
                style={styles.input} 
                secureTextEntry 
                underlineColorAndroid="transparent"
                cursorColor="#00D1FF"
                onChangeText={(val) => setForm({...form, confirmPassword: val})}
              />
              <Ionicons name="lock-closed-outline" size={20} color="#666" />
            </View>

            <Pressable style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>REGISTER</Text>
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Pressable onPress={() => router.push("/signin")}>
                <Text style={styles.signInText}>Sign in</Text>
              </Pressable>
            </View>

          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#b3d9ff' },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 20 },
  innerContainer: { paddingHorizontal: 40, alignItems: 'center', width: '100%', maxWidth: 500, alignSelf: 'center' },
  inputContainer: { width: '100%', height: 55, backgroundColor: '#fff', borderRadius: 28, borderWidth: 2, borderColor: '#00D1FF', marginBottom: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, overflow: 'hidden' },
  input: { flex: 1, fontSize: 16, color: '#333', padding: 0, height: '100%', borderWidth: 0, ...Platform.select({ web: { outlineStyle: 'none' } }) } as any,
  button: { backgroundColor: '#00D1FF', width: '100%', height: 55, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginTop: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footerRow: { flexDirection: 'row', marginTop: 30 },
  footerText: { color: '#fff', fontSize: 16 },
  signInText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});