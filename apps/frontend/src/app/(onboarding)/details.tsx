import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { showSuccessToast, showErrorToast } from "@/components/toast";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { OnboardingTopBar } from "@/components/onboarding/OnboardingTopBar";
import * as BackendService from "@/services/backendService";

// Import centralized theme
import theme from "@/theme/theme";

// --- Schema & Validation ---
const detailsSchema = z
  .object({
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    day: z.string().regex(/^(0?[1-9]|[12][0-9]|3[01])$/, "Invalid"),
    month: z.string().regex(/^(0?[1-9]|1[012])$/, "Invalid"),
    year: z
      .string()
      .regex(/^(19|20)\d\d$/, "Invalid")
      .refine((val) => {
        const num = parseInt(val, 10);
        const currentYear = new Date().getFullYear();
        return num >= 1900 && num <= currentYear - 18;
      }, "18+ only"),
    gender: z.string().min(1, "Please select your gender"),
  })
  .superRefine((data, ctx) => {
    // Validate if the actual date exists (e.g., prevent Feb 30)
    const d = parseInt(data.day, 10);
    const m = parseInt(data.month, 10);
    const y = parseInt(data.year, 10);
    const date = new Date(y, m - 1, d);

    if (
      date.getFullYear() !== y ||
      date.getMonth() !== m - 1 ||
      date.getDate() !== d
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid date",
        path: ["day"],
      });
    }
  });

type DetailsFormData = z.infer<typeof detailsSchema>;

const GENDER_OPTIONS = ["Man", "Woman", "Other"];

const mapGenderToBackend = (
  gender: string,
) => {
  switch (gender) {
    case "Man":
      return "MALE";

    case "Woman":
      return "FEMALE";

    default:
      return "NON-BINARY";
  }
};

