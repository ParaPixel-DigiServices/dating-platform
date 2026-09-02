import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { useAuthStore } from "@/hooks/useAuthStore";
import apiClient from "@/services/backendService";
import { showSuccessToast, showErrorToast } from "@/components/toast";
import theme from "@/theme/theme";
import { OnboardingTopBar } from "@/components/onboarding/OnboardingTopBar";

const { width } = Dimensions.get("window");
const t = theme.onboarding;
const MAX_SELECT = 10;

const mapReligionToCategory = (religion: string | null) => {
  if (!religion) return "GENERAL_VALUES";
  const r = religion.toUpperCase();
  if (r.includes("HINDU"))                   return "HINDU_VALUES";
  if (r.includes("MUSLIM") || r.includes("ISLAM")) return "MUSLIM_VALUES";
  if (r.includes("CHRISTIAN"))               return "CHRISTIAN_VALUES";
  if (r.includes("SIKH"))                    return "SIKH_VALUES";
  if (r.includes("BUDDH"))                   return "BUDDHIST_VALUES";
  if (r.includes("JAIN"))                    return "JAIN_VALUES";
  return "GENERAL_VALUES";
};

// Friendly display name for the religion
const religionDisplayName = (sub: string | null) => {
  if (!sub) return "Values";
  return sub.charAt(0).toUpperCase() + sub.slice(1).toLowerCase();
};

