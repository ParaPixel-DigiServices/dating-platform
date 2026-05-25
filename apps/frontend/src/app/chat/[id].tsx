import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Platform, Dimensions, TextInput, KeyboardAvoidingView, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChatBubble } from "@/components/ui/ChatBubble";

const { width } = Dimensions.get("window");

const MESSAGES = [
  { id: "1", text: "Are they still open at sunday?", sender: "them" as const, time: "8:16 PM" },
  { id: "2", text: "Kira Lindegaard\nOh, I think that's a good idea", sender: "me" as const, time: "8:18 PM", reply: true },
  { id: "3", text: "Now how we get that?", sender: "me" as const, time: "8:19 PM" },
  { id: "4", text: "Akbar Lazuardi\nWe can use my dad van", sender: "them" as const, time: "8:20 PM", reply: true },
  { id: "5", text: "Oh that's nice Akbar", sender: "them" as const, time: "8:21 PM" },
];

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [msg, setMsg] = useState("");

  return (
    <View style={s.master}>
      <LinearGradient colors={["#1A1A1C", "#0A0A0A"]} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView style={s.safeArea}>
        {/* HEADER */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <Feather name="chevron-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={s.avatarWrap}>
              <Image source={{ uri: "https://i.pravatar.cc/150?img=47" }} style={s.avatar} />
              <View style={s.onlineDot} />
            </View>
            <View>
              <Text style={s.headerName}>Visit Denpasar</Text>
              <Text style={s.headerStatus}>Online</Text>
            </View>
          </View>
          <View style={s.headerRight}>
            <TouchableOpacity style={s.headerIcon}><Feather name="phone" size={20} color="#FFF" /></TouchableOpacity>
            <TouchableOpacity style={s.headerIcon}><Feather name="video" size={20} color="#FFF" /></TouchableOpacity>
            <TouchableOpacity style={s.headerIcon}><Feather name="more-vertical" size={20} color="#FFF" /></TouchableOpacity>
          </View>
        </View>

        {/* CHAT AREA */}
        <ScrollView style={s.chatArea} contentContainerStyle={s.chatContent} showsVerticalScrollIndicator={false}>
          <Text style={s.systemText}>Do we need to prepare a van?</Text>
          <Text style={s.timeSeparator}>8:16 PM</Text>

          {MESSAGES.map((m) => (
            <ChatBubble
              key={m.id}
              id={m.id}
              text={m.text}
              sender={m.sender}
              avatar="https://i.pravatar.cc/150?img=47"
              time={m.time}
            />
          ))}
          
          <Text style={s.timeSeparator}>8:19 PM</Text>

          {/* Dummy Image Group */}
          <View style={s.imageGroup}>
             <View style={s.imgBox}><Text style={s.fireCount}>🔥 06</Text></View>
             <View style={[s.imgBox, { marginLeft: -40, zIndex: -1, transform: [{rotate: '5deg'}] }]}><Text style={s.fireCount}>🔥 09</Text></View>
          </View>
        </ScrollView>

        {/* INPUT AREA */}
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={10}>
          <View style={s.inputContainer}>
            <TextInput
              style={s.input}
              placeholder="Type here"
              placeholderTextColor="#666"
              value={msg}
              onChangeText={setMsg}
            />
            <View style={s.inputActions}>
              <TouchableOpacity style={s.inputIcon}><Feather name="camera" size={20} color="#999" /></TouchableOpacity>
              <TouchableOpacity style={s.sendBtn}>
                <Feather name="plus" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  master: { flex: 1, backgroundColor: "#0A0A0A" },
  safeArea: { flex: 1 },
  
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: Platform.OS === "android" ? 40 : 10, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  backBtn: { marginRight: 12 },
  avatarWrap: { position: "relative", marginRight: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  onlineDot: { position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: "#4CD964", borderWidth: 2, borderColor: "#1A1A1C" },
  headerName: { fontSize: 16, fontFamily: "Outfit_600SemiBold", color: "#FFF" },
  headerStatus: { fontSize: 13, fontFamily: "Outfit_400Regular", color: "#4CD964" },
  headerRight: { flexDirection: "row", gap: 8 },
  headerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center" },

  chatArea: { flex: 1 },
  chatContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 },
  
  systemText: { alignSelf: "center", backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, color: "rgba(255,255,255,0.8)", fontFamily: "Outfit_400Regular", fontSize: 13, marginBottom: 20 },
  timeSeparator: { alignSelf: "flex-start", color: "rgba(255,255,255,0.4)", fontFamily: "Outfit_600SemiBold", fontSize: 12, marginBottom: 16, marginTop: 8 },

  imageGroup: { flexDirection: "row", justifyContent: "center", marginTop: 10, marginBottom: 30 },
  imgBox: { width: 120, height: 140, backgroundColor: "#333", borderRadius: 20, justifyContent: "flex-end", padding: 10, shadowColor: "#000", shadowOffset: { width: -4, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10 },
  fireCount: { color: "#FFF", fontSize: 12, fontFamily: "Outfit_600SemiBold", backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: "flex-start" },

  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#1C1C1E", marginHorizontal: 20, marginBottom: Platform.OS === "ios" ? 10 : 20, borderRadius: 30, paddingHorizontal: 20, paddingVertical: 10 },
  input: { flex: 1, color: "#FFF", fontFamily: "Outfit_400Regular", fontSize: 15, maxHeight: 100, minHeight: 40 },
  inputActions: { flexDirection: "row", alignItems: "center", gap: 12, marginLeft: 10 },
  inputIcon: { padding: 4 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.1)", justifyContent: "center", alignItems: "center" },
});
