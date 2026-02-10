import React, { useState } from "react";
import { View, Text, Image, Pressable, TextInput, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useTheme } from "./contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData, UserFormData } from "./schemas/user-schema"; 
import { Ionicons } from "@expo/vector-icons";

export default function SignIn() {
  const router = useRouter();
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, setError, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema), 
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: { email: "", password: "" }
  });

  const getBorderStyle = (error: any) => ({
    borderColor: error ? '#FF3B30' : 'transparent',
    borderWidth: 1.5
  });

  const ErrorMsg = ({ name }: { name: keyof LoginFormData }) => (
    errors[name] ? <Text style={styles.inlineErrorText}>{errors[name]?.message}</Text> : null
  );

  const onSubmit = async (data: LoginFormData) => {
    try {
      const existingUsersJSON = await AsyncStorage.getItem("allUsers");
      const users = existingUsersJSON ? JSON.parse(existingUsersJSON) : [];
      
      const user = users.find((u: UserFormData) => 
        u.email.toLowerCase().trim() === data.email.toLowerCase().trim() && 
        u.password === data.password
      );

      if (user) {
        await AsyncStorage.setItem("userToken", "logged_in");
        await AsyncStorage.setItem("currentUser", JSON.stringify(user));
        router.replace("/(tabs)/profile");
      } else {
        setError("root", { message: "Invalid email or password." });
      }
    } catch (e) {
      setError("root", { message: "An error occurred during sign in." });
    }
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <Image
        source={{ uri: "https://static.vecteezy.com/system/resources/previews/047/530/610/non_2x/coffee-logo-in-flat-design-style-graphic-free-png.png" }}
        style={styles.brandLogo}
      />
      
      <Text style={[styles.brandTitle, { color: theme.text }]}>Coffee Shop</Text>
      
      {errors.root && (
        <View style={styles.rootErrorBanner}>
          <Text style={styles.rootErrorText}>{errors.root.message}</Text>
        </View>
      )}

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.inputField, { backgroundColor: theme.card, color: theme.text }, getBorderStyle(errors.email)]}
              placeholder="Email"
              placeholderTextColor={theme.textMuted}
              value={value}
              onChangeText={onChange}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <ErrorMsg name="email" />
          </View>
        )}
      />
      
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputGroup}>
            <View style={[styles.passwordWrapper, { backgroundColor: theme.card }, getBorderStyle(errors.password)]}>
              <TextInput
                style={[styles.flexInput, { color: theme.text }]}
                placeholder="Password"
                placeholderTextColor={theme.textMuted}
                secureTextEntry={!showPassword}
                value={value}
                onChangeText={onChange}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color={theme.textMuted} />
              </Pressable>
            </View>
            <ErrorMsg name="password" />
          </View>
        )}
      />
      
      <Pressable 
        style={[styles.signInButton, { backgroundColor: theme.primary }]} 
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.signInButtonText}>Sign In</Text>
      </Pressable>

      <Pressable style={styles.registerLink} onPress={() => router.push("/register")}>
        <Text style={[styles.footerText, { color: theme.text }]}>
          Don't have an account? <Text style={[styles.footerLink, { color: theme.primary }]}>Register</Text>
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  brandLogo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 6,
  },
  inputField: {
    padding: 18,
    borderRadius: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
  },
  flexInput: {
    flex: 1,
    padding: 18,
    fontSize: 16,
    fontWeight: "500",
  },
  eyeIcon: {
    paddingHorizontal: 15,
  },
  inlineErrorText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
    marginLeft: 4,
  },
  rootErrorBanner: {
    backgroundColor: "#FFEBEB",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 0, 0, 0.1)",
  },
  rootErrorText: {
    color: "#D32F2F",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
  },
  signInButton: {
    padding: 18,
    borderRadius: 16,
    marginTop: 10,
    alignItems: "center",
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  registerLink: {
    marginTop: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 15,
    fontWeight: "500",
  },
  footerLink: {
    fontWeight: "800",
  },
});