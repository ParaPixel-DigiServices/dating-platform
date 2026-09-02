import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const PADDING = 20;
const GAP = 6;
const PHOTO_SIZE = (width - PADDING * 2 - GAP * 2) / 3;

// ── helpers ────────────────────────────────────────────────────
const RELIGION_META: Record<string, { icon: string; color: string; label: string }> = {
  HINDU_VALUES:     { icon: "om",               color: "#F4A261", label: "Hindu Values"   },
  MUSLIM_VALUES:    { icon: "moon-waning-crescent", color: "#60B8D4", label: "Islamic Values" },
  CHRISTIAN_VALUES: { icon: "cross",            color: "#A8D8A8", label: "Christian Values"},
  SIKH_VALUES:      { icon: "star-of-david",    color: "#FFD700", label: "Sikh Values"    },
  JAIN_VALUES:      { icon: "leaf",             color: "#98D8C8", label: "Jain Values"    },
  BUDDHIST_VALUES:  { icon: "yin-yang",         color: "#C8A8E8", label: "Buddhist Values"},
};

function getReligionMeta(interests: any[]) {
  if (!interests) return null;
  const values = interests
    .map((i: any) => (i.interest?.category ?? i.category ?? ""))
    .filter((c: string) => c.endsWith("_VALUES"));
  if (!values.length) return null;
  const key = values[0].toUpperCase();
  return RELIGION_META[key] ?? { icon: "star", color: "#F4A261", label: key.replace(/_/g, " ") };
}

function formatEnum(val: string | null | undefined): string {
  if (!val) return "—";
  return val.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function InfoRow({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={styles.infoRow}>
      <Feather name={icon as any} size={16} color={color} style={styles.infoIcon} />
      <Text style={[styles.infoLabel, { color: "rgba(255,255,255,0.5)" }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: "#fff" }]}>{value}</Text>
    </View>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <BlurView intensity={60} tint="dark" style={[styles.card, style]}>
      {children}
    </BlurView>
  );
}

function SectionTitle({ title, color }: { title: string; color: string }) {
  return <Text style={[styles.sectionTitle, { color }]}>{title}</Text>;
}

