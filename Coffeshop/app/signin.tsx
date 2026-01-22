import { View, Text, Image, Pressable, TextInput, StyleSheet, Alert } from "react-native";
import { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useTheme } from "../app/context/ThemeContext";

export default function SignIn() {
  const router = useRouter();
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = () => {
    if (!email.includes("@") || !email.includes(".")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Invalid Password", "Password must be at least 6 characters long.");
      return;
    }

    router.push("/(tabs)/profile");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Image
          source={{
            uri: "https://static.vecteezy.com/system/resources/previews/047/530/610/non_2x/coffee-logo-in-flat-design-style-graphic-free-png.png",
          }}
          style={styles.logo}
        />

        <Text style={[styles.title, { color: theme.text }]}>Coffee Shop</Text>

        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
          keyboardType="email-address"
          placeholder="user@gmail.com"
          placeholderTextColor={theme.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          textContentType="none"
          autoComplete="off"
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
          placeholder="Your password"
          placeholderTextColor={theme.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCorrect={false}
          spellCheck={false}
          textContentType="none"
          autoComplete="off"
        />

        <Pressable 
          style={[styles.button, { backgroundColor: theme.primary }]} 
          onPress={handleSignIn}
        >
          <Text style={styles.buttonText}>Sign In</Text>
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