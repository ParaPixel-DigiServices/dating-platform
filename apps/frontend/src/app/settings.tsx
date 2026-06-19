import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { useAuthStore } from "@/hooks/useAuthStore";
import theme from "@/theme/theme";

// ── Types ────────────────────────────────────────────────────
type RowItem =
  | { kind: "nav";    icon: string; label: string; value?: string; onPress: () => void }
  | { kind: "toggle"; icon: string; label: string; value: boolean; onToggle: (v: boolean) => void }
  | { kind: "info";   icon: string; label: string; value: string };

interface Section { title: string; rows: RowItem[] }

export default function SettingsScreen() {
  const router = useRouter();

  const category = useOnboardingStore((s) => s.category) ?? "Casual";
  const logout   = useAuthStore((s) => s.logout);
  const reset    = useOnboardingStore((s) => s.reset);
  const user     = useAuthStore((s) => s.user);
  const t        = theme[category];

  // Local toggle states (dummy)
  const [notifications,  setNotifications]  = useState(true);
  const [emailUpdates,   setEmailUpdates]   = useState(false);
  const [showDistance,   setShowDistance]   = useState(true);
  const [showAge,        setShowAge]        = useState(true);
  const [incognitoMode,  setIncognitoMode]  = useState(false);
  const [readReceipts,   setReadReceipts]   = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out? You'll need to sign in again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log out",
          style: "destructive",
          onPress: () => {
            logout();   // clears auth store (AsyncStorage)
            reset();    // clears onboarding store (AsyncStorage)
            router.replace("/(onboarding)/landing" as any);
          },
        },
      ]
    );
  };

  const toast = (label: string) =>
    Alert.alert(label, "This feature is coming soon.", [{ text: "OK" }]);

  const SECTIONS: Section[] = [
    {
      title: "Account",
      rows: [
        { kind: "info",   icon: "mail",          label: "Email",          value: user?.email ?? "—"                       },
        { kind: "info",   icon: "phone",          label: "Phone",          value: user?.phoneNumber ?? "—"                 },
        { kind: "nav",    icon: "edit-2",         label: "Edit Profile",   onPress: () => toast("Edit Profile")           },
        { kind: "nav",    icon: "lock",           label: "Change Password", onPress: () => toast("Change Password")       },
        { kind: "nav",    icon: "credit-card",    label: "Subscription",   value: "Free", onPress: () => toast("Subscription") },
      ],
    },
    {
      title: "Notifications",
      rows: [
        { kind: "toggle", icon: "bell",           label: "Push Notifications", value: notifications, onToggle: setNotifications },
        { kind: "toggle", icon: "mail",           label: "Email Updates",       value: emailUpdates,  onToggle: setEmailUpdates  },
        { kind: "toggle", icon: "message-circle", label: "Read Receipts",       value: readReceipts,  onToggle: setReadReceipts  },
      ],
    },
    {
      title: "Discovery",
      rows: [
        { kind: "toggle", icon: "map-pin",        label: "Show Distance",    value: showDistance,  onToggle: setShowDistance  },
        { kind: "toggle", icon: "calendar",       label: "Show Age",         value: showAge,       onToggle: setShowAge       },
        { kind: "toggle", icon: "eye-off",        label: "Incognito Mode",   value: incognitoMode, onToggle: setIncognitoMode },
        { kind: "nav",    icon: "sliders",        label: "Match Preferences", onPress: () => toast("Match Preferences")     },
      ],
    },
    {
      title: "Privacy & Safety",
      rows: [
        { kind: "nav", icon: "shield",        label: "Block List",         onPress: () => toast("Block List")         },
        { kind: "nav", icon: "flag",          label: "Report a Problem",   onPress: () => toast("Report a Problem")   },
        { kind: "nav", icon: "file-text",     label: "Terms of Service",   onPress: () => toast("Terms of Service")   },
        { kind: "nav", icon: "lock",          label: "Privacy Policy",     onPress: () => toast("Privacy Policy")     },
      ],
    },
    {
      title: "About",
      rows: [
        { kind: "info", icon: "info",        label: "App Version",        value: "1.0.0 (beta)"                       },
        { kind: "nav",  icon: "star",        label: "Rate the App",       onPress: () => toast("Rate the App")        },
        { kind: "nav",  icon: "help-circle", label: "Help & Support",     onPress: () => toast("Help & Support")      },
      ],
    },
  ];

  return (
    <View style={[styles.master, { backgroundColor: t.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={t.background} />

      {/* ── HEADER ─────────────────────────────────────────── */}
      <SafeAreaView>
        <View style={[styles.header, { borderBottomColor: t.secondary }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={22} color={t.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: t.textPrimary }]}>Settings</Text>
          {/* spacer */}
          <View style={styles.backBtn} />
        </View>
      </SafeAreaView>

      {/* ── CONTENT ────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.sectionBlock}>
            <Text style={[styles.sectionLabel, { color: t.textSecondary }]}>
              {section.title.toUpperCase()}
            </Text>
            <View style={[styles.sectionCard, { backgroundColor: t.secondary }]}>
              {section.rows.map((row, idx) => (
                <View key={row.label}>
                  {/* NAV ROW */}
                  {row.kind === "nav" && (
                    <TouchableOpacity
                      style={styles.row}
                      onPress={row.onPress}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.rowIcon, { backgroundColor: `${t.primary}22` }]}>
                        <Feather name={row.icon as any} size={15} color={t.primary} />
                      </View>
                      <Text style={[styles.rowLabel, { color: t.textPrimary }]}>{row.label}</Text>
                      <View style={styles.rowRight}>
                        {row.value && (
                          <Text style={[styles.rowValue, { color: t.textSecondary }]}>{row.value}</Text>
                        )}
                        <Feather name="chevron-right" size={16} color={t.textSecondary} />
                      </View>
                    </TouchableOpacity>
                  )}

                  {/* TOGGLE ROW */}
                  {row.kind === "toggle" && (
                    <View style={styles.row}>
                      <View style={[styles.rowIcon, { backgroundColor: `${t.primary}22` }]}>
                        <Feather name={row.icon as any} size={15} color={t.primary} />
                      </View>
                      <Text style={[styles.rowLabel, { color: t.textPrimary }]}>{row.label}</Text>
                      <Switch
                        value={row.value}
                        onValueChange={row.onToggle}
                        trackColor={{ false: t.background, true: t.primary }}
                        thumbColor="#fff"
                        ios_backgroundColor={t.background}
                      />
                    </View>
                  )}

                  {/* INFO ROW */}
                  {row.kind === "info" && (
                    <View style={styles.row}>
                      <View style={[styles.rowIcon, { backgroundColor: `${t.primary}22` }]}>
                        <Feather name={row.icon as any} size={15} color={t.primary} />
                      </View>
                      <Text style={[styles.rowLabel, { color: t.textPrimary }]}>{row.label}</Text>
                      <Text style={[styles.rowValue, { color: t.textSecondary }]} numberOfLines={1}>
                        {row.value}
                      </Text>
                    </View>
                  )}

                  {/* Divider (skip last) */}
                  {idx < section.rows.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: t.background }]} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* ── LOGOUT BUTTON ─────────────────────────────────── */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={[styles.logoutBtn, { borderColor: "#E53E3E" }]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Feather name="log-out" size={18} color="#E53E3E" style={{ marginRight: 10 }} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
          <Text style={[styles.logoutHint, { color: t.textSecondary }]}>
            This will remove all your data from this device.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  master: { flex: 1 },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 16 : 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Lato_700Bold",
    letterSpacing: 0.2,
  },

  /* SCROLL */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 48,
    gap: 24,
  },

  /* SECTION */
  sectionBlock: { gap: 8 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Lato_700Bold",
    letterSpacing: 1.2,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 16,
    overflow: "hidden",
  },

  /* ROW */
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Lato_400Regular",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowValue: {
    fontSize: 13,
    fontFamily: "Lato_400Regular",
    maxWidth: 120,
  },
  divider: {
    height: 1,
    marginLeft: 62,
  },

  /* LOGOUT */
  logoutSection: {
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: "Lato_700Bold",
    color: "#E53E3E",
  },
  logoutHint: {
    fontSize: 12,
    fontFamily: "Lato_400Regular",
    textAlign: "center",
  },
});