// ── Tab: Profile ───────────────────────────────────────────────
function MarriageProfileTab({ profile, t }: { profile: any; t: any }) {
  const interests: any[] = profile.interests ?? [];
  const religionMeta = getReligionMeta(interests);
  const generalInterests = interests.filter(
    (i: any) => !(i.interest?.category ?? i.category ?? "").endsWith("_VALUES")
  );
  const valueInterests = interests.filter(
    (i: any) => (i.interest?.category ?? i.category ?? "").endsWith("_VALUES")
  );

  const mp = profile.marriageProfile ?? profile.marriage_profile;

  return (
    <View style={styles.tabContent}>
      {/* Bio */}
      {profile.about && (
        <Card>
          <SectionTitle title="About" color={t.textPrimary} />
          <Text style={{ color: t.textSecondary, fontSize: 15, lineHeight: 24 }}>{profile.about}</Text>
        </Card>
      )}

      {/* Religion / Values Badge */}
      {religionMeta && (
        <Card>
          <SectionTitle title="Faith & Values" color={t.textPrimary} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={[styles.religionBadge, { borderColor: religionMeta.color + "60", backgroundColor: religionMeta.color + "18" }]}>
              <MaterialCommunityIcons name={religionMeta.icon as any} size={18} color={religionMeta.color} />
              <Text style={[styles.religionLabel, { color: religionMeta.color }]}>{religionMeta.label}</Text>
            </View>
            {profile.religion?.name && (
              <View style={[styles.religionBadge, { borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.07)" }]}>
                <Text style={{ color: t.textSecondary, fontSize: 13, fontFamily: "Lato_400Regular" }}>
                  {profile.religion.name}
                </Text>
              </View>
            )}
          </View>
          {valueInterests.length > 0 && (
            <View style={[styles.tagsWrap, { marginTop: 14 }]}>
              {valueInterests.map((vi: any, idx: number) => (
                <View key={idx} style={[styles.interestTag, { borderColor: religionMeta.color + "40", backgroundColor: religionMeta.color + "12" }]}>
                  <Text style={{ color: religionMeta.color, fontSize: 12, fontFamily: "Lato_400Regular" }}>
                    {vi.interest?.name ?? vi.name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      )}

      {/* Basic Details */}
      <Card>
        <SectionTitle title="Personal Details" color={t.textPrimary} />
        <InfoRow icon="briefcase" label="Occupation" value={profile.occupation ?? "—"} color={t.primary} />
        <InfoRow icon="book" label="Education" value={formatEnum(profile.educationLevel ?? profile.education_level)} color={t.primary} />
        <InfoRow icon="dollar-sign" label="Annual Income" value={formatEnum(profile.annualIncome ?? profile.annual_income)} color={t.primary} />
        <InfoRow icon="activity" label="Diet" value={formatEnum(profile.dietPreference ?? profile.diet_preference)} color={t.primary} />
        <InfoRow icon="heart" label="Marital Status" value={formatEnum(profile.maritalStatus ?? profile.marital_status)} color={t.primary} />
        <InfoRow icon="arrow-up" label="Height" value={profile.heightCm ? `${profile.heightCm} cm` : (profile.height ?? "—")} color={t.primary} />
      </Card>

      {/* Interests */}
      {generalInterests.length > 0 && (
        <Card>
          <SectionTitle title="Interests" color={t.textPrimary} />
          <View style={styles.tagsWrap}>
            {generalInterests.map((i: any, idx: number) => (
              <View key={idx} style={[styles.interestTag, { borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)" }]}>
                <Text style={{ color: t.textPrimary, fontSize: 12, fontFamily: "Lato_400Regular" }}>
                  {i.interest?.name ?? i.name ?? i}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      )}
    </View>
  );
}

// ── Tab: Family ────────────────────────────────────────────────
function MarriageFamilyTab({ profile, t }: { profile: any; t: any }) {
  const mp = profile.marriageProfile ?? profile.marriage_profile;

  if (!mp) {
    return (
      <View style={[styles.tabContent, { alignItems: "center", paddingTop: 40 }]}>
        <Feather name="users" size={40} color={t.textSecondary} style={{ opacity: 0.4 }} />
        <Text style={{ color: t.textSecondary, marginTop: 16, fontFamily: "Lato_400Regular" }}>
          Family details not shared yet.
        </Text>
      </View>
    );
  }

  const siblingText = (() => {
    const b = mp.brotherCount ?? 0;
    const s = mp.sisterCount ?? 0;
    if (!b && !s) return "—";
    const parts = [];
    if (b) parts.push(`${b} brother${b > 1 ? "s" : ""}`);
    if (s) parts.push(`${s} sister${s > 1 ? "s" : ""}`);
    return parts.join(", ");
  })();

  return (
    <View style={styles.tabContent}>
      <Card>
        <SectionTitle title="Family Background" color={t.textPrimary} />
        <InfoRow icon="users" label="Family Type" value={formatEnum(mp.familyType ?? mp.family_type)} color={t.primary} />
        <InfoRow icon="home" label="Living Status" value={formatEnum(mp.familyLivingStatus ?? mp.family_living_status)} color={t.primary} />
        <InfoRow icon="trending-up" label="Family Income" value={formatEnum(mp.familyIncome ?? mp.family_income)} color={t.primary} />
        <InfoRow icon="user" label="Father" value={mp.fatherName ?? mp.father_name ?? "—"} color={t.primary} />
        <InfoRow icon="user" label="Mother" value={mp.motherName ?? mp.mother_name ?? "—"} color={t.primary} />
        <InfoRow icon="users" label="Siblings" value={siblingText} color={t.primary} />
      </Card>

      <Card>
        <SectionTitle title="Relocation" color={t.textPrimary} />
        <InfoRow icon="map-pin" label="Preference" value={formatEnum(mp.relocationPreference ?? mp.relocation_preference)} color={t.primary} />
      </Card>
    </View>
  );
}

// ── Tab: Photos ────────────────────────────────────────────────
function MarriagePhotosTab({ profile, t }: { profile: any; t: any }) {
  // Normalise photos from deck card or full profile
  const rawPhotos: any[] = profile.photos ?? [];
  const photos = rawPhotos.map((p: any) => (typeof p === "string" ? p : p.cdnUrl ?? p.uri));
  const mainPhoto = typeof profile.main_photo === "string"
    ? profile.main_photo
    : profile.main_photo?.uri ?? null;

  const allPhotos = [...(mainPhoto ? [mainPhoto] : []), ...photos.filter((u: string) => u && u !== mainPhoto)];

  if (!allPhotos.length) {
    return (
      <View style={[styles.tabContent, { alignItems: "center", paddingTop: 40 }]}>
        <Feather name="image" size={40} color={t.textSecondary} style={{ opacity: 0.4 }} />
        <Text style={{ color: t.textSecondary, marginTop: 16, fontFamily: "Lato_400Regular" }}>
          No photos shared yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      <Card>
        <SectionTitle title={`Photos (${allPhotos.length})`} color={t.textPrimary} />
        <View style={styles.photoGrid}>
          {allPhotos.map((uri: string, idx: number) => (
            <View key={idx} style={styles.photoCell}>
              <Image source={{ uri }} style={styles.photo} resizeMode="cover" />
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
}

// ── Tab: Compatibility (Coming Soon) ──────────────────────────
function MarriageCompatTab({ profile, t }: { profile: any; t: any }) {
  return (
    <View style={[styles.tabContent, { alignItems: "center", paddingTop: 40, paddingHorizontal: 20 }]}>
      <LinearGradient
        colors={[t.primary + "30", t.primary + "08"]}
        style={{ borderRadius: 24, padding: 32, alignItems: "center", width: "100%", borderWidth: 1, borderColor: t.primary + "30" }}
      >
        <MaterialCommunityIcons name="chart-arc" size={52} color={t.primary} style={{ opacity: 0.9, marginBottom: 16 }} />
        <Text style={{ color: t.textPrimary, fontFamily: "Lato_700Bold", fontSize: 20, textAlign: "center", marginBottom: 10 }}>
          Marriage Compatibility Report
        </Text>
        <Text style={{ color: t.textSecondary, fontFamily: "Lato_400Regular", fontSize: 14, textAlign: "center", lineHeight: 22 }}>
          A detailed AI-powered analysis covering family values, lifestyle alignment, financial compatibility, and astrological insights.
        </Text>
        <View style={[styles.comingSoonBadge, { backgroundColor: t.primary + "20", borderColor: t.primary + "50" }]}>
          <Feather name="clock" size={13} color={t.primary} />
          <Text style={{ color: t.primary, fontFamily: "Lato_700Bold", fontSize: 12, marginLeft: 6 }}>Coming Soon</Text>
        </View>
      </LinearGradient>

      <Text style={{ color: t.textSecondary, fontFamily: "Lato_400Regular", fontSize: 13, textAlign: "center", marginTop: 24, lineHeight: 20, opacity: 0.7 }}>
        We analyse 12+ dimensions including kundali match, family background, education, values, and lifestyle to give you a holistic picture.
      </Text>
    </View>
  );
}

// ── Main Component ─────────────────────────────────────────────
const TABS = ["Profile", "Family", "Photos", "Compat"] as const;
type Tab = typeof TABS[number];

interface Props {
  profile: any;
  t: any; // theme
}

export function MarriageProfileView({ profile, t }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Profile");

  const TAB_LABELS: Record<Tab, string> = {
    Profile: "Profile",
    Family:  "Family",
    Photos:  "Photos",
    Compat:  "Compat Report",
  };

  return (
    <>
      {/* Tab Bar */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabSwitcher}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? t.textPrimary : t.textSecondary }]}>
                {TAB_LABELS[tab]}
              </Text>
              {tab === "Compat" && (
                <View style={styles.soonDot} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {activeTab === "Profile" && <MarriageProfileTab profile={profile} t={t} />}
      {activeTab === "Family"  && <MarriageFamilyTab  profile={profile} t={t} />}
      {activeTab === "Photos"  && <MarriagePhotosTab  profile={profile} t={t} />}
      {activeTab === "Compat"  && <MarriageCompatTab  profile={profile} t={t} />}
    </>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabsContainer: {
    paddingHorizontal: PADDING,
    marginBottom: 10,
  },
  tabSwitcher: {
    flexDirection: "row",
    gap: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  tabBtn: {
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  tabBtnActive: {
    borderBottomColor: "#FFF",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Lato_700Bold",
  },
  soonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FBBF24",
    marginBottom: 6,
  },
  tabContent: {
    paddingHorizontal: PADDING,
    paddingTop: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Lato_700Bold",
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  infoIcon: {
    marginRight: 10,
    width: 22,
  },
  infoLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Lato_400Regular",
  },
  infoValue: {
    fontSize: 13,
    fontFamily: "Lato_700Bold",
    maxWidth: "55%",
    textAlign: "right",
  },
  religionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  religionLabel: {
    fontSize: 13,
    fontFamily: "Lato_700Bold",
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
  },
  photoCell: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 12,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  comingSoonBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
});
