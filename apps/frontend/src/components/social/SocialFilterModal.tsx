import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";

interface Props {
  theme: any;
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

const TOPICS = ["Advice", "Experiences", "Safety", "Relationships", "Venting", "Questions"];

export function SocialFilterModal({ theme: t, visible, onClose, onApply }: Props) {
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [dateAfter, setDateAfter] = useState("");
  const [dateBefore, setDateBefore] = useState("");

  const handleApply = () => {
    onApply({
      minAge: minAge ? parseInt(minAge, 10) : null,
      maxAge: maxAge ? parseInt(maxAge, 10) : null,
      topic: selectedTopic || null,
      dateAfter: dateAfter || null,
      dateBefore: dateBefore || null,
    });
    onClose();
  };

  const handleClear = () => {
    setMinAge("");
    setMaxAge("");
    setSelectedTopic("");
    setDateAfter("");
    setDateBefore("");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: t.background, borderColor: t.border }]}>
          <View style={[styles.header, { borderBottomColor: t.border }]}>
            <Text style={[styles.headerTitle, { color: t.textPrimary }]}>Advanced Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={24} color={t.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Age Group */}
            <Text style={[styles.sectionTitle, { color: t.textPrimary }]}>Age Group</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { color: t.textPrimary, borderColor: t.border }]}
                placeholder="Min Age"
                placeholderTextColor={t.textSecondary}
                keyboardType="numeric"
                value={minAge}
                onChangeText={setMinAge}
              />
              <Text style={[styles.toText, { color: t.textSecondary }]}>to</Text>
              <TextInput
                style={[styles.input, { color: t.textPrimary, borderColor: t.border }]}
                placeholder="Max Age"
                placeholderTextColor={t.textSecondary}
                keyboardType="numeric"
                value={maxAge}
                onChangeText={setMaxAge}
              />
            </View>

            {/* Date Range */}
            <Text style={[styles.sectionTitle, { color: t.textPrimary, marginTop: 24 }]}>Date Range (YYYY-MM-DD)</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { color: t.textPrimary, borderColor: t.border }]}
                placeholder="After Date"
                placeholderTextColor={t.textSecondary}
                value={dateAfter}
                onChangeText={setDateAfter}
              />
              <Text style={[styles.toText, { color: t.textSecondary }]}>to</Text>
              <TextInput
                style={[styles.input, { color: t.textPrimary, borderColor: t.border }]}
                placeholder="Before Date"
                placeholderTextColor={t.textSecondary}
                value={dateBefore}
                onChangeText={setDateBefore}
              />
            </View>

            {/* Topic Selection */}
            <Text style={[styles.sectionTitle, { color: t.textPrimary, marginTop: 24 }]}>Filter by Topic</Text>
            <View style={styles.topicGrid}>
              {TOPICS.map(topic => {
                const isActive = topic === selectedTopic;
                return (
                  <TouchableOpacity
                    key={topic}
                    style={[
                      styles.topicChip,
                      {
                        backgroundColor: isActive ? t.primary : "transparent",
                        borderColor: isActive ? t.primary : t.border,
                      }
                    ]}
                    onPress={() => setSelectedTopic(isActive ? "" : topic)}
                  >
                    <Text
                      style={{
                        color: isActive ? "#1E1410" : t.textSecondary,
                        fontFamily: isActive ? "PlayfairDisplay_700Bold" : "PlayfairDisplay_400Regular"
                      }}
                    >
                      {topic}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: t.border }]}>
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Text style={[styles.clearText, { color: t.textSecondary }]}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.applyBtn, { backgroundColor: t.primary }]} onPress={handleApply}>
              <Text style={[styles.applyText, { color: "#1E1410" }]}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    height: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "PlayfairDisplay_700Bold",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontFamily: "Lato_400Regular",
  },
  toText: {
    marginHorizontal: 12,
    fontFamily: "Lato_400Regular",
  },
  topicGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  topicChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    gap: 16,
  },
  clearBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
  },
  clearText: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 16,
  },
  applyBtn: {
    flex: 2,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  applyText: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 16,
  },
});
