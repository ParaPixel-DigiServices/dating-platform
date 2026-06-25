import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import {
  ChevronLeft,
  Heart,
  Target,
  Coffee,
  Home,
  ArrowRight,
  Zap,
  Eye,
  RefreshCw,
  Sun,
  Moon,
  Star,
  Flame,
} from "lucide-react-native";
import { useRouter } from "expo-router";

import CategoryCard from "@/components/onboarding/CategoryCard";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { useAuthStore } from "@/hooks/useAuthStore";
import { OnboardingTopBar } from "@/components/onboarding/OnboardingTopBar";
import * as Haptics from "expo-haptics";
const BgImg = require("@/assets/images/bg.png");

const { width, height } = Dimensions.get("window");

// --- Shared Constants ---
const COLORS = {
  primary: "#e5b399",
  primaryLight: "#f1cdb1",
  bgBase: "#0f1012",
  warmIvory: "#FFF5EC",
  softBeige: "#D8C5B5",
  buttonText: "#2D211C",
  textSecondary: "rgba(255,245,236, 0.55)",
};

const SPACING = { s: 8, m: 12, l: 16, xl: 24, xxl: 32, xxxl: 48 };
const RADIUS = { button: 32 };

const FONTS = {
  serif: Platform.select({ ios: "Times New Roman", android: "serif" }),
  sans: Platform.select({ ios: "Helvetica Neue", android: "sans-serif" }),
};

// --- Category Options ---
const OPTIONS = [
  {
    id: "love",
    title: "Love",
    subtitle: "Looking for a meaningful connection.",
    icon: Heart,
    redirectPath: "/flow/love",
    categoryKey: "Love",
  },
  {
    id: "marriage",
    title: "Marriage",
    subtitle: "Ready for a committed and lifelong partnership.",
    icon: Target,
    redirectPath: "/flow/marriage",
    categoryKey: "Marriage",
  },
];

// --- Sub-category Options (keyed by parent category id) ---
const SUB_OPTIONS: Record<
  string,
  { id: string; title: string; subtitle: string; icon: any }[]
> = {
  love: [
    {
      id: "spark",
      title: "Spark",
      subtitle: "An instant chemistry that lights the way.",
      icon: Zap,
    },
    {
      id: "insights",
      title: "Insights",
      subtitle: "Deep conversations and emotional depth.",
      icon: Eye,
    },
    {
      id: "synchronization",
      title: "Synchronization",
      subtitle: "Shared values, pace, and life goals.",
      icon: RefreshCw,
    },
  ],
  marriage: [
    {
      id: "hindu",
      title: "Hindu",
      subtitle: "Rooted in culture, tradition & family.",
      icon: Sun,
    },
    {
      id: "muslim",
      title: "Muslim",
      subtitle: "Guided by faith, values & commitment.",
      icon: Moon,
    },
    {
      id: "christian",
      title: "Christian",
      subtitle: "United in love, faith & shared beliefs.",
      icon: Star,
    },
  ],
};

// ── Continue Button ───────────────────────────────────────────────────────────
const ContinueButton = ({
  onPress,
  loading,
}: {
  onPress: () => void;
  loading: boolean;
}) => (
  <Animated.View entering={FadeInDown.delay(600).duration(500).springify()}>
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={loading ? 1 : 0.85}
      style={styles.buttonWrapper}
      disabled={loading}
    >
      <LinearGradient
        colors={["#f2c7aa", "#e5b399", "#f2c7aa"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.buttonGradient}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.buttonText} />
        ) : (
          <>
            <Text style={styles.buttonText}>Continue</Text>
            <ArrowRight
              color={COLORS.buttonText}
              size={20}
              strokeWidth={1.2}
              style={styles.buttonIcon}
            />
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  </Animated.View>
);

