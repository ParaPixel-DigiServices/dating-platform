import React from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface Props {
  theme: any;
  filters: string[];
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
  onOpenFilters: () => void;
}

export function SocialFilterBar({ theme: t, filters, activeFilter, onSelectFilter, onOpenFilters }: Props) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.container}
        contentContainerStyle={styles.content}
      >
      {filters.map((filter) => {
        const isActive = filter === activeFilter;
        return (
          <TouchableOpacity
            key={filter}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? t.primary : "transparent",
                borderColor: isActive ? t.primary : t.border,
              },
            ]}
            onPress={() => onSelectFilter(filter)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? "#1E1410" : t.textSecondary,
                  fontFamily: isActive ? "PlayfairDisplay_700Bold" : "PlayfairDisplay_400Regular",
                },
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        );
      })}
      </ScrollView>
      <TouchableOpacity 
        style={[styles.advancedFilterBtn, { borderColor: t.border }]}
        onPress={onOpenFilters}
      >
        <Feather name="sliders" size={18} color={t.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    minHeight: 40,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
  },
  advancedFilterBtn: {
    width: 40,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    marginLeft: 8,
  },
});
