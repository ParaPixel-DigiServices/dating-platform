import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Switch } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useSocialStore } from "@/hooks/useSocialStore";
import theme from "@/theme/theme";

const TOPICS = ["Advice", "Experiences", "Safety", "Relationships", "Venting", "Questions"];

export default function CreatePostScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = (theme as any).onboarding;
  const { addPost } = useSocialStore();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const isValid = title.trim().length > 0 && body.trim().length > 0 && selectedTopic;

  const handlePost = () => {
    addPost({
      title: title.trim(),
      body: body.trim(),
      topic: selectedTopic,
      isAnonymous: isAnonymous,
      authorName: "You",
      authorAvatar: null,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: t.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 30 : 0), borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={24} color={t.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.textPrimary }]}>Create Post</Text>
        <TouchableOpacity 
          style={[styles.postBtn, { backgroundColor: isValid ? t.primary : t.border }]}
          disabled={!isValid}
          onPress={handlePost}
        >
          <Text style={[styles.postBtnText, { color: isValid ? "#1E1410" : t.textSecondary }]}>Post</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Topic Selector */}
        <Text style={[styles.label, { color: t.textPrimary }]}>Select Topic</Text>
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
                onPress={() => setSelectedTopic(topic)}
              >
                <Text
                  style={{
                    color: isActive ? "#1E1410" : t.textSecondary,
                    fontFamily: isActive ? "PlayfairDisplay_700Bold" : "PlayfairDisplay_400Regular",
                    fontSize: 13,
                  }}
                >
                  {topic}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Anonymity Toggle */}
        <View style={[styles.toggleRow, { borderBottomColor: t.border }]}>
          <View>
            <Text style={[styles.toggleTitle, { color: t.textPrimary }]}>Post Anonymously</Text>
            <Text style={[styles.toggleDesc, { color: t.textSecondary }]}>Hide your name and photo from this post.</Text>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ false: t.border, true: t.primary }}
            thumbColor={Platform.OS === 'ios' ? "#fff" : (isAnonymous ? "#fff" : "#f4f3f4")}
          />
        </View>

        {/* Input Fields */}
        <TextInput
          style={[styles.titleInput, { color: t.textPrimary }]}
          placeholder="An interesting title"
          placeholderTextColor={t.textSecondary}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />
        <TextInput
          style={[styles.bodyInput, { color: t.textPrimary }]}
          placeholder="Share your thoughts, experiences, or ask for advice..."
          placeholderTextColor={t.textSecondary}
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  postBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postBtnText: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: "PlayfairDisplay_700Bold",
    marginBottom: 12,
  },
  topicGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  topicChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 24,
    marginBottom: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggleTitle: {
    fontSize: 16,
    fontFamily: "PlayfairDisplay_700Bold",
    marginBottom: 4,
  },
  toggleDesc: {
    fontSize: 13,
    fontFamily: "Lato_400Regular",
  },
  titleInput: {
    fontSize: 22,
    fontFamily: "PlayfairDisplay_700Bold",
    marginBottom: 16,
  },
  bodyInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Lato_400Regular",
    lineHeight: 24,
  },
});
