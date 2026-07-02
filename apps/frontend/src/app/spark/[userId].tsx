import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDeckStore } from "@/hooks/useDeckStore";
import { useProfileCompletionStore, DEFAULT_SPARK_QUESTIONS } from "@/hooks/useProfileCompletionStore";
import * as Haptics from "expo-haptics";

const COLORS = {
  primary: "#e5b399",
  bgBase: "#0f1012",
  warmIvory: "#FFF5EC",
  softBeige: "#D8C5B5",
  textSecondary: "rgba(255,245,236,0.55)",
  secondary: "#1E1410",
  buttonText: "#2D211C",
};

export default function SparkScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const masterProfiles = useDeckStore((s) => s.masterProfiles);
  const { sparkQuestions } = useProfileCompletionStore();

  const profile = useMemo(() => masterProfiles.find((p) => p.id === userId), [userId, masterProfiles]);

  const questions = [
    sparkQuestions.q1 || DEFAULT_SPARK_QUESTIONS.q1,
    sparkQuestions.q2 || DEFAULT_SPARK_QUESTIONS.q2,
    sparkQuestions.q3 || DEFAULT_SPARK_QUESTIONS.q3,
  ];

  const [answers, setAnswers] = useState(["", "", ""]);

  const allAnswered = answers.every((a) => a.trim().length > 0);

  const setAnswer = (idx: number, val: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleSend = () => {
    if (!allAnswered) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // TODO: send spark + answers to backend
    router.back();
  };

  const handleBack = () => router.back();

  if (!profile) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: COLORS.warmIvory }}>Profile not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background image */}
      <View style={StyleSheet.absoluteFillObject}>
        <Image source={profile.main_photo} style={styles.bg} resizeMode="cover" />
        <LinearGradient
          colors={["rgba(15,16,18,0.7)", "rgba(15,16,18,0.92)", COLORS.bgBase]}
          locations={[0, 0.4, 0.85]}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Feather name="chevron-left" size={24} color={COLORS.warmIvory} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image source={profile.main_photo} style={styles.avatar} />
          <View>
            <Text style={styles.headerName}>Spark to {profile.name}</Text>
            <Text style={styles.headerSub}>Answer {profile.name}'s questions</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 24) + 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Intro card */}
        <BlurView intensity={40} tint="dark" style={styles.introCard}>
          <View style={styles.sparkBadge}>
            <Feather name="zap" size={18} color={COLORS.buttonText} />
          </View>
          <Text style={styles.introTitle}>Send a Spark</Text>
          <Text style={styles.introSub}>
            {profile.name} wants to know more about you. Answer their questions honestly to stand out.
          </Text>
        </BlurView>

        {/* Questions */}
        {questions.map((q, idx) => (
          <BlurView key={idx} intensity={40} tint="dark" style={styles.questionCard}>
            <Text style={styles.qNumber}>Question {idx + 1}</Text>
            <Text style={styles.qText}>{q}</Text>
            <TextInput
              style={[styles.input, answers[idx].length > 0 && styles.inputActive]}
              placeholder="Your answer..."
              placeholderTextColor={COLORS.textSecondary}
              value={answers[idx]}
              onChangeText={(val) => setAnswer(idx, val)}
              multiline
              maxLength={200}
            />
            <Text style={styles.charCount}>{answers[idx].length}/200</Text>
          </BlurView>
        ))}
      </ScrollView>

      {/* Send Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={[styles.sendBtn, !allAnswered && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!allAnswered}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={allAnswered ? ["#f2c7aa", "#e5b399", "#f2c7aa"] : ["#2a1e16", "#2a1e16"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sendBtnGradient}
          >
            <Feather name="zap" size={20} color={allAnswered ? COLORS.buttonText : "rgba(255,245,236,0.25)"} />
            <Text style={[styles.sendBtnText, !allAnswered && styles.sendBtnTextDisabled]}>
              Send Spark
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgBase },
  bg: { width: "100%", height: "100%" },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,245,236,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.warmIvory,
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  introCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,245,236,0.1)",
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
    alignItems: "center",
  },
  sparkBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.warmIvory,
    marginBottom: 8,
    fontFamily: Platform.select({ ios: "Times New Roman", android: "serif" }),
  },
  introSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  questionCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,245,236,0.1)",
    padding: 20,
    marginBottom: 12,
    overflow: "hidden",
  },
  qNumber: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  qText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.warmIvory,
    lineHeight: 24,
    marginBottom: 16,
  },
  input: {
    backgroundColor: "rgba(255,245,236,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,245,236,0.1)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.warmIvory,
    fontSize: 14,
    lineHeight: 22,
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputActive: {
    borderColor: `${COLORS.primary}60`,
    backgroundColor: "rgba(229,179,153,0.06)",
  },
  charCount: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: "right",
    marginTop: 6,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: `${COLORS.bgBase}ee`,
  },
  sendBtn: {
    borderRadius: 32,
    overflow: "hidden",
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  sendBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.buttonText,
  },
  sendBtnTextDisabled: {
    color: "rgba(255,245,236,0.25)",
  },
});
