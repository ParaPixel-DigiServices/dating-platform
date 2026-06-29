import React from "react";
import { View, StyleSheet, Text, Image, Dimensions, TouchableOpacity } from "react-native";
import { AboutMeSection } from "@/components/home/AboutMeSection";
import { ProfilePrompt } from "@/components/home/ProfilePrompt";
import { Profile } from "@/components/home/MatchCard";
import { BlurView } from "expo-blur";
import { Feather, Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const PADDING = 20;
const GAP = 6;
const GRID_ITEM_SIZE = (width - PADDING * 2 - GAP * 2) / 3;

interface Props {
  profile: Profile;
  textPrimary: string;
  textSecondary: string;
  primaryColor: string;
  background: string;
  secondary: string;
}

const getInterestIcon = (interest: string, color: string) => {
  switch (interest) {
    case "Travel": return <Ionicons name="airplane-outline" size={13} color={color} />;
    case "Books": return <Feather name="book" size={13} color={color} />;
    case "Photography": return <Feather name="camera" size={13} color={color} />;
    case "Music": return <Feather name="music" size={13} color={color} />;
    case "Coffee": return <Feather name="coffee" size={13} color={color} />;
    case "Art": return <Feather name="edit-2" size={13} color={color} />;
    case "Yoga": return <Ionicons name="body-outline" size={13} color={color} />;
    case "Cooking": return <Ionicons name="restaurant-outline" size={13} color={color} />;
    case "Movies": return <Feather name="film" size={13} color={color} />;
    case "Dance": return <Ionicons name="musical-notes-outline" size={13} color={color} />;
    case "Fitness": return <Ionicons name="barbell-outline" size={13} color={color} />;
    case "Hiking": return <Feather name="map" size={13} color={color} />;
    case "Gaming": return <Ionicons name="game-controller-outline" size={13} color={color} />;
    case "Meditation": return <Ionicons name="leaf-outline" size={13} color={color} />;
    default: return <Feather name="star" size={13} color={color} />;
  }
};

export function ProfileTabContent({ profile, textPrimary, textSecondary, primaryColor, background, secondary }: Props) {
  const [showAllPhotos, setShowAllPhotos] = React.useState(false);
  const photos = profile.photos || (profile.main_photo ? [profile.main_photo] : []);
  const interests = profile.interests || [];
  const MAX_PHOTOS = 9; // 3x3 grid
  const displayPhotos = showAllPhotos ? photos : photos.slice(0, MAX_PHOTOS);
  const hasMore = !showAllPhotos && photos.length > MAX_PHOTOS;

  return (
    <View style={styles.container}>
      {/* Bio Section */}
      {profile.about && (
        <BlurView intensity={60} tint="dark" style={styles.card}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Bio</Text>
          <Text style={[styles.bioText, { color: textSecondary }]}>{profile.about}</Text>
        </BlurView>
      )}

      {/* Interests */}
      {interests.length > 0 && (
        <BlurView intensity={60} tint="dark" style={styles.card}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Interests</Text>
          <View style={styles.tagsWrap}>
            {interests.map((interest: string, idx: number) => (
              <View key={idx} style={[styles.interestTag, { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)" }]}>
                <View style={styles.tagIcon}>
                  {getInterestIcon(interest, primaryColor)}
                </View>
                <Text style={[styles.tagText, { color: textPrimary }]}>{interest}</Text>
              </View>
            ))}
          </View>
        </BlurView>
      )}

      {/* About Me pills */}
      <AboutMeSection
        profile={profile}
        primaryColor={primaryColor}
        textPrimary={textPrimary}
        background={background}
        secondary={`${secondary}90`}
      />

      {/* Photo Grid */}
      {photos.length > 0 && (
        <BlurView intensity={60} tint="dark" style={styles.card}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Photos</Text>
          <View style={styles.photoGrid}>
            {displayPhotos.map((photo: any, idx: number) => (
              <View key={idx} style={styles.photoCell}>
                <Image
                  source={typeof photo === "string" ? { uri: photo } : photo}
                  style={styles.photo}
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>
          {hasMore && (
            <TouchableOpacity
              style={[styles.showMoreBtn, { borderColor: "rgba(255,255,255,0.15)" }]}
              onPress={() => setShowAllPhotos(true)}
            >
              <Text style={[styles.showMoreText, { color: textSecondary }]}>
                Show {photos.length - MAX_PHOTOS} more
              </Text>
              <Feather name="chevron-down" size={16} color={textSecondary} />
            </TouchableOpacity>
          )}
        </BlurView>
      )}

      {/* Prompt */}
      {profile.prompt && (
        <ProfilePrompt
          question={profile.prompt.question}
          answer={profile.prompt.answer}
          primaryColor={primaryColor}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          secondary={`${secondary}90`}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: PADDING,
    paddingTop: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 24,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  interestTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1,
  },
  tagIcon: {
    marginRight: 7,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "500",
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
  },
  photoCell: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    borderRadius: 12,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  showMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
