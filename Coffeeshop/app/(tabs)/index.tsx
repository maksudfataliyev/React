import { router, Stack } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Image
          source={{
            uri: "https://static.vecteezy.com/system/resources/thumbnails/023/742/327/small/latte-coffee-isolated-illustration-ai-generative-free-png.png",
          }}
          style={styles.image}
        />

        <Text style={styles.title}>
          Enjoy the quality brew with the finest of flavours
        </Text>

        <Text style={styles.subtitle}>
          The best gain, the finest roast, the powerful flavour.
        </Text>

        <Pressable style={styles.button} onPress={() => router.push("/signin")}>
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 220,
    height: 220,
    marginBottom: 30,
  },
  title: {
    color: "white",
    fontSize: 22,
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 12,
  },
  subtitle: {
    color: "#cbd5f5",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#854c1f",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
