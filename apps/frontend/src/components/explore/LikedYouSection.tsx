import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LikedGridCard } from "./LikedGridCard";
import { LikedProfile } from "./LikedYouCard"; // reuse the interface
import { Feather } from "@expo/vector-icons";

interface Props {
  profiles:      LikedProfile[];
  primaryColor:  string;
  textPrimary:   string;
  textSecondary: string;
  secondary:     string;
  onSeeMore:     () => void;
  onProfile:     (id: string) => void;
  onAction:      (id: string) => void;
}

export function LikedYouSection({
  profiles,
  primaryColor,
  textPrimary,
  textSecondary,
  secondary,
  onSeeMore,
  onProfile,
  onAction,
}: Props) {
  return (
    <View style={styles.wrapper}>
      {/* Section header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>
            Liked You
          </Text>
          <Text style={[styles.sectionSub, { color: textSecondary }]}>
            Upgrade to see who liked you
          </Text>
        </View>

        {/* Notification count bubble */}
        <View style={[styles.countBubble, { backgroundColor: primaryColor }]}>
          <Text style={styles.countText}>{profiles.length}</Text>
        </View>
      </View>

      {/* Grid of cards */}
      <View style={styles.gridContainer}>
        {profiles.map((p, index) => (
          <LikedGridCard
            key={p.id}
            profile={p}
            primaryColor={primaryColor}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            secondary={secondary}
            isBlurred={index > 0} // First one clear, rest blurred
            onPress={() => onProfile(p.id)}
            onAction={() => onAction(p.id)}
          />
        ))}
      </View>

      {/* See more link */}
      <TouchableOpacity
        style={[styles.seeMoreBtn, { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }]}
        onPress={onSeeMore}
        activeOpacity={0.7}
      >
        <Text style={[styles.seeMoreText, { color: primaryColor }]}>
          Unlock all {profiles.length} admirers
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingTop:        24,
    paddingBottom:     32,
  },
  header: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "flex-start",
    marginBottom:   20,
  },
  sectionTitle: {
    fontSize:      20,
    fontFamily:    "Lato_700Bold",
    letterSpacing: 0.2,
  },
  sectionSub: {
    fontSize:  13,
    fontFamily: "Lato_400Regular",
    marginTop: 4,
  },
  countBubble: {
    width:          28,
    height:         28,
    borderRadius:   14,
    justifyContent: "center",
    alignItems:     "center",
    marginTop:      2,
  },
  countText: {
    fontSize:   12,
    fontFamily: "Lato_700Bold",
    color:      "#000",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  seeMoreBtn: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "center",
    marginTop:      12,
    paddingVertical: 16,
    borderRadius: 24,
    borderWidth: 1,
  },
  seeMoreText: {
    fontSize:      15,
    fontFamily:    "Lato_700Bold",
    letterSpacing: 0.3,
  },
});
