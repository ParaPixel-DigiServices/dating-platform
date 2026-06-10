import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

interface Props {
  primaryColor: string;
  textPrimary: string;
  textSecondary: string;
  secondary: string;
  onFilterPress?: () => void;
}

export function HomeHeader({ primaryColor, textPrimary, textSecondary, secondary, onFilterPress }: Props) {
  return (
    <SafeAreaView>
      <View style={styles.container}>
        {/* ── AMORA Logo ────────────────────────────────── */}
        <View style={styles.logoRow}>
          {/* <Ionicons name="moon" size={18} color={primaryColor} style={styles.moonIcon} /> */}
          <Text style={[styles.logoText, { color: primaryColor }]}>AMORA</Text>
        </View>

        {/* ── Filter icon ───────────────────────────────── */}
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: secondary }]}
          onPress={onFilterPress}
          activeOpacity={0.75}
        >
          <Feather name="sliders" size={22} color={textPrimary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 16 : 8,
    paddingBottom: 12,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  moonIcon: {
    transform: [{ rotate: "20deg" }],
  },
  logoText: {
    fontSize: 24,
    fontFamily: "serif",           // Times New Roman on iOS, Noto Serif on Android
    fontWeight: "600",
    letterSpacing: 2,
  },
  filterBtn: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "90deg" }],
  },
});
