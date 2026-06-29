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

export const CARD_WIDTH = width * 0.88;
export const CARD_HEIGHT = height * 0.58;

// ── Icons for interests ─────────────────────────────────────────────────
const getInterestIcon = (interest: string, color: string) => {
  switch (interest) {
    case "Travel": return <Ionicons name="airplane-outline" size={12} color={color} />;
    case "Books": return <Feather name="book" size={12} color={color} />;
    case "Photography": return <Feather name="camera" size={12} color={color} />;
    case "Music": return <Feather name="music" size={12} color={color} />;
    case "Coffee": return <Feather name="coffee" size={12} color={color} />;
    case "Art": return <Feather name="edit-2" size={12} color={color} />;
    case "Yoga": return <Ionicons name="body-outline" size={12} color={color} />;
    case "Cooking": return <Ionicons name="restaurant-outline" size={12} color={color} />;
    case "Movies": return <Feather name="film" size={12} color={color} />;
    case "Dance": return <Ionicons name="musical-notes-outline" size={12} color={color} />;
    case "Fitness": return <Ionicons name="barbell-outline" size={12} color={color} />;
    case "Street Food": return <Ionicons name="pizza-outline" size={12} color={color} />;
    case "Digital Art": return <Feather name="monitor" size={12} color={color} />;
    case "Beach Time": return <Feather name="sun" size={12} color={color} />;
    case "Hiking": return <Feather name="map" size={12} color={color} />;
    case "Gaming": return <Ionicons name="game-controller-outline" size={12} color={color} />;
    case "Meditation": return <Ionicons name="leaf-outline" size={12} color={color} />;
    default: return <Feather name="star" size={12} color={color} />;
  }
};

export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: string;
  distance: string;
  distanceNum?: number;
  liked?: boolean;
  recentlyActive?: boolean;
  religion?: string;
  location?: string;
  match: number;
  interests: string[];
  main_photo: string | any;
  photos: (string | any)[];
  verified: boolean;
  occupation?: string;
  about?: string;
  height?: string;
  zodiac?: string;
  education?: string;
  drinking?: string;
  smoking?: string;
  children?: string;
  pronouns?: string;
  tagline?: string;
  prompt?: {
    question: string;
    answer: string;
  };
}

interface Props {
  profile: Profile;
  primaryColor: string;
  textPrimary: string;
  textSecondary: string;
  secondary: string;
  background: string;
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
  background,
  likeOpacity,
  nopeOpacity,
  superOpacity,
}: Props) {
  const previewTags = profile.interests.slice(0, 3);
  const remainTags = profile.interests.slice(3);

  return (
    <View style={[styles.card, { borderColor: `${primaryColor}40` }]}>
      <View style={styles.imageSection}>
        <Image
          source={typeof profile.main_photo === "string" ? { uri: profile.main_photo } : profile.main_photo}
          style={styles.photo}
          resizeMode="cover"
        />

        {/* Match badge ── top left */}
        <View style={[styles.matchBadge, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
          <Feather name="shield" size={12} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.matchText}>Photo verified</Text>
        </View>

        {/* Options badge ── top right */}
        <View style={styles.optionsBadge}>
          <Feather name="more-horizontal" size={20} color="#fff" />
        </View>

        {/* LIKE stamp */}
        {likeOpacity && (
          <Animated.View style={[styles.overlayLike, { opacity: likeOpacity }]}>
            <View style={[styles.overlayBadge, { borderColor: "#4ade80" }]}>
              <Text style={[styles.overlayText, { color: "#4ade80" }]}>LIKE</Text>
            </View>
          </Animated.View>
        )}

        {/* NOPE stamp */}
        {nopeOpacity && (
          <Animated.View style={[styles.overlayNope, { opacity: nopeOpacity }]}>
            <View style={[styles.overlayBadge, { borderColor: "#f87171" }]}>
              <Text style={[styles.overlayText, { color: "#f87171" }]}>NOPE</Text>
            </View>
          </Animated.View>
        )}

        {/* SUPER stamp */}
        {superOpacity && (
          <Animated.View style={[styles.overlaySuper, { opacity: superOpacity }]}>
            <View style={[styles.overlayBadge, { borderColor: "#FBBF24" }]}>
              <Text style={[styles.overlayText, { color: "#FBBF24" }]}>⭐ SUPER</Text>
            </View>
          </Animated.View>
        )}

        <LinearGradient
          colors={[
            "rgba(18,18,19,0)",
            "rgba(18,18,19,0)",
            "rgba(18,18,19,0.25)",
            "rgba(0, 0, 0, 0.1)",
            "rgba(0, 0, 0, 0.81)",
            "rgba(0, 0, 0, 0.97)",
            "#0D0D0F",
          ]}
          locations={[0, 0.38, 0.55, 0.62, 0.72, 0.88, 1]}
          style={styles.imageGradient}
        >

          {/* Name + verified */}
          <View style={styles.nameRow}>
            <Text style={[styles.nameText, { color: textPrimary }]}>
              {profile.name}
            </Text>
            {profile.verified && (
              <MaterialIcons
                name="verified"
                size={22}
                color="#D4AF37"
                style={styles.verifiedIcon}
              />
            )}
          </View>

          {/* Details: Age • Gender • Location */}
          <View style={styles.detailsRow}>
            <Text style={styles.detailsText}>{profile.age} • {profile.gender} • </Text>
            <Feather name="map-pin" size={12} color="rgba(255,255,255,0.85)" style={{ marginRight: 4, marginTop: 1 }} />
            <Text style={styles.detailsText}>{profile.location || profile.distance}</Text>
          </View>

          {/* Occupation */}
          {(profile.occupation || profile.education) && (
            <View style={styles.occupationRow}>
              <Feather name="briefcase" size={12} color="rgba(255,255,255,0.85)" style={{ marginRight: 6 }} />
              <Text style={styles.occupationText}>{profile.occupation || profile.education}</Text>
            </View>
          )}

          {/* Tagline / Bio */}
          {profile.tagline && (
            <Text style={styles.bioText} numberOfLines={2}>
              {profile.tagline}
            </Text>
          )}

          {/* Interest Pills */}
          <View style={styles.previewTags}>
            {previewTags.map((tag) => (
              <View key={tag} style={[styles.previewTag, { borderColor: `${primaryColor}40` }]}>
                {getInterestIcon(tag, primaryColor)}
                <Text style={styles.previewTagText}>{tag}</Text>
              </View>
            ))}
            {remainTags.length > 0 && (
              <View style={[styles.previewTag, { borderColor: `${primaryColor}40` }]}>
                <Text style={styles.previewTagText}>+{remainTags.length}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    backgroundColor: "#1a1a1a",
  },
  imageSection: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  photo: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  matchBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  matchText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  optionsBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
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
    alignItems: "center",
    zIndex: 10,
  },

  /* Gradient info overlay on image bottom */
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: "flex-end",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6
  },
  nameText: {
    fontSize: 26,
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: 0.5,
  },
  verifiedIcon: {
    marginLeft: 6
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6
  },
  detailsText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Lato_400Regular",
  },
  occupationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  occupationText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Lato_400Regular",
  },
  bioText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Lato_400Regular",
    lineHeight: 18,
    marginBottom: 16,
  },
  previewTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  previewTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderWidth: 1,
    gap: 6,
  },
  previewTagText: {
    fontSize: 10,
    fontFamily: "Lato_400Regular",
    color: "#fff"
  },
});
