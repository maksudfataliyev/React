import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, 
      }}
    >
      <Stack.Screen name="signin" />
      <Stack.Screen name="(tabs)" />

``    <Stack.Screen name="cappuccino" />
      <Stack.Screen name="macchiato" />
      <Stack.Screen name="hot-coffee" />
      <Stack.Screen name="black-coffee" />
      
    </Stack>
  );
}