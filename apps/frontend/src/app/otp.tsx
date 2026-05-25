import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import rnAuth from "@react-native-firebase/auth";
// Functional Imports from your provided code
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/Input";
import { showErrorToast, showSuccessToast } from "@/components/toast";
import { usePhoneAuthStore } from "@/hooks/usePhoneAuthStore";
import { useAuthStore } from "@/hooks/useAuthStore";

// --- DEV MODE FLAG ---
// Set to false for production
const DEV_MODE = true;
const DEV_OTP = "898989";

// Schemas
const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Invalid phone number format (include country code, e.g. +919876543210)"
    ),
});

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

export default function OtpScreen() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [timer, setTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const inputRef = useRef<TextInput>(null);
  
  // Stores
  const phoneAuthStore = usePhoneAuthStore();
  const updateAuthUser = useAuthStore((state) => state.updateAuthUser);

  // Forms
  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: "" },
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  // Countdown timer logic for Resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // --- Handlers ---
  const handleSendOTP = async (data: PhoneFormData) => {
    try {
      phoneAuthStore.setVerifying(true);
      phoneAuthStore.setPhoneNumber(data.phoneNumber);

      if (DEV_MODE) {
        console.log("[DEV MODE] Bypassing Firebase OTP sending...");
        await new Promise((resolve) => setTimeout(resolve, 600)); // Artificial delay for UI testing
        phoneAuthStore.setCodeSent(true);
        showSuccessToast("OTP sent successfully! (DEV MODE)");
        setStep("otp");
        setTimer(30);
        return;
      }

      console.log("Sending OTP to:", `+91${data.phoneNumber}`);
      // const result = await signInWithPhoneNumber(auth, `+91${data.phoneNumber}`);
      const result = await rnAuth().signInWithPhoneNumber(`+91${data.phoneNumber}`);

      setConfirmationResult(result);
      phoneAuthStore.setCodeSent(true);

      console.log("OTP sent, confirmation result stored.");
      showSuccessToast("OTP sent successfully!");
      setStep("otp");
      setTimer(30);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send OTP";
      showErrorToast(message);
      phoneAuthStore.setError(message);
    } finally {
      phoneAuthStore.setVerifying(false);
    }
  };

  const handleVerifyOTP = async (data: OTPFormData) => {
    try {
      phoneAuthStore.setVerifying(true);

      if (DEV_MODE) {
        console.log("[DEV MODE] Verifying mock OTP...");
        await new Promise((resolve) => setTimeout(resolve, 800)); // Artificial delay for UI testing
        
        if (data.otp === DEV_OTP) {
          updateAuthUser({
            phoneNumber: phoneAuthStore.phoneNumber,
          });
          phoneAuthStore.reset();
          showSuccessToast("Phone verified successfully! (DEV MODE)");
          router.replace("/details");
          return;
        } else {
          throw new Error(`Invalid DEV OTP. Please use ${DEV_OTP}`);
        }
      }

      if (!confirmationResult) {
        throw new Error("No confirmation result. Please resend OTP.");
      }

      const userCredential = await confirmationResult.confirm(data.otp);

      if (userCredential.user) {
        updateAuthUser({
          phoneNumber: userCredential.user.phoneNumber ?? phoneAuthStore.phoneNumber,
        });
      }

      phoneAuthStore.reset();
      showSuccessToast("Phone verified successfully!");
      router.replace("/details");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to verify OTP";
      showErrorToast(message);
      phoneAuthStore.setError(message);
    } finally {
      phoneAuthStore.setVerifying(false);
    }
  };

  const handleBack = () => {
    if (step === "otp") {
      setStep("phone");
      phoneAuthStore.setCodeSent(false);
      setConfirmationResult(null);
      otpForm.reset();
      setTimer(0);
    } else {
      router.back();
    }
  };

  // Focus the hidden input when user taps the OTP boxes area
  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.masterContainer}>
        {/* Soft, warm elegant background gradient */}
        <LinearGradient
          colors={["#FCFAf8", "#F5EFEB", "#EBE2D9"]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            {/* --- HEADER --- */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleBack}
                activeOpacity={0.7}
                disabled={phoneAuthStore.isVerifying}
              >
                <Feather name="chevron-left" size={24} color="#1E1E1E" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
                <Ionicons name="sparkles" size={20} color="#D99485" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* --- MAIN CONTENT --- */}
              <View style={styles.contentContainer}>
                
                {/* Icon Section with concentric rings */}
                <View style={styles.iconContainer}>
                  <View style={styles.ringOuter}>
                    <View style={styles.ringInner}>
                      <Feather name="smartphone" size={32} color="#1E1E1E" />
                    </View>
                  </View>
                </View>

                {/* Dynamic Title & Subtitle based on Step */}
                <Text style={styles.title}>
                  {step === "phone" ? "Verify your phone" : "Verify your number"}
                </Text>
                <Text style={styles.subtitle}>
                  {step === "phone"
                    ? "We verify every profile to keep\nour community authentic."
                    : `We sent a code to\n${phoneAuthStore.phoneNumber}`}
                </Text>

                {/* =========================================================
                                    STEP 1: PHONE INPUT
                    ========================================================= */}
                {step === "phone" && (
                  <View style={styles.stepContainer}>
                    <Controller
                      control={phoneForm.control}
                      name="phoneNumber"
                      render={({ field, fieldState }) => (
                        <View style={styles.phoneInputWrapper}>
                           {/* Integrating your custom Input but forcing aesthetic container styles */}
                           <View style={[styles.inputBox, fieldState.error && styles.inputErrorBorder]}>
                              <Input
                                label=""
                                placeholder="98765 43210"
                                keyboardType="phone-pad"
                                editable={!phoneAuthStore.isVerifying}
                                value={field.value}
                                onChangeText={field.onChange}
                                error={fieldState.error?.message}
                              />
                           </View>
                           {fieldState.error && (
                             <Text style={styles.errorText}>{fieldState.error.message}</Text>
                           )}
                        </View>
                      )}
                    />

                    <TouchableOpacity
                      style={[
                        styles.primaryButton,
                        phoneAuthStore.isVerifying && styles.primaryButtonDisabled,
                      ]}
                      onPress={phoneForm.handleSubmit(handleSendOTP)}
                      disabled={phoneAuthStore.isVerifying}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.primaryButtonText}>
                        {phoneAuthStore.isVerifying ? "Sending..." : "Send OTP"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* =========================================================
                                    STEP 2: OTP INPUT
                    ========================================================= */}
                {step === "otp" && (
                  <View style={styles.stepContainer}>
                    
                    {/* Read-only Phone Number Display Box */}
                    <View style={styles.phoneBox}>
                      <Text style={styles.phoneNumberText}>{phoneAuthStore.phoneNumber}</Text>
                      <TouchableOpacity 
                        onPress={handleBack} 
                        activeOpacity={0.6}
                        disabled={phoneAuthStore.isVerifying}
                      >
                        <Text style={styles.editText}>Edit</Text>
                      </TouchableOpacity>
                    </View>

                    {/* OTP Form */}
                    <View style={styles.otpSection}>
                      <Text style={styles.otpLabel}>Enter 6-digit code</Text>
                      
                      <Controller
                        control={otpForm.control}
                        name="otp"
                        render={({ field, fieldState }) => {
                          const otpValue = field.value || "";
                          
                          return (
                            <View>
                              <TouchableWithoutFeedback onPress={focusInput}>
                                <View style={styles.otpBoxesContainer}>
                                  {[0, 1, 2, 3, 4, 5].map((index) => {
                                    const isActive = otpValue.length === index;
                                    const isFilled = otpValue.length > index;
                                    return (
                                      <View
                                        key={index}
                                        style={[
                                          styles.otpBox,
                                          isActive && styles.otpBoxActive,
                                        ]}
                                      >
                                        <Text style={styles.otpText}>
                                          {isFilled ? otpValue[index] : ""}
                                        </Text>
                                      </View>
                                    );
                                  })}
                                </View>
                              </TouchableWithoutFeedback>

                              {/* HIDDEN INPUT for native keyboard handling */}
                              <TextInput
                                ref={inputRef}
                                value={otpValue}
                                onChangeText={field.onChange}
                                keyboardType="number-pad"
                                maxLength={6}
                                editable={!phoneAuthStore.isVerifying}
                                style={styles.hiddenInput}
                                autoFocus
                              />

                              {fieldState.error && (
                                <Text style={styles.errorText}>{fieldState.error.message}</Text>
                              )}
                            </View>
                          );
                        }}
                      />

                      {/* Resend Timer */}
                      <View style={styles.resendContainer}>
                        {timer > 0 ? (
                          <Text style={styles.resendText}>
                            Resend code in{" "}
                            <Text style={styles.timerText}>
                              00:{timer < 10 ? `0${timer}` : timer}
                            </Text>
                          </Text>
                        ) : (
                          <TouchableOpacity 
                            onPress={() => handleSendOTP({ phoneNumber: phoneAuthStore.phoneNumber })}
                            disabled={phoneAuthStore.isVerifying}
                          >
                            <Text style={styles.timerText}>Resend Code</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    {/* Verify OTP Button */}
                    <TouchableOpacity
                      style={[
                        styles.primaryButton,
                        { marginTop: 40 },
                        (phoneAuthStore.isVerifying || !otpForm.watch("otp") || otpForm.watch("otp").length !== 6) && styles.primaryButtonDisabled,
                      ]}
                      onPress={otpForm.handleSubmit(handleVerifyOTP)}
                      disabled={phoneAuthStore.isVerifying || !otpForm.watch("otp") || otpForm.watch("otp").length !== 6}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.primaryButtonText}>
                        {phoneAuthStore.isVerifying ? "Verifying..." : "Continue"}
                      </Text>
                    </TouchableOpacity>

                  </View>
                )}

              </View>
            </ScrollView>

            {/* --- SECURE FOOTER --- */}
            <View style={styles.footerContainer}>
              <View style={styles.secureFooter}>
                <Feather name="lock" size={12} color="#666" style={{ marginRight: 6 }} />
                <Text style={styles.secureText}>
                  Your data is 100% secure with Amora.
                </Text>
              </View>
            </View>

          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  masterContainer: {
    flex: 1,
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
  
  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 40 : 10,
    marginBottom: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  /* MAIN CONTENT */
  contentContainer: {
    paddingHorizontal: 24,
    alignItems: "center",
    paddingBottom: 40,
  },
  stepContainer: {
    width: "100%",
  },
  
  /* ICONS & TITLES */
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    marginTop: 10,
  },
  ringOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  ringInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: Platform.OS === "ios" ? "500" : "bold",
    color: "#1E1E1E",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },

  /* PHONE INPUT (STEP 1) */
  phoneInputWrapper: {
    width: "100%",
    marginBottom: 32,
  },
  inputBox: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  inputErrorBorder: {
    borderColor: "#d32f2f",
  },

  /* PHONE BOX DISPLAY (STEP 2) */
  phoneBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    width: "100%",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  phoneNumberText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1E1E1E",
    letterSpacing: 1,
  },
  editText: {
    fontSize: 15,
    color: "#D99485", // Rose gold/Amora accent
    fontWeight: "600",
  },

  /* OTP SECTION (STEP 2) */
  otpSection: {
    width: "100%",
  },
  otpLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
  },
  otpBoxesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  otpBox: {
    width: 50,
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  otpBoxActive: {
    borderColor: "#D99485",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  otpText: {
    fontSize: 24,
    fontWeight: "500",
    color: "#1E1E1E",
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  
  /* ERRORS & TIMER */
  errorText: {
    fontSize: 12,
    color: "#d32f2f",
    marginTop: 8,
    textAlign: "center",
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 32,
  },
  resendText: {
    fontSize: 14,
    color: "#666",
  },
  timerText: {
    color: "#D99485", 
    fontWeight: "500",
  },

  /* BUTTONS & FOOTER */
  primaryButton: {
    backgroundColor: "#2A2A2A",
    width: "100%",
    paddingVertical: 20,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonDisabled: {
    backgroundColor: "#888",
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  footerContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    alignItems: "center",
  },
  secureFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secureText: {
    fontSize: 12,
    color: "#666",
  },
});


