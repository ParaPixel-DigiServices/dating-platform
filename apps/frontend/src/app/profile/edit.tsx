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
import { useUserProfileStore } from "@/onboarding_ques_temp/userProfileStore";
import theme from "@/theme/theme";

const t = (theme as any).onboarding;
const BG_COLOR = (theme as any).onboarding.background;

type EditItem = {
  id: string;
  label: string;
  type: "text" | "mcq";
  options?: string[];
  placeholder: string;
};

type EditSection = {
  title: string;
  subtitle: string;
  items: EditItem[];
};

const EDIT_SECTIONS: EditSection[] = [
  {
    title: "Basic Info",
    subtitle: "Tap to edit your basics",
    items: [
      { id: "name", label: "Name", type: "text", placeholder: "Change your name" },
      { id: "dob", label: "Date of Birth", type: "text", placeholder: "Change your birthday" },
      { id: "gender", label: "Gender", type: "mcq", placeholder: "Change your gender", options: ["Men", "Women", "Everyone"] },
    ],
  },
  {
    title: "Background",
    subtitle: "Tap to update background",
    items: [
      { id: "education", label: "Education", type: "mcq", placeholder: "Add your education", options: ["High School", "Undergrad", "Postgrad", "Other"] },
      { id: "occupation", label: "Occupation", type: "text", placeholder: "Add your occupation" },
      { id: "religion", label: "Religion / Community", type: "text", placeholder: "Add religion or community" },
    ],
  },
  {
    title: "Bio & Intent",
    subtitle: "Tell us about yourself",
    items: [
      { id: "bio", label: "Bio", type: "text", placeholder: "Write a short bio" },
      { id: "intent", label: "Relationship Goal", type: "mcq", placeholder: "What are you looking for?", options: ["Ready for Marriage", "Marriage in 1-2 Years", "Open to Discussion", "Long-Term Relationship", "Looking for Something Serious", "Open to Exploring", "Not Sure"] },
    ],
  },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { answers, setAnswer } = useUserProfileStore();
  
  const [selectedItem, setSelectedItem] = React.useState<EditItem | null>(null);
  const [inputValue, setInputValue] = React.useState("");

  const handleRowPress = (item: EditItem) => {
    setSelectedItem(item);
    if (answers[item.label]) {
      setInputValue(answers[item.label] as string);
    } else {
      setInputValue("");
    }
  };

  const saveOption = (val: string) => {
    if (selectedItem) {
      setAnswer(selectedItem.label, val);
    }
    setSelectedItem(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG_COLOR} />
      
      <View style={{ backgroundColor: BG_COLOR, paddingTop: insets.top }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Feather name="chevron-left" size={28} color={t.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.backBtn} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {EDIT_SECTIONS.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
            
            {section.items.map((item, itemIdx) => (
              <TouchableOpacity key={itemIdx} style={styles.row} activeOpacity={0.8} onPress={() => handleRowPress(item)}>
                <View style={styles.rowContent}>
                  <Text style={styles.rowText}>{item.label}</Text>
                  {answers[item.label] ? (
                    <Text style={styles.rowValue}>{answers[item.label] as string}</Text>
                  ) : (
                    <Text style={styles.rowPlaceholder}>{item.placeholder}</Text>
                  )}
                </View>
                <Feather name="chevron-right" size={20} color={t.primary} style={styles.chevron} />
              </TouchableOpacity>
            ))}
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
              <Text style={styles.modalTitle}>{selectedItem?.label}</Text>
              <TouchableOpacity onPress={() => setSelectedItem(null)}>
                <Feather name="x" size={24} color={t.primary} />
              </TouchableOpacity>
            </View>

            {selectedItem?.type === "mcq" && selectedItem.options ? (
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
