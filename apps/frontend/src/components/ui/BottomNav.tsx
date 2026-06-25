import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import theme from "@/theme/theme";

// ── Tab definitions ──────────────────────────────────────────
const TABS = [
  { name: "Home",    route: "/(tabs)/home",    iconActive: "home",           iconInactive: "home"           },
  { name: "Explore", route: "/(tabs)/explore",  iconActive: "compass",        iconInactive: "compass"        },
  { name: "Social",  route: "/(tabs)/social",   iconActive: "users",          iconInactive: "users"          },
  { name: "Chat",    route: "/(tabs)/chat",     iconActive: "message-circle", iconInactive: "message-circle" },
  { name: "Profile", route: "/(tabs)/profile",  iconActive: "user",           iconInactive: "user"           },
] as const;

export function BottomNav() {
  const router   = useRouter();
  const pathname = usePathname();

  const t = (theme as any).onboarding;

  const isActive = (route: string) => {
    // e.g. route = "/(tabs)/home", pathname = "/home"
    const segment = route.split("/").pop(); // "home"
    return pathname === `/${segment}` || pathname.endsWith(`/${segment}`);
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: t.background, borderTopColor: t.border }]}>
      {TABS.map((tab) => {
        const active = isActive(tab.route);

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => router.push(tab.route as any)}
            activeOpacity={0.75}
          >
            {/* Active: filled primary circle. Inactive: bare icon */}
            <View
              style={[
                styles.iconWrap,
                active && {
                  borderWidth: 1.5,
                  borderColor: t.primary,
                },
              ]}
            >
              <Feather
                name={active ? tab.iconActive : tab.iconInactive}
                size={20}
                color={active ? t.primary : t.textSecondary}
              />
            </View>

            <Text
              style={[
                styles.label,
                { color: active ? t.textPrimary : t.textSecondary },
                active && styles.labelActive,
              ]}
              numberOfLines={1}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 28 : 14,
    paddingHorizontal: 4,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  /* Circular ring around the active icon — transparent fill, border outline */
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 0,      // default — overridden inline when active
    borderColor: "transparent",
  },

  label: {
    fontSize: 11,
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: 0.1,
  },
  labelActive: {
    fontFamily: "PlayfairDisplay_700Bold",
  },
});
