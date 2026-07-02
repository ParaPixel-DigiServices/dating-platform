/**
 * Profile Completion V2 — "Old UI" style
 * Same 25 MCQ questions (3 basic + 22 personality) but
 * rendered with the app's existing dark-card theme aesthetic.
 */
import React, { useState } from "react";
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
} from "react-native";
import Animated, {
  FadeInRight,
  FadeOutLeft,
  FadeInLeft,
  FadeOutRight,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useProfileCompletionStore } from "@/hooks/useProfileCompletionStore";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import theme from "@/theme/theme";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

// ── All 25 questions (same as V1) ─────────────────────────────────────────────
const ALL_QUESTIONS: {
  id: string;
  category: string;
  question: string;
  options: string[];
}[] = [
  // Basic Info (3)
  {
    id: "basic_height",
    category: "Basic Info",
    question: "What is your height?",
    options: ["Below 5'2\"", "5'2\" – 5'5\"", "5'5\" – 5'8\"", "5'8\" – 6'0\"", "Above 6'0\""],
  },
  {
    id: "basic_education",
    category: "Basic Info",
    question: "What is your highest level of education?",
    options: ["High School", "Bachelor's Degree", "Master's Degree", "Doctorate / PhD", "Prefer not to say"],
  },
  {
    id: "basic_occupation",
    category: "Basic Info",
    question: "What best describes your occupation?",
    options: ["Student", "Working professional", "Self-employed / Entrepreneur", "Creative / Artist", "Other"],
  },
  // Personality Traits (4)
  {
    id: "pt1",
    category: "Personality",
    question: "In social situations, you tend to be:",
    options: ["The life of the party", "Warm and approachable", "Thoughtful and observant", "Reserved but genuine"],
  },
  {
    id: "pt2",
    category: "Personality",
    question: "When facing a difficult decision, you typically:",
    options: ["Trust your gut instinct", "Weigh every option carefully", "Seek advice from others", "Sleep on it first"],
  },
  {
    id: "pt3",
    category: "Personality",
    question: "Your friends would describe you as:",
    options: ["Adventurous and bold", "Creative and thoughtful", "Loyal and dependable", "Caring and empathetic"],
  },
  {
    id: "pt4",
    category: "Personality",
    question: "On a free afternoon, you are most likely to:",
    options: ["Try something new outdoors", "Dive into a book or podcast", "Cook or create something", "Catch up with close friends"],
  },
  // Communication Style (3)
  {
    id: "cs1",
    category: "Communication",
    question: "When you have something important to say, you prefer to:",
    options: ["Say it directly and honestly", "Write it down first", "Have a calm, planned conversation", "Show through actions instead"],
  },
  {
    id: "cs2",
    category: "Communication",
    question: "During a disagreement, your instinct is to:",
    options: ["Resolve it immediately", "Take space, then talk", "Listen fully before responding", "Find a compromise quickly"],
  },
  {
    id: "cs3",
    category: "Communication",
    question: "You feel most heard when someone:",
    options: ["Responds with thoughtful words", "Gives their undivided attention", "Validates your feelings first", "Offers practical solutions"],
  },
  // Core Values (4)
  {
    id: "cv1",
    category: "Values",
    question: "Which value is most important to you in a relationship?",
    options: ["Honesty above all", "Deep emotional connection", "Shared ambitions", "Mutual respect and space"],
  },
  {
    id: "cv2",
    category: "Values",
    question: "Family, to you, means:",
    options: ["My top priority always", "Important but balanced with independence", "Something I am building towards", "A chosen circle of trust"],
  },
  {
    id: "cv3",
    category: "Values",
    question: "How important is personal growth to you?",
    options: ["It defines who I am", "Very important but balanced", "I am focused on stability", "I grow through relationships"],
  },
  {
    id: "cv4",
    category: "Values",
    question: "When you imagine your future, it looks like:",
    options: ["A meaningful career and purpose", "A loving home and family", "Travel and new experiences", "Deep friendships and community"],
  },
  // Life Goals (3)
  {
    id: "lg1",
    category: "Life Goals",
    question: "Your long-term goal is:",
    options: ["Build a lasting legacy", "Create a loving family", "Explore the world freely", "Achieve financial freedom"],
  },
  {
    id: "lg2",
    category: "Life Goals",
    question: "Where do you see yourself in 5 years?",
    options: ["Settled and content", "Still exploring and growing", "Running my own venture", "In a deeply committed partnership"],
  },
  {
    id: "lg3",
    category: "Life Goals",
    question: "What does success mean to you?",
    options: ["Making a meaningful impact", "Happiness over achievement", "Financial independence", "Strong relationships"],
  },
  // Lifestyle & Habits (4)
  {
    id: "lh1",
    category: "Lifestyle",
    question: "Your ideal living situation is:",
    options: ["City life with all its energy", "Calm suburbs close to nature", "Anywhere with the right person", "A creative, cozy home"],
  },
  {
    id: "lh2",
    category: "Lifestyle",
    question: "How often do you enjoy going out?",
    options: ["Every weekend, social is my fuel", "A few times a month", "Occasionally, I prefer home", "Only for meaningful events"],
  },
  {
    id: "lh3",
    category: "Lifestyle",
    question: "Your relationship with fitness is:",
    options: ["Daily — it is a lifestyle", "Regular workout routine", "Casual walks and activities", "Not a priority right now"],
  },
  {
    id: "lh4",
    category: "Lifestyle",
    question: "When it comes to finances:",
    options: ["I save diligently and plan", "I balance saving and enjoying", "I live in the moment", "I am still figuring it out"],
  },
  // Love Language (2)
  {
    id: "ll1",
    category: "Love Language",
    question: "You feel most loved when your partner:",
    options: ["Says kind, affirming words", "Spends quality time with you", "Does small acts of service", "Gives thoughtful gifts"],
  },
  {
    id: "ll2",
    category: "Love Language",
    question: "You express love best through:",
    options: ["Words and deep conversations", "Being fully present", "Taking care of details", "Planning surprises"],
  },
  // Deal Breakers (2)
  {
    id: "db1",
    category: "Deal Breakers",
    question: "Your biggest deal breaker in a relationship is:",
    options: ["Dishonesty or broken trust", "Emotional unavailability", "Lack of ambition", "Different life goals"],
  },
  {
    id: "db2",
    category: "Deal Breakers",
    question: "In a partner, you cannot compromise on:",
    options: ["Kindness and empathy", "Intellectual curiosity", "Family values alignment", "Mutual respect"],
  },
];

