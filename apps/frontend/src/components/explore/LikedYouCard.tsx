import React from "react";
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type LikedStatus = "liked_you" | "new_match" | "messaged";

export interface LikedProfile {
  id:       string;
  name:     string;
  age:      number;
  photo:    ImageSourcePropType;
  isOnline: boolean;
  timeAgo:  string;
}

interface Props {
  profile:       LikedProfile;
  primaryColor:  string;
  textPrimary:   string;
  textSecondary: string;
  secondary:     string;
  onPress:       () => void;
  onAction:      () => void;
}

const STATUS_CONFIG: Record<LikedStatus, { label: string; color: string; icon: string }> = {
  liked_you:  { label: "Liked you",   color: "#f472b6", icon: "heart"         },
  new_match:  { label: "New match",   color: "#4ade80", icon: "star"          },
  messaged:   { label: "Messaged you",color: "#60a5fa", icon: "chatbubble"    },
};

export function LikedYouCard({
  profile,
  primaryColor,
  textPrimary,
  textSecondary,
  secondary,
  onPress,
  onAction,
}: Props) {
  // Always show "Liked you" treatment
  const heartColor = "#f472b6";

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: secondary }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <Image source={profile.photo} style={styles.avatar} />
        {profile.isOnline && <View style={styles.onlineDot} />}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: textPrimary }]}>
          {profile.name}, {profile.age}
        </Text>
        <View style={styles.row}>
          <View style={[styles.statusDot, { backgroundColor: heartColor }]} />
          <Text style={[styles.status, { color: heartColor }]}>Liked you</Text>
        </View>
        <Text style={[styles.timeAgo, { color: textSecondary }]}>{profile.timeAgo}</Text>
      </View>

      {/* Action button */}
      <TouchableOpacity
        style={[styles.actionBtn, { borderColor: `${primaryColor}55` }]}
        onPress={onAction}
        activeOpacity={0.7}
      >
        <Ionicons name="heart" size={18} color={primaryColor} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection:     "row",
    alignItems:        "center",
    borderRadius:      16,
    padding:           14,
    marginBottom:      10,
    gap:               12,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width:        56,
    height:       56,
    borderRadius: 28,
  },
  onlineDot: {
    position:        "absolute",
    bottom:          1,
    right:           1,
    width:           12,
    height:          12,
    borderRadius:    6,
    backgroundColor: "#4ade80",
    borderWidth:     2,
    borderColor:     "#1a1a1a",
  },
  info: {
    flex: 1,
    gap:  4,
  },
  name: {
    fontSize:   15,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           5,
  },
  statusDot: {
    width:        6,
    height:       6,
    borderRadius: 3,
  },
  status: {
    fontSize:   12,
    fontWeight: "500",
  },
  timeAgo: {
    fontSize: 11,
  },
  actionBtn: {
    width:        40,
    height:       40,
    borderRadius: 20,
    borderWidth:  1.5,
    justifyContent: "center",
    alignItems:     "center",
  },
});
