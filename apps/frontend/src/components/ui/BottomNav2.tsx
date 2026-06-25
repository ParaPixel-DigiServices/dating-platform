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
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();

  const t = (theme as any).onboarding;

  const isActive = (route: string) => {
    // e.g. route = "/(tabs)/home", pathname = "/home"
    const segment = route.split("/").pop(); 
    return pathname === `/${segment}` || pathname.endsWith(`/${segment}`);
  };

  return (
    <View style={[styles.floatingContainer, { bottom: Math.max(insets.bottom + 10, 20) }]}>
      <View style={[styles.wrapper, { backgroundColor: t.background, borderColor: t.border }]}>
        {TABS.map((tab) => {
          const active = isActive(tab.route);

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => router.push(tab.route as any)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.activeCircle,
                  active && {
                    borderWidth: 1,
                    borderColor: t.primary,
                    backgroundColor: t.primary + "0A", // Very faint glow
                  },
                ]}
              >
                <Feather
                  name={active ? tab.iconActive : tab.iconInactive}
                  size={20}
                  color={active ? t.primary : t.textSecondary}
                  style={{ marginBottom: 4, opacity: active ? 1 : 0.7 }}
                />
                <Text
                  style={[
                    styles.label,
                    { color: active ? t.primary : t.textSecondary },
                    { opacity: active ? 1 : 0.7 }
                  ]}
                  numberOfLines={1}
                >
                  {tab.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    // Android elevation
    elevation: 15,
  },
  wrapper: {
    flexDirection: "row",
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "space-between",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  activeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    fontFamily: "PlayfairDisplay_400Regular",
    letterSpacing: 0.2,
  },
});
