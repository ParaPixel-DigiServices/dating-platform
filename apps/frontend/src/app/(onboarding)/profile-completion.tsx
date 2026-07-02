import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Image,
} from "react-native";
import Animated, {
  FadeInRight,
  FadeOutLeft,
  FadeInLeft,
  FadeOutRight,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProfileCompletionStore } from "@/hooks/useProfileCompletionStore";
import * as Haptics from "expo-haptics";

const { height } = Dimensions.get("window");

const COLORS = {
  primary: "#e5b399",
  bgBase: "#0f1012",
  warmIvory: "#FFF5EC",
  softBeige: "#D8C5B5",
  buttonText: "#2D211C",
  textSecondary: "rgba(255,245,236, 0.55)",
};

const BgImg = require("@/assets/images/bg.png");

// ── All questions: 3 basic + 22 personality ──────────────────────────────────
const ALL_QUESTIONS: {
  id: string;
  category: string;
  question: string;
  options: string[];
}[] = [
  // ── Basic Info (3) ──
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
  // ── Personality Traits (4) ──
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
  // ── Communication Style (3) ──
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
  // ── Core Values (4) ──
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
  // ── Life Goals (3) ──
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
  // ── Lifestyle & Habits (4) ──
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
  // ── Love Language (2) ──
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
  // ── Deal Breakers (2) ──
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

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ answered, total }: { answered: number; total: number }) {
  const pct = Math.round((answered / total) * 100);
  return (
    <View style={pStyles.wrap}>
      <View style={pStyles.track}>
        <View style={[pStyles.fill, { width: `${(answered / total) * 100}%` }]} />
      </View>
      <Text style={pStyles.label}>{pct}%</Text>
    </View>
  );
}
const pStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  track: { flex: 1, height: 3, backgroundColor: "rgba(255,245,236,0.12)", borderRadius: 2 },
  fill: { height: 3, backgroundColor: COLORS.primary, borderRadius: 2 },
  label: { fontSize: 12, color: COLORS.primary, fontWeight: "700", minWidth: 32, textAlign: "right" },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function ProfileCompletionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setAnswer, markProfileCompleted, profileAnswers } = useProfileCompletionStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const question = ALL_QUESTIONS[currentIndex];
  const isLast = currentIndex === TOTAL - 1;
  const answeredCount = Object.keys(profileAnswers).length;

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

  const isBasic = question.category === "Basic Info";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background */}
      <View style={StyleSheet.absoluteFillObject}>
        <Image source={BgImg} style={styles.bg} resizeMode="cover" />
        <LinearGradient
          colors={["rgba(15,16,18,0.55)", "rgba(15,16,18,0.9)", COLORS.bgBase]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={COLORS.warmIvory} />
        </TouchableOpacity>
        <ProgressBar answered={Math.min(answeredCount + 1, TOTAL)} total={TOTAL} />
        <Text style={styles.counter}>{currentIndex + 1}/{TOTAL}</Text>
      </View>

      {/* Question area */}
      <View style={styles.body}>
        <Animated.View key={`q-${currentIndex}`} entering={enterAnim} exiting={exitAnim} style={styles.questionArea}>
          {isBasic && (
            <View style={styles.basicBadge}>
              <Text style={styles.basicBadgeText}>Basic Info</Text>
            </View>
          )}
          <Text style={styles.categoryLabel}>{question.category}</Text>
          <Text style={styles.questionText}>{question.question}</Text>
        </Animated.View>

        <Animated.View key={`o-${currentIndex}`} entering={enterAnim} exiting={exitAnim} style={styles.optionsArea}>
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => handleSelect(option)}
                activeOpacity={0.8}
              >
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <TouchableOpacity
          style={[styles.nextBtn, !selectedOption && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!selectedOption}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={selectedOption ? ["#f2c7aa", "#e5b399", "#f2c7aa"] : ["#3a2a20", "#2a1e16"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextBtnGradient}
          >
            <Text style={[styles.nextBtnText, !selectedOption && styles.nextBtnTextDisabled]}>
              {isLast ? "Complete Profile" : "Next"}
            </Text>
            <Feather
              name={isLast ? "check" : "arrow-right"}
              size={20}
              color={selectedOption ? COLORS.buttonText : "rgba(255,245,236,0.3)"}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgBase },
  bg: { width: "100%", height: "100%" },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,245,236,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  counter: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
    minWidth: 36,
    textAlign: "right",
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  questionArea: { marginBottom: 32 },
  basicBadge: {
    alignSelf: "flex-start",
    backgroundColor: `${COLORS.primary}20`,
    borderWidth: 1,
    borderColor: `${COLORS.primary}50`,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 14,
  },
  basicBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.warmIvory,
    lineHeight: 34,
    fontFamily: Platform.select({ ios: "Times New Roman", android: "serif" }),
  },
  optionsArea: { gap: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,245,236,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,245,236,0.1)",
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 18,
    gap: 14,
  },
  optionSelected: {
    backgroundColor: "rgba(229,179,153,0.12)",
    borderColor: COLORS.primary,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "rgba(255,245,236,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: { borderColor: COLORS.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    fontSize: 15,
    color: COLORS.softBeige,
    flex: 1,
    lineHeight: 22,
  },
  optionTextSelected: {
    color: COLORS.warmIvory,
    fontWeight: "600",
  },
  footer: { paddingHorizontal: 24, paddingTop: 16 },
  nextBtn: { borderRadius: 32, overflow: "hidden" },
  nextBtnDisabled: { opacity: 0.55 },
  nextBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  nextBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.buttonText,
  },
  nextBtnTextDisabled: { color: "rgba(255,245,236,0.3)" },
});
