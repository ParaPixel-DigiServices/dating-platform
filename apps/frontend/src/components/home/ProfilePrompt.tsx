import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Props {
  question: string;
  answer: string;
  primaryColor: string;
  textPrimary: string;
  textSecondary: string;
  secondary: string;
}

export function ProfilePrompt({ question, answer, primaryColor, textPrimary, textSecondary, secondary }: Props) {
  return (
    <View style={[styles.container, { backgroundColor: secondary }]}>
      <Text style={[styles.question, { color: textPrimary }]}>{question}</Text>
      <Text style={[styles.answer, { color: textSecondary }]}>{answer}</Text>
      
      <View style={[styles.divider, { backgroundColor: "rgba(255,255,255,0.1)" }]} />
      
      <TouchableOpacity style={styles.noteButton}>
        <MaterialCommunityIcons name="chat-outline" size={20} color={textPrimary} />
        <Text style={[styles.noteText, { color: textPrimary }]}>Note</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderRadius: 24,
    marginBottom: 20,
  },
  question: {
    fontSize: 22,
    fontFamily: "Lato_700Bold",
    marginBottom: 8,
    lineHeight: 30,
  },
  answer: {
    fontSize: 16,
    fontFamily: "Lato_400Regular",
    marginBottom: 20,
  },
  divider: {
    height: 1,
    width: "100%",
    marginBottom: 16,
  },
  noteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  noteText: {
    fontSize: 16,
    fontFamily: "Lato_700Bold",
  },
});
