import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export const CARD_WIDTH = width - 32;
export const CARD_HEIGHT = height * 1.15;

const IMAGE_SECTION_H = height * 0.6;

// ── Emoji map ─────────────────────────────────────────────────
const INTEREST_EMOJI: Record<string, string> = {
  Travel: "✈️",
  Books: "📚",
  Photography: "📸",
  Music: "🎵",
  Coffee: "☕",
  Art: "🎨",
  Yoga: "🧘",
  Cooking: "🍳",
  Movies: "🎬",
  Dance: "💃",
  Fitness: "💪",
  "Street Food": "🍕",
  "Digital Art": "🖥️",
  "Beach Time": "🏖️",
  Hiking: "🥾",
  Gaming: "🎮",
  Meditation: "🧠",
};

export interface Profile {
  id: string;
  name: string;
  age: number;
  distance: string;
  match: number;
  interests: string[];
  photo: string;
  verified: boolean;
  about?: string;
  height?: string;
  zodiac?: string;
  education?: string;
  preferences?: string[]; // e.g. ["Non-smoker 🚭", "No kids 🚫", "Dog lover 🐕"]
  tagline?: string; // short punchy line shown in detail section
}

interface Props {
  profile: Profile;
  primaryColor: string;
  textPrimary: string;
  textSecondary: string;
  secondary: string;
  likeOpacity?: Animated.AnimatedInterpolation<string | number>;
  nopeOpacity?: Animated.AnimatedInterpolation<string | number>;
  superOpacity?: Animated.AnimatedInterpolation<string | number>;
}

