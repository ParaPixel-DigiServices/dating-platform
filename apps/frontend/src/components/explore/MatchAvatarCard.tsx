import React from "react";
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const AVATAR = 76;

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
      {/* Avatar with ring */}
      <View style={[styles.avatarRing, { borderColor: profile.isNew ? primaryColor : "transparent" }]}>
        <Image source={profile.photo} style={styles.avatar} />

        {/* Match % badge */}
        <View style={[styles.matchBadge, { backgroundColor: primaryColor }]}>
          <Text style={styles.matchText}>{profile.match}%</Text>
        </View>

        {/* Online dot */}
        {profile.isOnline && (
          <View style={styles.onlineDot} />
        )}
      </View>

      {/* Name */}
      <Text style={[styles.name, { color: textPrimary }]} numberOfLines={1}>
        {profile.name}
      </Text>
      <Text style={[styles.age, { color: textSecondary }]}>{profile.age}</Text>

      {/* New badge */}
      {profile.isNew && (
        <View style={[styles.newBadge, { backgroundColor: `${primaryColor}22`, borderColor: `${primaryColor}55` }]}>
          <Text style={[styles.newText, { color: primaryColor }]}>New</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems:  "center",
    marginRight: 16,
    width:       AVATAR + 16,
  },
  avatarRing: {
    width:        AVATAR + 6,
    height:       AVATAR + 6,
    borderRadius: (AVATAR + 6) / 2,
    borderWidth:  2.5,
    padding:      2,
    marginBottom: 8,
    position:     "relative",
  },
  avatar: {
    width:        AVATAR,
    height:       AVATAR,
    borderRadius: AVATAR / 2,
  },
  matchBadge: {
    position:          "absolute",
    bottom:            2,
    left:              2,
    paddingHorizontal: 6,
    paddingVertical:   2,
    borderRadius:      10,
  },
  matchText: {
    fontSize:   9,
    fontWeight: "700",
    color:      "#fff",
  },
  onlineDot: {
    position:     "absolute",
    bottom:       4,
    right:        4,
    width:        12,
    height:       12,
    borderRadius: 6,
    backgroundColor: "#4ade80",
    borderWidth:  2,
    borderColor:  "#1a1a1a",
  },
  name: {
    fontSize:      13,
    fontWeight:    "600",
    textAlign:     "center",
    maxWidth:      AVATAR + 16,
  },
  age: {
    fontSize:  12,
    textAlign: "center",
    marginTop: 1,
  },
  newBadge: {
    marginTop:         5,
    paddingHorizontal: 8,
    paddingVertical:   2,
    borderRadius:      10,
    borderWidth:       1,
  },
  newText: {
    fontSize:   10,
    fontWeight: "600",
  },
});
