import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  StatusBar,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/theme/theme";

const { width, height } = Dimensions.get("window");
const t = theme.onboarding;

// Use the same background image that was already in the project
const BG_IMG = require("@/assets/images/main-bg.png");

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Full-screen background image ───────────────── */}
      <ImageBackground source={BG_IMG} style={styles.bg} resizeMode="cover">

        {/* ── Gradient: transparent top → dark bottom ──── */}
        <LinearGradient
          colors={["transparent", "rgba(13,10,7,0.55)", t.background]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        {/* ── Centre branding ──────────────────────────── */}
        <View style={styles.brandingContainer}>
          {/* Logo mark — simple geometric heart SVG-like shape using text/icon */}
          <View style={styles.logoMark}>
            <Ionicons name="heart-outline" size={52} color={t.primary} />
          </View>

          {/* App name */}
          <Text style={[styles.appName, { color: t.textPrimary }]}>AMORA</Text>

          {/* Tagline */}
          <Text style={[styles.tagline, { color: t.textSecondary }]}>
            REAL PEOPLE. DEEP CONNECTIONS.{"\n"}ENDLESS POSSIBILITIES.
          </Text>
        </View>

        {/* ── Bottom actions ───────────────────────────── */}
        <View style={styles.bottomContainer}>

          {/* Divider row with "Sign In" text */}
          <View style={styles.signInRow}>
            <View style={[styles.line, { backgroundColor: t.border }]} />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/(onboarding)/login")}
            >
              <Text style={[styles.signInText, { color: t.textPrimary }]}>Sign In</Text>
            </TouchableOpacity>
            <View style={[styles.line, { backgroundColor: t.border }]} />
          </View>

          {/* Create Account button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.createBtnWrapper}
            onPress={() => router.push("/(onboarding)/login")}
          >
            <LinearGradient
              colors={[t.primaryLight, t.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createBtn}
            >
              <Text style={styles.createBtnText}>Create Account</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Privacy note */}
          <View style={styles.privacyRow}>
            <Ionicons name="shield-checkmark-outline" size={14} color={t.textSecondary} />
            <Text style={[styles.privacyText, { color: t.textSecondary }]}>
              Privacy First. Always.
            </Text>
            {/* Sparkle accent */}
            <Ionicons name="sparkles" size={14} color={t.primary} />
          </View>

        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0D0A07",
  },
  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
  },

  /* ── Branding ── */
  brandingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Platform.OS === "android" ? 60 : 80,
  },
  logoMark: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    borderColor: "rgba(201,149,106,0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  appName: {
    fontSize: 46,
    letterSpacing: 14,
    fontWeight: "300",
    fontFamily: Platform.OS === "ios" ? "TimesNewRomanPSMT" : "serif",
    marginBottom: 18,
  },
  tagline: {
    fontSize: 12,
    letterSpacing: 2.5,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "500",
  },

  /* ── Bottom ── */
  bottomContainer: {
    paddingHorizontal: 32,
    paddingBottom: Platform.OS === "ios" ? 50 : 36,
    gap: 20,
  },
  signInRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth * 2,
  },
  signInText: {
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  createBtnWrapper: {
    borderRadius: 50,
    overflow: "hidden",
  },
  createBtn: {
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0D0A07",
    letterSpacing: 0.8,
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  privacyText: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
