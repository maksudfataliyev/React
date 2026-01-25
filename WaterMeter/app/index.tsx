import React from 'react';
import {  Stack, useRouter } from "expo-router";
import { ImageBackground, Pressable, StyleSheet, Text, View, SafeAreaView } from "react-native";


export default function Index() {
  const router = useRouter()
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ImageBackground
          source={require("../assets/water-bg.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <SafeAreaView style={styles.overlay}>
            <View style={styles.headerContainer}>
              <Text style={styles.welcomeText}>Welcome To</Text>
              <Text style={styles.brandText}>Water Meter</Text>
            </View>

            <View style={styles.sloganContainer}>
              <Text style={styles.scriptText}>Drink water</Text>
              <Text style={styles.scriptText}>Stay healthy</Text>
            </View>

            <View style={styles.footer}>
              <View style={styles.signInRow}>
                <Text style={styles.accountText}>Already have an account? </Text>
                <Pressable onPress={() => router.push("/signin")}>
                  <Text style={styles.signInLink}>Sign in</Text>
                </Pressable>
              </View>

              <Pressable 
                style={styles.button} 
                onPress={()=> router.push("/signup")}
              >
                <Text style={styles.buttonText}>SIGN UP</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 50,
  },
  headerContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 34,
    color: "#4A7C8C",
    fontWeight: "300",
  },
  brandText: {
    fontSize: 42,
    color: "#4A7C8C",
    fontWeight: "600",
  },
  sloganContainer: {
    alignItems: "center",
  },
  scriptText: {
    fontSize: 32,
    color: "#00CFFF",
    fontStyle: "italic",
    marginVertical: 2,
  },
  footer: {
    width: "100%",
    paddingHorizontal: 40,
    alignItems: "center",
    marginBottom: 30,
  },
  signInRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  accountText: {
    color: "#ffffff",
    fontSize: 15,
  },
  signInLink: {
    color: "#00CFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  button: {
    backgroundColor: "#00D1FF",
    width: "100%",
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});