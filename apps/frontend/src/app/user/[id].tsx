import React, { useMemo } from "react";
import { View, Image, StyleSheet, Dimensions, StatusBar, ScrollView, TouchableOpacity, Text, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { Feather } from "@expo/vector-icons";
import theme from "@/theme/theme";
import { ProfileHeaderButtons } from "@/components/profile/ProfileHeaderButtons";
import { ProfileInfoCard } from "@/components/profile/ProfileInfoCard";

const { height } = Dimensions.get("window");
const IMAGE_HEIGHT = height * 0.70; // 70% of screen height

const DUMMY_IMG = require("../../../assets/images/dummy_img1.png");

// Mock function to simulate fetching a user by ID
const getMockUser = (id: string) => {
  return {
    id,
    name: "Priya",
    age: 24,
    distance: "2 km away",
    match: 92,
    photo: DUMMY_IMG,
    about: "Book lover 📚, coffee enthusiast ☕️\nand always up for a good conversation.",
    interests: ["Travel", "Books", "Photography", "Music", "Fitness", "Art"],
    religion: "Hindu",
    hobbies: ["Painting", "Yoga", "Baking", "Dancing"],
    quote: "Life is what happens when you're busy making other plans.",
  };
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const category = useOnboardingStore((s) => s.category) ?? "Casual";
  const t = theme[category];

  const profile = useMemo(() => getMockUser(id), [id]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/explore");
    }
  };

  const handleMenu = () => {
    console.log("Menu pressed");
  };

  const handleSayHello = () => {
    console.log("Say Hello pressed");
  };

  const handleReport = () => {
    console.log("Report pressed");
  };

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {/* Top Image & Gradient Fade (Fixed Background) */}
      <View style={styles.imageContainer}>
        <Image source={profile.photo} style={styles.image} resizeMode="cover" />
        <LinearGradient
          colors={["transparent", t.background]}
          locations={[0.5, 1]}
          style={styles.imageGradient}
          pointerEvents="none"
        />
      </View>

      {/* Overlay Header Buttons */}
      <ProfileHeaderButtons primaryColor={t.primary} onBack={handleBack} onMenu={handleMenu} />

      {/* Scrollable Content overlaying the image */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
      >
        {/* Transparent spacer to push the card down and reveal the image initially */}
        <View style={{ height: IMAGE_HEIGHT * 0.55 }} />

        {/* Floating Info Card */}
        <ProfileInfoCard
          profile={profile}
          textPrimary={t.textPrimary}
          textSecondary={t.textSecondary}
          background={t.background}
          secondary={t.secondary}
        />

        {/* Bottom spacer so scroll doesn't get hidden behind fixed buttons */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Bottom Buttons Overlay (visually solid bottom part of the card) */}
      <View style={[styles.fixedBottomContainer, { backgroundColor: t.background }]}>
        {/* Say Hello Button */}
        <TouchableOpacity style={styles.helloBtnWrapper} activeOpacity={0.8} onPress={handleSayHello}>
          <LinearGradient
            colors={[`${t.primary}dd`, t.primary]}
            style={styles.helloBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Feather name="send" size={18} color="#000" style={styles.helloIcon} />
            <Text style={styles.helloText}>Say Hello</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Report Button */}
        <TouchableOpacity style={styles.reportBtn} activeOpacity={0.6} onPress={handleReport}>
          <Feather name="flag" size={14} color={t.textSecondary} />
          <Text style={[styles.reportText, { color: t.textSecondary }]}>Report</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    width: "100%",
    height: IMAGE_HEIGHT,
    position: "absolute",
    top: 0,
    left: 0,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  fixedBottomContainer: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    width: "95%", // Matches ProfileInfoCard width
    borderBottomLeftRadius: 35, // Matches the top corners of the info card
    borderBottomRightRadius: 35,
    paddingTop: 20, 
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    // Add shadow pointing upwards slightly to separate from the blur above if needed
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  helloBtnWrapper: {
    marginBottom: 16,
    width: "100%", // Take full width of the padded container
  },
  helloBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
  },
  helloIcon: {
    marginRight: 8,
  },
  helloText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    letterSpacing: 0.5,
  },
  reportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  reportText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
