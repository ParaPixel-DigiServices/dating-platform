import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  Image, Platform, Dimensions, Animated, PanResponder,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SwipeCard, SwipeCardRef, ProfileData } from "@/components/ui/SwipeCard";

const { width, height } = Dimensions.get("window");

const PROFILES: ProfileData[] = [
  {
    id: "1", name: "Amanda Lourence", age: 19, verified: true, distance: "3.2 km",
    bio: "My name is Amanda. I'm 19 years old and live in Jakarta. Want to get acquainted with me?",
    photos: [
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502764613149-7f1d229e230f?auto=format&fit=crop&w=800&q=80",
    ],
    interests: ["Shopping", "Music", "Coffee", "Books", "Piano", "Engineering", "Movie", "Travel"],
  },
  {
    id: "2", name: "Priya Sharma", age: 23, verified: true, distance: "5 km",
    bio: "Adventure seeker and coffee enthusiast. Love long hikes and cooking new recipes.",
    photos: [
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80",
    ],
    interests: ["Hiking", "Coffee", "Books", "Travel", "Yoga", "Photography"],
  },
  {
    id: "3", name: "Elizabeth Moore", age: 24, verified: true, distance: "2.5 km",
    bio: "Fashion lover, equestrian, and art curator. Based in California but my heart lives in Paris.",
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
    ],
    interests: ["Fashion", "Equestrian", "Art", "Wine", "Travel", "Jazz"],
  },
  {
    id: "4", name: "Sofia Chen", age: 25, verified: false, distance: "8 km",
    bio: "Foodie, bookworm, and part-time philosopher. Let's debate over dim sum sometime.",
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502764613149-7f1d229e230f?auto=format&fit=crop&w=800&q=80",
    ],
    interests: ["Food", "Books", "Philosophy", "Tea", "Movies", "Gaming"],
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const swipeRef = useRef<SwipeCardRef>(null);

  const [profileIdx, setProfileIdx] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);

  const currentProfile = PROFILES[profileIdx % PROFILES.length];

  const advanceProfile = () => {
    setProfileIdx(prev => prev + 1);
    setPhotoIdx(0);
  };

  const handlePhotoChange = (dir: "next" | "prev") => {
    const maxPhoto = currentProfile.photos.length - 1;
    if (dir === "next" && photoIdx < maxPhoto) setPhotoIdx(p => p + 1);
    else if (dir === "prev" && photoIdx > 0) setPhotoIdx(p => p - 1);
  };

  return (
    <View style={s.master}>
      {/* ── CARD ─────────────────────────────────────────── */}
      <View style={s.cardWrapper}>
        <SwipeCard
          ref={swipeRef}
          profile={currentProfile}
          photoIdx={photoIdx}
          onPhotoChange={handlePhotoChange}
          onSwipedLeft={advanceProfile}
          onSwipedRight={advanceProfile}
          onSwipedUp={advanceProfile}
        />
      </View>

      {/* ── TOP NAV OVERLAY ─────────────────────────────── */}
      <SafeAreaView style={s.topNavSafe} pointerEvents="box-none">
        <View style={s.topNav} pointerEvents="box-none">
          {/* Back Button */}
          <TouchableOpacity style={s.backBtn} activeOpacity={0.8} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#FFF" />
          </TouchableOpacity>

          <View style={s.centerNav}>
            <TouchableOpacity>
              <Text style={s.topNavText}>Following</Text>
            </TouchableOpacity>
            <View style={s.topNavDivider} />
            <TouchableOpacity>
              <Text style={[s.topNavText, s.topNavTextActive]}>For You</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  master: { flex: 1, backgroundColor: "#0A0A0A" },

  // TOP NAV OVERLAY
  topNavSafe: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100 },
  topNav: { flexDirection: "row", alignItems: "center", paddingTop: Platform.OS === "android" ? 40 : 10, paddingHorizontal: 20 },
  backBtn: { width: 44, height: 44, justifyContent: "center", alignItems: "flex-start" },
  centerNav: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", marginRight: 44 },
  topNavText: { fontSize: 18, fontFamily: "Outfit_600SemiBold", color: "rgba(255,255,255,0.6)" },
  topNavTextActive: { color: "#FFF" },
  topNavDivider: { width: 1, height: 14, backgroundColor: "rgba(255,255,255,0.4)", marginHorizontal: 16 },

  // CARD WRAPPER
  cardWrapper: {
    position: "absolute",
    top: 0, bottom: 0, left: 0, right: 0,
  },
});
