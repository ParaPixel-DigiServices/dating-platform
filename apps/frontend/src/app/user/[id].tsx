import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Platform, Dimensions, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");

export default function UserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <View style={s.master}>
      <Image 
        source={{ uri: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80" }} 
        style={StyleSheet.absoluteFillObject} 
      />
      
      <LinearGradient 
        colors={["rgba(0,0,0,0.4)", "transparent", "rgba(0,0,0,0.8)", "#0A0A0A"]} 
        locations={[0, 0.3, 0.6, 1]} 
        style={StyleSheet.absoluteFillObject} 
      />

      <SafeAreaView style={s.safeArea}>
        {/* HEADER */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Feather name="chevron-left" size={24} color="#FFF" />
            <Text style={s.headerTitle}>Home</Text>
          </TouchableOpacity>
          <View style={s.dateBadge}>
            <Text style={s.dateText}>22 Nov</Text>
            <Image source={{ uri: "https://i.pravatar.cc/150?img=47" }} style={s.smallAvatar} />
          </View>
        </View>

        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          {/* USER INFO */}
          <View style={s.infoSection}>
            <View style={s.locationRow}>
              <Ionicons name="location-sharp" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={s.locationText}>London</Text>
            </View>
            
            <View style={s.nameRow}>
              <Text style={s.name}>Ivan Ellanpark <Text style={s.heartIcon}>💖</Text></Text>
              <View style={s.ageCircle}>
                <Text style={s.ageText}>29</Text>
              </View>
            </View>

            <View style={s.statsRow}>
              <View style={s.statPill}>
                <Ionicons name="person" size={14} color="#FFF" />
                <Text style={s.statText}>Single</Text>
              </View>
              <View style={s.statPill}>
                <MaterialCommunityIcons name="weight" size={14} color="#FFF" />
                <Text style={s.statText}>50KG</Text>
              </View>
              <View style={s.statPill}>
                <MaterialCommunityIcons name="human-male-height" size={14} color="#FFF" />
                <Text style={s.statText}>180cm</Text>
              </View>
            </View>

            {/* ACTION BUTTONS */}
            <View style={s.actionsRow}>
              <TouchableOpacity style={s.actionBtn}>
                <Ionicons name="heart" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={s.actionBtn}>
                <Ionicons name="chatbubble" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={s.actionBtn}>
                <Feather name="video" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={s.meetingBtn}>
                <Ionicons name="calendar" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={s.meetingText}>Set Meeting</Text>
                <Feather name="x" size={16} color="#FFF" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* CALENDAR COMPONENT (Dummy layout) */}
          <BlurView intensity={40} tint="dark" style={s.calendarCard}>
            <View style={s.calHeader}>
              <Text style={s.calMonth}>OCT, 2024</Text>
              <View style={s.calControls}>
                <TouchableOpacity style={s.calArrow}><Feather name="chevron-left" size={16} color="#FFF" /></TouchableOpacity>
                <TouchableOpacity style={s.calArrow}><Feather name="chevron-right" size={16} color="#FFF" /></TouchableOpacity>
              </View>
            </View>
            
            <View style={s.calGrid}>
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(day => (
                <Text key={day} style={s.calDayName}>{day}</Text>
              ))}
              {/* Dummy days */}
              {[...Array(31)].map((_, i) => (
                <View key={i} style={s.calDayCell}>
                  {i === 9 || i === 19 ? (
                    <Image source={{ uri: "https://i.pravatar.cc/150?img=47" }} style={s.calDayAvatar} />
                  ) : (
                    <Text style={s.calDayNumber}>{i + 1}</Text>
                  )}
                </View>
              ))}
            </View>

            <View style={s.calFooter}>
              <TouchableOpacity style={s.calFooterBtn}>
                <Ionicons name="calendar-outline" size={16} color="#FFF" />
                <Text style={s.calFooterBtnText}>Move to Google calendar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.calFooterBtn, { width: undefined, paddingHorizontal: 20 }]}>
                <Feather name="headphones" size={16} color="#FFF" />
                <Text style={s.calFooterBtnText}>Questions?</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
          
          <Text style={s.bioText}>
            Passionate profiles, our detailed format allows you to add short bios, helping users easily express themselves and see what others are looking for. Through our intelligent matching algorithm...
          </Text>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  master: { flex: 1, backgroundColor: "#0A0A0A" },
  safeArea: { flex: 1 },
  
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: Platform.OS === "android" ? 40 : 10, paddingBottom: 10 },
  backBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)", paddingRight: 16, paddingLeft: 8, paddingVertical: 8, borderRadius: 24 },
  headerTitle: { fontSize: 16, fontFamily: "Outfit_600SemiBold", color: "#FFF", marginLeft: 4 },
  dateBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)", paddingRight: 4, paddingLeft: 12, paddingVertical: 4, borderRadius: 24 },
  dateText: { fontSize: 13, fontFamily: "Outfit_500Medium", color: "#FFF", marginRight: 8 },
  smallAvatar: { width: 28, height: 28, borderRadius: 14 },

  scrollContent: { paddingTop: height * 0.35, paddingHorizontal: 20, paddingBottom: 40 },
  
  infoSection: { marginBottom: 24 },
  locationRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  locationText: { fontSize: 16, fontFamily: "Outfit_500Medium", color: "rgba(255,255,255,0.9)", marginLeft: 6 },
  
  nameRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  name: { fontSize: 40, fontFamily: "Outfit_700Bold", color: "#FFF", lineHeight: 46 },
  heartIcon: { fontSize: 32 },
  ageCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center", marginLeft: 16 },
  ageText: { fontSize: 18, fontFamily: "Outfit_600SemiBold", color: "#FFF" },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statPill: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  statText: { fontSize: 14, fontFamily: "Outfit_500Medium", color: "#FFF", marginLeft: 6 },

  actionsRow: { flexDirection: "row", gap: 12 },
  actionBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" },
  meetingBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 28 },
  meetingText: { fontSize: 15, fontFamily: "Outfit_600SemiBold", color: "#FFF" },

  calendarCard: { borderRadius: 32, padding: 24, overflow: "hidden", marginBottom: 24 },
  calHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  calMonth: { fontSize: 18, fontFamily: "Outfit_600SemiBold", color: "#FFF", letterSpacing: 1 },
  calControls: { flexDirection: "row", gap: 8 },
  calArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.1)", justifyContent: "center", alignItems: "center" },
  
  calGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  calDayName: { width: "14%", textAlign: "center", fontSize: 12, fontFamily: "Outfit_600SemiBold", color: "rgba(255,255,255,0.6)", marginBottom: 16 },
  calDayCell: { width: "14%", aspectRatio: 1, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  calDayNumber: { fontSize: 14, fontFamily: "Outfit_500Medium", color: "#FFF" },
  calDayAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: "#FFF" },

  calFooter: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 16 },
  calFooterBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.1)", paddingVertical: 14, borderRadius: 24 },
  calFooterBtnText: { fontSize: 13, fontFamily: "Outfit_500Medium", color: "#FFF", marginLeft: 8 },

  bioText: { fontSize: 14, fontFamily: "Outfit_400Regular", color: "rgba(255,255,255,0.5)", lineHeight: 22 },
});
