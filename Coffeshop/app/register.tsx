import { View, Text, Pressable, TextInput, StyleSheet, Alert } from "react-native";
import { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useTheme } from "./context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Register() {
  const router = useRouter();
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleRegister = async () => {
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const existingUsersJSON = await AsyncStorage.getItem("allUsers");
    const users = existingUsersJSON ? JSON.parse(existingUsersJSON) : [];

    const userExists = users.some((u: any) => u.email === email);
    if (userExists) {
      setError("An account with this email already exists.");
      return;
    }

    const newUser = { email, password };
    users.push(newUser);

    await AsyncStorage.setItem("allUsers", JSON.stringify(users));
    
    Alert.alert("Success", "Account created!", [
      { text: "OK", onPress: () => router.push("/signin") }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
      
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        placeholder="Email"
        placeholderTextColor={theme.textMuted}
        value={email}
        onChangeText={(text) => { setEmail(text); setError(""); }}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        placeholder="Password"
        placeholderTextColor={theme.textMuted}
        secureTextEntry
        value={password}
        onChangeText={(text) => { setPassword(text); setError(""); }}
      />

      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        placeholder="Confirm Password"
        placeholderTextColor={theme.textMuted}
        secureTextEntry
        value={confirmPassword}
        onChangeText={(text) => { setConfirmPassword(text); setError(""); }}
      />
      
      <Pressable 
        style={[styles.button, { backgroundColor: theme.primary }]} 
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>Register</Text>
      </Pressable>

      <Pressable style={{ marginTop: 20 }} onPress={() => router.push("/signin")}>
        <Text style={{ color: theme.text, textAlign: 'center' }}>
          Already have an account? <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Sign in</Text>
        </Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 24, 
    justifyContent: "center" 
  },
  title: { 
    fontSize: 26, 
    textAlign: "center", 
    marginBottom: 24, 
    fontWeight: 'bold' 
  },
  errorBox: {
    backgroundColor: '#FFEBEB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FF000033',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 14,
  },
  input: { 
    padding: 14, 
    borderRadius: 8, 
    marginBottom: 12 
  },
  button: { 
    padding: 15, 
    borderRadius: 8, 
    marginTop: 10, 
    alignItems: "center" 
  },
  buttonText: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "600" 
  },
});