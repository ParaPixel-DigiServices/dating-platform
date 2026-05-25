// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { useForm, Controller } from 'react-hook-form';
// import { z } from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { Button } from '@/components/Button';
// import { Input } from '@/components/Input';
// import { showSuccessToast, showErrorToast } from '@/components/toast';
// import { useOnboardingStore } from '@/hooks/useOnboardingStore';
// import DateTimePicker from '@react-native-community/datetimepicker';

// const detailsSchema = z.object({
//   firstName: z.string().min(1, 'First name is required'),
//   lastName: z.string().min(1, 'Last name is required'),
// });

// type DetailsFormData = z.infer<typeof detailsSchema>;

// export default function DetailsScreen() {
//   const router = useRouter();
//   const { control, handleSubmit, formState } = useForm<DetailsFormData>({
//     resolver: zodResolver(detailsSchema),
//   });

//   const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const setFirstName = useOnboardingStore((state) => state.setFirstName);
//   const setLastName = useOnboardingStore((state) => state.setLastName);
//   const setDateOfBirthStore = useOnboardingStore((state) => state.setDateOfBirth);

//   const onSubmit = async (data: DetailsFormData) => {
//     try {
//       if (!dateOfBirth) {
//         showErrorToast('Please select a date of birth');
//         return;
//       }

//       setLoading(true);
//       setFirstName(data.firstName);
//       setLastName(data.lastName);
//       setDateOfBirthStore(dateOfBirth.toISOString());
//       showSuccessToast('Details saved');
//       router.push('/category');
//     } catch {
//       showErrorToast('Failed to save details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDateChange = (_event: unknown, selectedDate: Date | undefined) => {
//     if (Platform.OS === 'android') {
//       setShowDatePicker(false);
//     }
//     if (selectedDate) {
//       setDateOfBirth(selectedDate);
//     }
//   };

//   const formatDate = (date: Date) => {
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//     });
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.container}
//       >
//         <ScrollView
//           contentContainerStyle={styles.scrollContent}
//           keyboardShouldPersistTaps="handled"
//         >
//           <View style={styles.header}>
//             <Text style={styles.title}>Tell us about yourself</Text>
//             <Text style={styles.subtitle}>We would love to know more</Text>
//           </View>

//           <View style={styles.content}>
//             <Controller
//               control={control}
//               name="firstName"
//               render={({ field, fieldState }) => (
//                 <Input
//                   label="First Name"
//                   placeholder="John"
//                   value={field.value}
//                   onChangeText={field.onChange}
//                   error={fieldState.error?.message}
//                   editable={!loading}
//                 />
//               )}
//             />

//             <Controller
//               control={control}
//               name="lastName"
//               render={({ field, fieldState }) => (
//                 <Input
//                   label="Last Name"
//                   placeholder="Doe"
//                   value={field.value}
//                   onChangeText={field.onChange}
//                   error={fieldState.error?.message}
//                   editable={!loading}
//                 />
//               )}
//             />

//             <View style={styles.dateSection}>
//               <Text style={styles.label}>Date of Birth</Text>
//               <Button
//                 title={dateOfBirth ? formatDate(dateOfBirth) : 'Select Date'}
//                 onPress={() => setShowDatePicker(true)}
//                 variant={dateOfBirth ? 'primary' : 'outline'}
//               />
//             </View>

//             {showDatePicker && (
//               <DateTimePicker
//                 value={dateOfBirth || new Date(2000, 0, 1)}
//                 mode="date"
//                 display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//                 onChange={handleDateChange}
//                 maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
//               />
//             )}

//             <Button
//               title={loading ? 'Saving...' : 'Continue'}
//               onPress={handleSubmit(onSubmit)}
//               loading={loading}
//               disabled={!dateOfBirth || formState.isSubmitting}
//             />
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#faf9f7',
//   },
//   container: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//     paddingHorizontal: 20,
//     paddingVertical: 24,
//   },
//   header: {
//     marginVertical: 20,
//     marginBottom: 32,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#000',
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#666',
//   },
//   content: {
//     flex: 1,
//     marginTop: 24,
//   },
//   dateSection: {
//     marginBottom: 16,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#000',
//     marginBottom: 8,
//   },
// });
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
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";

// Functional Imports
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { showSuccessToast, showErrorToast } from "@/components/toast";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";

