import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { useUserProfileStore } from "@/onboarding_ques_temp/userProfileStore";
import {
  getProfileSections,
  findQuestionById,
  getAllGlobalQuestionIds,
  getReadOnlyIds,
  formatAnswer,
  type ProfileSection,
} from "@/utils/profileHelpers";
import { demoQuestionnaire } from "@/onboarding_ques_temp/onboarding";
import { categoryToKey } from "@/utils/profileHelpers";
import theme from "@/theme/theme";

// ─── QA Row ──────────────────────────────────────────────────────────────────

interface QARowProps {
  questionId: string;
  answers: Record<string, any>;
  t: any;
  onAdd: (questionId: string) => void;
}

function QARow({ questionId, answers, t, onAdd }: QARowProps) {
  const q = findQuestionById(questionId);
  if (!q) return null;

  const readOnlyIds = getReadOnlyIds();
  const isReadOnly = readOnlyIds.includes(questionId);

  const rawAns = answers[questionId];
  const displayAns = formatAnswer(rawAns);

  return (
    <View style={[styles.qaRow, { borderBottomColor: t.primary + "18" }]}>
      <View style={styles.qaLeft}>
        <View style={styles.qaLabelRow}>
          <Text style={[styles.qaLabel, { color: t.textSecondary + "77" }]}>
            {q.text}
          </Text>
          {isReadOnly && (
            <View style={[styles.readOnlyBadge, { backgroundColor: t.primary + "18" }]}>
              <Feather name="lock" size={9} color={t.primary + "99"} />
              <Text style={[styles.readOnlyText, { color: t.primary + "99" }]}>from onboarding</Text>
            </View>
          )}
        </View>
        {q.description ? (
          <Text style={[styles.qaDesc, { color: t.textSecondary + "55" }]}>
            {q.description}
          </Text>
        ) : null}
        {displayAns ? (
          <Text style={[styles.qaAnswer, { color: t.textSecondary }]}>
            {displayAns}
          </Text>
        ) : (
          <Text style={[styles.qaEmpty, { color: t.textSecondary + "55" }]}>
            {isReadOnly ? "—" : "Not answered"}
          </Text>
        )}
      </View>
      {!isReadOnly && (
        <TouchableOpacity
          style={[
            styles.qaEditBtn,
            {
              backgroundColor: displayAns ? t.secondary : t.primary + "22",
              borderColor: t.primary + "44",
            },
          ]}
          onPress={() => onAdd(questionId)}
          activeOpacity={0.7}
        >
          <Feather
            name={displayAns ? "edit-2" : "plus"}
            size={13}
            color={t.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Full Section Block ───────────────────────────────────────────────────────

interface SectionBlockProps {
  section: ProfileSection;
  allQuestionIds: string[];
  answers: Record<string, any>;
  t: any;
  onAdd: (questionId: string) => void;
}

function SectionBlock({
  section,
  allQuestionIds,
  answers,
  t,
  onAdd,
}: SectionBlockProps) {
  return (
    <View
      style={[styles.sectionBlock, { backgroundColor: t.secondary }]}
      nativeID={section.key}
    >
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconWrap, { backgroundColor: t.primary + "22" }]}>
          <Feather name={section.icon as any} size={18} color={t.primary} />
        </View>
        <Text style={[styles.sectionTitle, { color: t.textSecondary }]}>
          {section.title}
        </Text>
      </View>

      {allQuestionIds.map((id) => (
        <QARow
          key={id}
          questionId={id}
          answers={answers}
          t={t}
          onAdd={onAdd}
        />
      ))}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function FullProfileScreen() {
  const router = useRouter();
  const { scrollTo } = useLocalSearchParams<{ scrollTo?: string }>();

  const category   = useOnboardingStore((s) => s.category) ?? "Casual";
  const firstName  = useOnboardingStore((s) => s.firstName);
  const lastName   = useOnboardingStore((s) => s.lastName);
  const gender     = useOnboardingStore((s) => s.gender);
  const dateOfBirth = useOnboardingStore((s) => s.dateOfBirth);
  const answers = useUserProfileStore((s) => s.answers);
  const pct = useUserProfileStore((s) => s.getCompletionPercent(category as any));

  const t = (theme as any)[category];
  const sections = getProfileSections(category as any);
  const categoryKey = categoryToKey(category as any);

  // All question IDs for each section — read-only + editable for basic
  const allGlobalIds = getAllGlobalQuestionIds();

  // All category-specific question IDs
  const allCategoryIds = categoryKey
    ? (demoQuestionnaire.categories[categoryKey]?.questions ?? []).map((q: any) => q.id)
    : [];

  // Map section key → full list of question IDs to render
  const sectionFullIds: Record<string, string[]> = {
    basic:    allGlobalIds,
    category: allCategoryIds,
  };

  // Seed read-only answers from onboarding store so they render properly
  const enrichedAnswers = {
    ...answers,
    go_1: answers['go_1'] ?? (firstName ? `${firstName}${lastName ? ' ' + lastName : ''}` : null),
    go_2: answers['go_2'] ?? dateOfBirth,
    go_3: answers['go_3'] ?? gender,
  };


  const navigateToEdit = (questionId?: string) => {
    // Navigate to step 0 for now; deep-linking to a specific question is a future enhancement
    router.push("/profile/edit/0" as any);
  };

  const displayName = firstName
    ? `${firstName}${lastName ? ` ${lastName}` : ""}`
    : "Your Profile";

  return (
    <View style={[styles.master, { backgroundColor: t.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Header ─────────────────────────────────────────── */}
      <SafeAreaView style={[styles.header, { backgroundColor: t.background }]}>
        <View
          style={[
            styles.headerBar,
            { paddingTop: Platform.OS === "android" ? 48 : 12 },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={22} color={t.textSecondary} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={[styles.headerName, { color: t.textSecondary }]} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={[styles.headerSub, { color: t.textSecondary + "77" }]}>
              {pct}% complete
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.editHeaderBtn, { backgroundColor: t.primary }]}
            onPress={() => navigateToEdit()}
            activeOpacity={0.85}
          >
            <Feather name="edit-2" size={14} color="#fff" />
            <Text style={styles.editHeaderText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Overall progress bar */}
        <View style={[styles.overallTrack, { backgroundColor: t.primary + "22" }]}>
          <View
            style={[
              styles.overallFill,
              { backgroundColor: t.primary, width: `${pct}%` },
            ]}
          />
        </View>
      </SafeAreaView>

      {/* ── Scrollable Sections ─────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sections.map((section) => (
          <SectionBlock
            key={section.key}
            section={section}
            allQuestionIds={sectionFullIds[section.key] ?? section.questionIds}
            answers={enrichedAnswers}
            t={t}
            onAdd={navigateToEdit}
          />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  master: { flex: 1 },

  /* HEADER */
  header: {
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
  headerCenter: {
    flex: 1,
  },
  headerName: {
    fontSize: 17,
    fontFamily: "Outfit_700Bold",
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    marginTop: 1,
  },
  editHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  editHeaderText: {
    fontSize: 13,
    fontFamily: "Outfit_600SemiBold",
    color: "#fff",
  },
  overallTrack: {
    height: 3,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 2,
    overflow: "hidden",
  },
  overallFill: {
    height: "100%",
    borderRadius: 2,
  },

  /* SCROLL */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 14,
  },

  /* SECTION BLOCK */
  sectionBlock: {
    borderRadius: 20,
    padding: 18,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_600SemiBold",
  },

  /* QA ROW */
  qaRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  qaLeft: {
    flex: 1,
    gap: 3,
  },
  qaLabel: {
    fontSize: 11,
    fontFamily: "Outfit_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  qaDesc: {
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
  },
  qaAnswer: {
    fontSize: 14,
    fontFamily: "Outfit_500Medium",
    lineHeight: 20,
  },
  qaEmpty: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    fontStyle: "italic",
  },
  qaEditBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  qaLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  readOnlyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  readOnlyText: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    letterSpacing: 0.3,
  },
});
