import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Switch, ScrollView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/hooks/useAuthStore";

export default function SettingsScreen() {
  const router = useRouter();
  const logout = useAuthStore(s => s.logout);
  const [notifications, setNotifications] = React.useState(true);
  const [incognito, setIncognito] = React.useState(false);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <View style={s.master}>
      <LinearGradient colors={["#0A0A0A", "#111113"]} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView style={s.safeArea}>
        {/* HEADER */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Feather name="chevron-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={s.content}>
          <Text style={s.sectionTitle}>Preferences</Text>
          <View style={s.card}>
            <View style={s.row}>
              <View style={s.rowLeft}>
                <Feather name="bell" size={20} color="#FF4B2B" style={s.icon} />
                <Text style={s.rowText}>Push Notifications</Text>
              </View>
              <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: "#333", true: "#FF4B2B" }} thumbColor="#FFF" />
            </View>
            <View style={s.divider} />
            <View style={s.row}>
              <View style={s.rowLeft}>
                <Feather name="eye-off" size={20} color="#FF4B2B" style={s.icon} />
                <Text style={s.rowText}>Incognito Mode</Text>
              </View>
              <Switch value={incognito} onValueChange={setIncognito} trackColor={{ false: "#333", true: "#FF4B2B" }} thumbColor="#FFF" />
            </View>
          </View>

          <Text style={s.sectionTitle}>Account</Text>
          <View style={s.card}>
            <TouchableOpacity style={s.rowBtn}>
              <Text style={s.rowText}>Edit Profile</Text>
              <Feather name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
            <View style={s.divider} />
            <TouchableOpacity style={s.rowBtn}>
              <Text style={s.rowText}>Manage Payment Methods</Text>
              <Feather name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
            <View style={s.divider} />
            <TouchableOpacity style={s.rowBtn} onPress={handleLogout}>
              <Text style={[s.rowText, { color: "#FF3B30" }]}>Log Out</Text>
              <Feather name="log-out" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  master: { flex: 1, backgroundColor: "#0A0A0A" },
  safeArea: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: Platform.OS === "android" ? 40 : 10, paddingBottom: 20 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontFamily: "Outfit_600SemiBold", color: "#FFF" },
  content: { paddingHorizontal: 20, paddingTop: 10 },
  sectionTitle: { fontSize: 14, fontFamily: "Outfit_500Medium", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, marginTop: 20 },
  card: { backgroundColor: "#1C1C1E", borderRadius: 16, overflow: "hidden" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16 },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  icon: { marginRight: 16 },
  rowText: { fontSize: 16, fontFamily: "Outfit_400Regular", color: "#FFF" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.05)", marginHorizontal: 20 },
  rowBtn: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16 },
});
