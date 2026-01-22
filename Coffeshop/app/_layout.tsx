import { Stack } from 'expo-router';
import { ThemeProvider } from './context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="signin" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="cappuccino" />
        <Stack.Screen name="macchiato" />
        <Stack.Screen name="hot-coffee" />
        <Stack.Screen name="black-coffee" />
      </Stack>
    </ThemeProvider>
  );
}