// --- Schema & Validation ---
const detailsSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    day: z.string().regex(/^(0?[1-9]|[12][0-9]|3[01])$/, "Invalid day"),
    month: z.string().regex(/^(0?[1-9]|1[012])$/, "Invalid month"),
    year: z
      .string()
      .regex(/^(19|20)\d\d$/, "Invalid year")
      .refine((val) => {
        const num = parseInt(val, 10);
        const currentYear = new Date().getFullYear();
        return num >= 1900 && num <= currentYear - 18;
      }, "You must be at least 18 years old"),
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
        message: "Invalid date combination",
        path: ["day"], // Attach error to day input
      });
    }
  });

type DetailsFormData = z.infer<typeof detailsSchema>;

export default function DetailsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Input Refs for auto-advancing
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  // Store
  const setFirstName = useOnboardingStore((state) => state.setFirstName);
  const setLastName = useOnboardingStore((state) => state.setLastName);
  const setDateOfBirthStore = useOnboardingStore(
    (state) => state.setDateOfBirth,
  );

  const { control, handleSubmit, formState, watch } = useForm<DetailsFormData>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      day: "",
      month: "",
      year: "",
    },
  });

  const onSubmit = async (data: DetailsFormData) => {
    try {
      setLoading(true);

      // Combine into valid Date object
      const dob = new Date(
        parseInt(data.year, 10),
        parseInt(data.month, 10) - 1,
        parseInt(data.day, 10),
      );

      setFirstName(data.firstName.trim());
      setLastName(data.lastName.trim());
      setDateOfBirthStore(dob.toISOString());

      showSuccessToast("Details saved");
      router.push("/category");
    } catch {
      showErrorToast("Failed to save details");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    watch("firstName").length > 0 &&
    watch("lastName").length > 0 &&
    watch("day").length > 0 &&
    watch("month").length > 0 &&
    watch("year").length === 4;

  // --- Dynamic Progress Bar Logic ---
  let activeSteps = 0;
  if (watch("firstName")?.trim().length > 0) activeSteps++;
  if (watch("lastName")?.trim().length > 0) activeSteps++;
  if (watch("day")?.length > 0 && watch("month")?.length > 0 && watch("year")?.length === 4) activeSteps++;

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
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <Feather name="chevron-left" size={24} color="#1E1E1E" />
              </TouchableOpacity>

              {/* --- PROGRESS BAR --- */}
              <View style={styles.progressContainer}>
                {[1, 2, 3].map((step) => (
                  <View
                    key={step}
                    style={[
                      styles.progressSegment,
                      step <= activeSteps && styles.progressSegmentActive,
                    ]}
                  />
                ))}
              </View>

              <View style={styles.emptyIconSpace} />
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.contentContainer}>
                {/* --- TITLES --- */}
                <View style={styles.titleSection}>
                  <Text style={styles.title}>Let's make it{"\n"}official</Text>
                  <Text style={styles.subtitle}>
                    Your perfect match is waiting.{"\n"}Just a few details to
                    get started.
                  </Text>
                </View>

                {/* --- INPUTS --- */}
                <View style={styles.formContainer}>
                  {/* First Name */}
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field, fieldState }) => (
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>First Name</Text>
                        <View
                          style={[
                            styles.inputBox,
                            focusedInput === "firstName" &&
                              styles.inputBoxFocused,
                            fieldState.error && styles.inputErrorBorder,
                          ]}
                        >
                          <TextInput
                            style={styles.textInput}
                            placeholder="John"
                            placeholderTextColor="#999"
                            value={field.value}
                            onChangeText={field.onChange}
                            onFocus={() => setFocusedInput("firstName")}
                            onBlur={() => setFocusedInput(null)}
                            editable={!loading}
                          />
                        </View>
                        {fieldState.error && (
                          <Text style={styles.errorText}>
                            {fieldState.error.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />

                  {/* Last Name */}
                  <Controller
                    control={control}
                    name="lastName"
                    render={({ field, fieldState }) => (
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Last Name</Text>
                        <View
                          style={[
                            styles.inputBox,
                            focusedInput === "lastName" &&
                              styles.inputBoxFocused,
                            fieldState.error && styles.inputErrorBorder,
                          ]}
                        >
                          <TextInput
                            style={styles.textInput}
                            placeholder="Doe"
                            placeholderTextColor="#999"
                            value={field.value}
                            onChangeText={field.onChange}
                            onFocus={() => setFocusedInput("lastName")}
                            onBlur={() => setFocusedInput(null)}
                            editable={!loading}
                          />
                        </View>
                        {fieldState.error && (
                          <Text style={styles.errorText}>
                            {fieldState.error.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />

                  {/* Date of Birth (3 Inputs) */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Date of Birth</Text>
                    <View style={styles.dobContainer}>
                      {/* Day */}
                      <Controller
                        control={control}
                        name="day"
                        render={({ field }) => (
                          <View
                            style={[
                              styles.dobBox,
                              focusedInput === "day" && styles.inputBoxFocused,
                              (formState.errors.day || formState.errors.year) &&
                                styles.inputErrorBorder,
                            ]}
                          >
                            <TextInput
                              style={styles.dobInput}
                              placeholder="DD"
                              placeholderTextColor="#999"
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
                          </View>
                        )}
                      />

                      {/* Month */}
                      <Controller
                        control={control}
                        name="month"
                        render={({ field }) => (
                          <View
                            style={[
                              styles.dobBox,
                              focusedInput === "month" &&
                                styles.inputBoxFocused,
                              (formState.errors.month ||
                                formState.errors.year) &&
                                styles.inputErrorBorder,
                            ]}
                          >
                            <TextInput
                              ref={monthRef}
                              style={styles.dobInput}
                              placeholder="MM"
                              placeholderTextColor="#999"
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
                          </View>
                        )}
                      />

                      {/* Year */}
                      <Controller
                        control={control}
                        name="year"
                        render={({ field }) => (
                          <View
                            style={[
                              styles.dobBox,
                              { flex: 1.2 }, // Year box slightly wider
                              focusedInput === "year" && styles.inputBoxFocused,
                              formState.errors.year && styles.inputErrorBorder,
                            ]}
                          >
                            <TextInput
                              ref={yearRef}
                              style={styles.dobInput}
                              placeholder="YYYY"
                              placeholderTextColor="#999"
                              keyboardType="number-pad"
                              maxLength={4}
                              value={field.value}
                              onChangeText={field.onChange}
                              onFocus={() => setFocusedInput("year")}
                              onBlur={() => setFocusedInput(null)}
                              editable={!loading}
                            />
                          </View>
                        )}
                      />
                    </View>

                    {/* Unified DOB Error Message */}
                    {(formState.errors.day ||
                      formState.errors.month ||
                      formState.errors.year) && (
                      <Text style={styles.errorText}>
                        {formState.errors.year?.message ||
                          formState.errors.day?.message ||
                          formState.errors.month?.message}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* --- FOOTER / BUTTON --- */}
            <View style={styles.footerContainer}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!isFormValid || loading) && styles.primaryButtonDisabled,
                ]}
                onPress={handleSubmit(onSubmit)}
                disabled={!isFormValid || loading}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? "Saving..." : "Continue"}
                </Text>
              </TouchableOpacity>
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

  /* HEADER & PROGRESS */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 40 : 10,
    marginBottom: 20,
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
  emptyIconSpace: {
    width: 44, // Keeps the progress bar perfectly centered
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 20,
  },
  progressSegment: {
    height: 4,
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 2,
    marginHorizontal: 4,
  },
  progressSegmentActive: {
    backgroundColor: "#D99485", // Amora accent color
  },

  /* MAIN CONTENT */
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleSection: {
    marginTop: 10,
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: Platform.OS === "ios" ? "500" : "bold",
    color: "#1E1E1E",
    marginBottom: 12,
    lineHeight: 42,
    fontFamily: Platform.OS === "ios" ? "Optima" : "serif",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },

  /* FORMS & INPUTS */
  formContainer: {
    width: "100%",
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
    marginLeft: 4,
  },
  inputBox: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 14, // Reduced from 18 to make it slimmer
    paddingVertical: Platform.OS === "ios" ? 14 : 12, // Reduced to make fields less broad
    paddingHorizontal: 16, // Reduced from 20
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.8)",
  },
  inputBoxFocused: {
    borderColor: "#D99485",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  textInput: {
    fontSize: 16,
    color: "#1E1E1E",
    fontWeight: "500",
  },
  inputErrorBorder: {
    borderColor: "#d32f2f",
  },
  errorText: {
    fontSize: 12,
    color: "#d32f2f",
    marginTop: 8,
    marginLeft: 4,
  },

  /* DOB SPECIFIC */
  dobContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  dobBox: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 14, // Reduced from 18 to make it slimmer
    paddingVertical: Platform.OS === "ios" ? 14 : 12, // Reduced to make fields less broad
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  dobInput: {
    fontSize: 16,
    color: "#1E1E1E",
    fontWeight: "600",
    textAlign: "center",
    width: "100%",
  },

  /* BUTTONS & FOOTER */
  footerContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
  },
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
});
