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
import { LinearGradient } from "expo-linear-gradient";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useUserProfileStore } from "@/onboarding_ques_temp/userProfileStore";
import { formatAnswer } from "@/utils/profileHelpers";
import theme from "@/theme/theme";

const { width, height } = Dimensions.get("window");
const t = (theme as any).onboarding;


const HERO_HEIGHT = height * 0.4;
const AVATAR_SIZE = 110;
const DUMMY_PHOTO = "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80";
const HERO_BG = require("@/assets/images/main-bg.png");

// ─── Reusable Components ────────────────────────────────────────────────────────────

function InfoChip({ icon, label, value, t }: { icon: string; label: string; value: string | null; t: any }) {
  if (!value) return null;
  return (
    <View style={[styles.infoChip, { backgroundColor: t.primary + "12", borderColor: t.primary + "30" }]}>
      <Feather name={icon as any} size={14} color={t.primary} style={{ marginRight: 8, marginTop: -12 }} />
      <View>
        <Text style={[styles.infoChipLabel, { color: t.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoChipValue, { color: t.textPrimary }]}>{value}</Text>
      </View>
    </View>
  );
}

function SectionTitle({ title, t }: { title: string; t: any }) {
  return (
    <Text style={[styles.sectionTitle, { color: t.primary }]}>{title}</Text>
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

  const answers    = useUserProfileStore((s) => s.answers);
  const preferences = useUserProfileStore((s) => s.preferences);
  const isComplete = useUserProfileStore((s) => s.isProfileComplete(category as any));
  const pct        = useUserProfileStore((s) => s.getCompletionPercent(category as any));

  const age = dateOfBirth
    ? new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
    : null;

  const displayName = firstName
    ? `${firstName}${lastName ? ` ${lastName}` : ""}`
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Your Name";

  const location   = (answers['go_4'] as string) || null;
  const bio        = (answers['go_bio'] as string) || null;
  const kids       = (answers['go_kids'] as string) || null;
  const drinking   = (answers['go_9a'] as string) || null;
  const interests  = formatAnswer(answers['go_11']);
  const religion   = formatAnswer(answers['go_2']);
  const education  = formatAnswer(answers['go_5']);
  const occupation = formatAnswer(answers['go_6']);
  const intent     = formatAnswer(answers['go_3']); // usually intent

  const navigateToEdit = () => {
    router.push("/profile/edit" as any);
  };

  // ── Tabs Setup ──
  const tabs = ["BIO", "PHOTOS", "IDENTITY", "LOOKING FOR"];
  const [activeTab, setActiveTab] = useState<string>("BIO");

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* ── HERO SECTION ── */}
        <View style={{ width: "100%", height: HERO_HEIGHT }}>
          <Image source={HERO_BG} style={{ width: "100%", height: "100%" }} />
          <LinearGradient
            colors={["transparent", "rgba(13, 10, 7, 0.4)", t.background]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />

          <SafeAreaView style={styles.headerSafe}>
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/settings" as any)}>
                <Feather name="settings" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="images-outline" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* ── PROFILE CARD ── */}
        <View style={styles.cardWrapper}>
          <View style={[styles.profileCard, { backgroundColor: t.secondary }]}>
            
            {/* Overlapping Avatar */}
            <View style={[styles.avatarRing, { borderColor: t.primary, backgroundColor: t.background }]}>
              <Image source={{ uri: DUMMY_PHOTO }} style={styles.avatarImage} />
            </View>

            <TouchableOpacity style={styles.editBtn} onPress={navigateToEdit} activeOpacity={0.7}>
              <Feather name="edit-2" size={16} color={t.textSecondary} />
            </TouchableOpacity>

            {/* Basic Info */}
            <Text style={[styles.nameText, { color: t.textPrimary }]}>{displayName}</Text>
            <Text style={[styles.subtitleText, { color: t.textSecondary }]}>
              {gender ? gender.toLowerCase() : "gender"} • {age ? `${age} years` : "age"}
            </Text>
            {location && (
              <Text style={[styles.locationText, { color: t.textSecondary }]}>
                <Feather name="map-pin" size={12} /> {location}
              </Text>
            )}

            {/* Completion Section */}
            <TouchableOpacity 
              onPress={isComplete ? undefined : navigateToEdit} 
              style={[styles.meterBlock, isComplete && { opacity: 0.9 }]} 
              activeOpacity={isComplete ? 1 : 0.85}
            >
              <View style={[StyleSheet.absoluteFill, { backgroundColor: t.primary, width: `${pct}%`, opacity: 0.85 }]} />
              <View style={styles.meterContent}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={[styles.meterTitle, { color: t.textPrimary }]}>
                    {isComplete ? "PROFILE COMPLETED" : "COMPLETE YOUR PROFILE"}
                  </Text>
                  {!isComplete && (
                    <Feather name="chevron-right" size={12} color={t.textPrimary} style={{ marginLeft: 6, opacity: 0.8 }} />
                  )}
                </View>
                <View style={[styles.meterPctBadge, isComplete && { backgroundColor: "transparent", paddingHorizontal: 0 }]}>
                  <Text style={[styles.meterPctText, { color: t.textPrimary }]}>{pct}%</Text>
                </View>
              </View>
            </TouchableOpacity>

          </View>
        </View>

        {/* ── TABS ── */}
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={styles.tabBtn}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.tabText, 
                    { color: isActive ? t.textPrimary : t.textSecondary },
                    isActive && { fontFamily: "Lato_700Bold" }
                  ]}>
                    {tab}
                  </Text>
                  {isActive && <View style={[styles.activeIndicator, { backgroundColor: t.primary }]} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── TAB CONTENT ── */}
        <View style={styles.tabContent}>
          {activeTab === "BIO" && (
            <View style={styles.contentSection}>
              {bio ? (
                <Text style={[styles.bioText, { color: t.textSecondary }]}>"{bio}"</Text>
              ) : (
                <Text style={[styles.emptyText, { color: t.primaryLight + "66" }]}>Use your words to get what you want...</Text>
              )}
              
              <View style={{ marginTop: 24, gap: 12 }}>
                <SectionTitle title="Interests" t={t} />
                <View style={styles.chipsRow}>
                  {interests ? (
                    interests.split(", ").map((interest: string, i: number) => (
                      <View key={i} style={[styles.chip, { backgroundColor: t.primary + "15", borderColor: t.primary + "30" }]}>
                        <Text style={[styles.chipText, { color: t.textPrimary }]}>{interest}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={[styles.emptyText, { color: t.primaryLight + "66" }]}>No interests added yet.</Text>
                  )}
                </View>

                <SectionTitle title="Lifestyle" t={t} />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  <InfoChip icon="coffee" label="Drinking" value={drinking} t={t} />
                  <InfoChip icon="smile" label="Kids" value={kids} t={t} />
                </View>
              </View>
            </View>
          )}

          {activeTab === "PHOTOS" && (
            <View style={[styles.contentSection, { alignItems: 'center', marginTop: 32 }]}>
              <View style={[styles.photoPlaceholder, { borderColor: t.border, backgroundColor: "rgba(255,255,255,0.02)" }]}>
                <Feather name="image" size={48} color={t.textSecondary + "50"} />
              </View>
              <Text style={[styles.emptyTitle, { color: t.textPrimary, marginTop: 20 }]}>
                No photos added
              </Text>
              <Text style={[styles.emptySubtitle, { color: t.textSecondary, marginTop: 8 }]}>
                Add some photos to show your personality and get more matches.
              </Text>
              <TouchableOpacity style={[styles.addPhotoBtn, { backgroundColor: t.primary }]} activeOpacity={0.8}>
                <Feather name="plus" size={18} color="#1E1410" style={{ marginRight: 8 }} />
                <Text style={{ color: "#1E1410", fontFamily: "PlayfairDisplay_700Bold", fontSize: 16 }}>
                  Add Photos
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === "IDENTITY" && (
            <View style={styles.contentSection}>
              <View style={[styles.verificationBadge, { backgroundColor: t.primary + "10", borderColor: t.primary + "30" }]}>
                <Feather name="shield" size={18} color={t.primary} style={{ marginRight: 10 }} />
                <Text style={[styles.verificationText, { color: t.textPrimary }]}>Verification Pending</Text>
              </View>

              <View style={{ marginTop: 24, gap: 12 }}>
                <SectionTitle title="Background" t={t} />
                <InfoChip icon="book-open" label="Education" value={education} t={t} />
                <InfoChip icon="briefcase" label="Occupation" value={occupation} t={t} />
                <InfoChip icon="globe" label="Religion/Community" value={religion} t={t} />
              </View>
            </View>
          )}

          {activeTab === "LOOKING FOR" && (
            <View style={styles.contentSection}>
              <SectionTitle title="Relationship Goal" t={t} />
              {intent ? (
                <Text style={[styles.bioText, { color: t.textSecondary }]}>{intent}</Text>
              ) : (
                <Text style={[styles.emptyText, { color: t.textSecondary}]}>Not specified yet.</Text>
              )}
              
              <View style={{ marginTop: 24 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <SectionTitle title="Partner Preferences" t={t} />
                  {Object.keys(preferences).length > 0 && (
                    <TouchableOpacity onPress={() => router.push("/profile/preferences" as any)}>
                      <Text style={{ color: t.primary, fontFamily: 'Lato_700Bold', fontSize: 13 }}>
                        Edit
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {Object.keys(preferences).length > 0 ? (
                  <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {Object.keys(preferences).map((key) => {
                      const val = preferences[key];
                      if (!val) return null;
                      const displayVal = Array.isArray(val) ? val.join(", ") : String(val);
                      return (
                        <View key={key} style={{ backgroundColor: t.primary + "15", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: t.primary + "30" }}>
                          <Text style={{ color: t.textPrimary, fontFamily: "Lato_400Regular", fontSize: 13 }}>
                            <Text style={{ fontFamily: "Lato_700Bold", color: t.primary }}>{key}: </Text>
                            {displayVal}
                          </Text>
                        </View>
                      )
                    })}
                  </View>
                ) : (
                  <TouchableOpacity 
                    onPress={() => router.push("/profile/preferences" as any)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 16,
                      backgroundColor: t.primary + "10",
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: t.primary + "30",
                      marginTop: 8
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Feather name="sliders" size={18} color={t.primary} style={{ marginRight: 12 }} />
                      <Text style={{ fontSize: 15, fontFamily: "Lato_700Bold", color: t.textPrimary }}>
                        Set Preferences
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={18} color={t.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSafe: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 10,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
  },
  
  /* OVERLAPPING CARD */
  cardWrapper: {
    alignItems: "center",
    marginTop: -height * 0.18,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  profileCard: {
    width: "100%",
    borderRadius: 24,
    paddingBottom: 0,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: t.border,
  },
  avatarRing: {
    marginTop: -AVATAR_SIZE / 2,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    padding: 3,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: (AVATAR_SIZE - 6) / 2,
  },
  editBtn: {
    position: "absolute",
    right: 20,
    top: 20,
    padding: 8,
  },
  nameText: {
    fontSize: 26,
    fontFamily: "PlayfairDisplay_700Bold",
    marginTop: 12,
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 14,
    fontFamily: "Lato_400Regular",
    marginTop: 4,
    textTransform: "capitalize",
  },
  locationText: {
    fontSize: 12,
    fontFamily: "Lato_400Regular",
    marginTop: 4,
    opacity: 0.8,
  },

  /* COMPLETION SECTION */
  meterBlock: {
    width: "100%",
    marginTop: 24,
    backgroundColor: "#0A0A0A",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  meterContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 24,  
  },
  meterTitle: {
    fontSize: 10,
    fontFamily: "Lato_700Bold",
    letterSpacing: 1.5,
    // textDecorationLine: "underline",
    textDecorationStyle: "dotted",
  },
  meterPctBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  meterPctText: {
    fontSize: 12,
    fontFamily: "Lato_700Bold",
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  missingItemsContainer: {
    marginTop: 4,
  },
  missingTitle: {
    fontSize: 13,
    fontFamily: "Lato_700Bold",
    marginBottom: 8,
  },
  missingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  missingDot: {
    marginRight: 8,
  },
  missingText: {
    fontSize: 13,
    fontFamily: "Lato_400Regular",
  },
  completeBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  completeBtnText: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 14,
  },

  /* TABS */
  tabsWrapper: {
    marginTop: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  tabsScroll: {
    paddingHorizontal: 20,
    gap: 24,
  },
  tabBtn: {
    paddingVertical: 12,
    position: "relative",
  },
  tabText: {
    fontSize: 12,
    fontFamily: "Lato_400Regular",
    letterSpacing: 1.5,
  },
  activeIndicator: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
  },

  /* CONTENT */
  tabContent: {
    padding: 24,
    paddingBottom: 60,
  },
  contentSection: {
    flex: 1,
  },
  bioText: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_400Regular_Italic",
    lineHeight: 26,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Lato_400Regular",
    fontStyle: "italic",
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Lato_400Regular",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
    opacity: 0.8,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
  },
  addPhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Lato_700Bold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  
  /* CHIPS & INFO */
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Lato_400Regular",
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: "45%",
  },
  infoChipLabel: {
    fontSize: 10,
    fontFamily: "Lato_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoChipValue: {
    fontSize: 14,
    fontFamily: "Lato_400Regular",
    marginTop: 2,
  },
  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  verificationText: {
    fontSize: 15,
    fontFamily: "Lato_700Bold",
  },
});
