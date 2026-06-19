import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  SafeAreaView,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { useUserProfileStore } from "@/onboarding_ques_temp/userProfileStore";
import { useAuthStore } from "@/hooks/useAuthStore";
import {
  getStep,
  getTotalSteps,
  type ProfileQuestion,
  type EditStep,
} from "@/utils/profileHelpers";
import theme from "@/theme/theme";
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get("window");

// ─── Budget Slider values (₹2k – ₹1L) ───────────────────────────────────────
const BUDGET_MIN = 2000;
const BUDGET_MAX = 100000;
const BUDGET_STEP_SIZE = 2000;
const BUDGET_STEPS = Math.floor((BUDGET_MAX - BUDGET_MIN) / BUDGET_STEP_SIZE);

// ─── Question Input Components ───────────────────────────────────────────────

interface InputProps {
  question: ProfileQuestion;
  value: any;
  onChange: (v: any) => void;
  t: any;
}

/** Single-line or multi-line text input */
function TextInput_({ question, value, onChange, t }: InputProps) {
  return (
    <View style={{ gap: 8 }}>
      <TextInput
        style={[
          styles.textInput,
          {
            backgroundColor: t.background,
            borderColor: t.primary + "55",
            color: t.textPrimary,
          },
        ]}
        value={value ?? ""}
        onChangeText={onChange}
        placeholder={question.description ?? `Type your answer...`}
        placeholderTextColor={t.textSecondary + "55"}
        multiline={question.text.startsWith("Prompt")}
        numberOfLines={question.text.startsWith("Prompt") ? 3 : 1}
        returnKeyType="done"
      />
      {question.text.startsWith("Prompt") && (
        <Text style={[styles.charCount, { color: t.textSecondary + "55" }]}>
          {(value ?? "").length}/150
        </Text>
      )}
    </View>
  );
}

/** Date picker — simple text input for now (native date support via text) */
function DateInput({ question, value, onChange, t }: InputProps) {
  return (
    <TextInput
      style={[
        styles.textInput,
        {
          backgroundColor: t.background,
          borderColor: t.primary + "55",
          color: t.textSecondary,
        },
      ]}
      value={value ?? ""}
      onChangeText={onChange}
      placeholder="YYYY-MM-DD"
      placeholderTextColor={t.textSecondary + "55"}
      keyboardType="numeric"
      maxLength={10}
    />
  );
}

