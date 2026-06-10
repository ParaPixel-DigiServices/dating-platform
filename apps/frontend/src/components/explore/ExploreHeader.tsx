import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface Props {
  primaryColor:  string;
  textPrimary:   string;
  textSecondary: string;
  secondary:     string;
  background:    string;
  onSearch:      (q: string) => void;
}

export function ExploreHeader({
  primaryColor,
  textPrimary,
  textSecondary,
  secondary,
  background,
  onSearch,
}: Props) {
  const [query, setQuery] = useState("");

  const handleChange = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: background }]}>
      {/* Title */}
      <Text style={[styles.title, { color: textPrimary }]}>Explore</Text>
      <Text style={[styles.subtitle, { color: textSecondary }]}>
        Discover people around you
      </Text>

      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: secondary }]}>
        <Feather name="search" size={18} color={textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.input, { color: textPrimary }]}
          placeholder="Search connections..."
          placeholderTextColor={textSecondary}
          value={query}
          onChangeText={handleChange}
          returnKeyType="search"
          selectionColor={primaryColor}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => handleChange("")}>
            <Feather name="x" size={16} color={textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop:        Platform.OS === "android" ? 16 : 0,
    paddingHorizontal: 20,
    paddingBottom:     20,
  },
  title: {
    fontSize:      28,
    fontWeight:    "700",
    letterSpacing: 0.3,
    fontFamily:    Platform.OS === "ios" ? "Times New Roman" : "serif",
    marginBottom:  4,
  },
  subtitle: {
    fontSize:     13,
    fontWeight:   "400",
    marginBottom: 18,
  },
  searchBar: {
    flexDirection:     "row",
    alignItems:        "center",
    borderRadius:      14,
    paddingHorizontal: 14,
    paddingVertical:   12,
    gap:               10,
  },
  searchIcon: {
    marginRight: 2,
  },
  input: {
    flex:     1,
    fontSize: 15,
    padding:  0,
    margin:   0,
  },
});
