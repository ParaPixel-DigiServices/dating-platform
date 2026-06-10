import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface UserProfileData {
  name: string;
  age: number;
  distance: string;
  match: number;
  about: string;
  interests: string[];
  religion?: string;
  hobbies?: string[];
  quote?: string;
}

interface Props {
  profile: UserProfileData;
  textPrimary: string;
  textSecondary: string;
  background: string;
  secondary: string;
}

export function ProfileInfoCard({
  profile,
  textPrimary,
  textSecondary,
  background,
  secondary,
}: Props) {
  return (
    <BlurView 
      intensity={80} 
      tint="dark" 
      style={[styles.card, { backgroundColor: `${background}55` }]} // Using theme background with high transparency
    >
      {/* Gradient layer over the glassmorphism to fade bottom to solid */}
      <LinearGradient
        colors={[`${background}30`, background]}
        locations={[0, 1]} // Start transparent, fade to solid background at bottom
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Name, Age & Verification */}
      <View style={styles.nameRow}>
        <Text style={[styles.name, { color: textPrimary }]}>
          {profile.name}, {profile.age}
        </Text>
        <MaterialIcons name="verified" size={26} color={textPrimary} />
      </View>

      {/* Distance & Match */}
      <View style={styles.subInfoRow}>
        <Text style={[styles.subInfoText, { color: textSecondary }]}>{profile.distance}</Text>
        <Text style={[styles.dot, { color: textSecondary }]}>·</Text>
        <Text style={[styles.subInfoText, { color: textSecondary }]}>{profile.match}% Match</Text>
      </View>

      {/* About Me */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>About me</Text>
        <Text style={[styles.bodyText, { color: textSecondary }]}>{profile.about}</Text>
      </View>

      {/* Interests */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Interests</Text>
        <View style={styles.tagsContainer}>
          {profile.interests.map((interest, index) => (
            <View key={`interest-${index}`} style={[styles.tag, { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }]}>
              <Text style={[styles.tagText, { color: textSecondary }]}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Religion */}
      {profile.religion && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Religion</Text>
          <Text style={[styles.bodyText, { color: textSecondary }]}>{profile.religion}</Text>
        </View>
      )}

      {/* Hobbies */}
      {profile.hobbies && profile.hobbies.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Hobbies</Text>
          <View style={styles.tagsContainer}>
            {profile.hobbies.map((hobby, index) => (
              <View key={`hobby-${index}`} style={[styles.tag, { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }]}>
                <Text style={[styles.tagText, { color: textSecondary }]}>{hobby}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Favorite Quote */}
      {profile.quote && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Favorite Quote</Text>
          <Text style={[styles.bodyText, { color: textSecondary, fontStyle: "italic" }]}>"{profile.quote}"</Text>
        </View>
      )}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "95%", // 95% of screen width
    alignSelf: "center", // centered
    borderRadius: 20, // fully rounded edges
    paddingVertical: 30,
    paddingHorizontal: 24,
    overflow: "hidden", // Important for BlurView border radius
    // Add shadow pointing upwards slightly
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)", // Subtle border for definition
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Times New Roman" : "serif",
    letterSpacing: 0.5,
  },
  subInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  subInfoText: {
    fontSize: 13,
    fontWeight: "500",
  },
  dot: {
    marginHorizontal: 8,
    fontSize: 13,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
