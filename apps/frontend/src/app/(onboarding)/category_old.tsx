import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

// Functional Imports
import { showSuccessToast, showErrorToast } from "@/components/toast";
import { useOnboardingStore, CategoryKey } from "@/hooks/useOnboardingStore";
import { useAuthStore } from "@/hooks/useAuthStore";
import { OnboardingTopBar } from "@/components/onboarding/OnboardingTopBar";
import { CategoryCard } from "@/components/onboarding/CategoryCard";

// Import centralized theme
import theme from "@/theme/theme";



interface CategoryOption {
  id: CategoryKey;
  title: string;
  description: string;
  iconName: any;
  iconFamily: "Ionicons" | "MaterialCommunityIcons" | "Feather";
  imageUri: string;
}

// Casual at the top as requested, using the same image for all
const SHARED_IMAGE = "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=800&fit=crop";

const categories: CategoryOption[] = [
  {
    id: "Casual",
    title: "Casual",
    description: "Have fun & enjoy connections",
    iconName: "flame",
    iconFamily: "Ionicons",
    imageUri: SHARED_IMAGE,
  },
  {
    id: "Love",
    title: "Love",
    description: "Find a romantic partner",
    iconName: "heart",
    iconFamily: "Ionicons",
    imageUri: SHARED_IMAGE,
  },
  {
    id: "Marriage",
    title: "Marriage",
    description: "Looking for a life partner",
    iconName: "ring",
    iconFamily: "MaterialCommunityIcons",
    imageUri: SHARED_IMAGE,
  },
  {
    id: "Find_Your_Roommate",
    title: "Find Your Roommate",
    description: "Find a perfect roomate who matches your vibe",
    iconName: "home",
    iconFamily: "Ionicons",
    imageUri: SHARED_IMAGE,
  },
];

export default function CategoryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const setCategoryStore = useOnboardingStore((state) => state.setCategory);
  const persistedCategory = useOnboardingStore((state) => state.category);
  const setOnboardingCompleted = useAuthStore((state) => state.setOnboardingCompleted);

  // Initialize from persisted value so re-visiting the screen shows correct selection
  const [selectedKey, setSelectedKey] = useState<CategoryKey>(
    persistedCategory ?? "Casual"
  );

  // Dynamic theme based on selected category
  const currentTheme = theme[selectedKey];

  const handleSelectCategory = (categoryId: CategoryKey) => {
    setSelectedKey(categoryId);
    setCategoryStore(categoryId);  // Persist immediately on tap
  };

  const handleContinue = async () => {
    try {
      setLoading(true);

      // Safety net: ensure the current selection is always persisted,
      // even if the user never re-tapped a card on this visit
      setCategoryStore(selectedKey);

      await new Promise((resolve) => setTimeout(resolve, 400));

      setOnboardingCompleted(true);
      showSuccessToast("Preferences saved!");
      router.replace("/(tabs)/home");
    } catch (error) {
      showErrorToast("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={currentTheme.background} animated />

      {/* --- TOP BAR & PROGRESS --- */}
      <OnboardingTopBar
        step={4}
        primaryColor={currentTheme.primary}
        textColor={currentTheme.textPrimary}
        secondaryText={currentTheme.textSecondary}
        onBack={() => router.back()}
        rightSlot="none"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* --- HEADER --- */}
        <View style={styles.headerSection}>
          <Text style={[styles.title, { color: currentTheme.textPrimary }]}>
            What are you{"\n"}
            <Text style={{ color: currentTheme.primary }}>looking for?</Text>
          </Text>
          <Text style={[styles.subtitle, { color: currentTheme.textSecondary }]}>
            This helps us show you better matches
          </Text>
        </View>

        {/* --- 2x2 GRID CATEGORIES --- */}
        <View style={styles.gridContainer}>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              {...category}
              isSelected={selectedKey === category.id}
              primaryColor={currentTheme.primary}
              textPrimary={currentTheme.textPrimary}
              textSecondary={currentTheme.textSecondary}
              secondary={currentTheme.secondary}
              onPress={handleSelectCategory}
            />
          ))}
        </View>
      </ScrollView>

      {/* --- FOOTER BUTTON --- */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: currentTheme.primary },
            loading && styles.primaryButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={[styles.primaryButtonText, { color: currentTheme.textPrimary }]}>
            {loading ? "Saving..." : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // Background color is handled dynamically inline
  },
  
  /* TOP BAR & PROGRESS */
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 40 : 16,
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  emptySpace: {
    width: 40, 
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
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
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

  /* MAIN CONTENT */
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 36,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: -0.5,
    textAlign: "center",
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },

  /* CATEGORIES GRID */
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16, // Space between rows and columns
  },
  categoryCard: {
    width: "47%", // 2 columns
    aspectRatio: 0.85, // Taller than it is wide
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: "hidden", // Ensures background image stays inside borders
  },
  cardImageBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cardInnerContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  cardBottomRow: {
    justifyContent: 'flex-end',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardTitleUnderline: {
    width: 24,
    height: 3,
    borderRadius: 1.5,
    marginTop: 6,
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  /* BOTTOM BUTTON & FOOTER */
  footerContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
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
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  }
});
