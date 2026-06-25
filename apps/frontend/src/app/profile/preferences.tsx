import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Modal,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { useUserProfileStore } from "@/onboarding_ques_temp/userProfileStore";
import Slider from "@react-native-community/slider";
import theme from "@/theme/theme";

const t = (theme as any).onboarding;

// Using the same base background as the profile screen to match
const BG_COLOR = (theme as any).onboarding.background;

type PrefItem = 
  | { type: "row"; label: string; options?: string[] }
  | { type: "slider"; label: string; min: number; max: number; value: number; unit: string }
  | { type: "chips"; chips: { label: string; icon: keyof typeof Feather.glyphMap }[] };

type PrefSection = {
  title: string;
  items: PrefItem[];
};

const LOVE_PREFERENCES: PrefSection[] = [
  {
    title: "Basic Preferences",
    items: [
      { type: "row", label: "Gender Preference", options: ["Men", "Women", "Everyone"] },
      { type: "slider", label: "Age Range", min: 18, max: 60, value: 24, unit: "yrs" },
      { type: "slider", label: "Distance", min: 5, max: 100, value: 20, unit: "km" },
    ],
  },
  {
    title: "My Interests",
    items: [
      { 
        type: "chips",
        chips: [
          { label: "Travel", icon: "navigation" },
          { label: "Coffee", icon: "coffee" },
          { label: "Music", icon: "music" },
          { label: "Movies", icon: "film" },
          { label: "Books", icon: "book" },
          { label: "Photography", icon: "camera" },
          { label: "Fitness", icon: "activity" },
          { label: "Gaming", icon: "monitor" },
          { label: "Cooking", icon: "star" },
        ]
      }
    ]
  },
  {
    title: "Relationship",
    items: [
      { type: "row", label: "Looking for Something Serious" },
      { type: "row", label: "Long-Term Relationship" },
      { type: "row", label: "Open to Exploring" },
    ],
  },
  {
    title: "Lifestyle",
    items: [
      { type: "row", label: "Smoking Preference", options: ["Regularly", "Occasionally", "Never"] },
      { type: "row", label: "Drinking Preference", options: ["Regularly", "Occasionally", "Never"] },
      { type: "row", label: "Diet Preference", options: ["Vegan", "Vegetarian", "Omnivore", "Other"] },
    ],
  },
  {
    title: "Personality",
    items: [
      { type: "row", label: "Introvert / Extrovert / Ambivert", options: ["Introvert", "Extrovert", "Ambivert"] },
      { type: "row", label: "Love Language", options: ["Words of Affirmation", "Acts of Service", "Receiving Gifts", "Quality Time", "Physical Touch"] },
      { type: "row", label: "Communication Style", options: ["Direct", "Indirect", "Texting", "Phone Calls", "In Person"] },
    ],
  },
  {
    title: "Compatibility",
    items: [
      { type: "row", label: "Languages" },
      { type: "row", label: "Education Preference" },
      { type: "row", label: "Work-Life Balance Preference" },
    ],
  },
  {
    title: "Deal Breakers",
    items: [
      { type: "row", label: "Smoking", options: ["Regularly", "Occasionally", "Never"] },
      { type: "row", label: "Drinking", options: ["Regularly", "Occasionally", "Never"] },
      { type: "row", label: "Relocation" },
      { type: "row", label: "Lifestyle Mismatch" },
    ],
  },
];

