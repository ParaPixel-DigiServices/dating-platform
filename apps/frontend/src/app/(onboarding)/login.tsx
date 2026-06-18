import {
  showErrorToast,
  showSuccessToast,
  showInfoToast,
} from "@/components/toast";
import { useAuthStore } from "@/hooks/useAuthStore";
import { firebaseGoogleSignInWithIdToken } from "@/services/firebaseAuthService";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as BackendService from "@/services/backendService";

import theme from "@/theme/theme";

const t = theme.onboarding;

export default function LoginScreen() {
  const router = useRouter();
  const {
    setUser,
    setGoogleFirebaseToken,
    setAccessToken,
    setRefreshToken,
    setLoading,
    isLoading,
  } = useAuthStore();

  // Configure Google Sign-In on component mount
  useEffect(() => {
    console.log("Configuring Google Sign-In...");
    GoogleSignin.configure({
      webClientId:
        "1021629025840-1p1nm5k4ptqvea3lpfeup4tk0g1mlpo6.apps.googleusercontent.com",
    });
  }, []);

  // ─── ALL ORIGINAL LOGIC PRESERVED EXACTLY ────────────────────────────────

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.data)
        throw new Error("No user data received from Google Sign-In");

      const idToken = userInfo.data.idToken;

      if (!idToken) throw new Error("No idToken received from Google Sign-In");

      // Authenticate with Firebase using Google idToken
      const firebaseResult = await firebaseGoogleSignInWithIdToken(
        idToken,
      );

      const backendResponse = await BackendService.firebaseLogin(firebaseResult.idToken);

      if (backendResponse.requiresPhoneVerification) {
        // New user - store Firebase token and navigate to phone verification
        setGoogleFirebaseToken(firebaseResult.idToken);
        showSuccessToast("Google verification successful");
        router.replace("/otp");
        return;
      }

      // Existing user - store backend tokens and user data
      setAccessToken(backendResponse.accessToken);
      setRefreshToken(backendResponse.refreshToken);
      
      setUser({
        id: backendResponse.user.id,
        email: backendResponse.user.email ?? null,
        phoneNumber: backendResponse.user.phoneNumber ?? null,
        displayName: firebaseResult.displayName ?? null,
        photoURL: firebaseResult.photoURL ?? null,
      });

      showSuccessToast("Welcome back!");
      router.replace("/");
    } catch (error: any) {
      showErrorToast(error.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSignIn = async () => {
    router.push("/otp");
  };

  const handleAppleSignIn = async () => {
    showInfoToast("Apple Sign-In coming soon!");
    // TODO: Implement Apple Sign-In
  };

  const handleGuest = async () => {
    showInfoToast("Guest mode coming soon!");
    // TODO: Implement Guest mode
  };

  // ─── UI ──────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.root, { backgroundColor: t.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={t.background} />

      <SafeAreaView style={styles.safe}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={[styles.welcomeLabel, { color: t.textSecondary }]}>
            Welcome to
          </Text>
          <Text style={[styles.appName, { color: t.primary }]}>AMORA</Text>
          <Text style={[styles.subtitle, { color: t.textSecondary }]}>
            Where real connections{"\n"}turn into beautiful stories.
          </Text>
        </View>

        {/* ── Provider Buttons ── */}
        <View style={styles.providers}>

          <TouchableOpacity
            style={[styles.providerBtn, { backgroundColor: t.secondary, borderColor: t.border }]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-google" size={20} color={t.textPrimary} style={styles.providerIcon} />
            <Text style={[styles.providerText, { color: t.textPrimary }]}>
              {isLoading ? "Signing in…" : "Continue with Google"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.providerBtn, { backgroundColor: t.secondary, borderColor: t.border }]}
            onPress={handlePhoneSignIn}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="call-outline" size={20} color={t.textPrimary} style={styles.providerIcon} />
            <Text style={[styles.providerText, { color: t.textPrimary }]}>
              Continue with Phone
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.providerBtn, { backgroundColor: t.secondary, borderColor: t.border }]}
            onPress={handleAppleSignIn}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-apple" size={22} color={t.textPrimary} style={styles.providerIcon} />
            <Text style={[styles.providerText, { color: t.textPrimary }]}>
              Continue with Apple
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.orRow}>
            <View style={[styles.orLine, { backgroundColor: t.border }]} />
            <Text style={[styles.orText, { color: t.textSecondary }]}>or</Text>
            <View style={[styles.orLine, { backgroundColor: t.border }]} />
          </View>

          <TouchableOpacity onPress={handleGuest} activeOpacity={0.7}>
            <Text style={[styles.guestText, { color: t.primary }]}>
              Continue as Guest
            </Text>
          </TouchableOpacity>

        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: t.textSecondary }]}>
            By continuing, you agree to our{" "}
            <Text style={{ color: t.primary }}>Terms of Service</Text>
            {" "}and{" "}
            <Text style={{ color: t.primary }}>Privacy Policy</Text>
          </Text>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: Platform.OS === "android" ? 36 : 24,
  },

  /* Header */
  header: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  welcomeLabel: {
    fontSize: 18,
    fontWeight: "400",
    letterSpacing: 0.5,
  },
  appName: {
    fontSize: 46,
    fontWeight: "300",
    letterSpacing: 12,
    fontFamily: Platform.OS === "ios" ? "TimesNewRomanPSMT" : "serif",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
    marginTop: 4,
  },

  /* Provider buttons */
  providers: {
    gap: 14,
    alignItems: "center",
  },
  providerBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  providerIcon: {
    marginRight: 14,
  },
  providerText: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 12,
    marginVertical: 2,
  },
  orLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontSize: 14,
    fontWeight: "500",
  },
  guestText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  /* Footer */
  footer: {
    alignItems: "center",
    paddingTop: 20,
  },
  footerText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});