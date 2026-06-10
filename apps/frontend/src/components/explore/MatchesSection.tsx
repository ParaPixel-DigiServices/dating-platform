import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MatchAvatarCard, MatchProfile } from "./MatchAvatarCard";

interface Props {
  profiles:      MatchProfile[];
  primaryColor:  string;
  textPrimary:   string;
  textSecondary: string;
  secondary:     string;
  background:    string;
  onSeeAll:      () => void;
  onProfile:     (id: string) => void;
}

export function MatchesSection({
  profiles,
  primaryColor,
  textPrimary,
  textSecondary,
  secondary,
  background,
  onSeeAll,
  onProfile,
}: Props) {
  return (
    <View style={styles.wrapper}>
      {/* Section header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>
            Your Matches
          </Text>
          <Text style={[styles.sectionSub, { color: textSecondary }]}>
            {profiles.length} people liked you back
          </Text>
        </View>
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
          <Text style={[styles.seeAll, { color: primaryColor }]}>See all</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {profiles.map((p) => (
          <MatchAvatarCard
            key={p.id}
            profile={p}
            primaryColor={primaryColor}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            secondary={secondary}
            onPress={() => onProfile(p.id)}
          />
        ))}
      </ScrollView>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: `${textSecondary}20` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 8,
  },
  header: {
    flexDirection:     "row",
    justifyContent:    "space-between",
    alignItems:        "flex-end",
    paddingHorizontal: 20,
    marginBottom:      18,
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
  seeAll: {
    fontSize:      13,
    fontWeight:    "600",
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom:     4,
  },
  divider: {
    height:       1,
    marginTop:    24,
    marginBottom: 8,
    marginHorizontal: 20,
  },
});
