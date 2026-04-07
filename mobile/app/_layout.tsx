import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { useEffect } from "react";
import { initDatabase } from "../db";

export default function RootLayout() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#0a192f" }}>
      <StatusBar style="light" backgroundColor="#0a192f" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#112240" },
          headerTintColor: "#64ffda",
          headerTitleStyle: { fontWeight: "bold", fontFamily: "System" }, // Use system font for now
          contentStyle: { backgroundColor: "#0a192f" },
          headerShadowVisible: false, // Flat design
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
