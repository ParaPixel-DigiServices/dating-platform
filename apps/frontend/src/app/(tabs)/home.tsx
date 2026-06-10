import React, { useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import theme from "@/theme/theme";

import { HomeHeader }              from "@/components/home/HomeHeader";
import { SwipeDeck, SwipeDeckRef } from "@/components/home/SwipeDeck";
import { ActionButtons }           from "@/components/home/ActionButtons";
import { Profile }                 from "@/components/home/MatchCard";

const { height } = Dimensions.get("window");

// How tall the fixed bottom zone (gradient + buttons) is
const FIXED_BOTTOM_H = height * 0.42;

// ── Dummy profiles ────────────────────────────────────────────
const PROFILES: Profile[] = [
  {
    id:          "1",
    name:        "Priya",
    age:         24,
    distance:    "2 km away",
    match:       92,
    interests:   ["Travel", "Books", "Photography", "Coffee", "Hiking"],
    photo:       "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    verified:    true,
    tagline:     "Chasing sunsets and good stories 🌅",
    about:       "Hi! I'm Priya 👋 — a storyteller by passion, traveller by habit, and coffee addict by choice ☕. I love exploring new places, getting lost in a good book, and capturing moments through my lens 📸.",
    height:      "5'5\"",
    zodiac:      "Scorpio ♏",
    education:   "Design, NID",
    preferences: ["Non-smoker 🚭", "No kids 🚫", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id:          "2",
    name:        "Ananya",
    age:         26,
    distance:    "5 km away",
    match:       87,
    interests:   ["Music", "Coffee", "Art", "Movies", "Meditation"],
    photo:       "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    verified:    true,
    tagline:     "Turning caffeine into melodies since 2015 🎵",
    about:       "Life's too short for bad vibes 🎵. I spend my days making music, hunting for the perfect flat white, and sketching in my notebook. Looking for someone who matches my energy 🎨.",
    height:      "5'4\"",
    zodiac:      "Libra ♎",
    education:   "Music, FTII",
    preferences: ["Occasional drinker 🍷", "No kids 🚫", "Cat person 🐱", "Night owl 🌙"],
  },
  {
    id:          "3",
    name:        "Meera",
    age:         23,
    distance:    "8 km away",
    match:       79,
    interests:   ["Yoga", "Cooking", "Movies", "Meditation", "Hiking"],
    photo:       "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80",
    verified:    false,
    tagline:     "Finding peace one breath at a time 🧘",
    about:       "Yoga mornings, movie nights, and home-cooked meals 🍳. I believe food is love and love is food. Always down for a cooking session or a Netflix marathon 🎬.",
    height:      "5'3\"",
    zodiac:      "Cancer ♋",
    education:   "Nutrition, DU",
    preferences: ["Non-smoker 🚭", "Wants kids 👶", "Vegetarian 🥗", "Early bird 🌅"],
  },
  {
    id:          "4",
    name:        "Kavya",
    age:         25,
    distance:    "3 km away",
    match:       94,
    interests:   ["Dance", "Books", "Travel", "Art", "Coffee"],
    photo:       "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    verified:    true,
    tagline:     "If it involves chai and books, I'm in ☕📚",
    about:       "Classical dancer 💃, bibliophile 📚, and wanderlust addict ✈️. I think the best conversations happen over chai and good books. Let's swap travel stories!",
    height:      "5'6\"",
    zodiac:      "Aries ♈",
    education:   "Literature, JNU",
    preferences: ["Non-smoker 🚭", "Open to kids 🤍", "Dog lover 🐕", "Foodie 🍜"],
  },
  {
    id:          "5",
    name:        "Shreya",
    age:         27,
    distance:    "12 km away",
    match:       81,
    interests:   ["Fitness", "Photography", "Coffee", "Gaming", "Hiking"],
    photo:       "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    verified:    true,
    tagline:     "5 AM runs and midnight laughs — balance 💪",
    about:       "Early riser 🏃, coffee snob ☕, and weekend photographer 📸. I train hard and laugh harder. Looking for someone who can keep up with both 💪.",
    height:      "5'7\"",
    zodiac:      "Sagittarius ♐",
    education:   "MBA, IIM-A",
    preferences: ["Non-smoker 🚭", "No kids 🚫", "Gym rat 🏋️", "Early bird 🌅"],
  },
];

export default function HomeScreen() {
  const category = useOnboardingStore((s) => s.category) ?? "Casual";
  const t        = theme[category];
  const deckRef  = useRef<SwipeDeckRef>(null);

  return (
    <View style={[styles.screen, { backgroundColor: t.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={t.background} />

      {/* ── Scrollable content: header + tall card ────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: FIXED_BOTTOM_H + 16 }, // clear the fixed bottom zone
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        // Vertical scroll — PanResponder only takes over for horizontal
      >
        {/* Header */}
        <HomeHeader
          primaryColor={t.primary}
          textPrimary={t.textPrimary}
          textSecondary={t.textSecondary}
          secondary={t.secondary}
          onFilterPress={() => {}}
        />

        {/* Swipe deck — tall card, horizontal drag = like/dislike */}
        <View style={styles.deckWrapper}>
          <SwipeDeck
            ref={deckRef}
            profiles={PROFILES}
            primaryColor={t.primary}
            textPrimary={t.textPrimary}
            textSecondary={t.textSecondary}
            secondary={t.secondary}
            background={t.background}
          />
        </View>
      </ScrollView>

      {/* ── Fixed bottom: gradient (layer 2) + buttons (layer 3) */}
      {/* Layer 2 — gradient blends card into background */}
      <LinearGradient
        colors={["rgba(0,0,0,0)", `${t.background}99`, t.background]}
        locations={[0.0, 0.58, 0.7]}
        style={styles.fixedGradient}
        pointerEvents="none"
      />

      {/* Layer 3 — action buttons always visible at bottom */}
      <View style={styles.fixedButtons}>
        <ActionButtons
          primaryColor={t.primary}
          secondary={t.secondary}
          textPrimary={t.textPrimary}
          onDislike={()    => deckRef.current?.swipeLeft()}
          onLike={()       => deckRef.current?.swipeRight()}
          onSuperLike={()  => deckRef.current?.swipeSuperLike()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  /* Scrollable zone */
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
  },

  /* Deck sits centered with side margins */
  deckWrapper: {
    width:   "100%",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  /* Fixed bottom — gradient */
  fixedGradient: {
    position: "absolute",
    left:     0,
    right:    0,
    bottom:   0,
    height:   FIXED_BOTTOM_H,
    zIndex:   10,
  },

  /* Fixed bottom — buttons on top of gradient */
  fixedButtons: {
    position:       "absolute",
    left:           0,
    right:          0,
    bottom:         0,
    zIndex:         11,
    alignItems:     "center",
    justifyContent: "flex-end",
  },
});
