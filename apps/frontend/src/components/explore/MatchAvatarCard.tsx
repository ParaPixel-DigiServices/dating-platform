import React from "react";
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const CARD_WIDTH = 110;
const CARD_HEIGHT = 150;

export interface MatchProfile {
  id:       string;
  name:     string;
  age:      number;
  photo:    ImageSourcePropType;
  match:    number;
  isOnline: boolean;
  isNew:    boolean;
}

interface Props {
  profile:      MatchProfile;
  primaryColor: string;
  textPrimary:  string;
  textSecondary:string;
  secondary:    string;
  onPress:      () => void;
}

export function MatchAvatarCard({
  profile,
  primaryColor,
  textPrimary,
  textSecondary,
  secondary,
  onPress,
}: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={profile.photo} style={styles.image} />
      
      {/* Dark gradient for text readability */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.gradient}
      />

      {/* Online dot at top right */}
      {profile.isOnline && <View style={styles.onlineDot} />}

      {/* Border overlay for new match */}
      {profile.isNew && (
        <View style={[styles.newBorder, { borderColor: primaryColor }]} />
      )}

      {/* Info section at bottom */}
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: textPrimary }]} numberOfLines={1}>
            {profile.name}
          </Text>
          {profile.isNew && (
            <View style={[styles.newBadge, { backgroundColor: primaryColor }]}>
              <Text style={styles.newText}>NEW</Text>
            </View>
          )}
        </View>
        <Text style={[styles.matchText, { color: primaryColor }]}>
          {profile.match}% Match
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    marginRight: 12,
    overflow: "hidden",
    backgroundColor: "#1c1c1e",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  onlineDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4ade80",
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.5)",
  },
  newBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderRadius: 16,
  },
  infoContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    fontFamily: "Lato_700Bold",
    flexShrink: 1,
  },
  newBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newText: {
    fontSize: 8,
    fontFamily: "Lato_700Bold",
    color: "#fff",
  },
  matchText: {
    fontSize: 11,
    fontFamily: "Lato_700Bold",
  },
});
