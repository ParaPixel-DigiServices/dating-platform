import React from "react";
import { View, StyleSheet, TouchableOpacity, Platform, Dimensions } from "react-native";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const TABS = [
  { name: "home", route: "/(tabs)/home", icon: "home" },
  { name: "matches", route: "/(tabs)/matches", icon: "grid" }, // changed to grid for new matches UI
  { name: "swipe", route: "/swipe", icon: "compass", isCenter: true }, // The new central swipe trigger
  { name: "messages", route: "/(tabs)/messages", icon: "message-circle" },
  { name: "profile", route: "/(tabs)/profile", icon: "user" },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={s.container}>
      <BlurView intensity={80} tint="dark" style={s.blur}>
        {TABS.map((tab) => {
          const isActive = pathname.includes(tab.name) || (tab.name === "home" && pathname === "/");
          
          if (tab.isCenter) {
            return (
              <TouchableOpacity
                key="centerBtn"
                style={s.centerBtnWrap}
                activeOpacity={0.85}
                onPress={() => router.push(tab.route as any)}
              >
                <LinearGradient
                  colors={["#FF8C00", "#FF4B2B"]}
                  style={s.centerBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Feather name={tab.icon as any} size={28} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity 
              key={tab.name} 
              style={s.tabItem} 
              activeOpacity={0.7} 
              onPress={() => router.navigate(tab.route as any)}
            >
              {/* Active Indicator Line */}
              <View style={[s.activeLine, isActive && s.activeLineVisible]} />
              
              <Feather 
                name={tab.icon as any} 
                size={24} 
                color={isActive ? "#FF2D55" : "rgba(255,255,255,0.7)"} 
                style={{ marginTop: 12 }}
              />
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
  },
  blur: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 34 : 20, // SafeArea padding
    paddingTop: 8,
    backgroundColor: "rgba(20,20,20,0.6)", // Darker tint to match reference
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: 56,
  },
  activeLine: {
    position: "absolute",
    top: 0,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#FF2D55",
    opacity: 0,
  },
  activeLineVisible: {
    opacity: 1,
  },
  centerBtnWrap: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  centerBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8, // slight offset upwards
    shadowColor: "#FF4B2B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
});
