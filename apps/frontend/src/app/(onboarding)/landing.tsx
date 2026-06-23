import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  StatusBar,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  SlideInRight,
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight,
} from "react-native-reanimated";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { useAuthStore } from "@/hooks/useAuthStore";
import { showSuccessToast, showErrorToast, showInfoToast } from "@/components/toast";
import OtpFlow, { OtpFlowRef } from "@/components/onboarding/OtpFlow";
import LoginFlow from "@/components/onboarding/LoginFlow";
import { OnboardingTopBar } from "@/components/onboarding/OnboardingTopBar";
import theme from "@/theme/theme";

const t = theme.onboarding;
const BG_IMG = require("@/assets/images/main-bg.png");

export default function LandingScreen() {
  const router = useRouter();
  const { setGoogleFirebaseToken, setLoading } = useAuthStore();

  const [step, setStep] = useState<"landing" | "auth" | "verification">("landing");
  const otpFlowRef = useRef<OtpFlowRef>(null);
  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ImageBackground source={BG_IMG} style={styles.bg} resizeMode="cover">
        <LinearGradient
          colors={["rgba(13,10,7,0.15)", "rgba(13,10,7,0.65)", t.background]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        {step === "verification" && (
          <View style={styles.topBarWrapper}>
            <OnboardingTopBar
              step={1}
              onBack={() => {
                if (otpFlowRef.current) {
                  otpFlowRef.current.goBack();
                } else {
                  setStep("auth");
                }
              }}
            />
          </View>
        )}

        {/* ── Branding — always fixed, never moves ── */}
        <View style={styles.brandingContainer}>
          <View style={styles.logoMark}>
            <Ionicons name="heart-outline" size={44} color={t.primary} />
          </View>
          <Text style={[styles.appName, { color: t.textPrimary }]}>AMORA</Text>
          <Text style={[styles.tagline, { color: t.textSecondary }]}>
            REAL PEOPLE. DEEP CONNECTIONS.{"\n"}ENDLESS POSSIBILITIES.
          </Text>
        </View>

        {/* ── Bottom sliding area — only this section transitions ── */}
        <View style={styles.slidingArea}>

          {step === "landing" ? (

            // ── Landing CTAs ─────────────────────────────────────────────────
            <Animated.View
              key="landing-bottom"
              entering={SlideInLeft.duration(340)}
              exiting={SlideOutLeft.duration(300)}
              style={styles.bottomPad}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.createBtnWrapper}
                onPress={() => setStep("auth")}
              >
                <LinearGradient
                  colors={["#f2c7aa", "#e5b399", "#f2c7aa"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.createBtn}
                >
                  <Text style={styles.createBtnText}>Get Started</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.signInRow}>
                <View style={[styles.line, { backgroundColor: t.border }]} />
                {/* <TouchableOpacity activeOpacity={0.7} onPress={() => setStep("auth")}>
                  <Text style={[styles.signInText, { color: t.textPrimary }]}>Sign In</Text>
                </TouchableOpacity>
                <View style={[styles.line, { backgroundColor: t.border }]} /> */}
              </View>

              <View style={styles.privacyRow}>
                <Ionicons name="shield-checkmark-outline" size={14} color={t.textSecondary} />
                <Text style={[styles.privacyText, { color: t.textSecondary }]}>
                  Privacy First. Always.
                </Text>
              </View>
            </Animated.View>

          ) : step === "auth" ? (

            // ── Auth Provider Flow ─────────────────────────────────────────
            <LoginFlow onSuccess={() => setStep("verification")} />

          ) : (

            // ── OTP Verification Flow ───────────────────────────────────────
            <OtpFlow
              ref={otpFlowRef}
              onSuccess={() => router.replace("/details")}
              onBack={() => setStep("auth")}
            />

          )}
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

  /* ── Branding (fixed) ── */
  brandingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Platform.OS === "android" ? 60 : 80,
  },
  topBarWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
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
    letterSpacing: 12,
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

  /* ── Sliding area ── */
  slidingArea: {
    overflow: "hidden",
  },
  bottomPad: {
    paddingHorizontal: 28,
    paddingBottom: Platform.OS === "ios" ? 44 : 30,
    gap: 16,
  },

  /* ── Landing CTAs ── */
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

  /* ── Auth step ── */

  providerList: {
    gap: 12,
  },
  providerBtn: {
    flexDirection: "row",
    alignItems: "center",
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  providerIcon: {
    marginRight: 14,
    width: 22,
    textAlign: "center",
  },
  providerText: {
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  xLogo: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFF5EC",
  },
  termsText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    letterSpacing: 0.2,
  },
});
