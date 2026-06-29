import React, { forwardRef, useImperativeHandle } from "react";
import { View, StyleSheet, ScrollView, Dimensions, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { MatchCard, Profile } from "./MatchCard";
import { AboutMeSection } from "./AboutMeSection";
import { ProfilePrompt } from "./ProfilePrompt";
import { ProfileCarousel } from "./ProfileCarousel";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

export interface SwipeableProfileCardRef {
  swipeLeft: () => void;
  swipeRight: () => void;
}

interface Props {
  profile: Profile;
  isTop: boolean;
  theme: any; // Using the 'onboarding' theme object
  onSwipe: () => void;
}

export const SwipeableProfileCard = forwardRef<SwipeableProfileCardRef, Props>(
  ({ profile, isTop, theme, onSwipe }, ref) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const context = useSharedValue({ x: 0, y: 0 });

    const handleSwipeComplete = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSwipe();
    };

    useImperativeHandle(ref, () => ({
      swipeLeft: () => {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 1200, easing: Easing.out(Easing.cubic) }, () => {
          runOnJS(handleSwipeComplete)();
        });
      },
      swipeRight: () => {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 1200, easing: Easing.out(Easing.cubic) }, () => {
          runOnJS(handleSwipeComplete)();
        });
      },
    }));

    const panGesture = Gesture.Pan()
      .enabled(isTop)
      // Only capture horizontal swipes so vertical scroll passes through
      .activeOffsetX([-20, 20])
      .onStart(() => {
        context.value = { x: translateX.value, y: translateY.value };
      })
      .onUpdate((event) => {
        translateX.value = event.translationX + context.value.x;
        translateY.value = event.translationY + context.value.y;
      })
      .onEnd((event) => {
        if (event.translationX > SWIPE_THRESHOLD) {
          // Swipe Right (Like)
          translateX.value = withSpring(SCREEN_WIDTH * 1.5, { velocity: event.velocityX }, () => {
            runOnJS(handleSwipeComplete)();
          });
        } else if (event.translationX < -SWIPE_THRESHOLD) {
          // Swipe Left (Reject)
          translateX.value = withSpring(-SCREEN_WIDTH * 1.5, { velocity: event.velocityX }, () => {
            runOnJS(handleSwipeComplete)();
          });
        } else {
          // Snap back with minimal wobble
          translateX.value = withSpring(0, { damping: 20, stiffness: 120, mass: 1 });
          translateY.value = withSpring(0, { damping: 20, stiffness: 120, mass: 1 });
        }
      });

    const animatedCardStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
        ],
      };
    });

    const likeOpacity = useAnimatedStyle(() => ({
      opacity: interpolate(translateX.value, [0, SCREEN_WIDTH * 0.15], [0, 1], "clamp"),
    }));

    const nopeOpacity = useAnimatedStyle(() => ({
      opacity: interpolate(translateX.value, [0, -SCREEN_WIDTH * 0.15], [0, 1], "clamp"),
    }));

    return (
      <GestureDetector gesture={panGesture}>
        <Animated.View 
          style={[styles.cardContainer, { backgroundColor: theme.background }, isTop ? animatedCardStyle : undefined]}
          pointerEvents={isTop ? "auto" : "none"}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 160 }} // Give room for action buttons
            bounces={false}
          >
            <View style={styles.deckWrapper}>
              <View style={styles.cardWrapper}>
                <MatchCard
                  profile={profile}
                  primaryColor={theme.primaryLight}
                  textPrimary={theme.textPrimary}
                  textSecondary={theme.textSecondary}
                  secondary={theme.secondary}
                  background={theme.background}
                />
              </View>

              <View style={styles.aboutContainer}>
                <AboutMeSection 
                  profile={profile}
                  primaryColor={theme.primaryLight}
                  textPrimary={theme.textPrimary}
                  background={theme.background}
                  secondary={theme.secondary}
                />
                
                {profile.prompt && (
                  <ProfilePrompt
                    question={profile.prompt.question}
                    answer={profile.prompt.answer}
                    primaryColor={theme.primaryLight}
                    textPrimary={theme.textPrimary}
                    textSecondary={theme.textSecondary}
                    secondary={theme.secondary}
                  />
                )}
              </View>

              <ProfileCarousel
                photos={profile.photos || []}
                primaryColor={theme.primaryLight}
              />
            </View>
          </ScrollView>

          {/* Swipe Overlay Stamps */}
          {isTop && (
            <>
              {/* LIKE STAMP (Left side when swiping right) */}
              <Animated.View style={[styles.stampContainer, styles.likeStamp, likeOpacity, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="heart" size={60} color="#000" />
              </Animated.View>

              {/* NOPE STAMP (Right side when swiping left) */}
              <Animated.View style={[styles.stampContainer, styles.nopeStamp, nopeOpacity, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="close" size={60} color="#000" />
              </Animated.View>
            </>
          )}
        </Animated.View>
      </GestureDetector>
    );
  }
);

const styles = StyleSheet.create({
  cardContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    zIndex: 1,
    borderRadius: 25,
  },
  deckWrapper: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  cardWrapper: {
    width: "100%",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  aboutContainer: {
    width: "100%",
    marginTop: 16,
  },
  stampContainer: {
    position: "absolute",
    top: "15%", // moved up vertically
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  likeStamp: {
    left: 20,
    transform: [{ rotate: "-15deg" }],
  },
  nopeStamp: {
    right: 20,
    transform: [{ rotate: "15deg" }],
  },
});
