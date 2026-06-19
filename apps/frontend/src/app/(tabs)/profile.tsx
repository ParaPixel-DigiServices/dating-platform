import React from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useUserProfileStore } from "@/onboarding_ques_temp/userProfileStore";
import {
  getProfileSections,
  findQuestionById,
  type ProfileSection,
} from "@/utils/profileHelpers";
import theme from "@/theme/theme";

const { width, height } = Dimensions.get("window");
const HERO_HEIGHT = height * 0.48;

const DUMMY_PHOTO =
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80";

// ─── Basic Info Card ──────────────────────────────────────────────────────────

interface BasicInfoCardProps {
  displayName: string;
  age: number | null;
  gender: string | null;
  location: string | null;   // from go_4
  height: string | null;     // from go_7
  occupation: string | null; // from go_6
  education: string | null;  // from go_5
  t: any;
  onSeeAll: () => void;
  onEdit: () => void;
}

function BasicInfoCard({
  displayName, age, gender, location, height, occupation, education, t, onSeeAll, onEdit
}: BasicInfoCardProps) {
  const NA = "NA";

  const rows: { label: string; value: string | null; icon: string }[] = [
    { label: "Name",       value: displayName !== "Your Name" ? displayName : null, icon: "user"    },
    { label: "Age",        value: age ? `${age} years` : null,                      icon: "calendar" },
    { label: "Gender",     value: gender,                                           icon: "users"    },
    { label: "Location",   value: location,                                         icon: "map-pin"  },
    { label: "Height",     value: height,                                           icon: "bar-chart-2" },
    { label: "Occupation", value: occupation,                                       icon: "briefcase" },
  ];

  return (
    <View style={[styles.sectionCard, { backgroundColor: t.secondary }]}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionIcon}>👤</Text>
          <Text style={[styles.sectionTitle, { color: t.textSecondary }]}>Basic Info</Text>
        </View>
        <TouchableOpacity style={styles.seeAllBtn} onPress={onSeeAll} activeOpacity={0.7}>
          <Text style={[styles.seeAllText, { color: t.primary }]}>See all</Text>
          <Feather name="chevron-right" size={14} color={t.primary} />
        </TouchableOpacity>
      </View>

      {/* Info rows */}
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

      {/* Edit nudge */}
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
  // Show only first 4 answers as a preview
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
            const displayAns = Array.isArray(ans) ? ans.join(", ") : ans ?? null;
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

      {/* Mini progress */}
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

  // Pull extra fields from profile answers (with NA fallback handled in card)
  const location   = (answers['go_4'] as string) || null;
  const height     = (answers['go_7'] as string) || null;
  const occupation = (answers['go_6'] as string) || null;
  const education  = (answers['go_5'] as string) || null;

  const categorySection = sections.find((s) => s.key === 'category') ?? null;

  const navigateToFull = (sectionKey?: string) => {
    router.push({
      pathname: "/profile/full" as any,
      params: { scrollTo: sectionKey ?? "top" },
    });
  };

  const navigateToEdit = () => {
    router.push("/profile/edit/0" as any);
  };

  return (
    <View style={[styles.master, { backgroundColor: t.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── HERO IMAGE ─────────────────────────────────────── */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: DUMMY_PHOTO }} style={styles.heroImage} />

          <LinearGradient
            colors={["rgba(0,0,0,0.55)", "transparent"]}
            style={styles.topGradient}
          />
          <LinearGradient
            colors={["transparent", t.background]}
            locations={[0.5, 1]}
            style={styles.bottomGradient}
          />

          <SafeAreaView style={styles.topBarOverlay}>
            <View style={styles.topBar}>
              <Text style={[styles.appName, { color: t.primary }]}>amora</Text>
              <TouchableOpacity
                style={[
                  styles.settingsBtn,
                  { backgroundColor: "rgba(0,0,0,0.35)" },
                ]}
                onPress={() => router.push("/settings" as any)}
                activeOpacity={0.8}
              >
                <Feather name="settings" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          <View style={styles.verifiedBadge}>
            <Feather name="check" size={10} color="#fff" />
          </View>
        </View>

        {/* ── IDENTITY ROW ──────────────────────────────────── */}
        <View style={styles.identitySection}>
          <View style={styles.nameRow}>
            <Text style={[styles.nameText, { color: t.textSecondary }]}>
              {displayName}
              {age ? `, ${age}` : ""}
            </Text>
            <View style={[styles.checkBadge, { backgroundColor: t.primary }]}>
              <Feather name="check" size={12} color="#fff" />
            </View>
          </View>

          <View style={styles.metaRow}>
            {gender ? (
              <View
                style={[styles.metaPill, { backgroundColor: t.secondary }]}
              >
                <Ionicons
                  name="person-outline"
                  size={12}
                  color={t.textSecondary}
                />
                <Text style={[styles.metaText, { color: t.textSecondary }]}>
                  {gender}
                </Text>
              </View>
            ) : null}
            <View style={[styles.metaPill, { backgroundColor: t.secondary }]}>
              <Ionicons
                name="heart-outline"
                size={12}
                color={t.textSecondary}
              />
              <Text style={[styles.metaText, { color: t.textSecondary }]}>
                {category.replace("_", " ")}
              </Text>
            </View>
            {user?.email ? (
              <View
                style={[styles.metaPill, { backgroundColor: t.secondary }]}
              >
                <Feather name="mail" size={12} color={t.textSecondary} />
                <Text
                  style={[styles.metaText, { color: t.textSecondary }]}
                  numberOfLines={1}
                >
                  Verified
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── COMPLETE PROFILE BANNER (only when incomplete) ─── */}
        {!isComplete && (
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={navigateToEdit}
            style={[
              styles.completeBanner,
              { backgroundColor: t.secondary, borderColor: t.primary },
            ]}
          >
            <LinearGradient
              colors={[t.primary + "22", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.bannerLeft}>
              <Text style={[styles.bannerTitle, { color: t.textSecondary }]}>
                Complete your profile
              </Text>
              <Text style={[styles.bannerSub, { color: t.textSecondary + "aa" }]}>
                Get 3× more matches · {pct}% done
              </Text>

              {/* Progress bar */}
              <View
                style={[
                  styles.bannerTrack,
                  { backgroundColor: t.primary + "33" },
                ]}
              >
                <View
                  style={[
                    styles.bannerFill,
                    { backgroundColor: t.primary, width: `${pct}%` },
                  ]}
                />
              </View>
            </View>

            <View
              style={[
                styles.bannerCTA,
                { backgroundColor: t.primary },
              ]}
            >
              <Text style={styles.bannerCTAText}>Start</Text>
              <Feather name="arrow-right" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
        )}

        {/* ── BASIC INFO SECTION ─────────────────────────────── */}
        <BasicInfoCard
          displayName={displayName}
          age={age}
          gender={gender}
          location={location}
          height={height}
          occupation={occupation}
          education={education}
          t={t}
          onSeeAll={() => navigateToFull('basic')}
          onEdit={navigateToEdit}
        />

        {/* ── CATEGORY SECTION ──────────────────────────────── */}
        {categorySection && (
          <CategoryCard
            section={categorySection}
            answers={answers}
            t={t}
            onSeeAll={() => navigateToFull('category')}
          />
        )}

        {/* ── EDIT PROFILE BUTTON (always at bottom) ────────── */}
        <View style={styles.editSection}>
          <TouchableOpacity
            style={[styles.editBtn, { borderColor: t.primary }]}
            activeOpacity={0.85}
            onPress={navigateToEdit}
          >
            <Feather
              name="edit-2"
              size={16}
              color={t.primary}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.editBtnText, { color: t.primary }]}>
              {isComplete ? "Edit Profile" : "Complete Profile"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  master: { flex: 1 },

  /* HERO */
  heroContainer: {
    width,
    height: HERO_HEIGHT,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT * 0.5,
  },
  topBarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 10,
    paddingBottom: 10,
  },
  appName: {
    fontSize: 22,
    fontFamily: "Outfit_700Bold",
    letterSpacing: -0.5,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 16,
    right: 20,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  /* IDENTITY */
  identitySection: {
    paddingHorizontal: 20,
    marginTop: -8,
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  nameText: {
    fontSize: 28,
    fontFamily: "Outfit_700Bold",
    letterSpacing: -0.5,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Outfit_500Medium",
  },

  /* COMPLETE BANNER */
  completeBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  bannerLeft: {
    flex: 1,
    marginRight: 12,
  },
  bannerTitle: {
    fontSize: 15,
    fontFamily: "Outfit_700Bold",
    marginBottom: 3,
  },
  bannerSub: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    marginBottom: 10,
  },
  bannerTrack: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  bannerFill: {
    height: "100%",
    borderRadius: 2,
  },
  bannerCTA: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  bannerCTAText: {
    fontSize: 13,
    fontFamily: "Outfit_700Bold",
    color: "#fff",
  },

  /* SECTION CARD */
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 20,
    padding: 18,
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
    fontSize: 15,
    fontFamily: "Outfit_600SemiBold",
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontFamily: "Outfit_500Medium",
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
    fontFamily: "Outfit_400Regular",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Outfit_500Medium",
  },
  infoEmpty: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    fontStyle: "italic",
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
    fontFamily: "Outfit_500Medium",
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    fontStyle: "italic",
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
    fontFamily: "Outfit_400Regular",
  },

  /* EDIT BUTTON */
  editSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  editBtnText: {
    fontSize: 15,
    fontFamily: "Outfit_600SemiBold",
  },
});
