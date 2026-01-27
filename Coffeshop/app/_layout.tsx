import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider } from "./contexts/ThemeContext";

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const userToken = await AsyncStorage.getItem("userToken");
      const inAuthGroup = segments[0] === "signin" || segments[0] === "register" || segments[0] === undefined;
      const inTabs = segments[0] === "(tabs)";

      if (userToken && inAuthGroup) {
        router.replace("/(tabs)/profile");
      } else if (!userToken && inTabs) {
        router.replace("/");
      }
      setIsReady(true);
    };

    checkLogin();
  }, [segments]);

  if (!isReady) return null;

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="signin" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="cappuccino" />
        <Stack.Screen name="macchiato" />
        <Stack.Screen name="hot-coffee" />
        <Stack.Screen name="black-coffee" />
      </Stack>
    </ThemeProvider>
  );
}