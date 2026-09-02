import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getFallbackImage } from "@/utils/fallbackImage";

interface ProfileItem {
  id: string;
  name: string;
  age?: number;
  avatar?: string | null;
  photo?: any; // For backward compatibility with mock data
  match?: number;
  gender?: string;
}

interface Props {
  title: string;
  subtitle: string;
  profiles: ProfileItem[];
  primaryColor: string;
  textPrimary: string;
  textSecondary: string;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyLabel?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  onSeeAll: () => void;
  onProfile: (id: string) => void;
}

export function HorizontalProfileSection({
  title,
  subtitle,
  profiles,
  primaryColor,
  textPrimary,
  textSecondary,
  emptyIcon,
  emptyTitle,
  emptyLabel,
  emptyActionLabel,
  onEmptyAction,
  onSeeAll,
  onProfile,
}: Props) {
  if (profiles.length === 0 && !emptyTitle) return null;

  return (
    <View style={styles.wrapper}>
      {/* Section header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>
            {title}
          </Text>
          <Text style={[styles.sectionSub, { color: textSecondary }]}>
            {subtitle}
          </Text>
        </View>
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
          <Text style={[styles.seeAll, { color: primaryColor }]}>See all</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal scroll or Empty State */}
      {profiles.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {profiles.map((p) => {
            const imageSource = p.avatar ? { uri: p.avatar } : (p.photo || null);
            return (
              <TouchableOpacity 
                key={p.id} 
                style={styles.card} 
                onPress={() => onProfile(p.id)} 
                activeOpacity={0.8}
              >
                {imageSource ? (
                  <Image source={imageSource} style={styles.image} />
                ) : (
                  <View style={[styles.image, { backgroundColor: 'rgba(255, 255, 255, 0.05)', justifyContent: 'center', alignItems: 'center' }]}>
                    <Image
                      source={getFallbackImage(p.gender)}
                      style={{ width: '60%', height: '60%', opacity: 0.8 }}
                      resizeMode="contain"
                    />
                  </View>
                )}
                
                {/* Dark gradient for text readability */}
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.8)"]}
                  style={styles.gradient}
                />

                {/* Info section at bottom */}
                <View style={styles.infoContainer}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.name, { color: textPrimary }]} numberOfLines={1}>
                      {p.name}{p.age ? `, ${p.age}` : ""}
                    </Text>
                  </View>
                  {p.match != null && (
                    <Text style={[styles.matchText, { color: primaryColor }]}>
                      {p.match}% Match
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <View style={[styles.emptyWrap, { backgroundColor: primaryColor + '08', borderColor: primaryColor + '15', borderWidth: 1 }]}>
          <View style={[styles.emptyIconWrap, { backgroundColor: primaryColor + '15' }]}>
            <Feather name={emptyIcon as any} size={26} color={primaryColor} />
          </View>
          <Text style={[styles.emptyTitle, { color: textPrimary }]}>{emptyTitle}</Text>
          <Text style={[styles.emptyText, { color: textSecondary }]}>{emptyLabel}</Text>
          {emptyActionLabel && onEmptyAction && (
            <TouchableOpacity 
              style={[styles.emptyActionBtn, { backgroundColor: primaryColor }]} 
              onPress={onEmptyAction} 
              activeOpacity={0.85}
            >
              <Text style={styles.emptyActionText}>{emptyActionLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

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
    fontSize:      20,
    fontFamily:    "Lato_700Bold",
    letterSpacing: 0.2,
  },
  sectionSub: {
    fontSize:  13,
    fontFamily: "Lato_400Regular",
    marginTop: 4,
  },
  seeAll: {
    fontSize:      14,
    fontFamily:    "Lato_700Bold",
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
  card: {
    width: 110,
    height: 150,
    borderRadius: 16,
    marginRight: 12,
    overflow: "hidden",
    backgroundColor: "#1c1c1e",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  infoContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    fontFamily: "Lato_700Bold",
    flexShrink: 1,
  },
  matchText: {
    fontSize: 11,
    fontFamily: "Lato_700Bold",
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 20,
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Lato_700Bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Lato_400Regular",
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.8,
  },
  emptyActionBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyActionText: {
    color: "#1E1410",
    fontSize: 14,
    fontFamily: "Lato_700Bold",
  }
});