const MARRIAGE_PREFERENCES: PrefSection[] = [
  {
    title: "Basic Preferences",
    items: [
      { type: "row", label: "Gender Preference", options: ["Men", "Women", "Everyone"] },
      { type: "slider", label: "Age Range", min: 18, max: 60, value: 24, unit: "yrs" },
      { type: "slider", label: "Distance", min: 5, max: 100, value: 20, unit: "km" },
    ],
  },
  {
    title: "My Interests",
    items: [
      { 
        type: "chips",
        chips: [
          { label: "Travel", icon: "navigation" },
          { label: "Coffee", icon: "coffee" },
          { label: "Music", icon: "music" },
          { label: "Movies", icon: "film" },
          { label: "Books", icon: "book" },
          { label: "Photography", icon: "camera" },
          { label: "Fitness", icon: "activity" },
          { label: "Gaming", icon: "monitor" },
          { label: "Cooking", icon: "star" },
        ]
      }
    ]
  },
  {
    title: "Marriage Intent",
    items: [
      { type: "row", label: "Ready for Marriage" },
      { type: "row", label: "Marriage in 1–2 Years" },
      { type: "row", label: "Open to Discussion" },
    ],
  },
  {
    title: "Family & Future",
    items: [
      { type: "row", label: "Wants Children", options: ["Have children", "Want children", "Don't want children"] },
      { type: "row", label: "Family Values", options: ["Traditional", "Modern", "Moderate"] },
      { type: "row", label: "Joint / Nuclear Family Preference", options: ["Joint", "Nuclear", "Open to both"] },
      { type: "row", label: "Willingness to Relocate", options: ["Yes", "No", "Maybe"] },
    ],
  },
  {
    title: "Background",
    items: [
      { type: "row", label: "Religion Preference" },
      { type: "row", label: "Community Preference" },
      { type: "row", label: "Mother Tongue Preference" },
      { type: "row", label: "Education Preference" },
      { type: "row", label: "Occupation Preference" },
    ],
  },
  {
    title: "Lifestyle",
    items: [
      { type: "row", label: "Smoking Preference", options: ["Regularly", "Occasionally", "Never"] },
      { type: "row", label: "Drinking Preference", options: ["Regularly", "Occasionally", "Never"] },
      { type: "row", label: "Diet Preference", options: ["Vegan", "Vegetarian", "Omnivore", "Other"] },
    ],
  },
  {
    title: "Stability",
    items: [
      { type: "row", label: "Employment Type Preference", options: ["Full-time", "Part-time", "Self-employed", "Other"] },
      { type: "row", label: "Income Preference (Optional)" },
    ],
  },
  {
    title: "Compatibility",
    items: [
      { type: "row", label: "Languages" },
      { type: "row", label: "Cultural Values" },
      { type: "row", label: "Life Goals" },
    ],
  },
  {
    title: "Deal Breakers",
    items: [
      { type: "row", label: "Religion" },
      { type: "row", label: "Community" },
      { type: "row", label: "Children", options: ["Have children", "Want children", "Don't want children"] },
      { type: "row", label: "Relocation" },
      { type: "row", label: "Smoking", options: ["Regularly", "Occasionally", "Never"] },
      { type: "row", label: "Drinking", options: ["Regularly", "Occasionally", "Never"] },
    ],
  },
];

