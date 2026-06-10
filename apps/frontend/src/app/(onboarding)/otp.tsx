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
  StatusBar,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import "@react-native-firebase/app";
import rnAuth from "@react-native-firebase/auth";

// Functional Imports
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { showSuccessToast, showErrorToast } from "@/components/toast";
import { usePhoneAuthStore } from "@/hooks/usePhoneAuthStore";
import { useAuthStore } from "@/hooks/useAuthStore";
import { OnboardingTopBar } from "@/components/onboarding/OnboardingTopBar";
import * as BackendService from "@/services/backendService"

// Import centralized theme
import theme from "@/theme/theme";

// --- DEV MODE FLAG ---
const DEV_MODE = false;
const DEV_OTP = "898989";

// --- Schemas ---
const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .length(10, "Phone number must be exactly 10 digits")
    .regex(/^\d+$/, "Phone number must contain only numbers"),
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
  const [confirmationResult, setConfirmationResult] = useState<any | null>(null);
  
  // UI States
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
  
  // Local state for fixed country code
  const [countryCode] = useState("+91");
  
  const inputRef = useRef<TextInput>(null);
  
  // Stores
  const phoneAuthStore = usePhoneAuthStore();
  const{
    updateAuthUser,
    googleFirebaseToken,
    setAccessToken,
    setRefreshToken,
  } = useAuthStore();

  // Destructure Theme
  const casualTheme = theme.Casual;

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
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  // --- Handlers ---
  const handleSendOTP = async (data: PhoneFormData) => {
    try {
      phoneAuthStore.setVerifying(true);
      
      const fullPhoneNumber = `${countryCode}${data.phoneNumber}`;
      phoneAuthStore.setPhoneNumber(fullPhoneNumber);

      if (DEV_MODE) {
        console.log("[DEV MODE] Bypassing Firebase OTP sending...");
        await new Promise((resolve) => setTimeout(resolve, 600)); // Artificial delay for UI testing
        phoneAuthStore.setCodeSent(true);
        showSuccessToast("OTP sent successfully! (DEV MODE)");
        setStep("otp");
        setTimer(30);
        return;
      }

      console.log("Sending OTP to:", fullPhoneNumber);
      const result = await rnAuth().signInWithPhoneNumber(fullPhoneNumber);

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

      if(!userCredential.user){
        throw new Error(
          "Phone verification failed."
        );
      }

      if(!googleFirebaseToken){
        throw new Error(
          "Google verification session expired. Please restart signup."
        );
      }

      const phoneIdToken = await userCredential.user.getIdToken();

      const backendResponse = await BackendService.completePhoneVerification(
        googleFirebaseToken,
        phoneIdToken,
      );

      console.log(backendResponse)

      updateAuthUser({
        phoneNumber:
          userCredential.user.phoneNumber ??
          phoneAuthStore.phoneNumber,
      });

      setAccessToken(
        backendResponse.accessToken,
      );

      setRefreshToken(
        backendResponse.refreshToken,
      );

      phoneAuthStore.reset();
      showSuccessToast("Phone verified successfully!");
      router.replace("/details");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to verify OTP";
      showErrorToast(message);
      phoneAuthStore.setError(message);
      console.log(message)
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

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: casualTheme.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={casualTheme.background} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {/* ── TOP BAR + PROGRESS ─────────────────────────────── */}
          <OnboardingTopBar
            step={step === "phone" ? 1 : 2}
            primaryColor={casualTheme.primary}
            textColor={casualTheme.textPrimary}
            secondaryText={casualTheme.textSecondary}
            onBack={handleBack}
            rightSlot="help"
            onRightPress={() => setIsHelpModalVisible(true)}
          />

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* --- HEADER SECTION --- */}
            <View style={styles.headerSection}>
              <Text style={[styles.title, { color: casualTheme.textPrimary }]}>
                {step === "phone" ? "Your number" : "Verification code"}
              </Text>
              <Text style={[styles.subtitle, { color: casualTheme.textSecondary }]}>
                {step === "phone"
                  ? "We need your phone number to secure your account and keep Amora safe."
                  : `Please enter the 6-digit code sent to `}
                {step === "otp" && <Text style={{ color: casualTheme.textPrimary }}>{phoneAuthStore.phoneNumber}</Text>}
              </Text>
            </View>

            {/* =========================================================
                                STEP 1: PHONE INPUT
                ========================================================= */}
            {step === "phone" && (
              <View style={styles.stepContainer}>
                <Controller
                  control={phoneForm.control}
                  name="phoneNumber"
                  render={({ field, fieldState }) => (
                    <View style={styles.inputWrapper}>
                      <View style={styles.phoneInputRow}>
                        {/* Fixed Country Code Box */}
                        <View style={styles.countryCodeBox}>
                          <Text style={[styles.countryCodeText, { color: casualTheme.textSecondary }]}>
                            {countryCode}
                          </Text>
                        </View>
                        
                        {/* Mobile Number Box */}
                        <View style={[
                          styles.inputBox, 
                          fieldState.error && { borderColor: casualTheme.primary }
                        ]}>
                          <TextInput
                            style={[styles.textInput, { color: casualTheme.textPrimary }]}
                            placeholder="Phone Number"
                            placeholderTextColor={casualTheme.textSecondary}
                            keyboardType="number-pad"
                            maxLength={10}
                            editable={!phoneAuthStore.isVerifying}
                            value={field.value}
                            onChangeText={field.onChange}
                            autoFocus
                          />
                        </View>
                      </View>
                      
                      {fieldState.error && (
                        <Text style={[styles.errorText, { color: casualTheme.primary }]}>
                          {fieldState.error.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    { backgroundColor: casualTheme.primary },
                    phoneAuthStore.isVerifying && styles.primaryButtonDisabled,
                  ]}
                  onPress={phoneForm.handleSubmit(handleSendOTP)}
                  disabled={phoneAuthStore.isVerifying}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.primaryButtonText, { color: casualTheme.textPrimary }]}>
                    {phoneAuthStore.isVerifying ? "Sending..." : "Continue"}
                  </Text>
                  {!phoneAuthStore.isVerifying && (
                    <Feather name="arrow-right" size={20} color={casualTheme.textPrimary} style={styles.buttonIcon} />
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* =========================================================
                                STEP 2: OTP INPUT
                ========================================================= */}
            {step === "otp" && (
              <View style={styles.stepContainer}>
                
                {/* OTP Form */}
                <View style={styles.otpSection}>
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
                                      isActive && { borderColor: casualTheme.primary },
                                      fieldState.error && { borderColor: casualTheme.primary },
                                    ]}
                                  >
                                    <Text style={[styles.otpText, { color: casualTheme.textPrimary }]}>
                                      {isFilled ? otpValue[index] : ""}
                                    </Text>
                                  </View>
                                );
                              })}
                            </View>
                          </TouchableWithoutFeedback>

                          {/* HIDDEN INPUT */}
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
                            <Text style={[styles.errorText, { color: casualTheme.primary, textAlign: 'left', marginTop: 12 }]}>
                              {fieldState.error.message}
                            </Text>
                          )}
                        </View>
                      );
                    }}
                  />

                  {/* Resend Timer */}
                  <View style={styles.resendContainer}>
                    {timer > 0 ? (
                      <Text style={[styles.resendText, { color: casualTheme.textSecondary }]}>
                        Resend code in{" "}
                        <Text style={[styles.timerText, { color: casualTheme.primary }]}>
                          00:{timer < 10 ? `0${timer}` : timer}
                        </Text>
                      </Text>
                    ) : (
                      <TouchableOpacity 
                        onPress={() => handleSendOTP({ phoneNumber: phoneAuthStore.phoneNumber.replace(countryCode, "") })}
                        disabled={phoneAuthStore.isVerifying}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.resendLinkText, { color: casualTheme.primary }]}>Resend Code</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Verify OTP Button */}
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    { backgroundColor: casualTheme.primary, marginTop: 40 },
                    (phoneAuthStore.isVerifying || !otpForm.watch("otp") || otpForm.watch("otp").length !== 6) && styles.primaryButtonDisabled,
                  ]}
                  onPress={otpForm.handleSubmit(handleVerifyOTP)}
                  disabled={phoneAuthStore.isVerifying || !otpForm.watch("otp") || otpForm.watch("otp").length !== 6}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.primaryButtonText, { color: casualTheme.textPrimary }]}>
                    {phoneAuthStore.isVerifying ? "Verifying..." : "Next"}
                  </Text>
                  {(!phoneAuthStore.isVerifying && otpForm.watch("otp")?.length === 6) && (
                    <Feather name="arrow-right" size={20} color={casualTheme.textPrimary} style={styles.buttonIcon} />
                  )}
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.spacer} />

            {/* --- SECURE FOOTER --- */}
            <View style={styles.footerSection}>
              <View style={styles.secureFooterRow}>
                <Feather name="shield" size={14} color={casualTheme.textSecondary} style={{ marginRight: 6 }} />
                <Text style={[styles.secureText, { color: casualTheme.textSecondary }]}>
                  Your profile is private and secure.
                </Text>
              </View>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>

        {/* --- HELP MODAL --- */}
        <Modal
          visible={isHelpModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsHelpModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: casualTheme.secondary }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: casualTheme.textPrimary }]}>Why Verification?</Text>
                <TouchableOpacity onPress={() => setIsHelpModalVisible(false)}>
                  <Feather name="x" size={24} color={casualTheme.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.modalBody, { color: casualTheme.textSecondary }]}>
                We require phone verification to maintain a safe, secure, and authentic community. This helps us ensure that every profile belongs to a real person.
              </Text>
              
              <TouchableOpacity onPress={() => showSuccessToast("Opening Terms & Conditions...")}>
                <Text style={[styles.modalLink, { color: casualTheme.primary }]}>Read our Terms & Conditions</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: casualTheme.primary }]}
                onPress={() => setIsHelpModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalButtonText, { color: casualTheme.textPrimary }]}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 24,
  },

  /* TOP BAR & HEADER */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 40 : 16,
    paddingBottom: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "600",
  },

  /* PROGRESS BAR */
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  progressDotInactive: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333333",
  },
  progressLine: {
    width: 24,
    height: 1,
    backgroundColor: "#333333",
    marginHorizontal: 4,
  },
  progressLineActive: {
    height: 1.5,
  },

  /* HEADER TEXT */
  headerSection: {
    alignItems: "flex-start",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },

  stepContainer: {
    width: "100%",
  },

  /* INPUTS - DARK THEME FLAT STYLE */
  inputWrapper: {
    width: "100%",
    marginBottom: 32,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  countryCodeBox: {
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A0A", 
    borderWidth: 1,
    borderColor: "#331E21", 
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: "500",
  },
  inputBox: {
    flex: 1,
    marginLeft: 12,
    borderRadius: 12,
    height: 56, 
    paddingHorizontal: 16,
    justifyContent: "center",
    backgroundColor: "#0A0A0A",
    borderWidth: 1,
    borderColor: "#331E21",
  },
  textInput: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 1,
  },
  errorText: {
    fontSize: 13,
    marginTop: 10,
    marginLeft: 4,
    fontWeight: "500",
  },

  /* OTP SECTION */
  otpSection: {
    width: "100%",
  },
  otpBoxesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    borderWidth: 1,
    borderColor: "#331E21",
  },
  otpText: {
    fontSize: 20,
    fontWeight: "600",
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  
  /* TIMER */
  resendContainer: {
    alignItems: "flex-start",
    marginTop: 24,
  },
  resendText: {
    fontSize: 13,
    fontWeight: "500",
  },
  timerText: {
    fontWeight: "600",
  },
  resendLinkText: {
    fontSize: 14,
    fontWeight: "600",
  },

  /* BUTTONS */
  primaryButton: {
    width: "100%",
    height: 54,
    borderRadius: 27, 
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.5, 
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    position: "absolute",
    right: 20,
  },

  /* LAYOUT */
  spacer: {
    flex: 1,
    minHeight: 40,
  },

  /* FOOTER */
  footerSection: {
    alignItems: "center",
    paddingBottom: 10,
  },
  secureFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secureText: {
    fontSize: 12,
    fontWeight: "500",
  },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#331E21",
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalBody: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  modalLink: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 32,
  },
  modalButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});