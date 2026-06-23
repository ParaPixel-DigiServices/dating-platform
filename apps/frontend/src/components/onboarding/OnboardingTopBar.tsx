import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import theme from "@/theme/theme";

const t = theme.onboarding;

interface Props {
  step: number;
  totalSteps?: number;
  onBack?: () => void;
  hideBack?: boolean;
}

export function OnboardingTopBar({
  step,
  totalSteps = 4,
  onBack,
  hideBack = false,
}: Props) {
  return (
    <View style={styles.container}>
      {hideBack ? (
        <View style={styles.sideBtn} />
      ) : (
        <TouchableOpacity style={styles.sideBtn} activeOpacity={0.6} onPress={onBack}>
          <ChevronLeft color={t.textPrimary} size={28} strokeWidth={1} />
        </TouchableOpacity>
      )}

      <View style={styles.progressWrapper}>
        <Text style={[styles.stepText, { color: t.textSecondary }]}>
          STEP {step} OF {totalSteps}
        </Text>
        <View style={styles.progressTrackContainer}>
          <View style={[styles.progressBarTrack, { flex: step }]}>
            <LinearGradient
              colors={[t.primary, t.textSecondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressBarFill}
            />
          </View>
          
          {step < totalSteps && <View style={[styles.progressDot, { backgroundColor: t.primary, shadowColor: t.primary }]} />}
          
          {step < totalSteps && (
            <View style={[styles.progressBarTrackRemaining, { flex: totalSteps - step }]} />
          )}
        </View>
      </View>

      <View style={styles.sideBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 28,
    paddingTop: Platform.OS === "android" ? 50 : 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  sideBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "flex-start",
    marginLeft: -8,
  },
  progressWrapper: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  stepText: {
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "sans-serif",
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "600",
    marginBottom: 10,
  },
  progressTrackContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 120,
  },
  progressBarTrack: {
    height: 1.5,
    backgroundColor: "transparent",
  },
  progressBarFill: {
    height: "100%",
    width: "100%",
    borderRadius: 1,
  },
  progressDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    marginHorizontal: -1,
    zIndex: 2,
  },
  progressBarTrackRemaining: {
    height: 1.5,
    backgroundColor: "rgba(229,179,153,0.15)",
    borderRadius: 1,
  },
});
