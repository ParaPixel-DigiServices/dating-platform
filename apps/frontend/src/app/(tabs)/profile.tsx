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
import theme from "@/theme/theme";

const { width, height } = Dimensions.get("window");
const HERO_HEIGHT = height * 0.48;

const DUMMY_PHOTO = "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80";

const DUMMY_INTERESTS = ["Travel", "Photography", "Music", "Coffee", "Books"];

const COMPLETE_PROFILE_STEPS = [
  { label: "Add profile photo",  done: false, icon: "camera"   },
  { label: "Write a bio",        done: false, icon: "edit-2"   },
  { label: "Add interests",      done: false, icon: "star"     },
  { label: "Basic info",         done: true,  icon: "user"     },
];

export default function ProfileScreen() {
  const router = useRouter();

  const category    = useOnboardingStore((s) => s.category) ?? "Casual";
  const firstName   = useOnboardingStore((s) => s.firstName);
  const lastName    = useOnboardingStore((s) => s.lastName);
  const gender      = useOnboardingStore((s) => s.gender);
  const dateOfBirth = useOnboardingStore((s) => s.dateOfBirth);
  const user        = useAuthStore((s) => s.user);

  const t = theme[category];

  // Calculate age from DOB
  const age = dateOfBirth
    ? new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
    : null;

  const displayName = firstName
    ? `${firstName}${lastName ? ` ${lastName}` : ""}`
    : "Your Name";

  const completedSteps = COMPLETE_PROFILE_STEPS.filter((s) => s.done).length;
  const totalSteps     = COMPLETE_PROFILE_STEPS.length;
  const progressPct    = Math.round((completedSteps / totalSteps) * 100);

  return (
    <View style={[styles.master, { backgroundColor: t.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── HERO IMAGE ──────────────────────────────────────── */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: DUMMY_PHOTO }} style={styles.heroImage} />

          {/* Top gradient for status bar readability */}
          <LinearGradient
            colors={["rgba(0,0,0,0.55)", "transparent"]}
            style={styles.topGradient}
          />

          {/* Bottom gradient fade into background */}
          <LinearGradient
            colors={["transparent", t.background]}
            locations={[0.5, 1]}
            style={styles.bottomGradient}
          />

          {/* Top bar overlay */}
          <SafeAreaView style={styles.topBarOverlay}>
            <View style={styles.topBar}>
              <Text style={[styles.appName, { color: t.primary }]}>amora</Text>
              <TouchableOpacity
                style={[styles.settingsBtn, { backgroundColor: "rgba(0,0,0,0.35)" }]}
                onPress={() => router.push("/settings" as any)}
                activeOpacity={0.8}
              >
                <Feather name="settings" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Profile badge on photo */}
          <View style={styles.verifiedBadge}>
            <Feather name="check" size={10} color="#fff" />
          </View>
        </View>

        {/* ── IDENTITY ROW ────────────────────────────────────── */}
        <View style={styles.identitySection}>
          <View style={styles.nameRow}>
            <Text style={[styles.nameText, { color: t.textPrimary }]}>
              {displayName}{age ? `, ${age}` : ""}
            </Text>
            <View style={[styles.checkBadge, { backgroundColor: t.primary }]}>
              <Feather name="check" size={12} color="#fff" />
            </View>
          </View>

          <View style={styles.metaRow}>
            {gender ? (
              <View style={[styles.metaPill, { backgroundColor: t.secondary }]}>
                <Ionicons name="person-outline" size={12} color={t.textSecondary} />
                <Text style={[styles.metaText, { color: t.textSecondary }]}>{gender}</Text>
              </View>
            ) : null}
            <View style={[styles.metaPill, { backgroundColor: t.secondary }]}>
              <Ionicons name="heart-outline" size={12} color={t.textSecondary} />
              <Text style={[styles.metaText, { color: t.textSecondary }]}>{category.replace("_", " ")}</Text>
            </View>
            {user?.email ? (
              <View style={[styles.metaPill, { backgroundColor: t.secondary }]}>
                <Feather name="mail" size={12} color={t.textSecondary} />
                <Text style={[styles.metaText, { color: t.textSecondary }]} numberOfLines={1}>
                  Verified
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── COMPLETE YOUR PROFILE BANNER ─────────────────────── */}
        <View style={[styles.completeCard, { backgroundColor: t.secondary, borderColor: t.primary }]}>
          {/* Header */}
          <View style={styles.completeHeader}>
            <View>
              <Text style={[styles.completeTitle, { color: t.textPrimary }]}>
                Complete your profile
              </Text>
              <Text style={[styles.completeSubtitle, { color: t.textSecondary }]}>
                Get 3× more matches by finishing your profile
              </Text>
            </View>
            <View style={[styles.progressCircle, { borderColor: t.primary }]}>
              <Text style={[styles.progressPct, { color: t.primary }]}>{progressPct}%</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={[styles.progressTrack, { backgroundColor: t.background }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: t.primary, width: `${progressPct}%` },
              ]}
            />
          </View>

          {/* Steps */}
          <View style={styles.stepsContainer}>
            {COMPLETE_PROFILE_STEPS.map((step) => (
              <View key={step.label} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepIcon,
                    {
                      backgroundColor: step.done ? t.primary : "transparent",
                      borderColor: step.done ? t.primary : t.textSecondary,
                    },
                  ]}
                >
                  <Feather
                    name={step.done ? "check" : (step.icon as any)}
                    size={12}
                    color={step.done ? "#fff" : t.textSecondary}
                  />
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    { color: step.done ? t.textSecondary : t.textPrimary },
                    step.done && styles.stepLabelDone,
                  ]}
                >
                  {step.label}
                </Text>
                {!step.done && (
                  <View style={[styles.stepAddBtn, { backgroundColor: t.primary }]}>
                    <Text style={styles.stepAddText}>Add</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* ── ABOUT ME ────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: t.secondary }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: t.textPrimary }]}>About me</Text>
            <TouchableOpacity>
              <Feather name="edit-2" size={16} color={t.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.sectionBodyEmpty, { color: t.textSecondary }]}>
            Write something about yourself to attract better matches...
          </Text>
        </View>

        {/* ── INTERESTS ───────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: t.secondary }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: t.textPrimary }]}>Interests</Text>
            <TouchableOpacity>
              <Feather name="plus" size={18} color={t.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.tagsRow}>
            {DUMMY_INTERESTS.map((tag) => (
              <View key={tag} style={[styles.tag, { borderColor: t.primary, backgroundColor: `${t.primary}18` }]}>
                <Text style={[styles.tagText, { color: t.primary }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── SAY HELLO BUTTON ─────────────────────────────────── */}
        <View style={styles.helloSection}>
          <TouchableOpacity
            style={[styles.helloBtn, { backgroundColor: t.primary }]}
            activeOpacity={0.85}
          >
            <Feather name="send" size={18} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.helloBtnText}>Preview Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

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

  /* COMPLETE PROFILE CARD */
  completeCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  completeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  completeTitle: {
    fontSize: 17,
    fontFamily: "Outfit_700Bold",
    marginBottom: 4,
  },
  completeSubtitle: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    maxWidth: "80%",
    lineHeight: 16,
  },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2.5,
    justifyContent: "center",
    alignItems: "center",
  },
  progressPct: {
    fontSize: 13,
    fontFamily: "Outfit_700Bold",
  },
  progressTrack: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    marginBottom: 18,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  stepsContainer: {
    gap: 14,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  stepLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Outfit_500Medium",
  },
  stepLabelDone: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  stepAddBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  stepAddText: {
    fontSize: 12,
    fontFamily: "Outfit_600SemiBold",
    color: "#fff",
  },

  /* SECTIONS */
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Outfit_600SemiBold",
  },
  sectionBodyEmpty: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    lineHeight: 20,
    fontStyle: "italic",
  },

  /* INTERESTS */
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 13,
    fontFamily: "Outfit_500Medium",
  },

  /* HELLO BUTTON */
  helloSection: {
    paddingHorizontal: 16,
    marginTop: 4,
  },
  helloBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 16,
  },
  helloBtnText: {
    fontSize: 16,
    fontFamily: "Outfit_700Bold",
    color: "#fff",
    letterSpacing: 0.3,
  },
});
