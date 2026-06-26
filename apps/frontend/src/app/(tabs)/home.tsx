import React, { useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import theme from "@/theme/theme";
import demoImg from "../../../assets/images/demo_post.png";

import { HomeHeader } from "@/components/home/HomeHeader";
import { StaticCardStack } from "@/components/home/StaticCardStack";
import { ActionButtons } from "@/components/home/ActionButtons";
import { Profile } from "@/components/home/MatchCard";
import { ProfileCarousel } from "@/components/home/ProfileCarousel";
import { AboutMeSection } from "@/components/home/AboutMeSection";
import { ProfilePrompt } from "@/components/home/ProfilePrompt";

const { height } = Dimensions.get("window");

// ── Dummy profiles ────────────────────────────────────────────
const PROFILES: Profile[] = [
  {
    id: "1",
    name: "Priya",
    age: 24,
    gender: "Female",
    distance: "2 km away",
    location: "Mumbai",
    match: 92,
    interests: ["Travel", "Books", "Photography", "Coffee", "Hiking"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: true,
    occupation: "Software Engineer",
    tagline: "Coffee lover, sunset chaser, and always up for a good conversation. ✨",
    about: "Hi! I'm Priya 👋 — a storyteller by passion, traveller by habit, and coffee addict by choice ☕. I love exploring new places, getting lost in a good book, and capturing moments through my lens 📸.",
    height: "5'5\"",
    zodiac: "Scorpio ♏",
    education: "Design, NID",
    preferences: ["Non-smoker 🚭", "No kids 🚫", "Dog lover 🐕", "Vegetarian 🥗"],
    prompt: {
      question: "The quickest way to my heart is",
      answer: "Words of affirmation",
    },
  },
  {
    id: "2",
    name: "Ananya",
    age: 26,
    gender: "Female",
    distance: "5 km away",
    location: "Delhi",
    match: 87,
    interests: ["Music", "Coffee", "Art", "Movies", "Meditation"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: true,
    occupation: "Musician",
    tagline: "Turning caffeine into melodies since 2015 🎵",
    about: "Life's too short for bad vibes 🎵. I spend my days making music, hunting for the perfect flat white, and sketching in my notebook. Looking for someone who matches my energy 🎨.",
    height: "5'4\"",
    zodiac: "Libra ♎",
    education: "Music, FTII",
    preferences: ["Occasional drinker 🍷", "No kids 🚫", "Cat person 🐱", "Night owl 🌙"],
  },
  {
    id: "3",
    name: "Meera",
    age: 23,
    gender: "Female",
    distance: "8 km away",
    location: "Bangalore",
    match: 79,
    interests: ["Yoga", "Cooking", "Movies", "Meditation", "Hiking"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: false,
    occupation: "Nutritionist",
    tagline: "Finding peace one breath at a time 🧘",
    about: "Yoga mornings, movie nights, and home-cooked meals 🍳. I believe food is love and love is food. Always down for a cooking session or a Netflix marathon 🎬.",
    height: "5'3\"",
    zodiac: "Cancer ♋",
    education: "Nutrition, DU",
    preferences: ["Non-smoker 🚭", "Wants kids 👶", "Vegetarian 🥗", "Early bird 🌅"],
  },
  {
    id: "4",
    name: "Kavya",
    age: 25,
    gender: "Female",
    distance: "3 km away",
    location: "Pune",
    match: 94,
    interests: ["Dance", "Books", "Travel", "Art", "Coffee"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: true,
    occupation: "Literature Professor",
    tagline: "If it involves chai and books, I'm in ☕📚",
    about: "Classical dancer 💃, bibliophile 📚, and wanderlust addict ✈️. I think the best conversations happen over chai and good books. Let's swap travel stories!",
    height: "5'6\"",
    zodiac: "Aries ♈",
    education: "Literature, JNU",
    preferences: ["Non-smoker 🚭", "Open to kids 🤍", "Dog lover 🐕", "Foodie 🍜"],
  },
  {
    id: "5",
    name: "Shreya",
    age: 27,
    gender: "Female",
    distance: "12 km away",
    location: "Hyderabad",
    match: 81,
    interests: ["Fitness", "Photography", "Coffee", "Gaming", "Hiking"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg], verified: true,
    occupation: "Product Manager",
    tagline: "5 AM runs and midnight laughs — balance 💪",
    about: "Early riser 🏃, coffee snob ☕, and weekend photographer 📸. I train hard and laugh harder. Looking for someone who can keep up with both 💪.",
    height: "5'7\"",
    zodiac: "Sagittarius ♐",
    education: "MBA, IIM-A",
    preferences: ["Non-smoker 🚭", "No kids 🚫", "Gym rat 🏋️", "Early bird 🌅"],
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const t = (theme as any).onboarding;
  const [activeTab, setActiveTab] = React.useState("For You");

  return (
    <View style={[styles.screen, { backgroundColor: t.background, paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 30 : 0) }]}>
      <StatusBar barStyle="light-content" backgroundColor={t.background} />

      {/* ── Main content: header + tall card ────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <HomeHeader
          primaryColor={t.primary}
          textPrimary={t.textPrimary}
          textSecondary={t.textSecondary}
          secondary={t.secondary}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onFilterPress={() => { }}
        />

        {/* Static Card Stack */}
        <View style={styles.deckWrapper}>
          <StaticCardStack
            profiles={PROFILES}
            primaryColor={t.primaryLight}
            textPrimary={t.textPrimary}
            textSecondary={t.textSecondary}
            secondary={t.secondary}
            background={t.background}
          />
        </View>


        {/* ── About Me Section ── */}
        <View style={styles.aboutContainer}>
          <AboutMeSection 
            profile={PROFILES[0]}
            primaryColor={t.primaryLight}
            textPrimary={t.textPrimary}
            background={t.background}
            secondary={t.secondary}
          />
          
          {PROFILES[0].prompt && (
            <ProfilePrompt
              question={PROFILES[0].prompt.question}
              answer={PROFILES[0].prompt.answer}
              primaryColor={t.primaryLight}
              textPrimary={t.textPrimary}
              textSecondary={t.textSecondary}
              secondary={t.secondary}
            />
          )}
        </View>

        {/* ── Profile Photos Carousel ── */}
        <ProfileCarousel
          photos={PROFILES[0].photos}
          primaryColor={t.primaryLight}
        />

      </ScrollView>

      {/* FIXED ACTION BUTTONS */}
      <LinearGradient
        colors={[
          "rgba(14, 14, 15, 0)",
          "rgba(14, 14, 15, 0)",
          "rgba(14, 14, 15, 0.25)",
          "rgba(14, 14, 15, 0.4)",
          "rgba(14, 14, 15, 0.81)",
          "rgba(14, 14, 15, 0.97)",
          "#0e0e0f",
        ]}
        locations={[0, 0.24, 0.41, 0.55, 0.62, 0.7, 0.82]}
        style={styles.fixedButtonsContainer}
        pointerEvents="box-none"
      >
        <ActionButtons
          primaryColor={t.primaryLight}
          secondary={t.secondary}
          textPrimary={t.textPrimary}
          onDislike={() => { }}
          onLike={() => { }}
          onSuperLike={() => { }}
        />
      </LinearGradient>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  /* Main content zone */
  scroll: {
    flex: 1,
  },

  deckWrapper: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 16,
    zIndex: 1,
    marginBottom: 40,
  },
  aboutContainer: {
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  fixedButtonsContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingTop: 80,
    paddingBottom: 20,
    alignItems: "center",
    zIndex: 10,
  },
});