export default function DetailsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isGenderDropdownOpen, setGenderDropdownOpen] = useState(false);

  // Input Refs for auto-advancing
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  // Store
  const setFirstName = useOnboardingStore((state) => state.setFirstName);
  const setLastName = useOnboardingStore((state) => state.setLastName);
  const setGender = useOnboardingStore((state) => state.setGender);
  const setDateOfBirthStore = useOnboardingStore((state) => state.setDateOfBirth);

  const casualTheme = theme.Casual;

  const { control, handleSubmit, formState, watch, setValue } = useForm<DetailsFormData>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      day: "",
      month: "",
      year: "",
      gender: "",
    },
  });

  const onSubmit = async (
    data: DetailsFormData,
  ) => {
    try {
      setLoading(true);
      console.log("Submitting details:", data);

      const dob = new Date(
        parseInt(data.year, 10),
        parseInt(data.month, 10) - 1,
        parseInt(data.day, 10),
      );

      console.log("Constructed DOB:", dob);

      await BackendService.saveOnboardingDetails({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        dateOfBirth: dob.toISOString(),
        gender: mapGenderToBackend(
          data.gender,
        ),
      });

      console.log("Details saved successfully");

      // Local cache only
      setFirstName(
        data.firstName.trim(),
      );

      setLastName(
        data.lastName.trim(),
      );

      setGender(
        data.gender,
      );

      setDateOfBirthStore(
        dob.toISOString(),
      );

      showSuccessToast(
        "Details saved",
      );

      router.push("/category");
    } catch (error: any) {
      console.error(
        "Details submission failed:",
        error,
      );

      showErrorToast(
        error?.message ??
          "Failed to save details",
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    watch("firstName").length > 0 &&
    watch("lastName").length > 0 &&
    watch("day").length > 0 &&
    watch("month").length > 0 &&
    watch("year").length === 4 &&
    watch("gender").length > 0;

  return (
    <TouchableWithoutFeedback onPress={() => {
      Keyboard.dismiss();
      setGenderDropdownOpen(false);
    }}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: casualTheme.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={casualTheme.background} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* --- TOP BAR & PROGRESS --- */}
            <OnboardingTopBar
              step={3}
              primaryColor={casualTheme.primary}
              textColor={casualTheme.textPrimary}
              secondaryText={casualTheme.textSecondary}
              onBack={() => router.back()}
              rightSlot="settings"
            />

            {/* --- HEADER --- */}
            <View style={styles.headerSection}>
              {/* Stacked Hearts Icon */}
              <View style={styles.heroIconContainer}>
                <Ionicons name="heart" size={36} color={casualTheme.primary} style={{ opacity: 0.85 }} />
                <Ionicons name="heart" size={20} color={casualTheme.primaryLight} style={styles.heroIconSmall} />
              </View>
              
              <Text style={[styles.title, { color: casualTheme.textPrimary }]}>
                Tell us about <Text style={{ color: casualTheme.primary }}>yourself</Text>
              </Text>
              <Text style={[styles.subtitle, { color: casualTheme.textSecondary }]}>
                This helps personalize your experience
              </Text>
            </View>

            {/* --- FORM SECTION --- */}
            <View style={styles.formContainer}>
              
              {/* First Name */}
              <View style={styles.inputWrapper}>
                <Text style={[styles.inputLabel, { color: casualTheme.primary }]}>FIRST NAME</Text>
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field, fieldState }) => (
                    <View>
                      <View
                        style={[
                          styles.inputBox,
                          { backgroundColor: casualTheme.secondary, borderColor: casualTheme.secondary },
                          focusedInput === "firstName" && { borderColor: casualTheme.primary },
                          fieldState.error && styles.inputErrorBorder,
                        ]}
                      >
                        <Feather name="user" size={18} color={casualTheme.primary} style={styles.inputIcon} />
                        <TextInput
                          style={[styles.textInput, { color: casualTheme.textPrimary }]}
                          placeholder="e.g. Rohan"
                          placeholderTextColor={casualTheme.textSecondary}
                          value={field.value}
                          onChangeText={field.onChange}
                          onFocus={() => setFocusedInput("firstName")}
                          onBlur={() => setFocusedInput(null)}
                          editable={!loading}
                        />
                      </View>
                      {fieldState.error && (
                        <Text style={styles.errorText}>{fieldState.error.message}</Text>
                      )}
                    </View>
                  )}
                />
              </View>

              {/* Last Name */}
              <View style={styles.inputWrapper}>
                <Text style={[styles.inputLabel, { color: casualTheme.primary }]}>LAST NAME</Text>
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field, fieldState }) => (
                    <View>
                      <View
                        style={[
                          styles.inputBox,
                          { backgroundColor: casualTheme.secondary, borderColor: casualTheme.secondary },
                          focusedInput === "lastName" && { borderColor: casualTheme.primary },
                          fieldState.error && styles.inputErrorBorder,
                        ]}
                      >
                        <Feather name="user" size={18} color={casualTheme.primary} style={styles.inputIcon} />
                        <TextInput
                          style={[styles.textInput, { color: casualTheme.textPrimary }]}
                          placeholder="e.g. Kumar"
                          placeholderTextColor={casualTheme.textSecondary}
                          value={field.value}
                          onChangeText={field.onChange}
                          onFocus={() => setFocusedInput("lastName")}
                          onBlur={() => setFocusedInput(null)}
                          editable={!loading}
                        />
                      </View>
                      {fieldState.error && (
                        <Text style={styles.errorText}>{fieldState.error.message}</Text>
                      )}
                    </View>
                  )}
                />
              </View>

              {/* Date of Birth */}
              <View style={styles.inputWrapper}>
                <Text style={[styles.inputLabel, { color: casualTheme.primary }]}>DATE OF BIRTH</Text>
                <View
                  style={[
                    styles.inputBox,
                    { backgroundColor: casualTheme.secondary, borderColor: casualTheme.secondary },
                    (focusedInput === "day" || focusedInput === "month" || focusedInput === "year") && { borderColor: casualTheme.primary },
                    (formState.errors.day || formState.errors.month || formState.errors.year) && styles.inputErrorBorder,
                  ]}
                >
                  <Feather name="calendar" size={18} color={casualTheme.primary} style={styles.inputIcon} />
                  
                  {/* Day */}
                  <Controller
                    control={control}
                    name="day"
                    render={({ field }) => (
                      <TextInput
                        style={[styles.unifiedDobInput, { color: casualTheme.textPrimary }]}
                        placeholder="DD"
                        placeholderTextColor={casualTheme.textSecondary}
                        keyboardType="number-pad"
                        maxLength={2}
                        value={field.value}
                        onChangeText={(val) => {
                          field.onChange(val);
                          if (val.length === 2) monthRef.current?.focus();
                        }}
                        onFocus={() => setFocusedInput("day")}
                        onBlur={() => setFocusedInput(null)}
                        editable={!loading}
                      />
                    )}
                  />

                  <View style={styles.dobDivider} />

                  {/* Month */}
                  <Controller
                    control={control}
                    name="month"
                    render={({ field }) => (
                      <TextInput
                        ref={monthRef}
                        style={[styles.unifiedDobInput, { color: casualTheme.textPrimary }]}
                        placeholder="MM"
                        placeholderTextColor={casualTheme.textSecondary}
                        keyboardType="number-pad"
                        maxLength={2}
                        value={field.value}
                        onChangeText={(val) => {
                          field.onChange(val);
                          if (val.length === 2) yearRef.current?.focus();
                        }}
                        onFocus={() => setFocusedInput("month")}
                        onBlur={() => setFocusedInput(null)}
                        editable={!loading}
                      />
                    )}
                  />

                  <View style={styles.dobDivider} />

                  {/* Year */}
                  <Controller
                    control={control}
                    name="year"
                    render={({ field }) => (
                      <TextInput
                        ref={yearRef}
                        style={[styles.unifiedDobInput, { flex: 1.5, color: casualTheme.textPrimary }]} 
                        placeholder="YYYY"
                        placeholderTextColor={casualTheme.textSecondary}
                        keyboardType="number-pad"
                        maxLength={4}
                        value={field.value}
                        onChangeText={field.onChange}
                        onFocus={() => setFocusedInput("year")}
                        onBlur={() => setFocusedInput(null)}
                        editable={!loading}
                      />
                    )}
                  />
                </View>

                {/* Unified DOB Error Message */}
                {(formState.errors.day || formState.errors.month || formState.errors.year) && (
                  <Text style={styles.errorText}>
                    {formState.errors.year?.message ||
                      formState.errors.day?.message ||
                      formState.errors.month?.message}
                  </Text>
                )}
              </View>

              {/* Gender Custom Dropdown */}
              <View style={[styles.inputWrapper, { zIndex: 10 }]}>
                <Text style={[styles.inputLabel, { color: casualTheme.primary }]}>GENDER</Text>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field, fieldState }) => (
                    <View>
                      <TouchableOpacity
                        style={[
                          styles.inputBox,
                          { backgroundColor: casualTheme.secondary, borderColor: casualTheme.secondary },
                          isGenderDropdownOpen && { borderColor: casualTheme.primary },
                          fieldState.error && styles.inputErrorBorder,
                        ]}
                        onPress={() => setGenderDropdownOpen(!isGenderDropdownOpen)}
                        activeOpacity={0.8}
                      >
                        <Feather name="users" size={18} color={casualTheme.primary} style={styles.inputIcon} />
                        <Text style={[styles.textInput, field.value ? { color: casualTheme.textPrimary } : { color: casualTheme.textSecondary }]}>
                          {field.value || "Select Gender"}
                        </Text>
                        <Feather 
                          name={isGenderDropdownOpen ? "chevron-up" : "chevron-down"} 
                          size={20} 
                          color={casualTheme.primary} 
                          style={{ marginRight: 16 }}
                        />
                      </TouchableOpacity>

                      {/* Dropdown Menu */}
                      {isGenderDropdownOpen && (
                        <View style={[styles.dropdownMenu, { backgroundColor: casualTheme.secondary, borderColor: casualTheme.border }]}>
                          {GENDER_OPTIONS.map((option, index) => (
                            <TouchableOpacity
                              key={option}
                              style={[
                                styles.dropdownItem,
                                index === GENDER_OPTIONS.length - 1 && { borderBottomWidth: 0 },
                                { borderBottomColor: "rgba(255,255,255,0.05)" }
                              ]}
                              onPress={() => {
                                setValue("gender", option, { shouldValidate: true });
                                setGenderDropdownOpen(false);
                              }}
                            >
                              <Text style={[
                                styles.dropdownItemText,
                                { color: casualTheme.textPrimary },
                                field.value === option && { color: casualTheme.primary, fontWeight: "700" }
                              ]}>
                                {option}
                              </Text>
                              {field.value === option && (
                                <Feather name="check" size={18} color={casualTheme.primary} />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}

                      {fieldState.error && !isGenderDropdownOpen && (
                        <Text style={styles.errorText}>{fieldState.error.message}</Text>
                      )}
                    </View>
                  )}
                />
              </View>
            </View>

            <View style={styles.spacer} />

            {/* --- FOOTER SECTION --- */}
            <View style={styles.footerSection}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: casualTheme.primary },
                  (!isFormValid || loading) && styles.primaryButtonDisabled,
                ]}
                onPress={handleSubmit(onSubmit)}
                disabled={!isFormValid || loading}
                activeOpacity={0.8}
              >
                <Text style={[styles.primaryButtonText, { color: casualTheme.textPrimary }]}>
                  {loading ? "Saving..." : "Continue"}
                </Text>
              </TouchableOpacity>

              <View style={styles.bottomProgressContainer}>
                <Text style={[styles.pageIndicator, { color: casualTheme.textSecondary }]}>03. Basic Information</Text>
                <View style={styles.bottomProgressTrack}>
                  <View style={[styles.bottomProgressFill, { backgroundColor: casualTheme.primary }]} />
                </View>
              </View>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
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
    paddingTop: Platform.OS === "android" ? 40 : 16,
    paddingBottom: 24,
  },

  /* TOP BAR & PROGRESS */
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  iconButton: {
    padding: 8,
    marginLeft: -8,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  progressDotSolid: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressLineSolid: {
    width: 24,
    height: 2,
    marginHorizontal: 4,
  },
  progressDotOutline: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  progressLineInactive: {
    width: 24,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginHorizontal: 4,
  },
  progressDotInactive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "transparent",
  },

  /* HEADER */
  headerSection: {
    alignItems: "center",
    marginBottom: 36,
  },
  heroIconContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroIconSmall: {
    marginLeft: -10,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "400",
  },

  /* FORM & INPUTS */
  formContainer: {
    width: "100%",
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 1, 
    textTransform: "uppercase",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    height: 58,
    borderWidth: 1.5,
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  inputErrorBorder: {
    borderColor: "#E62E45", 
  },
  errorText: {
    fontSize: 12,
    color: "#E62E45",
    marginTop: 8,
    marginLeft: 4,
    fontWeight: "500",
  },

  /* UNIFIED DOB SPECIFIC */
  unifiedDobInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  dobDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  /* GENDER DROPDOWN */
  dropdownMenu: {
    position: "absolute",
    top: 66, 
    left: 0,
    right: 0,
    borderRadius: 12,
    paddingVertical: 4,
    borderWidth: 1,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: "500",
  },

  /* LAYOUT */
  spacer: {
    flex: 1,
    minHeight: 30,
  },

  /* FOOTER & BUTTONS */
  footerSection: {
    alignItems: "center",
  },
  primaryButton: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  bottomProgressContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  pageIndicator: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 8,
  },
  bottomProgressTrack: {
    width: 100,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  bottomProgressFill: {
    width: "50%", 
    height: "100%",
  }
});
