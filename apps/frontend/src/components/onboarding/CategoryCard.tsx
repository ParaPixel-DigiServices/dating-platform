import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { CategoryKey } from "@/hooks/useOnboardingStore";

/**
 * CategoryCard
 *
 * One card in the 2×2 category grid on the category selection screen.
 *
 * Props:
 *   id            — CategoryKey ('Casual' | 'Love' | 'Marriage' | 'Find_Your_Roommate')
 *   title         — Display title
 *   description   — Short description
 *   iconName      — Icon name string
 *   iconFamily    — Which icon set to use
 *   imageUri      — Background image URL
 *   isSelected    — Whether this card is currently active
 *   primaryColor  — Active theme primary colour
 *   textSecondary — Active theme text secondary colour
 *   textPrimary   — Active theme text primary colour
 *   secondary     — Active theme surface colour
 *   onPress       — Selection callback
 */

type IconFamily = "Ionicons" | "MaterialCommunityIcons" | "Feather";

interface Props {
  id: CategoryKey;
  title: string;
  description: string;
  iconName: string;
  iconFamily: IconFamily;
  imageUri: string;
  isSelected: boolean;
  primaryColor: string;
  textPrimary: string;
  textSecondary: string;
  secondary: string;
  onPress: (id: CategoryKey) => void;
}

function CategoryIcon({
  name,
  family,
  color,
}: {
  name: string;
  family: IconFamily;
  color: string;
}) {
  if (family === "Ionicons")
    return <Ionicons name={name as any} size={26} color={color} />;
  if (family === "MaterialCommunityIcons")
    return <MaterialCommunityIcons name={name as any} size={28} color={color} />;
  return <Feather name={name as any} size={26} color={color} />;
}

export function CategoryCard({
  id,
  title,
  description,
  iconName,
  iconFamily,
  imageUri,
  isSelected,
  primaryColor,
  textPrimary,
  textSecondary,
  secondary,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: secondary },
        isSelected
          ? { borderColor: primaryColor }
          : { borderColor: "rgba(255,255,255,0.08)" },
      ]}
      onPress={() => onPress(id)}
      activeOpacity={0.8}
    >
      <ImageBackground source={{ uri: imageUri }} style={styles.image}>
        {/* Dark overlay */}
        <View style={[StyleSheet.absoluteFillObject, styles.overlay]} />

        <View style={styles.inner}>
          {/* Top row: icon + checkmark */}
          <View style={styles.topRow}>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: isSelected
                    ? "rgba(0,0,0,0.5)"
                    : "rgba(0,0,0,0.3)",
                },
              ]}
            >
              <CategoryIcon
                name={iconName}
                family={iconFamily}
                color={isSelected ? primaryColor : textSecondary}
              />
            </View>

            {isSelected && (
              <View style={[styles.checkBadge, { backgroundColor: primaryColor }]}>
                <Feather name="check" size={14} color="#FFF" />
              </View>
            )}
          </View>

          {/* Bottom row: title + underline + description */}
          <View style={styles.bottomRow}>
            <Text style={[styles.title, { color: textPrimary }]}>{title}</Text>
            <View
              style={[
                styles.underline,
                { backgroundColor: isSelected ? primaryColor : "transparent" },
              ]}
            />
            <Text style={[styles.description, { color: textPrimary }]}>
              {description}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "47%",
    aspectRatio: 0.85,
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  inner: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
    zIndex: 2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  bottomRow: {
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.3,
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  underline: {
    width: 24,
    height: 3,
    borderRadius: 1.5,
    marginTop: 6,
    marginBottom: 10,
  },
  description: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
