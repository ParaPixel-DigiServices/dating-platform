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
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

import { useAuthStore } from "@/hooks/useAuthStore";
import { firebaseGoogleSignInWithIdToken } from "@/services/firebaseAuthService";
import { firebaseLogin } from "@/services/backendService";
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
  const { setGoogleFirebaseToken, setAccessToken, setRefreshToken, setUser } = useAuthStore();
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  // // Configure Google Sign-In on mount
  // useEffect(() => {
  //   GoogleSignin.configure({
  //     webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  //   }); 
  // }, []);

  // Configure Google Sign-In on mount
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '1051030268726-9pi97gjvih8e7g7iq01nrnofi5otnhtl.apps.googleusercontent.com',
        // "1021629025840-1p1nm5k4ptqvea3lpfeup4tk0g1mlpo6.apps.googleusercontent.com",

    });
  }, []);

  const handleGoogleSignIn = async () => {
    console.log('hi')
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoadingProvider("google");
    try {
      console.log(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
      await GoogleSignin.hasPlayServices();
      console.log("Google Play services available");
      
      try {
        // Force account picker by signing out first
        await GoogleSignin.signOut();
      } catch (e) {
        // Ignore if already signed out
      }

      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo);

      if (!userInfo.data)
        throw new Error("No user data received from Google Sign-In");

      const idToken = userInfo.data.idToken;
      if (!idToken) throw new Error("No idToken received from Google Sign-In");

      // Firebase Authentication using Google idToken
      console.log("starting firebase registration")
      const firebaseResult = await firebaseGoogleSignInWithIdToken(idToken);
      console.log("firebase registration done")

      // Backend logic: Try logging in with just the Google token (for returning users)
      try {
        console.log("starting backend registration")
        const response = await firebaseLogin(firebaseResult.idToken);
        console.log("backend registration done")
        
        // If we reach here, user already exists and we got tokens!
        setAccessToken(response.accessToken);
        setRefreshToken(response.refreshToken);
        setUser(response.user);
        
        showSuccessToast("Welcome back!");
        
        // Route based on onboardingStep using the single source of truth in index.tsx
        router.replace('/');
      } catch (backendError: any) {
        if (backendError.message.includes('PHONE_REQUIRED')) {
          // New user! Needs phone verification.
          setGoogleFirebaseToken(firebaseResult.idToken);
          onSuccess(); // Go to OTP step
        } else {
          throw backendError;
        }
      }
    } catch (error: any) {
      showErrorToast(error.message || "Google sign-in failed");
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleAppleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showInfoToast("Apple Sign-In coming soon!");
  };

  const handleXSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
