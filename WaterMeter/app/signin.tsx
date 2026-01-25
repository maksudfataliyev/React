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
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Signin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) return Alert.alert("Error", "Please fill all fields");

    try {
      const storedUsers = await AsyncStorage.getItem('users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      const user = users.find((u: any) => u.username === username && u.password === password);

      if (user) {
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
        router.replace("/(tabs)/profile");
      } else {
        Alert.alert("Error", "Invalid username or password");
      }
    } catch (e) {
      Alert.alert("Error", "Login failed");
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
                placeholderTextColor="#A0A0A0" 
                style={styles.input}
                cursorColor="#00D1FF"
                underlineColorAndroid="transparent"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput 
                placeholder="Password" 
                placeholderTextColor="#A0A0A0" 
                style={styles.input} 
                secureTextEntry 
                cursorColor="#00D1FF"
                underlineColorAndroid="transparent"
                value={password}
                onChangeText={setPassword}
              />
              <Ionicons name="lock-closed-outline" size={20} color="#666" />
            </View>

            <Pressable style={styles.mainButton} onPress={handleLogin}>
              <Text style={styles.buttonText}>LOG IN</Text>
            </Pressable>

            <View style={styles.linkSection}>
              <Pressable><Text style={styles.forgotText}>Forgot Password?</Text></Pressable>
              <View style={styles.row}>
                <Text style={styles.subText}>Don't have an account? </Text>
                <Pressable onPress={() => router.push("/signup")}>
                  <Text style={styles.signUpLink}>Sign Up</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.line} /><Text style={styles.dividerText}>Or log in with</Text><View style={styles.line} />
            </View>

            <Pressable style={[styles.socialButton, { backgroundColor: '#66DB69' }]}>
              <FontAwesome name="whatsapp" size={24} color="white" style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Whatsapp</Text>
            </Pressable>

            <Pressable style={[styles.socialButton, { backgroundColor: '#1877F2' }]}>
              <FontAwesome name="facebook" size={24} color="white" style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </Pressable>

            <Pressable style={[styles.socialButton, { backgroundColor: '#FFFFFF' }]}>
              <FontAwesome name="google" size={24} color="#DB4437" style={styles.socialIcon} />
              <Text style={[styles.socialButtonText, { color: '#555' }]}>Google</Text>
            </Pressable>

          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#A3D2F7' },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 40 },
  innerContainer: { paddingHorizontal: 45, alignItems: 'center', width: '100%', maxWidth: 500, alignSelf: 'center' },
  inputContainer: { width: '100%', height: 55, backgroundColor: '#FFFAFA', borderRadius: 30, borderWidth: 2, borderColor: '#00D1FF', marginBottom: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, overflow: 'hidden' },
  input: { flex: 1, fontSize: 16, color: '#333', padding: 0, height: '100%', borderWidth: 0, ...Platform.select({ web: { outlineStyle: 'none' } }) } as any,
  mainButton: { backgroundColor: '#00CCFF', width: '100%', height: 55, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  linkSection: { alignItems: 'center', marginTop: 35 },
  forgotText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', marginBottom: 10 },
  row: { flexDirection: 'row' },
  subText: { color: '#FFFFFF', fontSize: 15 },
  signUpLink: { color: '#00D1FF', fontSize: 15, fontWeight: 'bold' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 40 },
  line: { flex: 1, height: 1, backgroundColor: '#FFFFFF' },
  dividerText: { color: '#FFFFFF', paddingHorizontal: 15, fontSize: 18 },
  socialButton: { width: '100%', height: 55, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  socialIcon: { position: 'absolute', left: 25 },
  socialButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
});