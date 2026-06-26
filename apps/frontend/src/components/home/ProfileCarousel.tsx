import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";

const { width } = Dimensions.get("window");

// Center image width
const ITEM_WIDTH = width * 0.7;
// Spacing so the adjacent images peek in from the edges
const SPACING = 16;
const SNAP_INTERVAL = ITEM_WIDTH + SPACING;
// Padding to center the first and last items
const SIDE_PADDING = (width - ITEM_WIDTH) / 2;

interface Props {
  photos: (string | any)[];
  primaryColor: string;
}

export function ProfileCarousel({ photos, primaryColor }: Props) {
  // Create a looped array for fake infinite scrolling
  const loopCount = 5; // Enough to scroll left and right smoothly
  const loopedPhotos = Array(loopCount).fill(photos).flat();
  
  // Start exactly at the first photo of the middle loop
  const middleStart = Math.floor(loopCount / 2) * photos.length;

  const [currentIndex, setCurrentIndex] = useState(middleStart);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    // Calculate current index based on scroll position
    const index = Math.round(x / SNAP_INTERVAL);
    if (index >= 0 && index < loopedPhotos.length) {
      setCurrentIndex(index);
    }
  };

  useEffect(() => {
    // Scroll to the middle loop item after layout is ready to ensure peeking works
    const timer = setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: middleStart,
          animated: false,
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [middleStart]);

  if (!photos || photos.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={loopedPhotos}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        decelerationRate="fast"
        snapToInterval={SNAP_INTERVAL}
        removeClippedSubviews={false}
        contentContainerStyle={{
          paddingHorizontal: SIDE_PADDING,
        }}
        getItemLayout={(_, index) => ({
          length: SNAP_INTERVAL,
          offset: SNAP_INTERVAL * index,
          index,
        })}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => {
          const isCenter = index === currentIndex;
          return (
            <View
              style={[
                styles.imageWrapper,
                {
                  marginRight: index === loopedPhotos.length - 1 ? 0 : SPACING,
                  opacity: isCenter ? 1 : 0.6,
                  transform: [{ scale: isCenter ? 1 : 0.9 }],
                  borderColor: isCenter ? primaryColor : "transparent",
                },
              ]}
            >
              <Image
                source={typeof item === "string" ? { uri: item } : item}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          );
        }}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {photos.map((_, idx) => {
          const isActive = idx === (currentIndex % photos.length);
          return (
            <View
              key={idx}
              style={[
                styles.dot,
                {
                  backgroundColor: isActive ? primaryColor : "rgba(255,255,255,0.3)",
                  width: isActive ? 24 : 8,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 20,
  },
  imageWrapper: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.25, // Slightly taller than wide
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    backgroundColor: "#1a1a1a",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
