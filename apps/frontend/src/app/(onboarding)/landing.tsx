import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  StatusBar,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/theme/theme";

// ── No auth logic on this screen ────────────────────────────────────────────
// This is a pure branding/entry screen. All auth logic lives in login.tsx.

const t = theme.onboarding;
const BG_IMG = require("@/assets/images/main-bg.png");

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ImageBackground source={BG_IMG} style={styles.bg} resizeMode="cover">

        {/* Gradient: transparent top → near-black bottom */}
        <LinearGradient
          colors={["rgba(13,10,7,0.15)", "rgba(13,10,7,0.65)", t.background]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        {/* ── Centre Branding ── */}
        <View style={styles.brandingContainer}>
          {/* Logo mark — oval with heart + A */}
          <View style={styles.logoMark}>
            <Ionicons name="heart-outline" size={44} color={t.primary} />
          </View>

          <Text style={[styles.appName, { color: t.textPrimary }]}>AMORA</Text>

          <Text style={[styles.tagline, { color: t.textSecondary }]}>
            REAL PEOPLE. DEEP CONNECTIONS.{"\n"}ENDLESS POSSIBILITIES.
          </Text>
        </View>

        {/* ── Bottom Section ── */}
        <View style={styles.bottomContainer}>

          {/* Create Account CTA */}
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

          {/* Sign In – flanked by lines */}
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

          {/* Trusted by section */}
          <View style={styles.trustedSection}>
            <Text style={[styles.trustedLabel, { color: t.textSecondary }]}>
              TRUSTED BY MILLIONS WORLDWIDE
            </Text>
            <View style={styles.brandLogos}>
              <Text style={[styles.brandLogo, { color: t.textSecondary, fontStyle: "italic" }]}>VOGUE</Text>
              <Text style={[styles.brandSep, { color: t.border }]}>|</Text>
              <Text style={[styles.brandLogo, { color: t.textSecondary, fontWeight: "700" }]}>GQ</Text>
              <Text style={[styles.brandSep, { color: t.border }]}>|</Text>
              <Text style={[styles.brandLogo, { color: t.textSecondary, fontStyle: "italic" }]}>Forbes</Text>
              <Text style={[styles.brandSep, { color: t.border }]}>|</Text>
              <Text style={[styles.brandLogo, { color: t.textSecondary, letterSpacing: 3 }]}>ELLE</Text>
            </View>
          </View>

          {/* Privacy note */}
          <View style={styles.privacyRow}>
            <Ionicons name="shield-checkmark-outline" size={14} color={t.textSecondary} />
            <Text style={[styles.privacyText, { color: t.textSecondary }]}>
              Privacy First. Always.
            </Text>
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

  /* Branding */
  brandingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Platform.OS === "android" ? 60 : 80,
  },
  logoMark: {
    width: 86,
    height: 100,
    borderRadius: 43,
    borderWidth: 1.5,
    borderColor: "rgba(201,149,106,0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  appName: {
    fontSize: 44,
    letterSpacing: 16,
    fontWeight: "300",
    fontFamily: Platform.OS === "ios" ? "TimesNewRomanPSMT" : "serif",
    marginBottom: 16,
  },
  tagline: {
    fontSize: 11,
    letterSpacing: 2.2,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "500",
  },

  /* Bottom */
  bottomContainer: {
    paddingHorizontal: 28,
    paddingBottom: Platform.OS === "ios" ? 44 : 30,
    gap: 18,
  },
  createBtnWrapper: {
    borderRadius: 50,
    overflow: "hidden",
  },
  createBtn: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0D0A07",
    letterSpacing: 0.6,
  },
  signInRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  line: {
    flex: 1,
    height: 1,
    opacity: 0.5,
  },
  signInText: {
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  /* Trusted by */
  trustedSection: {
    alignItems: "center",
    gap: 10,
  },
  trustedLabel: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "500",
  },
  brandLogos: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandLogo: {
    fontSize: 15,
    fontWeight: "400",
  },
  brandSep: {
    fontSize: 14,
    opacity: 0.4,
  },

  /* Privacy */
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
