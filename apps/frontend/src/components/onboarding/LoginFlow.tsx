import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { SlideInRight, SlideOutRight } from "react-native-reanimated";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { useAuthStore } from "@/hooks/useAuthStore";
import { firebaseGoogleSignInWithIdToken } from "@/services/firebaseAuthService";
import { showSuccessToast, showErrorToast, showInfoToast } from "@/components/toast";
import theme from "@/theme/theme";

const t = theme.onboarding;

// ── Modular Auth Buttons ──────────────────────────────────────────────────

const GoogleAuthButton = ({ isLoading, onPress }: { isLoading: boolean; onPress: () => void }) => (
  <TouchableOpacity
    style={[styles.providerBtn, { backgroundColor: t.secondary, borderColor: t.border }]}
    onPress={onPress}
    disabled={isLoading}
    activeOpacity={0.8}
  >
    {isLoading ? (
      <ActivityIndicator size="small" color={t.primary} style={styles.providerIcon} />
    ) : (
      <Ionicons name="logo-google" size={20} color={t.textPrimary} style={styles.providerIcon} />
    )}
    <Text style={[styles.providerText, { color: t.textPrimary }]}>
      {isLoading ? "Signing in…" : "Continue with Google"}
    </Text>
  </TouchableOpacity>
);

const AppleAuthButton = ({ isLoading, onPress }: { isLoading: boolean; onPress: () => void }) => (
  <TouchableOpacity
    style={[styles.providerBtn, { backgroundColor: t.secondary, borderColor: t.border }]}
    onPress={onPress}
    disabled={isLoading}
    activeOpacity={0.8}
  >
    <Ionicons name="logo-apple" size={22} color={t.textPrimary} style={styles.providerIcon} />
    <Text style={[styles.providerText, { color: t.textPrimary }]}>Continue with Apple</Text>
  </TouchableOpacity>
);

const XAuthButton = ({ isLoading, onPress }: { isLoading: boolean; onPress: () => void }) => (
  <TouchableOpacity
    style={[styles.providerBtn, { backgroundColor: t.secondary, borderColor: t.border }]}
    onPress={onPress}
    disabled={isLoading}
    activeOpacity={0.8}
  >
    <Text style={[styles.xLogo, styles.providerIcon]}>𝕏</Text>
    <Text style={[styles.providerText, { color: t.textPrimary }]}>Continue with X</Text>
  </TouchableOpacity>
);

// ── Main Flow Component ──────────────────────────────────────────────────

export default function LoginFlow({ onSuccess }: { onSuccess: () => void }) {
  const { setGoogleFirebaseToken } = useAuthStore();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  // Configure Google Sign-In on mount
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "1021629025840-1p1nm5k4ptqvea3lpfeup4tk0g1mlpo6.apps.googleusercontent.com",
    });
  }, []);

  const handleGoogleSignIn = async () => {
    setLoadingProvider("google");
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.data)
        throw new Error("No user data received from Google Sign-In");

      const idToken = userInfo.data.idToken;
      if (!idToken) throw new Error("No idToken received from Google Sign-In");

      // Firebase Authentication using Google idToken
      const firebaseResult = await firebaseGoogleSignInWithIdToken(idToken);

      // Backend logic has been removed as requested.
      // Set the token and proceed to the next step.
      setGoogleFirebaseToken(firebaseResult.idToken);
      showSuccessToast("Google verification successful");
      onSuccess();
    } catch (error: any) {
      showErrorToast(error.message || "Google sign-in failed");
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleAppleSignIn = async () => {
    showInfoToast("Apple Sign-In coming soon!");
  };

  const handleXSignIn = async () => {
    showInfoToast("X Sign-In coming soon!");
  };

  return (
    <Animated.View
      key="auth-bottom"
      entering={SlideInRight.duration(340)}
      exiting={SlideOutRight.duration(300)}
      style={styles.bottomPad}
    >
      <View style={styles.providerList}>
        <GoogleAuthButton
          isLoading={loadingProvider === "google"}
          onPress={handleGoogleSignIn}
        />
        <AppleAuthButton
          isLoading={!!loadingProvider}
          onPress={handleAppleSignIn}
        />
        <XAuthButton
          isLoading={!!loadingProvider}
          onPress={handleXSignIn}
        />
      </View>

      <Text style={[styles.termsText, { color: t.textSecondary }]}>
        By continuing, you agree to our{" "}
        <Text style={{ color: t.primary }}>Terms</Text>
        {" & "}
        <Text style={{ color: t.primary }}>Privacy Policy</Text>
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bottomPad: {
    paddingHorizontal: 28,
    paddingBottom: Platform.OS === "ios" ? 44 : 30,
    gap: 16,
  },
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
