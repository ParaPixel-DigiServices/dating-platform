import React from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";

interface Props {
  primaryColor: string;
  onBack: () => void;
  onMenu: () => void;
}

export function ProfileHeaderButtons({ primaryColor, onBack, onMenu }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack}>
        <BlurView
          intensity={Platform.OS === "ios" ? 60 : 80}
          tint="dark"
          style={styles.btn}
        >
          <Feather name="arrow-left" size={28} color={primaryColor} />
        </BlurView>
      </TouchableOpacity>

      <TouchableOpacity onPress={onMenu}>
        <BlurView
          intensity={Platform.OS === "ios" ? 60 : 80}
          tint="dark"
          style={styles.btn}
        >
          <Feather name="more-horizontal" size={26} color={primaryColor} />
        </BlurView>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "android" ? 40 : 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 100,
  },
  btn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", // Important for BlurView border radius
    backgroundColor: "rgba(0, 0, 0, 0.55)", // Fallback color
  },
});
