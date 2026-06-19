import React, { useState, useCallback } from "react";
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
import {
  getStep,
  getTotalSteps,
  type ProfileQuestion,
  type EditStep,
} from "@/utils/profileHelpers";
import theme from "@/theme/theme";

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
      placeholder={question.description ?? `Enter ${question.text.toLowerCase()}…`}
      placeholderTextColor={t.textSecondary + "55"}
      multiline={question.type === "text" && question.text.startsWith("Prompt")}
      numberOfLines={question.text.startsWith("Prompt") ? 3 : 1}
      returnKeyType="done"
    />
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
    <View style={styles.optionsWrap}>
      {(question.options ?? []).map((opt) => {
        const selected = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            style={[
              styles.optionChip,
              {
                backgroundColor: selected ? t.primary : t.background,
                borderColor: selected ? t.primary : t.primary + "44",
              },
            ]}
            onPress={() => onChange(selected ? null : opt)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.optionText,
                { color: selected ? "#fff" : t.textSecondary },
              ]}
            >
              {opt}
            </Text>
            {selected && (
              <Feather
                name="check"
                size={12}
                color="#fff"
                style={{ marginLeft: 4 }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** Multi-select option chips */
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
    <View style={styles.optionsWrap}>
      {(question.options ?? []).map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <TouchableOpacity
            key={opt}
            style={[
              styles.optionChip,
              {
                backgroundColor: isSelected ? t.primary : t.background,
                borderColor: isSelected ? t.primary : t.primary + "44",
              },
            ]}
            onPress={() => toggle(opt)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.optionText,
                { color: isSelected ? "#fff" : t.textSecondary },
              ]}
            >
              {opt}
            </Text>
            {isSelected && (
              <Feather
                name="check"
                size={12}
                color="#fff"
                style={{ marginLeft: 4 }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** Mock photo upload — shows placeholder, doesn't actually upload */
function FileUploadMock({ question, value, onChange, t }: InputProps) {
  return (
    <View
      style={[
        styles.uploadBox,
        { borderColor: t.primary + "55", backgroundColor: t.background },
      ]}
    >
      <Feather name="camera" size={32} color={t.primary + "99"} />
      <Text style={[styles.uploadTitle, { color: t.textSecondary }]}>
        Upload Photos
      </Text>
      <Text style={[styles.uploadSub, { color: t.textSecondary + "77" }]}>
        {question.description ?? "Upload 3-5 photos"}
      </Text>
      <TouchableOpacity
        style={[styles.uploadBtn, { backgroundColor: t.primary + "22", borderColor: t.primary + "44" }]}
        onPress={() => onChange("mock_uploaded")}
        activeOpacity={0.75}
      >
        <Text style={[styles.uploadBtnText, { color: t.primary }]}>
          {value ? "✓ Photos selected (mock)" : "Select Photos"}
        </Text>
      </TouchableOpacity>
      <Text style={[styles.uploadNote, { color: t.textSecondary + "55" }]}>
        Photo upload will be enabled when backend is ready
      </Text>
    </View>
  );
}

/** Budget slider for roommate category (₹2k – ₹1L) */
function SliderRangeInput({ question, value, onChange, t }: InputProps) {
  const parsed = (() => {
    if (value && typeof value === "object") return value;
    return { min: BUDGET_MIN, max: 30000 };
  })();

  const steps = Array.from({ length: BUDGET_STEPS + 1 }, (_, i) => BUDGET_MIN + i * BUDGET_STEP_SIZE);
  const commonPresets = [
    { label: "₹2k–₹5k", min: 2000, max: 5000 },
    { label: "₹5k–₹15k", min: 5000, max: 15000 },
    { label: "₹15k–₹30k", min: 15000, max: 30000 },
    { label: "₹30k–₹50k", min: 30000, max: 50000 },
    { label: "₹50k–₹1L", min: 50000, max: 100000 },
  ];

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

      <Text style={[styles.presetLabel, { color: t.textSecondary + "77" }]}>
        Quick select
      </Text>
      <View style={styles.optionsWrap}>
        {commonPresets.map((p) => {
          const selected = parsed.min === p.min && parsed.max === p.max;
          return (
            <TouchableOpacity
              key={p.label}
              style={[
                styles.optionChip,
                {
                  backgroundColor: selected ? t.primary : t.background,
                  borderColor: selected ? t.primary : t.primary + "44",
                },
              ]}
              onPress={() => onChange({ min: p.min, max: p.max })}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: selected ? "#fff" : t.textSecondary },
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
      return; // Block navigation
    }

    setShowErrors(false);

    // Persist draft answers to userProfileStore
    Object.entries(draft).forEach(([id, val]) => {
      if (val !== null && val !== undefined) setAnswer(id, val);
    });

    if (nextStep === "done") {
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

      {/* ── Top Bar ──────────────────────────────────────────── */}
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
            <Feather name="arrow-left" size={22} color={t.textSecondary} />
          </TouchableOpacity>

          <View style={styles.topCenter}>
            <Text style={[styles.stepLabel, { color: t.textSecondary + "88" }]}>
              {currentStep.label}
            </Text>
            <Text style={[styles.stepCount, { color: t.textSecondary + "66" }]}>
              Step {stepIndex + 1} of {totalSteps}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => commitAndNavigate(isLastStep ? "done" : stepIndex + 1)}
            activeOpacity={0.7}
          >
            <Text style={[styles.skipText, { color: t.primary + "aa" }]}>
              Skip
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View
            style={[styles.progressTrack, { backgroundColor: t.primary + "22" }]}
          >
            <View
              style={[
                styles.progressFill,
                { backgroundColor: t.primary, width: `${progressPct}%` },
              ]}
            />
          </View>
          <Text style={[styles.progressPct, { color: t.primary }]}>
            {progressPct}%
          </Text>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  topCenter: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 14,
    fontFamily: "Outfit_600SemiBold",
  },
  stepCount: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    marginTop: 1,
  },
  skipText: {
    fontSize: 14,
    fontFamily: "Outfit_500Medium",
  },

  /* PROGRESS */
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressPct: {
    fontSize: 12,
    fontFamily: "Outfit_600SemiBold",
    minWidth: 36,
    textAlign: "right",
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
    fontFamily: "Outfit_700Bold",
  },
  questionText: {
    fontSize: 15,
    fontFamily: "Outfit_600SemiBold",
    lineHeight: 22,
  },
  questionDesc: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    marginTop: 3,
    lineHeight: 17,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Outfit_500Medium",
    color: '#E53E3E',
    marginTop: 6,
  },

  /* TEXT INPUT */
  textInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    minHeight: 46,
    textAlignVertical: "top",
  },

  /* OPTIONS */
  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1.5,
  },
  optionText: {
    fontSize: 13,
    fontFamily: "Outfit_500Medium",
  },

  /* FILE UPLOAD MOCK */
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    gap: 10,
  },
  uploadTitle: {
    fontSize: 16,
    fontFamily: "Outfit_600SemiBold",
  },
  uploadSub: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    textAlign: "center",
  },
  uploadBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  uploadBtnText: {
    fontSize: 14,
    fontFamily: "Outfit_500Medium",
  },
  uploadNote: {
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
    textAlign: "center",
    marginTop: 4,
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
    fontFamily: "Outfit_400Regular",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  budgetRange: {
    fontSize: 22,
    fontFamily: "Outfit_700Bold",
  },
  presetLabel: {
    fontSize: 11,
    fontFamily: "Outfit_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.6,
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
    fontFamily: "Outfit_700Bold",
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
    fontFamily: "Outfit_700Bold",
    textAlign: "center",
  },
  doneSub: {
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
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
    fontFamily: "Outfit_700Bold",
    color: "#fff",
  },
});