/** Single-select option chips */
function SelectInput({ question, value, onChange, t }: InputProps) {
  return (
    <View style={{ gap: 12 }}>
      {(question.options ?? []).map((opt) => {
        const selected = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            style={[
              styles.cardOption,
              {
                backgroundColor: t.background,
                borderColor: selected ? t.primary : t.primary + "33",
              },
            ]}
            onPress={() => onChange(opt)}
            activeOpacity={0.7}
          >
            <Text style={[styles.cardOptionText, { color: t.textPrimary }]}>
              {opt}
            </Text>
            <View style={[styles.radioCircle, { borderColor: selected ? t.primary : t.textSecondary + "55" }]}>
              {selected && <View style={[styles.radioFill, { backgroundColor: t.primary }]} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** Multi-select option cards */
function MultiSelectInput({ question, value, onChange, t }: InputProps) {
  const selected: string[] = Array.isArray(value) ? value : [];

  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <View style={{ gap: 12 }}>
      {(question.options ?? []).map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <TouchableOpacity
            key={opt}
            style={[
              styles.cardOption,
              {
                backgroundColor: t.background,
                borderColor: isSelected ? t.primary : t.primary + "33",
              },
            ]}
            onPress={() => toggle(opt)}
            activeOpacity={0.7}
          >
            <Text style={[styles.cardOptionText, { color: t.textPrimary }]}>
              {opt}
            </Text>
            <View style={[styles.checkboxSquare, { borderColor: isSelected ? t.primary : t.textSecondary + "55" }]}>
              {isSelected && <Feather name="check" size={14} color={t.primary} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** 6-Photo Grid Upload Mock */
function FileUploadMock({ question, value, onChange, t }: InputProps) {
  const slots = [1, 2, 3, 4, 5, 6];
  return (
    <View style={styles.photoGrid}>
      {slots.map((slot) => (
        <View key={slot} style={styles.photoSlotContainer}>
          <TouchableOpacity
            style={[
              styles.photoUploadBox,
              { borderColor: t.primary + "33", backgroundColor: t.background },
            ]}
            activeOpacity={0.8}
            onPress={() => onChange(`mock_photo_${slot}`)}
          >
            <Feather name="image" size={24} color={t.primary + "55"} />
            <Text style={[styles.photoAddText, { color: t.primary + "88" }]}>Add Photo</Text>
            <View style={[styles.photoBadge, { backgroundColor: t.primary }]}>
              <Text style={styles.photoBadgeText}>{slot}</Text>
            </View>
            <View style={[styles.photoPlus, { backgroundColor: t.primary }]}>
              <Feather name="plus" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          <TextInput
            style={[
              styles.photoCaptionInput,
              { backgroundColor: t.background, borderColor: t.primary + "22", color: t.textPrimary },
            ]}
            placeholder="Write a caption..."
            placeholderTextColor={t.textSecondary + "55"}
          />
        </View>
      ))}
    </View>
  );
}

/** City Picker Mock */
function CitySelectInput({ question, value, onChange, t }: InputProps) {
  // A mock list for now
  const mockCities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "London", "New York"];
  return (
    <View style={{ gap: 12 }}>
      {mockCities.map((city) => {
        const selected = value === city;
        return (
          <TouchableOpacity
            key={city}
            style={[
              styles.cardOption,
              {
                backgroundColor: t.background,
                borderColor: selected ? t.primary : t.primary + "33",
              },
            ]}
            onPress={() => onChange(city)}
            activeOpacity={0.7}
          >
            <Text style={[styles.cardOptionText, { color: t.textPrimary }]}>{city}</Text>
            <View style={[styles.radioCircle, { borderColor: selected ? t.primary : t.textSecondary + "55" }]}>
              {selected && <View style={[styles.radioFill, { backgroundColor: t.primary }]} />}
            </View>
          </TouchableOpacity>
        );
      })}
      <TextInput
        style={[
          styles.textInput,
          { backgroundColor: t.background, borderColor: t.primary + "55", color: t.textPrimary, marginTop: 8 },
        ]}
        placeholder="Or type a different city..."
        placeholderTextColor={t.textSecondary + "55"}
        value={!mockCities.includes(value) ? value : ""}
        onChangeText={onChange}
      />
    </View>
  );
}

/** Vertical Height Ruler Mock */
function HeightSliderInput({ question, value, onChange, t }: InputProps) {
  const heights = Array.from({ length: 111 }, (_, i) => 140 + i); // 140cm to 250cm
  
  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / 40);
    if (index >= 0 && index < heights.length) {
      const h = heights[index];
      const newValue = `${h} cm`;
      if (value !== newValue) {
        onChange(newValue);
      }
    }
  };

  return (
    <View style={{ height: 200, backgroundColor: t.background, borderRadius: 12, borderColor: t.primary + "33", borderWidth: 1, overflow: 'hidden' }}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        snapToInterval={40} 
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={{ height: 80 }} /> {/* Padding top */}
        {heights.map((h) => {
          const selected = value === `${h} cm`;
          return (
            <TouchableOpacity 
              key={h} 
              style={{ height: 40, justifyContent: 'center', alignItems: 'center' }}
              onPress={() => onChange(`${h} cm`)}
            >
              <Text style={{ 
                fontSize: selected ? 22 : 16, 
                color: selected ? t.primary : t.textSecondary + "55",
                fontFamily: selected ? "Lato_700Bold" : "Lato_400Regular"
              }}>
                {h} cm
              </Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 80 }} /> {/* Padding bottom */}
      </ScrollView>
      {/* Center highlight line */}
      <View style={{ position: 'absolute', top: 100, left: 0, right: 0, height: 1, backgroundColor: t.primary + "44", zIndex: -1 }} />
    </View>
  );
}

/** Budget slider for roommate category (₹2k – ₹1L) */
function SliderRangeInput({ question, value, onChange, t }: InputProps) {
  const parsed = (() => {
    if (value && typeof value === "object") return value;
    return { min: 2000, max: 30000 };
  })();

  const formatAmount = (n: number) =>
    n >= 100000 ? "₹1L" : n >= 1000 ? `₹${n / 1000}k` : `₹${n}`;

  return (
    <View style={{ gap: 16 }}>
      <View
        style={[
          styles.budgetDisplay,
          { backgroundColor: t.background, borderColor: t.primary + "44" },
        ]}
      >
        <Text style={[styles.budgetLabel, { color: t.textSecondary + "77" }]}>
          Selected Budget Range
        </Text>
        <Text style={[styles.budgetRange, { color: t.primary }]}>
          {formatAmount(parsed.min)} – {formatAmount(parsed.max)}
        </Text>
      </View>

      <View style={{ gap: 24, marginTop: 8 }}>
        {/* Min Slider */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 13, color: t.textSecondary, fontFamily: "Lato_400Regular" }}>Min Budget</Text>
            <Text style={{ fontSize: 13, color: t.primary, fontFamily: "PlayfairDisplay_700Bold" }}>{formatAmount(parsed.min)}</Text>
          </View>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={2000}
            maximumValue={100000}
            step={1000}
            value={parsed.min}
            onValueChange={(val) => {
              if (val > parsed.max) {
                onChange({ min: val, max: val });
              } else {
                onChange({ min: val, max: parsed.max });
              }
            }}
            minimumTrackTintColor={t.primary}
            maximumTrackTintColor={t.primary + "33"}
            thumbTintColor={t.primary}
          />
        </View>

        {/* Max Slider */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 13, color: t.textSecondary, fontFamily: "Lato_400Regular" }}>Max Budget</Text>
            <Text style={{ fontSize: 13, color: t.primary, fontFamily: "PlayfairDisplay_700Bold" }}>{formatAmount(parsed.max)}</Text>
          </View>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={2000}
            maximumValue={100000}
            step={1000}
            value={parsed.max}
            onValueChange={(val) => {
              if (val < parsed.min) {
                onChange({ min: val, max: val });
              } else {
                onChange({ min: parsed.min, max: val });
              }
            }}
            minimumTrackTintColor={t.primary}
            maximumTrackTintColor={t.primary + "33"}
            thumbTintColor={t.primary}
          />
        </View>
      </View>
    </View>
  );
}

// ─── Question Renderer ────────────────────────────────────────────────────────

function QuestionInput(props: InputProps) {
  switch (props.question.type) {
    case "select":
      return <SelectInput {...props} />;
    case "multiselect":
      return <MultiSelectInput {...props} />;
    case "date":
      return <DateInput {...props} />;
    case "file_upload":
      return <FileUploadMock {...props} />;
    case "slider_range":
      return <SliderRangeInput {...props} />;
    case "city_select":
      return <CitySelectInput {...props} />;
    case "height_slider":
      return <HeightSliderInput {...props} />;
    case "text":
    default:
      return <TextInput_ {...props} />;
  }
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function EditProfileStep() {
  const router = useRouter();
  const { step: stepParam } = useLocalSearchParams<{ step: string }>();
  const stepIndex = parseInt(stepParam ?? "0", 10);

  const category = useOnboardingStore((s) => s.category) ?? "Casual";
  const t = (theme as any)[category];
  const setOnboardingStatus = useAuthStore((s) => s.setOnboardingStatus);

  // Read onboarding-collected values for bridging
  const ob_firstName   = useOnboardingStore((s) => s.firstName);
  const ob_lastName    = useOnboardingStore((s) => s.lastName);
  const ob_dob         = useOnboardingStore((s) => s.dateOfBirth);
  const ob_gender      = useOnboardingStore((s) => s.gender);
  const setFirstName   = useOnboardingStore((s) => s.setFirstName);
  const setLastName    = useOnboardingStore((s) => s.setLastName);
  const setDateOfBirth = useOnboardingStore((s) => s.setDateOfBirth);
  const setGender      = useOnboardingStore((s) => s.setGender);

  const savedAnswers = useUserProfileStore((s) => s.answers);
  const setAnswer = useUserProfileStore((s) => s.setAnswer);

  const currentStep = getStep(category as any, stepIndex);
  const totalSteps = getTotalSteps(category as any);

  /**
   * Seed priority for overlapping fields (go_1/go_2/go_3):
   *   1. Already saved in userProfileStore  → use that
   *   2. Available in useOnboardingStore    → pre-fill from there
   *   3. null
   */
  const seedValue = (id: string): any => {
    if (savedAnswers[id] !== undefined && savedAnswers[id] !== null) return savedAnswers[id];
    if (id === 'go_1') return ob_firstName ? `${ob_firstName}${ob_lastName ? ' ' + ob_lastName : ''}` : null;
    if (id === 'go_2') return ob_dob ?? null;
    if (id === 'go_3') return ob_gender ?? null;
    return null;
  };

  // Local draft answers (committed on Next/Finish)
  const [draft, setDraft] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    if (currentStep) {
      currentStep.questions.forEach((q) => {
        init[q.id] = savedAnswers[q.id] ?? null;
      });
    }
    return init;
  });

  // Tracks whether the user hit Next without answering — triggers inline errors
  const [showErrors, setShowErrors] = useState(false);

  const progressPct = Math.round(((stepIndex + 1) / totalSteps) * 100);

  const handleChange = useCallback((questionId: string, value: any) => {
    setDraft((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  /**
   * Questions that MUST be answered before Next — file_upload is optional,
   * slider_range always has a default, everything else is required.
   */
  const isRequired = (q: ProfileQuestion): boolean =>
    q.type !== 'file_upload';

  const isAnswered = (id: string, val: any): boolean => {
    if (val === null || val === undefined) return false;
    if (typeof val === 'string' && val.trim() === '') return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  };

  const commitAndNavigate = (nextStep: number | "done") => {
    // ── Validate all required questions on this step ──
    const unanswered = (currentStep?.questions ?? []).filter(
      (q) => isRequired(q) && !isAnswered(q.id, draft[q.id])
    );

    if (unanswered.length > 0) {
      setShowErrors(true);
      return;
    }

    setShowErrors(false);

    // Persist draft answers to userProfileStore
    Object.entries(draft).forEach(([id, val]) => {
      if (val !== null && val !== undefined) setAnswer(id, val);
    });

    if (nextStep === "done") {
      // Mark onboarding as complete — this is critical for correct routing on restart
      setOnboardingStatus("COMPLETED");
      router.replace("/(tabs)/profile" as any);
    } else {
      router.push(`/profile/edit/${nextStep}` as any);
    }
  };

  const handleBack = () => {
    // Always pop the stack — works for hardware back button and on-screen button
    router.back();
  };

  if (!currentStep) {
    // Finished all steps
    return (
      <View style={[styles.master, { backgroundColor: t.background }]}>
        <View style={styles.doneContainer}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={[styles.doneTitle, { color: t.textSecondary }]}>
            Profile Complete!
          </Text>
          <Text style={[styles.doneSub, { color: t.textSecondary + "88" }]}>
            Your profile is all set. You're ready to connect.
          </Text>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: t.primary }]}
            onPress={() => router.replace("/(tabs)/profile" as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>View My Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isLastStep = stepIndex === totalSteps - 1;

  return (
    <KeyboardAvoidingView
      style={[styles.master, { backgroundColor: t.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Premium Top Bar ──────────────────────────────────── */}
      <SafeAreaView style={{ backgroundColor: t.background }}>
        <View
          style={[
            styles.topBar,
            { paddingTop: Platform.OS === "android" ? 48 : 12 },
          ]}
        >
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color={t.textPrimary} />
          </TouchableOpacity>

          <View style={styles.topCenter}>
            <Text style={[styles.stepCountPremium, { color: t.textSecondary }]}>
              STEP {stepIndex + 1} OF {totalSteps}
            </Text>
            <View style={styles.dotsContainer}>
              {Array.from({ length: totalSteps }).map((_, i) => {
                const isCompleted = i < stepIndex;
                const isCurrent = i === stepIndex;
                return (
                  <React.Fragment key={i}>
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor: isCompleted || isCurrent ? t.primary : t.primary + "33",
                          transform: [{ scale: isCurrent ? 1.2 : 1 }],
                        },
                      ]}
                    />
                    {i < totalSteps - 1 && (
                      <View
                        style={[
                          styles.dotLine,
                          { backgroundColor: isCompleted ? t.primary : t.primary + "33" },
                        ]}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          </View>

          <View style={styles.rightPlaceholder} />
        </View>
      </SafeAreaView>

      {/* ── Questions ─────────────────────────────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {currentStep.questions.map((q, qi) => {
          const hasError = showErrors && isRequired(q) && !isAnswered(q.id, draft[q.id]);
          return (
            <View
              key={q.id}
              style={[
                styles.questionBlock,
                { backgroundColor: t.secondary },
                hasError && { borderWidth: 1.5, borderColor: '#E53E3E' },
              ]}
            >
              {/* Question header */}
              <View style={styles.questionHeader}>
                <View
                  style={[
                    styles.qNumber,
                    { backgroundColor: hasError ? '#E53E3E22' : t.primary + '22' },
                  ]}
                >
                  <Text style={[styles.qNumberText, { color: hasError ? '#E53E3E' : t.primary }]}>
                    {qi + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.questionText, { color: t.textSecondary }]}>
                    {q.text}
                    {isRequired(q) && (
                      <Text style={{ color: '#E53E3E' }}> *</Text>
                    )}
                  </Text>
                  {q.description && (
                    <Text style={[styles.questionDesc, { color: t.textSecondary + '77' }]}>
                      {q.description}
                    </Text>
                  )}
                </View>
              </View>

              {/* Input */}
              <QuestionInput
                question={q}
                value={draft[q.id]}
                onChange={(v) => {
                  handleChange(q.id, v);
                  // Clear error for this field as soon as user gives an answer
                  if (showErrors && isAnswered(q.id, v)) setShowErrors(false);
                }}
                t={t}
              />

              {/* Inline error message */}
              {hasError && (
                <Text style={styles.errorText}>This field is required to continue</Text>
              )}
            </View>
          );
        })}

        <View style={{ height: 120 }} />

      </ScrollView>

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: t.background,
            borderTopColor: t.primary + "22",
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: t.primary }]}
          onPress={() =>
            commitAndNavigate(isLastStep ? "done" : stepIndex + 1)
          }
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {isLastStep ? "Finish" : "Next"}
          </Text>
          <Feather
            name={isLastStep ? "check" : "arrow-right"}
            size={18}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  master: { flex: 1 },

  /* TOP BAR */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  rightPlaceholder: {
    width: 40,
  },
  topCenter: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  stepCountPremium: {
    fontSize: 11,
    fontFamily: "Lato_700Bold",
    letterSpacing: 1.2,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotLine: {
    width: 24,
    height: 2,
    marginHorizontal: 4,
  },

  /* SCROLL */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 14,
  },

  /* QUESTION BLOCK */
  questionBlock: {
    borderRadius: 20,
    padding: 18,
    gap: 14,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  qNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  qNumberText: {
    fontSize: 13,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  questionText: {
    fontSize: 18,
    fontFamily: "Lato_700Bold",
    lineHeight: 26,
  },
  questionDesc: {
    fontSize: 12,
    fontFamily: "Lato_400Regular",
    marginTop: 3,
    lineHeight: 17,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Lato_400Regular",
    color: '#E53E3E',
    marginTop: 6,
  },

  charCount: {
    fontSize: 11,
    fontFamily: "Lato_400Regular",
    textAlign: "right",
    paddingRight: 4,
  },
  /* TEXT INPUT */
  textInput: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Lato_400Regular",
    minHeight: 52,
    textAlignVertical: "top",
  },

  /* OPTIONS */
  cardOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  cardOptionText: {
    fontSize: 15,
    fontFamily: "Lato_400Regular",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  radioFill: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },

  /* PHOTO GRID UPLOAD */
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  photoSlotContainer: {
    width: (width - 32 - 12 - 36) / 2, // Calculate width for 2 columns, accounting for padding
    gap: 8,
  },
  photoUploadBox: {
    height: 140,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  photoAddText: {
    fontSize: 12,
    fontFamily: "Lato_400Regular",
    marginTop: 8,
  },
  photoBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  photoBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  photoPlus: {
    position: "absolute",
    bottom: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  photoCaptionInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontFamily: "Lato_400Regular",
  },

  /* SLIDER RANGE */
  budgetDisplay: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  budgetLabel: {
    fontSize: 11,
    fontFamily: "Lato_400Regular",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  budgetRange: {
    fontSize: 22,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  presetLabel: {
    fontSize: 11,
    fontFamily: "Lato_400Regular",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  optionText: {
    fontSize: 13,
    fontFamily: "Lato_400Regular",
  },

  /* BOTTOM BAR */
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: Platform.OS === "android" ? 20 : 36,
    borderTopWidth: 1,
  },
  nextBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#fff",
    letterSpacing: 0.3,
  },

  /* DONE STATE */
  doneContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  doneEmoji: {
    fontSize: 60,
  },
  doneTitle: {
    fontSize: 26,
    fontFamily: "PlayfairDisplay_700Bold",
    textAlign: "center",
  },
  doneSub: {
    fontSize: 15,
    fontFamily: "Lato_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  doneBtn: {
    marginTop: 16,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
  },
  doneBtnText: {
    fontSize: 16,
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#fff",
  },
});
