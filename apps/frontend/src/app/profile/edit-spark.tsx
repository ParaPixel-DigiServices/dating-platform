import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import theme from "@/theme/theme";
import { getSparkQuestions, updateSparkQuestions } from "../../services/backendService";

const BG_COLOR = "#120d0b";

export default function EditSparkScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = (theme as any).onboarding;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState<string[]>(["", "", ""]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await getSparkQuestions();
        const data = res?.data || res;
        
        if (Array.isArray(data) && data.length > 0) {
          const loaded = ["", "", ""];
          data.forEach((q, idx) => {
            if (idx < 3) loaded[idx] = q.text;
          });
          setQuestions(loaded);
        }
      } catch (err) {
        console.error("Failed to load spark questions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const updateQuestion = (text: string, index: number) => {
    const newQs = [...questions];
    newQs[index] = text;
    setQuestions(newQs);
  };

  const handleSave = async () => {
    const validQuestions = questions.filter(q => q.trim().length > 0);
    if (validQuestions.length === 0) {
      Alert.alert("Hold on", "You must provide at least one question.");
      return;
    }

    setSaving(true);
    try {
      await updateSparkQuestions(validQuestions);
      router.back();
    } catch (err) {
      console.error("Failed to save spark questions", err);
      Alert.alert("Error", "Could not save your questions. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={t.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7} disabled={saving}>
          <Feather name="chevron-left" size={28} color={t.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Spark Questions</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
          
          <View style={{ marginBottom: 32 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: t.primary + '15', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Feather name="zap" size={28} color={t.primary} />
            </View>
            <Text style={[styles.title, { color: t.textPrimary }]}>
              Set up your Spark
            </Text>
            <Text style={[styles.subtitle, { color: t.textSecondary }]}>
              Guys will need to answer these questions to send you a like. Pick questions that will spark a great conversation!
            </Text>
          </View>

          {[0, 1, 2].map((idx) => (
            <View key={idx} style={styles.inputGroup}>
              <Text style={[styles.label, { color: t.primary }]}>Question {idx + 1}</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    color: t.textPrimary, 
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderColor: t.border
                  }
                ]}
                placeholder="e.g. What's your most controversial food opinion?"
                placeholderTextColor={t.textSecondary + "50"}
                value={questions[idx]}
                onChangeText={(text) => updateQuestion(text, idx)}
                multiline
                maxLength={150}
              />
              <Text style={[styles.charCount, { color: t.textSecondary }]}>
                {questions[idx].length}/150
              </Text>
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <TouchableOpacity 
          style={[styles.saveBtn, { backgroundColor: t.primary }]}
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#1E1410" />
          ) : (
            <Text style={styles.saveBtnText}>Save Questions</Text>
          )}
        </TouchableOpacity>
      </View>
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#fff",
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: "PlayfairDisplay_700Bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Lato_400Regular",
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: "Lato_700Bold",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    paddingTop: 16,
    fontSize: 16,
    fontFamily: "Lato_400Regular",
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    fontFamily: "Lato_400Regular",
    textAlign: "right",
    marginTop: 6,
    marginRight: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    backgroundColor: BG_COLOR,
  },
  saveBtn: {
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#1E1410",
    fontSize: 16,
    fontFamily: "Lato_700Bold",
  }
});
