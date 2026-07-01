import React, { useRef, useState } from "react";
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
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { useDeckStore } from "@/hooks/useDeckStore";
import theme from "@/theme/theme";
import demoImg from "../../../assets/images/demo_post.png";

import { HomeHeader } from "@/components/home/HomeHeader";
import { ProfilePrompt } from "@/components/home/ProfilePrompt";
import { HomeFilterModal } from "@/components/home/HomeFilterModal";
import { SwipeableProfileCard, SwipeableProfileCardRef } from "@/components/home/SwipeableProfileCard";
import { ActionButtons } from "@/components/home/ActionButtons";
import { Profile } from "@/components/home/MatchCard";

const { height } = Dimensions.get("window");

// ── Dummy profiles ────────────────────────────────────────────
const PROFILES: Profile[] = [
  {
    id: "1",
    name: "Priya",
    age: 21,
    gender: "Female",
    distance: "18 km away",
    distanceNum: 18,
    liked: true,
    recentlyActive: false,
    religion: "Hindu",
    location: "Kolkata",
    match: 75,
    interests: ["Hiking", "Gaming", "Coffee", "Meditation", "Photography"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: true,
    occupation: "Designer",
    tagline: "Just looking for someone to share hiking and gaming with ✨",
    about: "Hi! I'm Priya 👋 — passionate about designer and always exploring new things. Let's talk about coffee and see where it goes!",
    height: "5'4\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "2",
    name: "Ananya",
    age: 28,
    gender: "Female",
    distance: "16 km away",
    distanceNum: 16,
    liked: true,
    recentlyActive: false,
    religion: "Muslim",
    location: "Mumbai",
    match: 91,
    interests: ["Hiking", "Music", "Cooking", "Art", "Dance"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: true,
    occupation: "Photographer",
    tagline: "Just looking for someone to share hiking and music with ✨",
    about: "Hi! I'm Ananya 👋 — passionate about photographer and always exploring new things. Let's talk about cooking and see where it goes!",
    height: "5'2\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "3",
    name: "Meera",
    age: 28,
    gender: "Female",
    distance: "1 km away",
    distanceNum: 1,
    liked: true,
    recentlyActive: true,
    religion: "Sikh",
    location: "Mumbai",
    match: 94,
    interests: ["Dance", "Hiking", "Music", "Photography", "Cooking"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: true,
    occupation: "Photographer",
    tagline: "Just looking for someone to share dance and hiking with ✨",
    about: "Hi! I'm Meera 👋 — passionate about photographer and always exploring new things. Let's talk about music and see where it goes!",
    height: "5'4\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "4",
    name: "Kavya",
    age: 21,
    gender: "Female",
    distance: "19 km away",
    distanceNum: 19,
    liked: true,
    recentlyActive: true,
    religion: "Hindu",
    location: "Kolkata",
    match: 79,
    interests: ["Coffee", "Music", "Dance", "Yoga", "Travel"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: true,
    occupation: "Doctor",
    tagline: "Just looking for someone to share coffee and music with ✨",
    about: "Hi! I'm Kavya 👋 — passionate about doctor and always exploring new things. Let's talk about dance and see where it goes!",
    height: "5'4\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "5",
    name: "Shreya",
    age: 29,
    gender: "Female",
    distance: "13 km away",
    distanceNum: 13,
    liked: false,
    recentlyActive: false,
    religion: "Sikh",
    location: "Kolkata",
    match: 77,
    interests: ["Fitness", "Hiking", "Meditation", "Travel", "Books"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: false,
    occupation: "Product Manager",
    tagline: "Just looking for someone to share fitness and hiking with ✨",
    about: "Hi! I'm Shreya 👋 — passionate about product manager and always exploring new things. Let's talk about meditation and see where it goes!",
    height: "5'8\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "6",
    name: "Neha",
    age: 28,
    gender: "Female",
    distance: "1 km away",
    distanceNum: 1,
    liked: true,
    recentlyActive: true,
    religion: "Buddhist",
    location: "Pune",
    match: 86,
    interests: ["Art", "Photography", "Books", "Movies", "Cooking"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: true,
    occupation: "Doctor",
    tagline: "Just looking for someone to share art and photography with ✨",
    about: "Hi! I'm Neha 👋 — passionate about doctor and always exploring new things. Let's talk about books and see where it goes!",
    height: "5'5\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "7",
    name: "Riya",
    age: 25,
    gender: "Female",
    distance: "18 km away",
    distanceNum: 18,
    liked: false,
    recentlyActive: true,
    religion: "Sikh",
    location: "Mumbai",
    match: 92,
    interests: ["Fitness", "Meditation", "Hiking", "Gaming", "Movies"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: true,
    occupation: "Architect",
    tagline: "Just looking for someone to share fitness and meditation with ✨",
    about: "Hi! I'm Riya 👋 — passionate about architect and always exploring new things. Let's talk about hiking and see where it goes!",
    height: "5'5\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "8",
    name: "Aisha",
    age: 27,
    gender: "Female",
    distance: "2 km away",
    distanceNum: 2,
    liked: true,
    recentlyActive: false,
    religion: "Christian",
    location: "Delhi",
    match: 76,
    interests: ["Yoga", "Gaming", "Dance", "Books", "Hiking"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: false,
    occupation: "Architect",
    tagline: "Just looking for someone to share yoga and gaming with ✨",
    about: "Hi! I'm Aisha 👋 — passionate about architect and always exploring new things. Let's talk about dance and see where it goes!",
    height: "5'6\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "9",
    name: "Simran",
    age: 25,
    gender: "Female",
    distance: "8 km away",
    distanceNum: 8,
    liked: true,
    recentlyActive: true,
    religion: "Agnostic",
    location: "Delhi",
    match: 75,
    interests: ["Yoga", "Art", "Gaming", "Cooking", "Fitness"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: true,
    occupation: "Architect",
    tagline: "Just looking for someone to share yoga and art with ✨",
    about: "Hi! I'm Simran 👋 — passionate about architect and always exploring new things. Let's talk about gaming and see where it goes!",
    height: "5'4\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "10",
    name: "Tara",
    age: 30,
    gender: "Female",
    distance: "18 km away",
    distanceNum: 18,
    liked: true,
    recentlyActive: false,
    religion: "Atheist",
    location: "Delhi",
    match: 85,
    interests: ["Travel", "Yoga", "Movies", "Hiking", "Art"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: false,
    occupation: "Musician",
    tagline: "Just looking for someone to share travel and yoga with ✨",
    about: "Hi! I'm Tara 👋 — passionate about musician and always exploring new things. Let's talk about movies and see where it goes!",
    height: "5'5\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "11",
    name: "Roshni",
    age: 29,
    gender: "Female",
    distance: "20 km away",
    distanceNum: 20,
    liked: true,
    recentlyActive: false,
    religion: "Agnostic",
    location: "Ahmedabad",
    match: 83,
    interests: ["Movies", "Hiking", "Fitness", "Photography", "Dance"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: false,
    occupation: "Designer",
    tagline: "Just looking for someone to share movies and hiking with ✨",
    about: "Hi! I'm Roshni 👋 — passionate about designer and always exploring new things. Let's talk about fitness and see where it goes!",
    height: "5'6\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "12",
    name: "Sana",
    age: 30,
    gender: "Female",
    distance: "12 km away",
    distanceNum: 12,
    liked: true,
    recentlyActive: true,
    religion: "Agnostic",
    location: "Chennai",
    match: 94,
    interests: ["Hiking", "Cooking", "Coffee", "Fitness", "Movies"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: true,
    occupation: "Product Manager",
    tagline: "Just looking for someone to share hiking and cooking with ✨",
    about: "Hi! I'm Sana 👋 — passionate about product manager and always exploring new things. Let's talk about coffee and see where it goes!",
    height: "5'7\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "13",
    name: "Kriti",
    age: 27,
    gender: "Female",
    distance: "17 km away",
    distanceNum: 17,
    liked: true,
    recentlyActive: true,
    religion: "Agnostic",
    location: "Hyderabad",
    match: 79,
    interests: ["Movies", "Coffee", "Meditation", "Photography", "Art"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: true,
    occupation: "Literature Professor",
    tagline: "Just looking for someone to share movies and coffee with ✨",
    about: "Hi! I'm Kriti 👋 — passionate about literature professor and always exploring new things. Let's talk about meditation and see where it goes!",
    height: "5'3\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "14",
    name: "Pooja",
    age: 25,
    gender: "Female",
    distance: "10 km away",
    distanceNum: 10,
    liked: true,
    recentlyActive: false,
    religion: "Sikh",
    location: "Ahmedabad",
    match: 88,
    interests: ["Yoga", "Cooking", "Meditation", "Coffee", "Photography"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: true,
    occupation: "Nutritionist",
    tagline: "Just looking for someone to share yoga and cooking with ✨",
    about: "Hi! I'm Pooja 👋 — passionate about nutritionist and always exploring new things. Let's talk about meditation and see where it goes!",
    height: "5'3\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "15",
    name: "Maya",
    age: 22,
    gender: "Female",
    distance: "18 km away",
    distanceNum: 18,
    liked: false,
    recentlyActive: false,
    religion: "Hindu",
    location: "Bangalore",
    match: 81,
    interests: ["Meditation", "Dance", "Music", "Travel", "Hiking"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: true,
    occupation: "Lawyer",
    tagline: "Just looking for someone to share meditation and dance with ✨",
    about: "Hi! I'm Maya 👋 — passionate about lawyer and always exploring new things. Let's talk about music and see where it goes!",
    height: "5'8\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "16",
    name: "Sonia",
    age: 22,
    gender: "Female",
    distance: "11 km away",
    distanceNum: 11,
    liked: true,
    recentlyActive: true,
    religion: "Agnostic",
    location: "Pune",
    match: 85,
    interests: ["Meditation", "Books", "Hiking", "Fitness", "Art"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: true,
    occupation: "Literature Professor",
    tagline: "Just looking for someone to share meditation and books with ✨",
    about: "Hi! I'm Sonia 👋 — passionate about literature professor and always exploring new things. Let's talk about hiking and see where it goes!",
    height: "5'2\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "17",
    name: "Alia",
    age: 21,
    gender: "Female",
    distance: "6 km away",
    distanceNum: 6,
    liked: false,
    recentlyActive: true,
    religion: "Muslim",
    location: "Pune",
    match: 82,
    interests: ["Fitness", "Hiking", "Movies", "Books", "Cooking"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: false,
    occupation: "Designer",
    tagline: "Just looking for someone to share fitness and hiking with ✨",
    about: "Hi! I'm Alia 👋 — passionate about designer and always exploring new things. Let's talk about movies and see where it goes!",
    height: "5'3\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "18",
    name: "Diya",
    age: 30,
    gender: "Female",
    distance: "13 km away",
    distanceNum: 13,
    liked: false,
    recentlyActive: true,
    religion: "Agnostic",
    location: "Kolkata",
    match: 90,
    interests: ["Yoga", "Meditation", "Fitness", "Coffee", "Music"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: false,
    occupation: "Product Manager",
    tagline: "Just looking for someone to share yoga and meditation with ✨",
    about: "Hi! I'm Diya 👋 — passionate about product manager and always exploring new things. Let's talk about fitness and see where it goes!",
    height: "5'3\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "19",
    name: "Nisha",
    age: 24,
    gender: "Female",
    distance: "4 km away",
    distanceNum: 4,
    liked: true,
    recentlyActive: true,
    religion: "Muslim",
    location: "Delhi",
    match: 91,
    interests: ["Coffee", "Hiking", "Meditation", "Art", "Travel"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: false,
    occupation: "Architect",
    tagline: "Just looking for someone to share coffee and hiking with ✨",
    about: "Hi! I'm Nisha 👋 — passionate about architect and always exploring new things. Let's talk about meditation and see where it goes!",
    height: "5'3\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "20",
    name: "Ishita",
    age: 21,
    gender: "Female",
    distance: "6 km away",
    distanceNum: 6,
    liked: true,
    recentlyActive: true,
    religion: "Muslim",
    location: "Pune",
    match: 85,
    interests: ["Coffee", "Art", "Photography", "Yoga", "Meditation"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: true,
    occupation: "Designer",
    tagline: "Just looking for someone to share coffee and art with ✨",
    about: "Hi! I'm Ishita 👋 — passionate about designer and always exploring new things. Let's talk about photography and see where it goes!",
    height: "5'6\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "21",
    name: "Sneha",
    age: 27,
    gender: "Female",
    distance: "1 km away",
    distanceNum: 1,
    liked: true,
    recentlyActive: true,
    religion: "Hindu",
    location: "Ahmedabad",
    match: 75,
    interests: ["Coffee", "Photography", "Dance", "Art", "Gaming"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: true,
    occupation: "Marketing Executive",
    tagline: "Just looking for someone to share coffee and photography with ✨",
    about: "Hi! I'm Sneha 👋 — passionate about marketing executive and always exploring new things. Let's talk about dance and see where it goes!",
    height: "5'5\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "22",
    name: "Aditi",
    age: 25,
    gender: "Female",
    distance: "7 km away",
    distanceNum: 7,
    liked: true,
    recentlyActive: false,
    religion: "Sikh",
    location: "Chennai",
    match: 80,
    interests: ["Coffee", "Photography", "Movies", "Art", "Dance"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: false,
    occupation: "Doctor",
    tagline: "Just looking for someone to share coffee and photography with ✨",
    about: "Hi! I'm Aditi 👋 — passionate about doctor and always exploring new things. Let's talk about movies and see where it goes!",
    height: "5'6\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "23",
    name: "Pallavi",
    age: 21,
    gender: "Female",
    distance: "5 km away",
    distanceNum: 5,
    liked: true,
    recentlyActive: false,
    religion: "Buddhist",
    location: "Delhi",
    match: 78,
    interests: ["Coffee", "Photography", "Movies", "Cooking", "Meditation"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: false,
    occupation: "Musician",
    tagline: "Just looking for someone to share coffee and photography with ✨",
    about: "Hi! I'm Pallavi 👋 — passionate about musician and always exploring new things. Let's talk about movies and see where it goes!",
    height: "5'8\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "24",
    name: "Swati",
    age: 23,
    gender: "Female",
    distance: "2 km away",
    distanceNum: 2,
    liked: false,
    recentlyActive: false,
    religion: "Atheist",
    location: "Ahmedabad",
    match: 85,
    interests: ["Books", "Art", "Gaming", "Movies", "Cooking"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: true,
    occupation: "Data Scientist",
    tagline: "Just looking for someone to share books and art with ✨",
    about: "Hi! I'm Swati 👋 — passionate about data scientist and always exploring new things. Let's talk about gaming and see where it goes!",
    height: "5'2\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
  {
    id: "25",
    name: "Nandini",
    age: 22,
    gender: "Female",
    distance: "6 km away",
    distanceNum: 6,
    liked: true,
    recentlyActive: false,
    religion: "Sikh",
    location: "Bangalore",
    match: 76,
    interests: ["Fitness", "Movies", "Hiking", "Music", "Dance"],
    main_photo: demoImg,
    photos: [demoImg, demoImg, demoImg],
    verified: false,
    occupation: "Musician",
    tagline: "Just looking for someone to share fitness and movies with ✨",
    about: "Hi! I'm Nandini 👋 — passionate about musician and always exploring new things. Let's talk about hiking and see where it goes!",
    height: "5'2\"",
    zodiac: "Scorpio ♏",
    education: "B.Tech, NIT",
    preferences: ["Non-smoker 🚭", "Dog lover 🐕", "Vegetarian 🥗"],
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const t = (theme as any).onboarding;
  const activeTab = useDeckStore((state) => state.activeTab);
  const setActiveTab = useDeckStore((state) => state.setActiveTab);
  const profiles = useDeckStore((state) => state.profiles);
  const setMasterProfiles = useDeckStore((state) => state.setMasterProfiles);
  const swipeProfile = useDeckStore((state) => state.swipeProfile);
  const setFilters = useDeckStore((state) => state.setFilters);
  const unreadCount = useDeckStore((state) => state.unreadCount);
  const setUnreadCount = useDeckStore((state) => state.setUnreadCount);

  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const topCardRef = useRef<SwipeableProfileCardRef>(null);

  React.useEffect(() => {
    // Simulate backend fetch
    setMasterProfiles(PROFILES);
  }, []);

  const handleSwipe = () => {
    swipeProfile();
  };

  return (
    <View style={[styles.screen, { backgroundColor: t.background, paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 30 : 0) }]}>
      <StatusBar barStyle="light-content" backgroundColor={t.background} />

      {/* Header (Fixed) */}
      <View style={{ zIndex: 100, backgroundColor: t.background }}>
        <HomeHeader
          primaryColor={t.primary}
          textPrimary={t.textPrimary}
          textSecondary={t.textSecondary}
          secondary={t.secondary}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onFilterPress={() => setIsFilterModalVisible(true)}
          onNotificationPress={() => {
            setUnreadCount(0);
            router.push("/notifications");
          }}
          notificationCount={unreadCount}
        />
      </View>

      {/* Swipe Deck Container */}
      <View style={styles.deckContainer}>
        {profiles.slice(0, 2).map((profile, index) => {
          const isTop = index === 0;
          return (
            <SwipeableProfileCard
              key={profile.id}
              ref={isTop ? topCardRef : null}
              profile={profile}
              isTop={isTop}
              theme={t}
              onSwipe={handleSwipe}
            />
          );
        }).reverse()}
      </View>

      {/* GRADIENT OVERLAY (Touches pass through completely) */}
      <View style={styles.fixedButtonsContainer} pointerEvents="none">
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
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* ACTION BUTTONS (Only buttons catch touches, rest passes through) */}
      <View style={styles.fixedButtonsContainer} pointerEvents="box-none">
        <ActionButtons
          primaryColor={t.primaryLight}
          secondary={t.secondary}
          textPrimary={t.textPrimary}
          onDislike={() => topCardRef.current?.swipeLeft()}
          onLike={() => topCardRef.current?.swipeRight()}
          onSuperLike={() => { /* Superlike action */ }}
        />
      </View>

      <HomeFilterModal
        theme={t}
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        onApply={(filters) => {
          setFilters(filters);
          setIsFilterModalVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  deckContainer: {
    flex: 1,
    width: "100%",
    position: "relative",
    overflow: "hidden",
    marginTop: 10,
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