export default function PreferencesScreen() {
  const router = useRouter();
  const category = useOnboardingStore((s) => s.category);
  const { preferences, setPreference } = useUserProfileStore();
  const insets = useSafeAreaInsets();
  const preferencesList = category === "Marriage" ? MARRIAGE_PREFERENCES : LOVE_PREFERENCES;

  const [selectedItem, setSelectedItem] = React.useState<PrefItem | null>(null);
  const [inputValue, setInputValue] = React.useState("");

  const handleRowPress = (item: PrefItem) => {
    setSelectedItem(item);
    if (item.type === "row" && preferences[item.label]) {
      setInputValue(preferences[item.label] as string);
    } else {
      setInputValue("");
    }
  };

  const saveOption = (val: string) => {
    if (selectedItem?.type === "row") {
      setPreference(selectedItem.label, val);
    }
    setSelectedItem(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG_COLOR} />
      
      {/* ── Header ── */}
      <View style={{ backgroundColor: BG_COLOR, paddingTop: insets.top }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Feather name="chevron-left" size={28} color={t.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Preferences</Text>
          <View style={styles.backBtn} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {preferencesList.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Tap to add your preferences</Text>
            
            {section.items.map((item, itemIdx) => {
              if (item.type === "slider") {
                return (
                  <View key={itemIdx} style={styles.sliderContainer}>
                    <View style={styles.sliderHeader}>
                      <Text style={styles.rowText}>{item.label}</Text>
                      <Text style={[styles.rowText, { color: t.primary, fontFamily: "PlayfairDisplay_700Bold" }]}>
                        {item.value} {item.unit}
                      </Text>
                    </View>
                    <Slider
                      style={{ width: "100%", height: 40 }}
                      minimumValue={item.min}
                      maximumValue={item.max}
                      value={item.value}
                      minimumTrackTintColor={t.primary}
                      maximumTrackTintColor={t.border}
                      thumbTintColor={t.primary}
                    />
                  </View>
                );
              }
              if (item.type === "chips") {
                return (
                  <View key={itemIdx} style={styles.chipsContainer}>
                    {item.chips.map((chip, cIdx) => (
                      <TouchableOpacity key={cIdx} style={styles.chip} activeOpacity={0.8}>
                        <Feather name={chip.icon} size={14} color={t.primary} style={{ marginRight: 6 }} />
                        <Text style={styles.chipText}>{chip.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              }
              return (
                <TouchableOpacity key={itemIdx} style={styles.row} activeOpacity={0.8} onPress={() => handleRowPress(item)}>
                  <View style={styles.rowContent}>
                    <Text style={styles.rowText}>{item.label}</Text>
                    {preferences[item.label] ? (
                      <Text style={styles.rowValue}>{preferences[item.label] as string}</Text>
                    ) : (
                      <Text style={styles.rowPlaceholder}>Add your preference</Text>
                    )}
                  </View>
                  <Feather name="chevron-right" size={20} color={t.primary} style={styles.chevron} />
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Popup Modal */}
      <Modal
        visible={!!selectedItem}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedItem?.type === "row" ? selectedItem.label : ""}</Text>
              <TouchableOpacity onPress={() => setSelectedItem(null)}>
                <Feather name="x" size={24} color={t.primary} />
              </TouchableOpacity>
            </View>

            {selectedItem?.type === "row" && selectedItem.options ? (
              <View style={styles.mcqContainer}>
                {selectedItem.options.map((opt, idx) => (
                  <TouchableOpacity key={idx} style={styles.mcqOption} activeOpacity={0.8} onPress={() => saveOption(opt)}>
                    <Text style={styles.mcqOptionText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Type your answer..."
                  placeholderTextColor={t.textSecondary}
                  value={inputValue}
                  onChangeText={setInputValue}
                  autoFocus
                />
                <TouchableOpacity style={styles.saveBtn} activeOpacity={0.8} onPress={() => saveOption(inputValue)}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 16 : 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: t.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "PlayfairDisplay_700Bold",
    color: t.primary,
  },
  scrollContent: {
    paddingTop: 32,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 40,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_700Bold",
    color: t.primary,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: "PlayfairDisplay_400Regular",
    color: t.textSecondary,
    marginBottom: 16,
    opacity: 0.8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: t.border,
  },
  rowContent: {
    flex: 1,
    paddingRight: 16,
  },
  rowText: {
    fontSize: 15,
    fontFamily: "PlayfairDisplay_400Regular",
    color: t.textPrimary,
    marginBottom: 4,
  },
  rowPlaceholder: {
    fontSize: 13,
    fontFamily: "PlayfairDisplay_400Regular",
    color: t.textSecondary,
    opacity: 0.6,
  },
  rowValue: {
    fontSize: 14,
    fontFamily: "PlayfairDisplay_700Bold",
    color: t.primary,
  },
  chevron: {
    opacity: 0.8,
  },
  sliderContainer: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: t.border,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  chipText: {
    fontSize: 13,
    fontFamily: "PlayfairDisplay_400Regular",
    color: t.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: t.secondary,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: t.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "PlayfairDisplay_700Bold",
    color: t.primary,
  },
  mcqContainer: {
    gap: 12,
  },
  mcqOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  mcqOptionText: {
    fontSize: 15,
    fontFamily: "PlayfairDisplay_400Regular",
    color: t.textPrimary,
  },
  textInputContainer: {
    gap: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    fontFamily: "PlayfairDisplay_400Regular",
    color: t.textPrimary,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  saveBtn: {
    backgroundColor: t.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#1E1410",
  },
});
