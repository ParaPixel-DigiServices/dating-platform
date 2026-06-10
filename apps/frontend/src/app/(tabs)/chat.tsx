import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import theme from "@/theme/theme";

export default function ChatScreen() {
  const category    = useOnboardingStore((s) => s.category) ?? "Casual";
  const activeTheme = theme[category];
  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <Text style={[styles.text, { color: activeTheme.textPrimary }]}>Chat</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 28, fontFamily: "Outfit_600SemiBold" },
});
