import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Profile } from "./MatchCard";

interface Props {
  profile: Profile;
  primaryColor: string;
  textPrimary: string;
  background: string;
  secondary: string;
}

export function AboutMeSection({ profile, primaryColor, textPrimary, background, secondary }: Props) {
  // We'll generate pills based on the profile data
  const renderPill = (iconName: any, text: string, IconFamily: any = Feather) => {
    if (!text) return null;
    return (
      <View style={[styles.pill, { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", borderWidth: 1 }]}>
        <IconFamily name={iconName} size={14} color={primaryColor} style={styles.pillIcon} />
        <Text style={[styles.pillText, { color: textPrimary }]}>{text}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: secondary }]}>
      <Text style={[styles.title, { color: textPrimary }]}>About me</Text>
      <View style={styles.pillsContainer}>
        {renderPill("ruler", profile.height, MaterialCommunityIcons)}
        {renderPill("school-outline", profile.education, Ionicons)}
        {renderPill("briefcase-outline", profile.occupation, Ionicons)}
        {renderPill("wine-outline", profile.drinking, Ionicons)}
        {renderPill("smoking-off", profile.smoking, MaterialCommunityIcons)}
        {renderPill("baby-carriage", profile.children, MaterialCommunityIcons)}
        {renderPill("star-outline", profile.zodiac, Ionicons)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderRadius: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "Lato_700Bold",
    marginBottom: 16,
  },
  pillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  pillIcon: {
    marginRight: 6,
  },
  pillText: {
    fontSize: 14,
    fontFamily: "Lato_400Regular",
  },
});
