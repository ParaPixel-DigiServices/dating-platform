import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import Animated, {
  FadeInRight,
  FadeOutLeft,
  FadeInLeft,
  FadeOutRight,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { useAuthStore } from "@/hooks/useAuthStore";
import { updateProfile } from "@/services/backendService";
import theme from "@/theme/theme";
import * as Haptics from "expo-haptics";


// Dynamic questions will be fetched from backend based on category

export default function ProfileCompletionScreen() {
  const router = useRouter();
  const category = useOnboardingStore((s) => s.category) ?? "Love";
  const { setOnboardingStep } = useAuthStore();
  const themeObj = (theme as any).default || theme;
  const t = themeObj[category] || themeObj.onboarding;

  const [schemaQuestions, setSchemaQuestions] = useState<any[]>([]);
  const [isFetchingSchema, setIsFetchingSchema] = useState(true);

  React.useEffect(() => {
    async function loadSchema() {
      try {
        const { getOnboardingFields } = await import("@/services/backendService");
        const res = await getOnboardingFields();
        if (res.success && res.data) {
          const mapped = res.data.map((f: any) => ({
            id: f.key,
            category: "Compatibility",
            question: f.question,
            options: f.options.map((opt: string) => ({
              label: opt.replace(/_/g, ' '),
              value: opt
            }))
          }));
          setSchemaQuestions(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch schema", err);
      } finally {
        setIsFetchingSchema(false);
      }
    }
    loadSchema();
  }, []);

  const ALL_QUESTIONS = useMemo(() => {
    return [...schemaQuestions];
  }, [schemaQuestions]);

  const TOTAL = ALL_QUESTIONS.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isFetchingSchema) {
    return (
      <View style={[styles.container, { backgroundColor: t.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={t.primary} />
        <Text style={{ color: t.textSecondary, marginTop: 16 }}>Loading personalized questions...</Text>
      </View>
    );
  }

  if (!isFetchingSchema && ALL_QUESTIONS.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: t.background, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }]}>
        <Feather name="check-circle" size={64} color={t.primary} />
        <Text style={{ color: t.textPrimary, fontSize: 24, fontFamily: 'PlayfairDisplay_700Bold', marginTop: 24, textAlign: 'center' }}>All caught up!</Text>
        <Text style={{ color: t.textSecondary, marginTop: 12, textAlign: 'center', opacity: 0.8, lineHeight: 22 }}>
          You have already answered all the profiling questions.
        </Text>
        <TouchableOpacity 
          style={{ marginTop: 32, paddingVertical: 16, paddingHorizontal: 32, backgroundColor: t.primary, borderRadius: 24 }} 
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#1E1410', fontFamily: 'Lato_700Bold', fontSize: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const question = ALL_QUESTIONS[currentIndex];
  const isLast = currentIndex === TOTAL - 1;
  const answeredCount = Object.keys(answers).length;
  const pct = TOTAL > 0 ? Math.round(((answeredCount) / TOTAL) * 100) : 0;

  const currentAnswer = answers[question.id];

  const handleSelect = (value: any) => {
    Haptics.selectionAsync();
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  };

  const handleNext = async () => {
    if (currentAnswer === undefined) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isLast) {
      setIsSubmitting(true);
      try {
        await updateProfile(answers);
        setOnboardingStep('CATEGORY_DONE'); // Updates layout router
        router.replace("/(tabs)/home");
      } catch (err) {
        console.error("Failed to update profile", err);
        setIsSubmitting(false);
      }
    } else {
      setDirection("forward");
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex === 0) {
      router.back();
    } else {
      setDirection("back");
      setCurrentIndex((i) => i - 1);
    }
  };

  const enterAnim = direction === "forward" ? FadeInRight.duration(260) : FadeInLeft.duration(260);
  const exitAnim = direction === "forward" ? FadeOutLeft.duration(200) : FadeOutRight.duration(200);

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Header ── */}
      <SafeAreaView style={[styles.headerSafe, { backgroundColor: t.background }]}>
        <View style={[styles.headerBar, { paddingTop: Platform.OS === "android" ? 48 : 12 }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7} disabled={isSubmitting}>
            <Feather name="arrow-left" size={22} color={t.textSecondary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: t.textSecondary }]}>Complete Your Profile</Text>
            <Text style={[styles.headerSub, { color: t.textSecondary + "77" }]}>
              {pct}% complete · Question {currentIndex + 1} of {TOTAL}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: t.primary + "22" }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: t.primary, width: `${((currentIndex + 1) / TOTAL) * 100}%` },
            ]}
          />
        </View>
      </SafeAreaView>

      {/* ── Question Card ── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View key={`card-${currentIndex}`} entering={enterAnim} exiting={exitAnim}>
          {/* Category badge */}
          <View style={[styles.categoryBadgeWrap, { backgroundColor: t.secondary }]}>
            <View style={[styles.categoryDot, { backgroundColor: t.primary }]} />
            <Text style={[styles.categoryText, { color: t.primary }]}>{question.category}</Text>
          </View>

          {/* Question */}
          <View style={[styles.questionCard, { backgroundColor: t.secondary }]}>
            <Text style={[styles.questionText, { color: t.textSecondary }]}>
              {question.question}
            </Text>

            <View style={styles.optionsList}>
              {question.options.map((option, idx) => {
                const isSelected = currentAnswer === option.value;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.optionRow,
                      {
                        borderColor: isSelected ? t.primary : t.primary + "22",
                        backgroundColor: isSelected ? t.primary + "18" : "transparent",
                      },
                    ]}
                    onPress={() => handleSelect(option.value)}
                    activeOpacity={0.75}
                    disabled={isSubmitting}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        { borderColor: isSelected ? t.primary : t.textSecondary + "55" },
                      ]}
                    >
                      {isSelected && (
                        <View style={[styles.radioInner, { backgroundColor: t.primary }]} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.optionLabel,
                        { color: isSelected ? t.textSecondary : t.textSecondary + "99" },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {isSelected && (
                      <Feather name="check" size={16} color={t.primary} style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* Spacer for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Next / Complete Button ── */}
      <View style={[styles.footer, { backgroundColor: t.background }]}>
        <TouchableOpacity
          style={[
            styles.nextBtn,
            { backgroundColor: currentAnswer !== undefined && !isSubmitting ? t.primary : t.primary + "33" },
          ]}
          onPress={handleNext}
          disabled={currentAnswer === undefined || isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color={t.buttonText ?? "#2D211C"} />
          ) : (
            <>
              <Text
                style={[
                  styles.nextBtnText,
                  { color: currentAnswer !== undefined ? t.buttonText ?? "#2D211C" : t.textSecondary + "55" },
                ]}
              >
                {isLast ? "Complete Profile & Submit" : "Next Question"}
              </Text>
              <Feather
                name={isLast ? "check-circle" : "arrow-right"}
                size={18}
                color={currentAnswer !== undefined ? t.buttonText ?? "#2D211C" : t.textSecondary + "55"}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  headerSafe: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: { flex: 1 },
  headerTitle: {
    fontSize: 17,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Lato_400Regular",
    marginTop: 2,
  },
  progressTrack: {
    height: 3,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Category badge
  categoryBadgeWrap: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 12,
  },
  categoryDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: "Lato_700Bold",
    letterSpacing: 0.8,
  },

  // Question card
  questionCard: {
    borderRadius: 20,
    padding: 20,
  },
  questionText: {
    fontSize: 20,
    fontFamily: "PlayfairDisplay_700Bold",
    lineHeight: 30,
    marginBottom: 24,
  },
  optionsList: { gap: 10 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Lato_400Regular",
    lineHeight: 22,
  },
  checkIcon: {
    flexShrink: 0,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: "Lato_700Bold",
  },
});
