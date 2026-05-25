import React, { useRef, useState, useImperativeHandle, forwardRef } from "react";
import { View, Text, StyleSheet, Image, Dimensions, Animated, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import MaskedView from "@react-native-masked-view/masked-view";

const { width, height } = Dimensions.get("window");

export interface ProfileData {
  id: string;
  name: string;
  age: number;
  bio: string;
  verified: boolean;
  distance: string;
  photos: string[];
  interests: string[];
}

export interface SwipeCardProps {
  profile: ProfileData;
  photoIdx: number;
  onPhotoChange: (direction: "next" | "prev") => void;
  onSwipedLeft: () => void;
  onSwipedRight: () => void;
  onSwipedUp: () => void;
}

export interface SwipeCardRef {
  swipeLeft: () => void;
  swipeRight: () => void;
  swipeUp: () => void;
}

export const SwipeCard = forwardRef<SwipeCardRef, SwipeCardProps>(
  ({ profile, photoIdx, onPhotoChange, onSwipedLeft, onSwipedRight, onSwipedUp }, ref) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const cardOpacity = useRef(new Animated.Value(1)).current;
    
    const likeOpacity = useRef(new Animated.Value(0)).current;
    const nopeOpacity = useRef(new Animated.Value(0)).current;
    const superLikeOpacity = useRef(new Animated.Value(0)).current;
    
    const isAnimating = useRef(false);
    const [isSuperLikeReady, setIsSuperLikeReady] = useState(false);

    // Slide up with soft transition
    const slideUpAndOut = (onDone: () => void) => {
      isAnimating.current = true;
      Animated.parallel([
        Animated.timing(pan.y, {
          toValue: -height * 0.8,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        pan.setValue({ x: 0, y: 0 });
        cardOpacity.setValue(1);
        likeOpacity.setValue(0);
        nopeOpacity.setValue(0);
        superLikeOpacity.setValue(0);
        isAnimating.current = false;
        onDone();
      });
    };

    useImperativeHandle(ref, () => ({
      swipeLeft: () => {
        if (isAnimating.current) return;
        Animated.timing(nopeOpacity, { toValue: 1, duration: 100, useNativeDriver: true }).start();
        slideUpAndOut(onSwipedLeft);
      },
      swipeRight: () => {
        if (isAnimating.current) return;
        Animated.timing(likeOpacity, { toValue: 1, duration: 100, useNativeDriver: true }).start();
        slideUpAndOut(onSwipedRight);
      },
      swipeUp: () => {
        if (isAnimating.current) return;
        Animated.timing(superLikeOpacity, { toValue: 1, duration: 100, useNativeDriver: true }).start();
        slideUpAndOut(onSwipedUp);
      },
    }));

    const triggerLike = () => {
      if (isAnimating.current) return;
      if (isSuperLikeReady) {
        Animated.timing(superLikeOpacity, { toValue: 1, duration: 100, useNativeDriver: true }).start();
        slideUpAndOut(onSwipedUp);
      } else {
        Animated.timing(likeOpacity, { toValue: 1, duration: 100, useNativeDriver: true }).start();
        slideUpAndOut(onSwipedRight);
      }
      setIsSuperLikeReady(false);
    };

    const triggerPass = () => {
      if (isAnimating.current) return;
      Animated.timing(nopeOpacity, { toValue: 1, duration: 100, useNativeDriver: true }).start();
      slideUpAndOut(onSwipedLeft);
    };

    return (
      <Animated.View
        style={[s.card, { opacity: cardOpacity, transform: [{ translateY: pan.y }] }]}
      >
        <Image source={{ uri: profile.photos[photoIdx] }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        
        {/* Photo Progress Bars */}
        <View style={s.photoBars}>
          {profile.photos.map((_, i) => (
            <View key={i} style={[s.photoBar, { opacity: i === photoIdx ? 1 : 0.3, flex: 1 }]} />
          ))}
        </View>

        {/* Stamps */}
        <Animated.View style={[s.stamp, s.stampLike, { opacity: likeOpacity }]}>
          <Text style={[s.stampTxt, { color: "#4CD964", borderColor: "#4CD964" }]}>LIKE</Text>
        </Animated.View>
        <Animated.View style={[s.stamp, s.stampNope, { opacity: nopeOpacity }]}>
          <Text style={[s.stampTxt, { color: "#FF3B30", borderColor: "#FF3B30" }]}>NOPE</Text>
        </Animated.View>
        <Animated.View style={[s.stamp, s.stampSuper, { opacity: superLikeOpacity }]}>
          <Text style={[s.stampTxt, { color: "#4A9EFF", borderColor: "#4A9EFF" }]}>SUPER</Text>
        </Animated.View>

        <LinearGradient
          colors={["transparent", "rgba(255, 90, 90, 0.6)", "rgba(255, 75, 75, 1)"]}
          locations={[0.3, 0.65, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        <View style={s.info}>
          <View style={s.nameRow}>
            <Text style={s.name}>{profile.name}</Text>
            <Text style={s.age}> {profile.age}</Text>
          </View>
          
          <Text style={s.bio} numberOfLines={3}>{profile.bio}</Text>
          
          <View style={s.tags}>
            {profile.interests.slice(0, 3).map((tag) => (
              <View key={tag} style={s.tag}>
                <Ionicons name="musical-notes" size={12} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={s.tagTxt}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={s.cardActions}>
            <TouchableOpacity style={s.btnReject} activeOpacity={0.8} onPress={triggerPass}>
              <Feather name="x" size={28} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={s.btnLike} 
              activeOpacity={0.8} 
              onPress={triggerLike}
              onLongPress={() => setIsSuperLikeReady(true)}
              delayLongPress={600} 
            >
              {isSuperLikeReady ? (
                <MaskedView
                  style={{ width: 28, height: 28 }}
                  maskElement={<Ionicons name="heart" size={28} color="#000" style={{ backgroundColor: 'transparent' }} />}
                >
                  <LinearGradient
                    colors={["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#8B00FF"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                </MaskedView>
              ) : (
                <Ionicons name="heart" size={28} color="#000" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  }
);

const s = StyleSheet.create({
  card: { flex: 1, borderRadius: 26, overflow: "hidden", backgroundColor: "#222", elevation: 15 },
  photoBars: { position: "absolute", top: 14, left: 12, right: 12, flexDirection: "row", gap: 5, zIndex: 10 },
  photoBar: { height: 3, borderRadius: 2, backgroundColor: "#FFF" },
  stamp: { position: "absolute", zIndex: 20 },
  stampLike: { left: 20, top: 60, transform: [{ rotate: "-18deg" }] },
  stampNope: { right: 20, top: 60, transform: [{ rotate: "18deg" }] },
  stampSuper: { alignSelf: "center", left: width / 2 - 70, top: 70 },
  stampTxt: { fontSize: 34, fontWeight: "900", letterSpacing: 3, borderWidth: 4, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 2 },
  info: { position: "absolute", bottom: 24, left: 0, right: 0, paddingHorizontal: 24 },
  nameRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 8 },
  name: { fontSize: 44, fontFamily: "Outfit_700Bold", color: "#1A1A1A", lineHeight: 48, letterSpacing: -1 },
  age: { fontSize: 44, fontFamily: "Outfit_500Medium", color: "rgba(26,26,26,0.6)", lineHeight: 48, letterSpacing: -1 },
  
  bio: { fontSize: 14, color: "#1A1A1A", fontFamily: "Outfit_500Medium", lineHeight: 20, marginBottom: 16, paddingRight: 20 },
  
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  tag: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  tagTxt: { fontSize: 13, color: "#FFF", fontFamily: "Outfit_600SemiBold" },

  cardActions: { flexDirection: "row", gap: 16 },
  btnReject: { flex: 1, height: 60, backgroundColor: "#FFF", borderRadius: 16, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  btnLike: { flex: 1, height: 60, backgroundColor: "#C8B8FF", borderRadius: 16, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
});
