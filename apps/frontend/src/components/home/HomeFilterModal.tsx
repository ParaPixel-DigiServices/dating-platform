import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch, Platform, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Props {
  theme: any;
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

const GENDERS = ["Men", "Women", "Everyone"];
const RELIGIONS = ["Agnostic", "Atheist", "Buddhist", "Catholic", "Christian", "Hindu", "Jewish", "Muslim", "Spiritual", "Other"];



export function HomeFilterModal({ theme: t, visible, onClose, onApply }: Props) {
  const [selectedGender, setSelectedGender] = useState("Women");
  const [selectedReligion, setSelectedReligion] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [distance, setDistance] = useState(45);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(28);

  const handleApply = () => {
    onApply({
      gender: selectedGender,
      religion: selectedReligion,
      verifiedOnly,
      distance,
      minAge,
      maxAge,
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedGender("Everyone");
    setSelectedReligion("");
    setVerifiedOnly(false);
    setDistance(150);
    setMinAge(18);
    setMaxAge(60);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: t.background, borderColor: t.border }]}>
          <View style={[styles.header, { borderBottomColor: t.border }]}>
            <Text style={[styles.headerTitle, { color: t.textPrimary }]}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={24} color={t.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Interested In / Gender */}
            <Text style={[styles.sectionTitle, { color: t.textPrimary }]}>Interested In</Text>
            <View style={styles.chipGrid}>
              {GENDERS.map((gender) => {
                const isActive = gender === selectedGender;
                return (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isActive ? t.primary : "transparent",
                        borderColor: isActive ? t.primary : t.border,
                      }
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedGender(gender)}
                  >
                    <Text
                      style={{
                        color: isActive ? "#1E1410" : t.textSecondary,
                        fontFamily: isActive ? "Lato_700Bold" : "Lato_400Regular"
                      }}
                    >
                      {gender}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Distance Slider */}
            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <Text style={[styles.sectionTitle, { color: t.textPrimary, marginBottom: 0 }]}>Distance</Text>
                <Text style={[styles.sliderValue, { color: t.textSecondary }]}>Up to {distance} km</Text>
              </View>
              <Slider
                style={{ width: "100%", height: 40 }}
                minimumValue={2}
                maximumValue={150}
                step={1}
                value={distance}
                onValueChange={setDistance}
                minimumTrackTintColor={t.primary}
                maximumTrackTintColor={t.border}
                thumbTintColor={Platform.OS === 'ios' ? '#ffffff' : t.primary}
              />
              <View style={styles.sliderLabels}>
                <Text style={[styles.sliderLimitText, { color: t.textSecondary }]}>2km</Text>
                <Text style={[styles.sliderLimitText, { color: t.textSecondary }]}>150km</Text>
              </View>
            </View>

            {/* Age Sliders */}
            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <Text style={[styles.sectionTitle, { color: t.textPrimary, marginBottom: 0 }]}>Age Range</Text>
                <Text style={[styles.sliderValue, { color: t.textSecondary }]}>{minAge} - {maxAge}</Text>
              </View>

              <View style={{ alignItems: 'center' }}>
                <MultiSlider
                  values={[minAge, maxAge]}
                  sliderLength={SCREEN_WIDTH - 80}
                  onValuesChange={(values) => {
                    let [newMin, newMax] = values;
                    // Enforce a minimum gap of 4 years
                    if (newMax - newMin < 4) {
                      if (newMin !== minAge) newMin = newMax - 4; // user dragged min too close
                      else newMax = newMin + 4; // user dragged max too close
                    }
                    setMinAge(newMin);
                    setMaxAge(newMax);
                  }}
                  min={18}
                  max={60}
                  step={1}
                  allowOverlap={false}
                  snapped
                  selectedStyle={{ backgroundColor: t.primary }}
                  unselectedStyle={{ backgroundColor: t.border }}
                  containerStyle={{ height: 40 }}
                  trackStyle={{ height: 4, borderRadius: 2 }}
                  markerStyle={{
                    backgroundColor: Platform.OS === 'ios' ? '#ffffff' : t.primary,
                    height: 20,
                    width: 20,
                    borderRadius: 10,
                    borderWidth: 0,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 2,
                    elevation: 3,
                  }}
                />
              </View>
              <View style={[styles.sliderLabels, { marginTop: -10 }]}>
                <Text style={[styles.sliderLimitText, { color: t.textSecondary }]}>18</Text>
                <Text style={[styles.sliderLimitText, { color: t.textSecondary }]}>60</Text>
              </View>
            </View>

            {/* Religion */}
            <Text style={[styles.sectionTitle, { color: t.textPrimary, marginTop: 12 }]}>Religion</Text>
            <View style={styles.chipGrid}>
              {RELIGIONS.map((rel) => {
                const isActive = rel === selectedReligion;
                return (
                  <TouchableOpacity
                    key={rel}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isActive ? t.primary : "transparent",
                        borderColor: isActive ? t.primary : t.border,
                      }
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedReligion(isActive ? "" : rel)}
                  >
                    <Text
                      style={{
                        color: isActive ? "#1E1410" : t.textSecondary,
                        fontFamily: isActive ? "Lato_700Bold" : "Lato_400Regular"
                      }}
                    >
                      {rel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Verified Only Toggle */}
            <View style={styles.toggleRow}>
              <View>
                <Text style={[styles.sectionTitle, { color: t.textPrimary, marginBottom: 4 }]}>Verified Profiles Only</Text>
                <Text style={[styles.toggleSubText, { color: t.textSecondary }]}>Show only photo-verified members</Text>
              </View>
              <Switch
                value={verifiedOnly}
                onValueChange={setVerifiedOnly}
                trackColor={{ false: t.border, true: t.primary }}
                thumbColor={verifiedOnly ? "#1E1410" : "#f4f3f4"}
                ios_backgroundColor={t.border}
              />
            </View>
            
            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: t.border }]}>
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Text style={[styles.clearText, { color: t.textSecondary }]}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.applyBtn, { backgroundColor: t.primary }]} onPress={handleApply}>
              <Text style={[styles.applyText, { color: "#1E1410" }]}>Apply</Text>
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
    height: "85%",
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
    fontFamily: "Lato_700Bold",
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Lato_700Bold",
    marginBottom: 12,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  
  // Slider mock styles
  sliderContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sliderValue: {
    fontSize: 14,
    fontFamily: "Lato_700Bold",
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  sliderLimitText: {
    fontSize: 12,
    fontFamily: "Lato_400Regular",
  },

  // Toggle switch row
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  toggleSubText: {
    fontSize: 13,
    fontFamily: "Lato_400Regular",
  },

  // Footer
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
    fontFamily: "Lato_700Bold",
    fontSize: 16,
  },
  applyBtn: {
    flex: 2,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 24,
  },
  applyText: {
    fontFamily: "Lato_700Bold",
    fontSize: 16,
  },
});