export default function MarriageInterestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const subCategory      = useOnboardingStore((s) => s.subCategory);
  const marriageFormData = useOnboardingStore((s) => s.marriageFormData);
  const setMarriageProgress = useOnboardingStore((s) => s.setMarriageProgress);

  const setOnboardingStep = useAuthStore((s) => s.setOnboardingStep);
  const setUser           = useAuthStore((s) => s.setUser);

  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [interests,  setInterests]  = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Progress bar animation
  const progressAnim = useSharedValue(0);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  useEffect(() => {
    fetchInterests();
  }, []);

  useEffect(() => {
    progressAnim.value = withTiming(selectedIds.size / MAX_SELECT, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [selectedIds.size]);

  const fetchInterests = async () => {
    try {
      setLoading(true);
      const categoryStr = mapReligionToCategory(subCategory);
      const response = await apiClient.get(`/user/interests?category=${categoryStr}`);
      const data = response.data;
      if (data && Array.isArray(data)) {
        setInterests(data);
      } else if (data?.data && Array.isArray(data.data)) {
        setInterests(data.data);
      } else {
        setInterests([]);
      }
    } catch {
      showErrorToast("Failed to load options");
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= MAX_SELECT) {
          showErrorToast(`You can select at most ${MAX_SELECT} values`);
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMarriageProgress("FAMILY");
    router.back();
  };

  const handleSubmit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (selectedIds.size === 0) {
      showErrorToast("Please select at least 1 value");
      return;
    }
    try {
      setSubmitting(true);
      const payload = { ...marriageFormData, interests: Array.from(selectedIds) };
      const response = await apiClient.post("/onboarding/marriage-details", payload);
      showSuccessToast("Profile Completed!");
      if (response.data?.onboardingStep) setOnboardingStep(response.data.onboardingStep);
      if (response.user) setUser(response.user);
      setMarriageProgress(null);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      showErrorToast(error?.response?.data?.message || "Failed to complete profile");
    } finally {
      setSubmitting(false);
    }
  };

  const displayName = religionDisplayName(subCategory);
  const canSubmit   = selectedIds.size > 0;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0A07" />

      {/* ── Solid gradient background (no image) ── */}
      <LinearGradient
        colors={["#1A1108", "#0D0A07", "#0D0A07"]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle warm glow top-left */}
      <View style={styles.glowBlob} pointerEvents="none" />

      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        {/* Top bar */}
        <OnboardingTopBar step={4} totalSteps={4} onBack={handleBack} />

        {/* ── Header ── */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.eyebrow}>YOUR FAITH & VALUES</Text>
            <Text style={styles.headline}>
              {displayName}{" "}
              <Text style={{ color: t.primary }}>Values</Text>
            </Text>
            <Text style={styles.sub}>Select up to {MAX_SELECT} that resonate with you</Text>
          </View>

          {/* Selection counter pill */}
          <View style={[
            styles.counterPill,
            selectedIds.size > 0 && { borderColor: t.primary + "60", backgroundColor: t.primary + "15" }
          ]}>
            <Text style={[styles.counterNum, selectedIds.size > 0 && { color: t.primary }]}>
              {selectedIds.size}
            </Text>
            <Text style={styles.counterDen}>/{MAX_SELECT}</Text>
          </View>
        </Animated.View>

        {/* ── Progress bar ── */}
        <Animated.View entering={FadeIn.delay(200).duration(500)} style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </Animated.View>

        {/* ── Chip Grid ── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={t.primary} />
              <Text style={styles.loadingText}>Loading values…</Text>
            </View>
          ) : interests.length === 0 ? (
            <View style={styles.centerBox}>
              <Feather name="inbox" size={48} color={t.textSecondary} style={{ opacity: 0.5, marginBottom: 16 }} />
              <Text style={styles.emptyTitle}>No values found</Text>
              <Text style={styles.emptySub}>You can continue without selecting.</Text>
            </View>
          ) : (
            <View style={styles.chipGrid}>
              {interests.map((item, i) => {
                const selected = selectedIds.has(item.id);
                return (
                  <Animated.View
                    key={item.id}
                    entering={FadeInDown.delay(i * 25).duration(350)}
                    style={{ overflow: 'visible', marginTop: 8 }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => toggleInterest(item.id)}
                      style={[styles.chip, selected && styles.chipSelected]}
                    >
                      {selected && (
                        <View style={styles.chipCheck}>
                          <Feather name="check" size={10} color="#0D0A07" />
                        </View>
                      )}
                      <Text
                        style={[styles.chipText, selected && styles.chipTextSelected]}
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* ── Footer ── */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          {/* Min-selection hint */}
          {!canSubmit && !loading && interests.length > 0 && (
            <Animated.View entering={FadeIn.duration(400)} style={styles.hintRow}>
              <Ionicons name="information-circle-outline" size={16} color={t.textSecondary} />
              <Text style={styles.hintText}>
                Select at least 1 value to continue
              </Text>
            </Animated.View>
          )}

          {canSubmit && (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.selectionSummary}>
              <Ionicons name="checkmark-circle" size={18} color={t.primary} />
              <Text style={styles.selectionText}>
                {selectedIds.size} value{selectedIds.size !== 1 ? "s" : ""} selected
              </Text>
            </Animated.View>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={submitting || !canSubmit ? 1 : 0.85}
            disabled={submitting || !canSubmit}
            style={[styles.btnWrap, (!canSubmit || submitting) && { opacity: 0.45 }]}
          >
            <LinearGradient
              colors={["#f2c7aa", "#e5b399", "#d9a07a"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#0D0A07" />
              ) : (
                <>
                  <Text style={styles.btnText}>Complete Profile</Text>
                  <Feather name="arrow-right" color="#0D0A07" size={20} style={{ marginLeft: 10 }} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const CHIP_GAP = 10;
const CHIP_COLS = 3;
const CHIP_WIDTH = (width - 48 - CHIP_GAP * (CHIP_COLS - 1)) / CHIP_COLS;

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: "#0D0A07" },
  safeArea: { flex: 1 },

  // Subtle warm blob in top-left
  glowBlob: {
    position: "absolute",
    top: -80,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#e5b39940",
    // iOS shadow creates the glow; on Android it's invisible (acceptable)
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 18,
  },
  headerLeft: { flex: 1, paddingRight: 16 },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 2.5,
    color: t.primary,
    fontWeight: "700",
    marginBottom: 6,
    opacity: 0.8,
  },
  headline: {
    fontSize: 28,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
    color: t.textPrimary,
    lineHeight: 34,
    marginBottom: 6,
  },
  sub: {
    fontSize: 14,
    color: t.textSecondary,
    fontFamily: "Lato_400Regular",
    lineHeight: 20,
  },

  // Counter pill top-right
  counterPill: {
    flexDirection: "row",
    alignItems: "baseline",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 60,
    justifyContent: "center",
  },
  counterNum: {
    fontSize: 22,
    fontFamily: "Lato_700Bold",
    color: t.textPrimary,
  },
  counterDen: {
    fontSize: 14,
    color: t.textSecondary,
    fontFamily: "Lato_400Regular",
    marginLeft: 2,
  },

  // Progress bar
  progressTrack: {
    height: 2,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginHorizontal: 24,
    borderRadius: 2,
    marginBottom: 20,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: t.primary,
    borderRadius: 2,
  },

  // Scroll area
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 14,      // room for the badge that floats above the first row
    paddingBottom: 32,
  },

  // Chip grid
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CHIP_GAP,
    marginTop: -8,   // compensate for the per-chip marginTop added for badge overflow
  },
  chip: {
    width: CHIP_WIDTH,
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
    overflow: "visible",
  },
  chipSelected: {
    backgroundColor: t.primary + "18",
    borderColor: t.primary + "90",
  },
  chipCheck: {
    position: "absolute",
    top: -7,
    right: -7,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: t.primary,
    justifyContent: "center",
    alignItems: "center",
    // Shadow so it pops over the chip edge
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 4,
  },
  chipText: {
    fontSize: 12,
    color: t.textSecondary,
    fontFamily: "Lato_400Regular",
    textAlign: "center",
    lineHeight: 16,
  },
  chipTextSelected: {
    color: t.textPrimary,
    fontFamily: "Lato_700Bold",
  },

  // Loading / Empty
  centerBox: {
    flex: 1,
    minHeight: 280,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: t.textSecondary,
    fontSize: 14,
    fontFamily: "Lato_400Regular",
  },
  emptyTitle: {
    fontSize: 18,
    color: t.textPrimary,
    fontFamily: "Lato_700Bold",
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: t.textSecondary,
    fontFamily: "Lato_400Regular",
    textAlign: "center",
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(13,10,7,0.98)",
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  hintText: {
    fontSize: 13,
    color: t.textSecondary,
    fontFamily: "Lato_400Regular",
  },
  selectionSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  selectionText: {
    fontSize: 14,
    color: t.primary,
    fontFamily: "Lato_700Bold",
  },
  btnWrap: {
    borderRadius: 50,
    overflow: "hidden",
  },
  btnGradient: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },
  btnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D0A07",
    letterSpacing: 0.5,
  },
});
