import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useUserProfileStore } from "@/onboarding_ques_temp/userProfileStore";
import {
  getProfileSections,
  findQuestionById,
  formatAnswer,
  type ProfileSection,
} from "@/utils/profileHelpers";
import theme from "@/theme/theme";

const { width } = Dimensions.get("window");

const DUMMY_PHOTO =
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80";

// ─── Overview Card ────────────────────────────────────────────────────────────

interface OverviewCardProps {
  displayName: string;
  age: number | null;
  gender: string | null;
  location: string | null;
  bio: string | null;
  kids: string | null;
  drinking: string | null;
  interests: string | null;
  t: any;
  onSeeAll: () => void;
  onEdit: () => void;
}

function OverviewCard({
  displayName, age, gender, location, bio, kids, drinking, interests, t, onSeeAll, onEdit
}: OverviewCardProps) {
  const NA = "NA";

  const rows: { label: string; value: string | null; icon: string }[] = [
    { label: "Name",       value: displayName !== "Your Name" ? displayName : null, icon: "user"    },
    { label: "Age",        value: age ? `${age} years` : null,                      icon: "calendar" },
    { label: "Gender",     value: gender,                                           icon: "users"    },
    { label: "Location",   value: location,                                         icon: "map-pin"  },
    { label: "Bio",        value: bio,                                              icon: "align-left"},
    { label: "Interests",  value: interests,                                        icon: "heart"    },
    { label: "Drinking",   value: drinking,                                         icon: "coffee"   },
    { label: "Kids",       value: kids,                                             icon: "smile"    },
  ];

  return (
    <View style={[styles.sectionCard, { backgroundColor: t.secondary }]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionIcon}>👤</Text>
          <Text style={[styles.sectionTitle, { color: t.textSecondary }]}>Overview</Text>
        </View>
        <TouchableOpacity style={styles.seeAllBtn} onPress={onSeeAll} activeOpacity={0.7}>
          <Text style={[styles.seeAllText, { color: t.primary }]}>See all</Text>
          <Feather name="chevron-right" size={14} color={t.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.infoGrid}>
        {rows.map((row) => (
          <View key={row.label} style={styles.infoRow}>
            <View style={[styles.infoIconBox, { backgroundColor: t.primary + "18" }]}>
              <Feather name={row.icon as any} size={13} color={t.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: t.textSecondary + "77" }]}>{row.label}</Text>
              <Text style={[styles.infoValue, { color: row.value ? t.textSecondary : t.textSecondary + "44" }]}>
                {row.value ?? NA}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.cardEditBtn, { borderColor: t.primary + "44" }]}
        onPress={onEdit}
        activeOpacity={0.75}
      >
        <Feather name="edit-2" size={12} color={t.primary} />
        <Text style={[styles.cardEditText, { color: t.primary }]}>Edit basic info</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Category Section Card ────────────────────────────────────────────────────

interface CategoryCardProps {
  section: ProfileSection;
  answers: Record<string, any>;
  t: any;
  onSeeAll: () => void;
}

function CategoryCard({ section, answers, t, onSeeAll }: CategoryCardProps) {
  const previewIds = section.questionIds.slice(0, 4);
  const answeredCount = section.questionIds.filter(
    (id) => answers[id] !== null && answers[id] !== undefined && answers[id] !== ""
  ).length;
  const total = section.questionIds.length;

  return (
    <View style={[styles.sectionCard, { backgroundColor: t.secondary }]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionIcon}>{section.icon}</Text>
          <Text style={[styles.sectionTitle, { color: t.textSecondary }]}>{section.title}</Text>
        </View>
        <TouchableOpacity style={styles.seeAllBtn} onPress={onSeeAll} activeOpacity={0.7}>
          <Text style={[styles.seeAllText, { color: t.primary }]}>See all</Text>
          <Feather name="chevron-right" size={14} color={t.primary} />
        </TouchableOpacity>
      </View>

      {answeredCount === 0 ? (
        <Text style={[styles.emptyText, { color: t.textSecondary + "66" }]}>
          No answers yet — tap See all to fill this in
        </Text>
      ) : (
        <View style={styles.infoGrid}>
          {previewIds.map((id) => {
            const q = findQuestionById(id);
            const ans = answers[id];
            if (!q) return null;
            const displayAns = formatAnswer(ans);
            return (
              <View key={id} style={styles.infoRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.infoLabel, { color: t.textSecondary + "77" }]}>{q.text}</Text>
                  <Text style={[styles.infoValue, { color: displayAns ? t.textSecondary : t.textSecondary + "44" }]}>
                    {displayAns ?? "Not answered"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.completionRow}>
        <View style={[styles.miniProgress, { backgroundColor: t.primary + "22" }]}>
          <View
            style={[
              styles.miniProgressFill,
              { backgroundColor: t.primary, width: `${Math.round((answeredCount / total) * 100)}%` },
            ]}
          />
        </View>
        <Text style={[styles.completionText, { color: t.textSecondary + "88" }]}>
          {answeredCount}/{total} answered
        </Text>
      </View>
    </View>
  );
}

// ─── Insights Card ────────────────────────────────────────────────────────────

function InsightsCard({ t }: { t: any }) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: t.secondary }]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionIcon}>📊</Text>
          <Text style={[styles.sectionTitle, { color: t.textSecondary }]}>Photo Insights</Text>
        </View>
      </View>
      <View style={{ alignItems: "center", paddingVertical: 20 }}>
        <Ionicons name="bar-chart" size={48} color={t.primary + "88"} style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: 16, fontFamily: "PlayfairDisplay_700Bold", color: t.textPrimary, marginBottom: 8 }}>
          Unlock Photo Insights
        </Text>
        <Text style={{ fontSize: 13, fontFamily: "Lato_400Regular", color: t.textSecondary, textAlign: "center", paddingHorizontal: 20 }}>
          Find out which of your photos is getting the most attention and optimize your profile for more matches.
        </Text>
        <TouchableOpacity style={[styles.cardEditBtn, { backgroundColor: t.primary, borderWidth: 0, marginTop: 24, paddingHorizontal: 24, paddingVertical: 12 }]}>
          <Text style={{ color: t.background, fontFamily: "PlayfairDisplay_700Bold" }}>Get Insights</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Pay Plan Card ────────────────────────────────────────────────────────────

function PayPlanCard({ t }: { t: any }) {
  const benefits = [
    "Get exclusive photo insights",
    "Fast track your likes",
    "Stand out every day",
    "Unlimited likes",
    "See who liked you"
  ];

  return (
    <View style={{ gap: 16 }}>
      {/* Boost Actions */}
      <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 4 }}>
        <TouchableOpacity style={[styles.sectionCard, { flex: 1, padding: 16, marginBottom: 0, flexDirection: "row", alignItems: "center", gap: 12 }]}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.textPrimary, justifyContent: "center", alignItems: "center" }}>
            <Ionicons name="sparkles" size={20} color={t.background} />
          </View>
          <View>
            <Text style={{ fontSize: 15, fontFamily: "PlayfairDisplay_700Bold", color: t.textPrimary }}>Spotlight</Text>
            <Text style={{ fontSize: 11, fontFamily: "Lato_400Regular", color: t.textSecondary }}>Stand out</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.sectionCard, { flex: 1, padding: 16, marginBottom: 0, flexDirection: "row", alignItems: "center", gap: 12 }]}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.textPrimary, justifyContent: "center", alignItems: "center" }}>
            <Ionicons name="star" size={20} color={t.background} />
          </View>
          <View>
            <Text style={{ fontSize: 15, fontFamily: "PlayfairDisplay_700Bold", color: t.textPrimary }}>SuperSwipe</Text>
            <Text style={{ fontSize: 11, fontFamily: "Lato_400Regular", color: t.textSecondary }}>Get noticed</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Premium Banner */}
      <View style={[styles.sectionCard, { backgroundColor: "#FCD34D", marginHorizontal: 4 }]}>
        <Text style={{ fontSize: 20, fontFamily: "PlayfairDisplay_700Bold", color: "#1F2937", fontStyle: "italic", marginBottom: 8 }}>PREMIUM+</Text>
        <Text style={{ fontSize: 14, fontFamily: "Lato_400Regular", color: "#374151", marginBottom: 20, lineHeight: 20 }}>
          Get the VIP treatment, and enjoy better ways to connect with incredible people.
        </Text>
        <TouchableOpacity style={{ backgroundColor: "#1F2937", borderRadius: 20, paddingVertical: 14, alignItems: "center" }}>
          <Text style={{ color: "#F9FAFB", fontSize: 15, fontFamily: "PlayfairDisplay_700Bold" }}>Explore Premium+</Text>
        </TouchableOpacity>
      </View>

      {/* Benefits List */}
      <View style={[styles.sectionCard, { marginHorizontal: 4 }]}>
        <Text style={{ fontSize: 16, fontFamily: "PlayfairDisplay_700Bold", color: t.textPrimary, marginBottom: 16 }}>What you get:</Text>
        {benefits.map((b, i) => (
          <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: i === benefits.length - 1 ? 0 : 1, borderBottomColor: t.primary + "11" }}>
            <Text style={{ fontSize: 14, fontFamily: "Lato_400Regular", color: t.textSecondary, flex: 1 }}>{b}</Text>
            <Feather name="check" size={18} color={t.textPrimary} />
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const router = useRouter();

  const category    = useOnboardingStore((s) => s.category) ?? "Casual";
  const firstName   = useOnboardingStore((s) => s.firstName);
  const lastName    = useOnboardingStore((s) => s.lastName);
  const gender      = useOnboardingStore((s) => s.gender);
  const dateOfBirth = useOnboardingStore((s) => s.dateOfBirth);
  const user        = useAuthStore((s) => s.user);

  const answers    = useUserProfileStore((s) => s.answers);
  const isComplete = useUserProfileStore((s) => s.isProfileComplete(category as any));
  const pct        = useUserProfileStore((s) => s.getCompletionPercent(category as any));

  const t       = (theme as any)[category];
  const sections = getProfileSections(category as any);

  const age = dateOfBirth
    ? new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
    : null;

  const displayName = firstName
    ? `${firstName}${lastName ? ` ${lastName}` : ""}`
    : "Your Name";

  const location   = (answers['go_4'] as string) || null;
  const bio        = (answers['go_bio'] as string) || null;
  const kids       = (answers['go_kids'] as string) || null;
  const drinking   = (answers['go_9a'] as string) || null;
  const interests  = formatAnswer(answers['go_11']);

  const navigateToFull = (sectionKey?: string) => {
    router.push({
      pathname: "/profile/full" as any,
      params: { scrollTo: sectionKey ?? "top" },
    });
  };

  const navigateToEdit = () => {
    router.push("/profile/edit/0" as any);
  };

  // ── Tabs Setup ──
  const [activeTab, setActiveTab] = useState<string>("overview");

  const tabs = [
    { key: "overview", label: "Overview" },
    ...sections.filter((s) => s.key !== "overview").map((s) => ({ key: s.key, label: s.title })),
    { key: "insights", label: "Insights" },
    { key: "pay_plan", label: "Pay Plan" },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={t.background} />
      
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: t.textPrimary }]}>Profile</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity activeOpacity={0.7} style={styles.iconBtn}>
            <Feather name="help-circle" size={24} color={t.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={styles.iconBtn} onPress={() => router.push("/settings" as any)}>
            <Feather name="settings" size={24} color={t.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ── TOP SECTION (Avatar & Name) ── */}
        <View style={styles.topSection}>
          <View style={styles.avatarContainer}>
            {/* Simple circular ring wrapper */}
            <View style={[styles.avatarRing, { borderColor: t.primary }]}>
              <Image source={{ uri: DUMMY_PHOTO }} style={styles.avatarImage} />
            </View>
            <View style={[styles.pctPill, { backgroundColor: t.textPrimary }]}>
              <Text style={[styles.pctText, { color: t.background }]}>{pct}%</Text>
            </View>
          </View>

          <View style={styles.userInfoContainer}>
            <Text style={[styles.nameAgeText, { color: t.textPrimary }]}>
              {displayName}{age ? `, ${age}` : ""}
            </Text>
            
            <TouchableOpacity 
              style={[styles.completeProfileBtn, { borderColor: t.textPrimary + "33" }]} 
              activeOpacity={0.7}
              onPress={navigateToEdit}
            >
              <Text style={[styles.completeProfileText, { color: t.textPrimary }]}>
                {isComplete ? "Edit profile" : "Complete profile"}
              </Text>
              {!isComplete && <View style={styles.redDot} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── TABS (Pills) ── */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabsContainer}
          style={styles.tabsScroll}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabPill,
                  isActive ? { backgroundColor: t.textPrimary } : { backgroundColor: "transparent" },
                ]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.tabText,
                  isActive ? { color: t.background, fontFamily: "PlayfairDisplay_700Bold" } : { color: t.textSecondary, fontFamily: "Lato_400Regular" }
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── TAB CONTENT ── */}
        <View style={styles.tabContentContainer}>
          {activeTab === "overview" && (
            <OverviewCard
              displayName={displayName}
              age={age}
              gender={gender}
              location={location}
              bio={bio}
              kids={kids}
              drinking={drinking}
              interests={interests}
              t={t}
              onSeeAll={() => navigateToFull("overview")}
              onEdit={navigateToEdit}
            />
          )}

          {activeTab !== "overview" && activeTab !== "insights" && activeTab !== "pay_plan" && sections.find((s) => s.key === activeTab) && (
            <CategoryCard
              section={sections.find((s) => s.key === activeTab)!}
              answers={answers}
              t={t}
              onSeeAll={() => navigateToFull("category")}
            />
          )}

          {activeTab === "insights" && <InsightsCard t={t} />}
          {activeTab === "pay_plan" && <PayPlanCard t={t} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  /* TOP SECTION */
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatarRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    padding: 3, // Space between ring and image
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  pctPill: {
    position: "absolute",
    bottom: -6,
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pctText: {
    fontSize: 11,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  userInfoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  nameAgeText: {
    fontSize: 22,
    fontFamily: "Lato_700Bold",
    marginBottom: 8,
  },
  completeProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  completeProfileText: {
    fontSize: 13,
    fontFamily: "Lato_400Regular",
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
    backgroundColor: '#E53E3E',
  },

  /* TABS */
  tabsScroll: {
    maxHeight: 50,
    marginBottom: 20,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: "center",
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
  },

  /* CONTENT */
  tabContentContainer: {
    paddingHorizontal: 16,
  },

  /* SECTION CARD */
  sectionCard: {
    marginHorizontal: 4,
    marginBottom: 14,
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontFamily: "Lato_400Regular",
  },

  /* INFO GRID inside section */
  infoGrid: {
    gap: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoIconBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: "Lato_400Regular",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Lato_400Regular",
  },
  cardEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  cardEditText: {
    fontSize: 12,
    fontFamily: "Lato_400Regular",
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "PlayfairDisplay_400Regular_Italic",
    lineHeight: 20,
  },

  /* MINI PROGRESS */
  completionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },
  miniProgress: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  miniProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  completionText: {
    fontSize: 11,
    fontFamily: "Lato_400Regular",
  },
});
