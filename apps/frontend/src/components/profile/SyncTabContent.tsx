import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { Feather, Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useProfileCompletionStore } from "@/hooks/useProfileCompletionStore";

interface SyncReport {
  compatibilityScore: number;
  compatibilityLabel: string;
  sharedInterests: string[];
  categoryBreakdown: { label: string; score: number }[];
  conversationStarters: string[];
}

interface Props {
  textPrimary: string;
  textSecondary: string;
  primaryColor: string;
  viewedUserName: string;
  // Sync data (mock for now, will be fetched by both userId from backend)
  syncReport?: SyncReport;
}

const MOCK_SYNC: SyncReport = {
  compatibilityScore: 82,
  compatibilityLabel: "Great Match",
  sharedInterests: ["Travel", "Coffee", "Music", "Photography"],
  categoryBreakdown: [
    { label: "Core Values", score: 90 },
    { label: "Communication", score: 84 },
    { label: "Lifestyle", score: 76 },
    { label: "Life Goals", score: 68 },
  ],
  conversationStarters: [
    "What is the best trip you have ever had?",
    "If you could live in any era, which would it be?",
    "What song never gets old for you?",
  ],
};

function ScoreBar({ label, score, primaryColor, textSecondary, delay }: {
  label: string; score: number; primaryColor: string; textSecondary: string; delay: number;
}) {
  const width = useSharedValue(0);
  React.useEffect(() => {
    width.value = withDelay(delay, withTiming(score, { duration: 700 }));
  }, []);
  const barStyle = useAnimatedStyle(() => ({ width: `${width.value}%` as any }));

  return (
    <View style={sStyles.row}>
      <Text style={[sStyles.label, { color: textSecondary }]}>{label}</Text>
      <View style={sStyles.track}>
        <Animated.View style={[sStyles.fill, barStyle, { backgroundColor: primaryColor }]} />
      </View>
      <Text style={[sStyles.score, { color: primaryColor }]}>{score}%</Text>
    </View>
  );
}

const sStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 10 },
  label: { fontSize: 13, width: 120 },
  track: { flex: 1, height: 6, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3 },
  score: { fontSize: 12, fontWeight: "700", width: 36, textAlign: "right" },
});

// Circular compatibility score
function CompatibilityCircle({ score, label, primaryColor, textPrimary, textSecondary }: {
  score: number; label: string; primaryColor: string; textPrimary: string; textSecondary: string;
}) {
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <View style={{ alignItems: "center", paddingVertical: 8 }}>
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        {/* Background ring */}
        <View style={{
          position: "absolute", width: size, height: size, borderRadius: size / 2,
          borderWidth: strokeWidth, borderColor: "rgba(255,255,255,0.08)",
        }} />
        {/* Accent arc — simulated with a thick border on only 3 sides using rotation */}
        <View style={{
          position: "absolute", width: size, height: size, borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderTopColor: primaryColor,
          borderRightColor: score > 25 ? primaryColor : "transparent",
          borderBottomColor: score > 50 ? primaryColor : "transparent",
          borderLeftColor: score > 75 ? primaryColor : "transparent",
          transform: [{ rotate: "-90deg" }],
        }} />
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: primaryColor }}>{score}%</Text>
          <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

export function SyncTabContent({ textPrimary, textSecondary, primaryColor, viewedUserName, syncReport }: Props) {
  const router = useRouter();
  const { profileCompleted } = useProfileCompletionStore();
  const report = syncReport || MOCK_SYNC;

  // Gate: viewer must complete their profile first
  if (!profileCompleted) {
    return (
      <View style={styles.container}>
        <BlurView intensity={60} tint="dark" style={styles.gateCard}>
          <View style={[styles.gateIcon, { backgroundColor: `${primaryColor}20` }]}>
            <Feather name="lock" size={28} color={primaryColor} />
          </View>
          <Text style={[styles.gateTitle, { color: textPrimary }]}>
            Complete your profile first
          </Text>
          <Text style={[styles.gateSub, { color: textSecondary }]}>
            To unlock your Sync report with {viewedUserName}, you need to complete your own profile questionnaire.
          </Text>
          <TouchableOpacity
            style={[styles.gateBtn, { backgroundColor: primaryColor }]}
            onPress={() => router.push("/profile-completion" as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.gateBtnText}>Complete Profile</Text>
            <Feather name="arrow-right" size={16} color="#2D211C" />
          </TouchableOpacity>
        </BlurView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Compatibility Score */}
      <BlurView intensity={60} tint="dark" style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="refresh-cw" size={16} color={primaryColor} />
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Compatibility Score</Text>
        </View>
        <CompatibilityCircle
          score={report.compatibilityScore}
          label={report.compatibilityLabel}
          primaryColor={primaryColor}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
        />
      </BlurView>

      {/* Shared Interests */}
      <BlurView intensity={60} tint="dark" style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="star" size={16} color={primaryColor} />
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>You Both Love</Text>
        </View>
        <View style={styles.pillsRow}>
          {report.sharedInterests.map((interest, idx) => (
            <View key={idx} style={[styles.pill, { borderColor: `${primaryColor}40`, backgroundColor: `${primaryColor}12` }]}>
              <Text style={[styles.pillText, { color: primaryColor }]}>{interest}</Text>
            </View>
          ))}
        </View>
      </BlurView>

      {/* Breakdown */}
      <BlurView intensity={60} tint="dark" style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="bar-chart-2" size={16} color={primaryColor} />
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Compatibility Breakdown</Text>
        </View>
        {report.categoryBreakdown.map((item, idx) => (
          <ScoreBar
            key={item.label}
            label={item.label}
            score={item.score}
            primaryColor={primaryColor}
            textSecondary={textSecondary}
            delay={idx * 120}
          />
        ))}
      </BlurView>

      {/* Conversation Starters */}
      <BlurView intensity={60} tint="dark" style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="message-square" size={16} color={primaryColor} />
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Conversation Starters</Text>
        </View>
        {report.conversationStarters.map((q, idx) => (
          <View key={idx} style={[styles.starterRow, { borderColor: "rgba(255,255,255,0.07)" }]}>
            <View style={[styles.starterDot, { backgroundColor: primaryColor }]} />
            <Text style={[styles.starterText, { color: textSecondary }]}>{q}</Text>
          </View>
        ))}
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
    fontWeight: "600",
  },
  starterRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  starterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    flexShrink: 0,
  },
  starterText: {
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
  },
  // Gate state
  gateCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 28,
    overflow: "hidden",
    alignItems: "center",
  },
  gateIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  gateTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  gateSub: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  gateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 32,
  },
  gateBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2D211C",
  },
});