const TOTAL = ALL_QUESTIONS.length;

export default function ProfileCompletionV2Screen() {
  const router = useRouter();
  const category = useOnboardingStore((s) => s.category) ?? "Love";
  const themeObj = (theme as any).default || theme;
  const t = themeObj[category] || themeObj.onboarding;

  const { setAnswer, markProfileCompleted, profileAnswers } = useProfileCompletionStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const question = ALL_QUESTIONS[currentIndex];
  const isLast = currentIndex === TOTAL - 1;
  const answeredCount = Object.keys(profileAnswers).length;
  const pct = Math.round(((answeredCount) / TOTAL) * 100);

  const handleSelect = (option: string) => {
    Haptics.selectionAsync();
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (!selectedOption) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswer(question.id, selectedOption);
    if (isLast) {
      markProfileCompleted();
      router.back();
    } else {
      setDirection("forward");
      setSelectedOption(null);
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex === 0) {
      router.back();
    } else {
      setDirection("back");
      setSelectedOption(null);
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
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
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
                const isSelected = selectedOption === option;
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
                    onPress={() => handleSelect(option)}
                    activeOpacity={0.75}
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
                      {option}
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
            { backgroundColor: selectedOption ? t.primary : t.primary + "33" },
          ]}
          onPress={handleNext}
          disabled={!selectedOption}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.nextBtnText,
              { color: selectedOption ? t.buttonText ?? "#2D211C" : t.textSecondary + "55" },
            ]}
          >
            {isLast ? "Complete Profile" : "Next Question"}
          </Text>
          <Feather
            name={isLast ? "check-circle" : "arrow-right"}
            size={18}
            color={selectedOption ? t.buttonText ?? "#2D211C" : t.textSecondary + "55"}
          />
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