// ── Screen ────────────────────────────────────────────────────────────────────
export default function Landing() {
  const router = useRouter();
  const setCategory = useOnboardingStore((s) => s.setCategory);
  const setSubCategory = useOnboardingStore((s) => s.setSubCategory);
  const setOnboardingStatus = useAuthStore((s) => s.setOnboardingStatus);

  // Which step we're on
  const [step, setStep] = useState<"category" | "subCategory">("category");

  // Selections
  const [selectedItem, setSelectedItem] = useState<(typeof OPTIONS)[0] | null>(
    null,
  );
  const [selectedSubItem, setSelectedSubItem] = useState<{
    id: string;
    title: string;
    subtitle: string;
    icon: any;
  } | null>(null);

  // Button loading state (shown during transition)
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === "category") {
      if (!selectedItem) return;
      // Show loading on button, then slide to sub-category step
      setIsTransitioning(true);
      setTimeout(() => {
        setStep("subCategory");
        setIsTransitioning(false);
      }, 500);
    } else {
      // Sub-category step — save both and go home
      if (!selectedSubItem) return;
      setCategory(selectedItem!.categoryKey as any);
      setSubCategory(selectedSubItem.id);
      
      // Update global auth state to confirm onboarding completion
      setOnboardingStatus("COMPLETED");

      // Redirect to index which will now correctly route to /(tabs)/home
      router.replace("/");
    }
  };

  const currentSubOptions = selectedItem
    ? (SUB_OPTIONS[selectedItem.id] ?? [])
    : [];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* ── Background Layers (always visible, never slides) ── */}
      <View style={styles.absoluteFill}>
        <Image
          source={BgImg}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "#e5b499", opacity: 0.1 },
          ]}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: COLORS.bgBase, opacity: 0.5 },
          ]}
        />
        <LinearGradient
          colors={[
            "rgba(15, 16, 18, 0)",
            "rgba(15, 16, 18, 0.8)",
            COLORS.bgBase,
          ]}
          locations={[0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          {/* ── Progress Bar (stays fixed across both steps) ── */}
          <OnboardingTopBar
            step={step === "category" ? 3 : 4}
            onBack={() => {
              if (step === "subCategory") {
                setStep("category");
                setSelectedSubItem(null);
              } else {
                router.back();
              }
            }}
          />

          {/* ── Spacer ── */}
          <View
            style={{
              height: step === "category" ? height * 0.3 : height * 0.23,
            }}
          />

          {/* ── Sliding Content Area ── */}
          <View style={styles.slidingArea}>
            {step === "category" ? (
              // ── STEP 1: Category selection ──
              <Animated.View
                key="category-step"
                exiting={SlideOutLeft.duration(320)}
                style={styles.stepContent}
              >
                <View style={styles.headerTextContainer}>
                  <Animated.Text
                    entering={FadeInDown.delay(200).duration(600)}
                    style={styles.headline}
                  >
                    What are you{"\n"}looking for?
                  </Animated.Text>
                  <Animated.Text
                    entering={FadeInDown.delay(300).duration(600)}
                    style={styles.subHeadline}
                  >
                    Choose what fits you best.
                  </Animated.Text>
                </View>

                <View style={styles.optionsContainer}>
                  {OPTIONS.map((item, index) => (
                    <CategoryCard
                      key={item.id}
                      item={item}
                      index={index}
                      isSelected={selectedItem?.id === item.id}
                      cardHeight={100}
                      onPress={(selectedOption: any) =>
                        setSelectedItem(selectedOption)
                      }
                    />
                  ))}
                </View>
              </Animated.View>
            ) : (
              // ── STEP 2: Sub-category selection ──
              <Animated.View
                key="subcategory-step"
                entering={SlideInRight.duration(350)}
                style={styles.stepContent}
              >
                <View style={styles.headerTextContainer}>
                  <Animated.Text
                    entering={FadeInDown.delay(100).duration(500)}
                    style={styles.headline}
                  >
                    {selectedItem?.id === "love"
                      ? "What kind of\nconnection?"
                      : "Choose your\ncommunity."}
                  </Animated.Text>
                  <Animated.Text
                    entering={FadeInDown.delay(200).duration(500)}
                    style={styles.subHeadline}
                  >
                    Pick what resonates with you.
                  </Animated.Text>
                </View>

                <View style={styles.optionsContainer}>
                  {currentSubOptions.map((item, index) => (
                    <CategoryCard
                      key={item.id}
                      item={item}
                      index={index}
                      isSelected={selectedSubItem?.id === item.id}
                      cardHeight={80}
                      onPress={(selected: any) => setSelectedSubItem(selected)}
                    />
                  ))}
                </View>
              </Animated.View>
            )}
          </View>
        </View>

        {/* ── Footer / CTA (stays fixed) ── */}
        <View style={styles.footerContainer}>
          <ContinueButton onPress={handleContinue} loading={isTransitioning} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  absoluteFill: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  backgroundImage: { width: width, height: height * 0.7, opacity: 1 },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    borderWidth: 1,
  },
  contentContainer: { paddingHorizontal: SPACING.xl, flex: 1 },

  // ── Sliding area clips content so it doesn't overflow ──
  slidingArea: {
    flex: 1,
    overflow: "hidden",
  },
  stepContent: {
    flex: 1,
  },

  // ── Content ──
  headerTextContainer: { marginBottom: 32 },
  headline: {
    fontFamily: FONTS.serif,
    fontSize: 38,
    color: COLORS.warmIvory,
    lineHeight: 46,
    marginBottom: SPACING.m,
    fontWeight: "400",
    letterSpacing: 0.5,
  },
  subHeadline: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "400",
    letterSpacing: 0.2,
  },

  optionsContainer: { gap: 14 },

  // ── Footer ──
  footerContainer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: Platform.OS === "ios" ? SPACING.xl : SPACING.xxl,
    paddingTop: SPACING.m,
  },
  buttonWrapper: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 4,
  },
  buttonGradient: {
    height: 60,
    borderRadius: RADIUS.button,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    fontFamily: FONTS.sans,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.buttonText,
    letterSpacing: 0.5,
  },
  buttonIcon: { position: "absolute", right: 24 },
});
