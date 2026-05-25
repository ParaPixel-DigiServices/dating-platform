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
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const router = useRouter();
  const { setUser, setAccessToken, setLoading, isLoading } = useAuthStore();

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
      const firebaseResult = await firebaseGoogleSignInWithIdToken(idToken);

      setUser({
        uid: firebaseResult.uid,
        email: firebaseResult.email ?? null,
        displayName: firebaseResult.displayName ?? null,
        photoURL: firebaseResult.photoURL ?? null,
        phoneNumber: firebaseResult.phoneNumber ?? null,
      });

      console.log("Firebase authentication successful.", { firebaseResult });
      setAccessToken(firebaseResult.idToken);
      showSuccessToast("Signed in with Google!");
      router.replace("/otp");
    } catch (error: any) {
      showErrorToast(error.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    showInfoToast("Use Google sign in for now, pls");
    // TODO: Implement Apple Sign-In
  };

  const handleXSignIn = async () => {
    showInfoToast("Use Google sign in for now, pls");
    // TODO: Implement X Sign-In
  };

  return (
    <View style={styles.masterContainer}>
      {/* Background Image Container */}
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=1600&fit=crop",
        }}
        style={styles.backgroundImage}
      >
        {/* SMOOTH LINEAR GRADIENT OVERLAY */}
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.3)", // Started with an opacity to act as an overlay from the very top (0,0)
            "rgba(0,0,0,0.4)",
            "rgba(0,0,0,0.6)",
            "rgba(0,0,0,0.85)",
            "#000000",
          ]}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* PARENT VIEW CONTAINING THE 4 COMPONENTS */}
              <View style={styles.mainContent}>
                
                {/* 1. TOP COMPONENT: Profile Icon */}
                <View style={styles.topSection}>
                  <Image
                    source={{
                      uri: "https://i.pravatar.cc/150?img=47",
                    }}
                    style={styles.profileIcon}
                  />
                </View>

                {/* 2. MIDDLE COMPONENT: Logo, Name, and Tagline */}
                <View style={styles.middleSection}>
                  {/* Using Ionicons for a cleaner, consistent heart shape - increased size to 72 */}
                  <Ionicons name="heart-outline" size={72} color="#F3B0A2" style={styles.logoMark} />
                  
                  <Text style={styles.appName}>AMORA</Text>
                  
                  <Text style={styles.tagline}>
                    Find a connection{"\n"}meant{" "}
                    <Text style={styles.taglineHighlight}>for you.</Text>
                  </Text>
                </View>

                {/* 3. THIRD SECTION: Sign In Options */}
                <View style={styles.authSection}>
                  <TouchableOpacity
                    style={styles.authButton}
                    onPress={handleGoogleSignIn}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-google" size={32} color="#EA4335" style={styles.btnIcon} />
                    <Text style={styles.authBtnText}>
                      {isLoading ? "Signing in..." : "Continue with Google"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.authButton}
                    onPress={handleAppleSignIn}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-apple" size={34} color="#000" style={styles.btnIcon} />
                    <Text style={styles.authBtnText}>Continue with Apple</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.authButton}
                    onPress={handleXSignIn}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.btnIconText, { marginRight: 16 }]}>𝕏</Text>
                    <Text style={styles.authBtnText}>Continue with Twitter</Text>
                  </TouchableOpacity>
                </View>

                {/* 4. FOURTH SECTION: Terms and Privacy */}
                <View style={styles.footerSection}>
                  <Text style={styles.footerText}>
                    By continuing, you agree to our
                  </Text>
                  <Text style={styles.footerTextBold}>
                    Terms & Privacy Policy
                  </Text>
                </View>

              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  masterContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },

  /* 1. TOP COMPONENT STYLES */
  topSection: {
    paddingTop: Platform.OS === "android" ? 40 : 20,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
  },

  /* 2. MIDDLE COMPONENT STYLES */
  middleSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  logoMark: {
    marginBottom: 4, // Decreased to reduce spacing
  },
  appName: {
    fontSize: 42,
    fontWeight: Platform.OS === "ios" ? "500" : "bold",
    color: "#fff",
    letterSpacing: 8,
    marginBottom: 8, // Decreased to reduce spacing
    fontFamily: Platform.OS === "ios" ? "Optima" : "serif", 
  },
  tagline: {
    fontSize: 17,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    fontWeight: "400",
    lineHeight: 26,
  },
  taglineHighlight: {
    color: "#F3B0A2",
    fontWeight: "600",
  },

  /* 3. THIRD SECTION STYLES */
  authSection: {
    width: "100%",
    paddingBottom: 24,
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F5F2", 
    borderRadius: 36, // Slightly rounder to match larger padding
    paddingVertical: 20, // Increased padding to fit bigger text
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  btnIcon: {
    marginRight: 16, // Increased spacing between icon and bigger text
  },
  btnIconText: {
    fontSize: 32, // Increased custom icon size
    fontWeight: "600",
    color: "#000",
  },
  authBtnText: {
    fontSize: 22, // Increased by ~50%
    fontWeight: "600",
    color: "#1E1E1E",
    letterSpacing: 0.3,
  },

  /* 4. FOURTH SECTION STYLES */
  footerSection: {
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 20 : 30,
  },
  footerText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 4,
  },
  footerTextBold: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
});
