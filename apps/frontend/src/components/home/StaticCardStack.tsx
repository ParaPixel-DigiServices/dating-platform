import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { MatchCard, Profile, CARD_HEIGHT, CARD_WIDTH } from "./MatchCard";

interface Props {
  profiles: Profile[];
  primaryColor: string;
  textPrimary: string;
  textSecondary: string;
  secondary: string;
  background: string;
}

export function StaticCardStack({
  profiles,
  primaryColor,
  textPrimary,
  textSecondary,
  secondary,
  background,
}: Props) {
  if (profiles.length === 0) return null;

  const currentProfile = profiles[0];
  const nextProfile = profiles.length > 1 ? profiles[1] : null;

  return (
    <View style={styles.container}>
      {/* Back Card */}
      {nextProfile && (
        <View style={styles.backCardWrapper}>
          <MatchCard
            profile={currentProfile}
            primaryColor={primaryColor}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            secondary={secondary}
            background={background}
          />
          {/* Dark translucent overlay */}
          <View style={styles.darkOverlay} />
        </View>
      )}

      {/* Front Card */}
      <View style={styles.frontCardWrapper}>
        <MatchCard
          profile={currentProfile}
          primaryColor={primaryColor}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          secondary={secondary}
          background={background}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: CARD_HEIGHT,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 10,
    position: "relative",
  },
  backCardWrapper: {
    position: "absolute",
    top: 10,
    transform: [
      { rotate: "0deg" },
      { scale: 0.95 },
      { translateX: 20 },
      { translateY: -10 },
    ],
    zIndex: 1,
  },
  frontCardWrapper: {
    position: "absolute",
    top: 10,
    transform: [
      { rotate: "-6deg" },
    ],
    zIndex: 2,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Reduced opacity
    borderRadius: 20,
    zIndex: 10,
  },
});
