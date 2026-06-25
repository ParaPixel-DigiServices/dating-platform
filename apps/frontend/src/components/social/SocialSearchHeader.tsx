import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

interface Props {
  theme: any;
  value: string;
  onChangeText: (val: string) => void;
}

export function SocialSearchHeader({ theme: t, value, onChangeText }: Props) {
  return (
    <View style={[styles.container, { borderBottomColor: t.border }]}>
      <View style={[styles.searchBar, { backgroundColor: t.secondary, borderColor: t.border }]}>
        <Feather name="search" size={20} color={t.textSecondary} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: t.textPrimary }]}
          placeholder="Search community..."
          placeholderTextColor={t.textSecondary}
          value={value}
          onChangeText={onChangeText}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText("")} style={styles.clearBtn}>
            <Feather name="x-circle" size={18} color={t.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "PlayfairDisplay_400Regular",
  },
  clearBtn: {
    marginLeft: 8,
    padding: 4,
  },
});
