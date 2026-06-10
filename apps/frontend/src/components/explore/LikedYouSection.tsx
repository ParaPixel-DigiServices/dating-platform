import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LikedYouCard, LikedProfile } from "./LikedYouCard";
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
            People waiting for your response
          </Text>
        </View>

        {/* Notification count bubble */}
        <View style={[styles.countBubble, { backgroundColor: primaryColor }]}>
          <Text style={styles.countText}>{profiles.length}</Text>
        </View>
      </View>

      {/* Cards list */}
      {profiles.map((p) => (
        <LikedYouCard
          key={p.id}
          profile={p}
          primaryColor={primaryColor}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          secondary={secondary}
          onPress={() => onProfile(p.id)}
          onAction={() => onAction(p.id)}
        />
      ))}

      {/* See more link */}
      <TouchableOpacity
        style={styles.seeMoreRow}
        onPress={onSeeMore}
        activeOpacity={0.7}
      >
        <Text style={[styles.seeMoreText, { color: primaryColor }]}>
          See more profiles
        </Text>
        <Feather name="arrow-right" size={14} color={primaryColor} style={{ marginLeft: 4 }} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingTop:        16,
    paddingBottom:     32,
  },
  header: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "flex-start",
    marginBottom:   18,
  },
  sectionTitle: {
    fontSize:      18,
    fontWeight:    "700",
    letterSpacing: 0.2,
  },
  sectionSub: {
    fontSize:  12,
    marginTop: 3,
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
    fontWeight: "800",
    color:      "#fff",
  },
  seeMoreRow: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "center",
    marginTop:      8,
    paddingVertical: 14,
  },
  seeMoreText: {
    fontSize:      14,
    fontWeight:    "600",
    letterSpacing: 0.3,
  },
});
