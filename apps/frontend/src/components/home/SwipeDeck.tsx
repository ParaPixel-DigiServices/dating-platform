import React, {
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  View,
  Animated,
  PanResponder,
  StyleSheet,
  Dimensions,
  Text,
} from "react-native";
import { MatchCard, Profile, CARD_WIDTH, CARD_HEIGHT } from "./MatchCard";

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = 110;
const SWIPE_DURATION  = 280;

export interface SwipeDeckRef {
  swipeLeft:        () => void;
  swipeRight:       () => void;   // manual gesture equivalent (not used by button)
  swipeLikeButton:  () => void;   // center ♥ button → fade out
  swipeSuperLike:   () => void;
}

interface Props {
  profiles:     Profile[];
  primaryColor: string;
  textPrimary:  string;
  textSecondary:string;
  secondary:    string;
  background:   string;
}

export const SwipeDeck = forwardRef<SwipeDeckRef, Props>(
  ({ profiles, primaryColor, textPrimary, textSecondary, secondary, background }, ref) => {

    const [currentIndex, setCurrentIndex] = useState(0);
    const position  = useRef(new Animated.ValueXY()).current;
    const cardScale = useRef(new Animated.Value(1)).current;
    const cardAlpha = useRef(new Animated.Value(1)).current;

    // ── Derived animated values ───────────────────────────
    const rotate = position.x.interpolate({
      inputRange:  [-width / 2, 0, width / 2],
      outputRange: ["-12deg", "0deg", "12deg"],
      extrapolate: "clamp",
    });

    const likeOpacity = position.x.interpolate({
      inputRange:  [0, SWIPE_THRESHOLD * 0.6],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });

    const nopeOpacity = position.x.interpolate({
      inputRange:  [-SWIPE_THRESHOLD * 0.6, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    const nextCardScale = position.x.interpolate({
      inputRange:  [-width / 2, 0, width / 2],
      outputRange: [1, 0.93, 1],
      extrapolate: "clamp",
    });

    const nextCardOpacity = position.x.interpolate({
      inputRange:  [-width / 2, 0, width / 2],
      outputRange: [1, 0.6, 1],
      extrapolate: "clamp",
    });

    // Upward drag → super like stamp
    const superOpacity = position.y.interpolate({
      inputRange:  [-150, -60, 0],
      outputRange: [1, 0.6, 0],
      extrapolate: "clamp",
    });

    // ── Advance to next card ──────────────────────────────
    const advance = () => {
      setCurrentIndex((prev) => prev + 1);
      position.setValue({ x: 0, y: 0 });
    };

    // ── Programmatic swipe helpers ────────────────────────
    const animateOut = (toX: number, toY = 0, cb?: () => void) => {
      Animated.timing(position, {
        toValue:         { x: toX, y: toY },
        duration:        SWIPE_DURATION,
        useNativeDriver: false,
      }).start(() => {
        advance();
        cb?.();
      });
    };

    const swipeLeft      = () => animateOut(-width * 1.5);
    const swipeRight     = () => animateOut(width * 1.5);
    const swipeSuperLike = () => animateOut(0, -width * 1.5);

    // ── Like via button: fade + scale down (no direction) ────
    const swipeLikeButton = () => {
      Animated.parallel([
        Animated.timing(cardScale, { toValue: 0.82, duration: 260, useNativeDriver: false }),
        Animated.timing(cardAlpha, { toValue: 0,    duration: 260, useNativeDriver: false }),
      ]).start(() => {
        advance();
        cardScale.setValue(1);
        cardAlpha.setValue(1);
      });
    };

    // ── Expose methods via ref ────────────────────────────
    useImperativeHandle(ref, () => ({ swipeLeft, swipeRight, swipeLikeButton, swipeSuperLike }));

    // ── PanResponder ──────────────────────────────────────
    const panResponder = PanResponder.create({
      // Only claim the gesture when the user is moving more horizontally
      // than vertically — this lets the inner ScrollView handle vertical scroll
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > Math.abs(gesture.dy) + 8,
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeLeft();
        } else {
          // Snap back
          Animated.spring(position, {
            toValue:         { x: 0, y: 0 },
            friction:        5,
            useNativeDriver: false,
          }).start();
        }
      },
    });

    // ── Empty state ───────────────────────────────────────
    if (currentIndex >= profiles.length) {
      return (
        <View style={[styles.emptyContainer, { backgroundColor: secondary }]}>
          <Text style={[styles.emptyEmoji]}>✨</Text>
          <Text style={[styles.emptyTitle, { color: textPrimary }]}>
            You're all caught up!
          </Text>
          <Text style={[styles.emptySubtitle, { color: textSecondary }]}>
            Check back later for new matches
          </Text>
        </View>
      );
    }

    // ── Render top 2 cards ────────────────────────────────
    return (
      <View style={styles.deckContainer}>
        {/* Back card (n+1) */}
        {currentIndex + 1 < profiles.length && (
          <Animated.View
            style={[
              styles.cardWrapper,
              styles.backCard,
              { transform: [{ scale: nextCardScale }], opacity: nextCardOpacity },
            ]}
          >
            <MatchCard
              profile={profiles[currentIndex + 1]}
              primaryColor={primaryColor}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              secondary={secondary}
            />
          </Animated.View>
        )}

        {/* Front card (current) — draggable */}
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              opacity: cardAlpha,
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate },
                { scale: cardScale },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <MatchCard
            profile={profiles[currentIndex]}
            primaryColor={primaryColor}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            secondary={secondary}
            likeOpacity={likeOpacity}
            nopeOpacity={nopeOpacity}
            superOpacity={superOpacity}
          />
        </Animated.View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  deckContainer: {
    width:          "100%",
    height:         CARD_HEIGHT,
    alignItems:     "center",
    justifyContent: "flex-start",
    paddingTop:     10,
  },
  cardWrapper: {
    position: "absolute",
  },
  backCard: {
    zIndex: 0,
  },
  emptyContainer: {
    width:          CARD_WIDTH,
    height:         CARD_HEIGHT,
    borderRadius:   20,
    justifyContent: "center",
    alignItems:     "center",
    gap:            12,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize:   22,
    fontFamily: "Outfit_700Bold",
  },
  emptySubtitle: {
    fontSize:   14,
    fontFamily: "Outfit_400Regular",
    textAlign:  "center",
    paddingHorizontal: 32,
  },
});
