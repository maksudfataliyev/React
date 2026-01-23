import { View, Text, Image, Pressable, TextInput, StyleSheet, Alert } from "react-native";
import { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useTheme } from "./context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignIn() {
  const router = useRouter();
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignIn = async () => {
  setError("");
  if (!email || !password) {
    setError("Please fill in all fields.");
    return;
  }

  const existingUsersJSON = await AsyncStorage.getItem("allUsers");
  const users = existingUsersJSON ? JSON.parse(existingUsersJSON) : [];

  const user = users.find((u: any) => u.email === email && u.password === password);

  if (user) {
    await AsyncStorage.setItem("userToken", "logged_in");
    router.replace("/(tabs)/profile");
  } else {
    setError("Invalid email or password.");
  }
};

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Image
          source={{ uri: "https://static.vecteezy.com/system/resources/previews/047/530/610/non_2x/coffee-logo-in-flat-design-style-graphic-free-png.png" }}
          style={styles.logo}
        />
        <Text style={[styles.title, { color: theme.text }]}>Coffee Shop</Text>
        
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TextInput
          style={[
            styles.input, 
            { backgroundColor: theme.card, color: theme.text },
            error ? { borderColor: 'red', borderWidth: 1 } : null
          ]}
          placeholder="user@gmail.com"
          placeholderTextColor={theme.textMuted}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (error) setError("");
          }}
          autoCapitalize="none"
        />
        
        <TextInput
          style={[
            styles.input, 
            { backgroundColor: theme.card, color: theme.text },
            error ? { borderColor: 'red', borderWidth: 1 } : null
          ]}
          placeholder="Password"
          placeholderTextColor={theme.textMuted}
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (error) setError("");
          }}
        />
        
        <Pressable 
          style={[styles.button, { backgroundColor: theme.primary }]} 
          onPress={handleSignIn}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>

        <Pressable 
          style={{ marginTop: 20 }} 
          onPress={() => router.push("/register")}
        >
          <Text style={{ color: theme.text, textAlign: 'center' }}>
            Don't have an account? <Text style={{ color: theme.primary, fontWeight: "bold" }}>Register</Text>
          </Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    textAlign: "center",
    marginBottom: 24,
    fontWeight: 'bold',
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
    marginBottom: 12,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});