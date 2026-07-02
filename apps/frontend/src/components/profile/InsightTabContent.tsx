import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInRight, useSharedValue, useAnimatedStyle, withTiming, withDelay } from "react-native-reanimated";

interface InsightReport {
  personalityTraits: { trait: string; score: number }[];
  communicationStyle: string;
  coreValues: string[];
  lifeGoals: string;
  loveLanguage: string;
}

interface Props {
  textPrimary: string;
  textSecondary: string;
  primaryColor: string;
  secondary: string;
  // Insight data (mock for now, will be fetched by userId from backend)
  insightReport?: InsightReport;
}

const MOCK_INSIGHT: InsightReport = {
  personalityTraits: [
    { trait: "Ambitious", score: 80 },
    { trait: "Thoughtful", score: 75 },
    { trait: "Adventurous", score: 70 },
    { trait: "Emotionally Intelligent", score: 85 },
    { trait: "Family Oriented", score: 90 },
  ],
  communicationStyle: "Thoughtful Listener",
  coreValues: ["Honesty", "Respect", "Growth", "Loyalty"],
  lifeGoals: "Wants to build a meaningful life and travel the world while staying connected to family.",
  loveLanguage: "Words of Affirmation",
};

function TraitBar({ trait, score, primaryColor, textPrimary, textSecondary, delay }: {
  trait: string; score: number; primaryColor: string; textPrimary: string; textSecondary: string; delay: number;
}) {
  const width = useSharedValue(0);
  React.useEffect(() => {
    width.value = withDelay(delay, withTiming(score, { duration: 700 }));
  }, []);
  const barStyle = useAnimatedStyle(() => ({ width: `${width.value}%` as any }));

  return (
    <View style={tStyles.row}>
      <Text style={[tStyles.label, { color: textSecondary }]}>{trait}</Text>
      <View style={tStyles.track}>
        <Animated.View style={[tStyles.fill, barStyle, { backgroundColor: primaryColor }]} />
      </View>
      <Text style={[tStyles.score, { color: primaryColor }]}>{score}%</Text>
    </View>
  );
}

const tStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 10 },
  label: { fontSize: 13, width: 130 },
  track: { flex: 1, height: 6, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3 },
  score: { fontSize: 12, fontWeight: "700", width: 36, textAlign: "right" },
});

export function InsightTabContent({ textPrimary, textSecondary, primaryColor, secondary, insightReport }: Props) {
  const report = insightReport || MOCK_INSIGHT;

  return (
    <View style={styles.container}>
      {/* Personality Snapshot */}
      <BlurView intensity={60} tint="dark" style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="activity" size={16} color={primaryColor} />
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Personality Snapshot</Text>
        </View>
        {report.personalityTraits.map((t, idx) => (
          <TraitBar
            key={t.trait}
            trait={t.trait}
            score={t.score}
            primaryColor={primaryColor}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            delay={idx * 100}
          />
        ))}
      </BlurView>

      {/* Communication Style */}
      <BlurView intensity={60} tint="dark" style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="message-circle" size={16} color={primaryColor} />
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Communication Style</Text>
        </View>
        <View style={[styles.styleBadge, { borderColor: `${primaryColor}50`, backgroundColor: `${primaryColor}15` }]}>
          <Feather name="check-circle" size={14} color={primaryColor} />
          <Text style={[styles.styleBadgeText, { color: primaryColor }]}>{report.communicationStyle}</Text>
        </View>
      </BlurView>

      {/* Core Values */}
      <BlurView intensity={60} tint="dark" style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="heart" size={16} color={primaryColor} />
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Core Values</Text>
        </View>
        <View style={styles.pillsRow}>
          {report.coreValues.map((v, idx) => (
            <View key={idx} style={[styles.pill, { borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.05)" }]}>
              <Text style={[styles.pillText, { color: textPrimary }]}>{v}</Text>
            </View>
          ))}
        </View>
      </BlurView>

      {/* Life Goals */}
      <BlurView intensity={60} tint="dark" style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="target" size={16} color={primaryColor} />
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Life Goals</Text>
        </View>
        <Text style={[styles.bodyText, { color: textSecondary }]}>{report.lifeGoals}</Text>
      </BlurView>

      {/* Love Language */}
      <BlurView intensity={60} tint="dark" style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="sun" size={16} color={primaryColor} />
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Love Language</Text>
        </View>
        <View style={[styles.styleBadge, { borderColor: `${primaryColor}50`, backgroundColor: `${primaryColor}15` }]}>
          <Text style={[styles.styleBadgeText, { color: primaryColor }]}>{report.loveLanguage}</Text>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 20,
    marginBottom: 14,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  styleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
  },
  styleBadgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "500",
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
  },
});
