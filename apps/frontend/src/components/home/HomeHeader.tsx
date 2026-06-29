import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { NotificationIcon } from "./NotificationIcon";

interface Props {
  primaryColor: string;
  textPrimary: string;
  textSecondary: string;
  secondary: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onFilterPress?: () => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
}

const TABS = ["For You", "Recently Active", "Liked You"];

export function HomeHeader({ primaryColor, textPrimary, textSecondary, secondary, activeTab, onTabChange, onFilterPress, onNotificationPress, notificationCount = 0 }: Props) {
  return (
    <View>
      <View style={styles.container}>
        {/* ── AMORA Logo ────────────────────────────────── */}
        <View style={styles.logoRow}>
          {/* <Ionicons name="moon" size={18} color={primaryColor} style={styles.moonIcon} /> */}
          <Text style={[styles.logoText, { color: primaryColor }]}>AMORA</Text>
        </View>

        {/* ── Right Actions ───────────────────────────────── */}
        <View style={styles.rightActions}>
          <NotificationIcon
            count={notificationCount}
            color={primaryColor}
            onPress={onNotificationPress || (() => {})}
          />
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={onFilterPress}
            activeOpacity={0.75}
          >
            <Feather name="sliders" size={24} color={primaryColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Tabs ──────────────────────────────────────── */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => onTabChange(tab)}
              style={styles.tabButton}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? primaryColor : textSecondary },
                ]}
              >
                {tab}
              </Text>
              {isActive && (
                <View style={[styles.activeIndicator, { backgroundColor: primaryColor }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 16 : 8,
    paddingBottom: 24,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  moonIcon: {
    transform: [{ rotate: "20deg" }],
  },
  logoText: {
    fontSize: 26,
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: 2,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  filterBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 24,
    paddingBottom: 16,
  },
  tabButton: {
    paddingBottom: 8,
    position: "relative",
  },
  tabText: {
    fontSize: 16,
    fontFamily: "Lato_400Regular",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
  },
});
