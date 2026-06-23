import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  useSharedValue,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";

// --- Shared Constants ---
const COLORS = {
  primaryChampagne: "#E8C7B2",
  warmIvory: "#FFF5EC",
  textSecondary: "rgba(255,245,236, 0.55)",
  borderSubtle: "rgba(232,199,178,0.12)",
  borderSelected: "#E8C7B2",
  cardGlassDark: "rgba(10, 5, 2, 0.45)",
  cardGlassSelected: "rgba(50, 30, 20, 0.65)",
};

const FONTS = {
  serif: Platform.select({ ios: "Times New Roman", android: "serif" }),
  sans: Platform.select({ ios: "Helvetica Neue", android: "sans-serif" }),
};

const SPACING = { m: 12, l: 16 };
const RADIUS = { card: 24 };

export default function CategoryCard({ item, isSelected, onPress, index, cardHeight }) {
  const Icon = item.icon;
  const scale = useSharedValue(1);
  const progress = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isSelected ? 1 : 0, { duration: 300 });
  }, [isSelected]);

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        progress.value,
        [0, 1],
        [COLORS.borderSubtle, COLORS.borderSelected],
      ),
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [COLORS.cardGlassDark, COLORS.cardGlassSelected],
      ),
      transform: [{ scale: scale.value }],
    };
  });

  const animatedRadioStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: progress.value }],
      opacity: progress.value,
    };
  });

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 120).duration(400)}
      style={[styles.cardWrapper, animatedCardStyle, {height: cardHeight}]}
    >
      {/* 1. Base Blur Layer */}
      <BlurView intensity={30} tint="dark" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />

      {/* 2. Glassy Gradient Overlay */}
      <LinearGradient
        colors={["#131613", "#392e29b0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onPress(item)} // Passes the full item back so Landing can read the redirectPath
        onPressIn={() => (scale.value = withTiming(0.98, { duration: 150 }))}
        onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
        style={styles.cardTouchable}
      >
        <View
          style={[
            styles.iconContainer,
            isSelected && styles.iconContainerSelected,
          ]}
        >
          <Icon color={COLORS.primaryChampagne} size={22} strokeWidth={1} />
        </View>

        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        </View>

        <View
          style={[styles.radioButton, isSelected && styles.radioButtonSelected]}
        >
          <Animated.View
            style={[styles.radioButtonInner, animatedRadioStyle]}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTouchable: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.l,
    borderWidth: 1,
    borderColor: "rgba(232,199,178,0.15)",
  },
  iconContainerSelected: {
    borderColor: "rgba(232,199,178,0.3)",
    backgroundColor: "rgba(232,199,178,0.05)",
  },
  cardTextContainer: {
    flex: 1,
    marginRight: SPACING.m,
  },
  cardTitle: {
    fontFamily: FONTS.serif,
    fontSize: 18,
    color: COLORS.warmIvory,
    marginBottom: 4,
    fontWeight: "400",
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,245,236, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: COLORS.primaryChampagne,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primaryChampagne,
  },
});