export function MatchCard({
  profile,
  primaryColor,
  textPrimary,
  textSecondary,
  secondary,
  likeOpacity,
  nopeOpacity,
  superOpacity,
}: Props) {
  // Show first 3 interests as badges on the image; rest go in info section
  const previewTags = profile.interests.slice(0, 3);
  const remainTags = profile.interests.slice(3);

  return (
    <View style={[styles.card, { borderColor: primaryColor }]}>
      {/* ══════════════════════════════════════════
          SECTION 1 — IMAGE with overlay info
      ══════════════════════════════════════════ */}
      <View style={styles.imageSection}>
        <Image source={{ uri: profile.photo }} style={styles.photo} />

        {/* Subtle colour tint */}
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: secondary, opacity: 0.25 },
          ]}
        />

        {/* Match badge ── top right */}
        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>{profile.match}% Match</Text>
        </View>

        {/* LIKE stamp */}
        {likeOpacity && (
          <Animated.View style={[styles.overlayLike, { opacity: likeOpacity }]}>
            <View style={[styles.overlayBadge, { borderColor: "#4ade80" }]}>
              <Text style={[styles.overlayText, { color: "#4ade80" }]}>
                LIKE
              </Text>
            </View>
          </Animated.View>
        )}

        {/* NOPE stamp */}
        {nopeOpacity && (
          <Animated.View style={[styles.overlayNope, { opacity: nopeOpacity }]}>
            <View style={[styles.overlayBadge, { borderColor: "#f87171" }]}>
              <Text style={[styles.overlayText, { color: "#f87171" }]}>
                NOPE
              </Text>
            </View>
          </Animated.View>
        )}

        {/* SUPER stamp — center, triggered by upward swipe */}
        {superOpacity && (
          <Animated.View style={[styles.overlaySuper, { opacity: superOpacity }]}>
            <View style={[styles.overlayBadge, { borderColor: "#FBBF24" }]}>
              <Text style={[styles.overlayText, { color: "#FBBF24" }]}>
                ⭐ SUPER
              </Text>
            </View>
          </Animated.View>
        )}

        {/* ── Bottom gradient + name / distance / tags ── */}
        <LinearGradient
          colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.50)", "rgba(0,0,0,0.92)"]}
          locations={[0.0, 0.4, 1]}
          style={styles.imageGradient}
        >
          {/* Name + verified */}
          <View style={styles.nameRow}>
            <Text style={[styles.nameText, { color: textPrimary }]}>
              {profile.name}, {profile.age}
            </Text>
            {profile.verified && (
              <MaterialIcons
                name="verified"
                size={24}
                color="#D4AF37"
                style={styles.verifiedIcon}
              />
            )}
          </View>

          {/* Distance */}
          <View style={styles.locationRow}>
            <Feather
              name="map-pin"
              size={12}
              color="rgba(255,255,255,0.75)"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.distanceText}>{profile.distance}</Text>
          </View>

          {/* Preview interest pills */}
          <View style={styles.previewTags}>
            {previewTags.map((tag) => (
              <View key={tag} style={styles.previewTag}>
                <Text style={styles.previewTagText}>
                  {INTEREST_EMOJI[tag] ?? "✨"} {tag}
                </Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </View>

      {/* ══════════════════════════════════════════
          SECTION 2 — ADDITIONAL INFO (plain View)
      ══════════════════════════════════════════ */}
      <View style={[styles.infoSection, { backgroundColor: secondary }]}>
        {/* Tagline */}
        {profile.tagline && (
          <Text style={[styles.tagline, { color: textPrimary }]}>
            "{profile.tagline}"
          </Text>
        )}

        {/* Quick chips: height / zodiac / education */}
        {(profile.height || profile.zodiac || profile.education) && (
          <View style={styles.chipsRow}>
            {profile.height && (
              <Chip
                emoji="📏"
                label={profile.height}
                primaryColor={primaryColor}
                textSecondary={textSecondary}
              />
            )}
            {profile.zodiac && (
              <Chip
                emoji="🔮"
                label={profile.zodiac}
                primaryColor={primaryColor}
                textSecondary={textSecondary}
              />
            )}
            {profile.education && (
              <Chip
                emoji="🎓"
                label={profile.education}
                primaryColor={primaryColor}
                textSecondary={textSecondary}
              />
            )}
          </View>
        )}

        <View
          style={[styles.divider, { backgroundColor: `${primaryColor}25` }]}
        />

        {/* About */}
        {profile.about && (
          <>
            <Text style={[styles.sectionLabel, { color: primaryColor }]}>
              ABOUT
            </Text>
            <Text style={[styles.aboutText, { color: textSecondary }]}>
              {profile.about}
            </Text>
            <View
              style={[styles.divider, { backgroundColor: `${primaryColor}25` }]}
            />
          </>
        )}

        {/* Preferences */}
        {profile.preferences && profile.preferences.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: primaryColor }]}>
              LIFESTYLE
            </Text>
            <View style={styles.prefsRow}>
              {profile.preferences.map((pref) => (
                <View
                  key={pref}
                  style={[
                    styles.prefChip,
                    {
                      borderColor: `${primaryColor}40`,
                      backgroundColor: `${primaryColor}12`,
                    },
                  ]}
                >
                  <Text style={[styles.prefText, { color: textSecondary }]}>
                    {pref}
                  </Text>
                </View>
              ))}
            </View>
            <View
              style={[styles.divider, { backgroundColor: `${primaryColor}25` }]}
            />
          </>
        )}

        {/* Hobbies (remaining interests not shown on image) */}
        {(remainTags.length > 0 || previewTags.length > 0) && (
          <>
            <Text style={[styles.sectionLabel, { color: primaryColor }]}>
              HOBBIES
            </Text>
            <View style={styles.tagsRow}>
              {profile.interests.map((tag) => (
                <View
                  key={tag}
                  style={[
                    styles.tag,
                    {
                      backgroundColor: `${primaryColor}18`,
                      borderColor: `${primaryColor}40`,
                    },
                  ]}
                >
                  <Text style={styles.tagEmoji}>
                    {INTEREST_EMOJI[tag] ?? "✨"}
                  </Text>
                  <Text style={[styles.tagText, { color: textPrimary }]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 28 }} />
      </View>
    </View>
  );
}

// ── Reusable chip ─────────────────────────────────────────────
function Chip({
  emoji,
  label,
  primaryColor,
  textSecondary,
}: {
  emoji: string;
  label: string;
  primaryColor: string;
  textSecondary: string;
}) {
  return (
    <View style={[chipStyles.chip, { borderColor: `${primaryColor}55` }]}>
      <Text style={chipStyles.emoji}>{emoji}</Text>
      <Text style={[chipStyles.label, { color: textSecondary }]}>{label}</Text>
    </View>
  );
}
const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  emoji: { fontSize: 12 },
  label: { fontSize: 12, fontWeight: "500" },
});

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    backgroundColor: "#1a1a1a",
  },

  /* Image section */
  imageSection: {
    width: "100%",
    height: IMAGE_SECTION_H,
    overflow: "hidden",
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },
  matchBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  matchText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },

  /* Swipe overlays */
  overlayLike: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    padding: 24,
    zIndex: 10,
  },
  overlayNope: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    padding: 24,
    zIndex: 10,
  },
  overlayBadge: {
    borderWidth: 3,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    transform: [{ rotate: "-15deg" }],
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  overlayText: { fontSize: 32, fontWeight: "900", letterSpacing: 3 },
  overlaySuper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems:     "center",
    zIndex:         10,
  },

  /* Gradient info overlay on image bottom */
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: IMAGE_SECTION_H * 0.8,
    paddingHorizontal: 18,
    paddingBottom: 18,
    justifyContent: "flex-end",
  },
  nameRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  nameText: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.3,
    fontFamily: Platform.OS === "ios" ? "Times New Roman" : "serif",
  },
  verifiedIcon: { marginLeft: 8 },
  locationRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  distanceText: { fontSize: 13, color: "rgba(255,255,255,0.80)" },
  previewTags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  previewTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  previewTagText: { fontSize: 12, fontWeight: "500", color: "#fff" },

  /* Info section */
  infoSection: {
    flex: 1, 
    paddingTop: 30, 
    paddingHorizontal: 18,
  },
  tagline: {
    fontSize: 15,
    fontStyle: "italic",
    marginBottom: 14,
    lineHeight: 22,
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  divider: { height: 1, marginVertical: 14, borderRadius: 1 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  aboutText: { fontSize: 14, lineHeight: 22 },
  prefsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  prefChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  prefText: { fontSize: 12, fontWeight: "500" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  tagEmoji: { fontSize: 13 },
  tagText: { fontSize: 13, fontWeight: "500" },
});
