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
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import BgImg from "@/assets/images/main-bg.png";
import * as BackendService from "@/services/backendService";

// Import your centralized theme
import theme from "@/theme/theme";

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
  
  // Destructure the Casual theme for easy access
  const casualTheme = theme.Casual;

  // Configure Google Sign-In on component mount
  useEffect(() => {
    console.log("Configuring Google Sign-In...");
    GoogleSignin.configure({
      webClientId:
        "1021629025840-1p1nm5k4ptqvea3lpfeup4tk0g1mlpo6.apps.googleusercontent.com",
    });
  }, []);

  const handleGoogleSignIn = async () => {
    console.log("Initiating Google Sign-In...");
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.data)
        throw new Error("No user data received from Google Sign-In");

      const idToken = userInfo.data.idToken;

      if (!idToken) throw new Error("No idToken received from Google Sign-In");

      console.log("Google Sign-In successful.", { idToken });

      // Authenticate with Firebase using Google idToken
      const firebaseResult = await firebaseGoogleSignInWithIdToken(
        idToken,
      );

      const backendResponse = await BackendService.firebaseLogin(firebaseResult.idToken,);
      console.log("Backend auth response:", backendResponse,);

      setGoogleFirebaseToken(firebaseResult.idToken,);

      setUser({
        uid: firebaseResult.uid,
        email: firebaseResult.email ?? null,
        displayName: firebaseResult.displayName ?? null,
        photoURL: firebaseResult.photoURL ?? null,
        phoneNumber: firebaseResult.phoneNumber ?? null,
      });

      if (backendResponse.requiresPhoneVerification) {
        showSuccessToast(
          "Google verification successful",
        );

        router.replace("/otp");
        return;
      }

      setAccessToken(
        backendResponse.accessToken,
      );

      setRefreshToken(
        backendResponse.refreshToken,
      );

      showSuccessToast(
        "Welcome back!",
      );

      router.replace("/");
    } catch (error: any) {
      showErrorToast(error.message || "Sign-in failed");
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSignIn = async () => {
    // Optional: Route to your phone authentication screen
    router.push("/otp");
  };

  const handleXSignIn = async () => {
    showInfoToast("Use Google or Phone sign in for now, pls");
    // TODO: Implement X Sign-In
  };

  return (
    <View style={[styles.masterContainer, { backgroundColor: casualTheme.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ImageBackground
        source={BgImg}
        style={styles.backgroundImage}
      >
        {/* Base dark overlay just for the top half to make the logo pop */}
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.83)", "transparent"]}
          locations={[0, 0.4]}
          style={StyleSheet.absoluteFillObject}
        />

        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            {/* --- TOP SECTION: Logo & Settings --- */}
            <View style={styles.topSection}>
              <Text style={styles.logoText}>AMORA</Text>
              <TouchableOpacity style={styles.settingsButton} activeOpacity={0.7}>
                <Ionicons name="settings-sharp" size={22} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>

            {/* --- BOTTOM SHEET (Glassmorphism) --- */}
            <View style={styles.bottomSheetWrapper}>
              <BlurView intensity={90} tint="dark" style={styles.bottomSheetBlur}>
                {/* Additional subtle gradient to mix the theme background into the blur */}
                <LinearGradient
                  colors={["rgba(5,5,5,0.4)", "rgba(5,5,5,0.85)"]}
                  style={StyleSheet.absoluteFillObject}
                />
                
                <View style={styles.sheetContent}>
                  {/* Typography matching the dark theme */}
                  <Text style={[styles.title, { color: casualTheme.textPrimary }]}>
                    Find Your <Text style={{ color: casualTheme.primary }}>First Perfect</Text> Matches
                  </Text>
                  
                  <Text style={[styles.subtitle, { color: casualTheme.textSecondary }]}>
                    Join us and connect with millions of like-minded souls
                  </Text>

                  {/* --- AUTH SECTION --- */}
                  <View style={styles.authContainer}>
                    {/* Primary Google Button */}
                    <TouchableOpacity
                      style={[styles.primaryButton, { backgroundColor: casualTheme.primary }]}
                      onPress={handleGoogleSignIn}
                      disabled={isLoading}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="logo-google" size={20} color={casualTheme.textPrimary} />
                      <Text style={[styles.primaryBtnText, { color: casualTheme.textPrimary }]}>
                        {isLoading ? "Signing in..." : "Continue with Google"}
                      </Text>
                    </TouchableOpacity>

                    {/* Secondary Auth Options (Glassmorphism matched) */}
                    <View style={styles.secondaryButtonsRow}>
                      <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handlePhoneSignIn}
                        disabled={isLoading}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="call-outline" size={18} color={casualTheme.textPrimary} />
                        <Text style={[styles.secondaryBtnText, { color: casualTheme.textPrimary }]}>Phone</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleXSignIn}
                        disabled={isLoading}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.xIconTextSecondary, { color: casualTheme.textPrimary }]}>𝕏</Text>
                        <Text style={[styles.secondaryBtnText, { color: casualTheme.textPrimary }]}>Twitter</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footerSection}>
                      <Ionicons name="lock-closed-outline" size={12} color={casualTheme.textSecondary} />
                      <Text style={[styles.footerText, { color: casualTheme.textSecondary }]}>
                        Your profile is private and secure.
                      </Text>
                    </View>
                  </View>
                </View>
              </BlurView>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  masterContainer: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: 'space-between',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'space-between',
  },

  /* TOP SECTION */
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 50 : 20,
    position: 'relative',
  },
  logoText: {
    fontSize: 28,
    letterSpacing: 8,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
  },
  settingsButton: {
    position: 'absolute',
    right: 24,
    top: Platform.OS === 'android' ? 50 : 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* BOTTOM SHEET (GLASSMORPHISM) */
  bottomSheetWrapper: {
    width: "100%",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: "hidden", // Crucial for BlurView to respect border radius
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)", // Subtle glass edge highlight
    borderBottomWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 24,
  },
  bottomSheetBlur: {
    width: "100%",
  },
  sheetContent: {
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: Platform.OS === "ios" ? 50 : 40,
    alignItems: 'center',
  },

  /* TYPOGRAPHY */
  title: {
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 46,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 24,
    paddingHorizontal: 10,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },

  /* AUTH CONTAINER */
  authContainer: {
    width: "100%",
    marginTop: 36,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 58,
    borderRadius: 29, 
    marginBottom: 16,
    shadowColor: "#B81D33",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  secondaryButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255, 255, 255, 0.08)", // Transparent white for glass look
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  xIconTextSecondary: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: -2,
  },

  /* FOOTER */
  footerSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
  },
  footerText: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
});