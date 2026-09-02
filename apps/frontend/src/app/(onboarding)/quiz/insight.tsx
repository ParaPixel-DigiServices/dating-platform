import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import apiClient from '@/services/backendService';
import theme from '@/theme/theme';

const t = theme.onboarding;

export default function InsightQuizScreen() {
  const router = useRouter();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await apiClient.get('/user/questions?category=INSIGHT');
      if (res.data?.success) {
        setQuestions(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const formattedAnswers = Object.keys(answers).map(qId => ({
        questionId: qId,
        answer: answers[qId]
      }));

      const res = await apiClient.post('/user/answers', { answers: formattedAnswers });
      
      if (res.data?.success) {
        router.back();
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save answers.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={t.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={28} color={t.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Insight Quiz</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>No right or wrong answers. Just be real. 🤍</Text>

        {questions.map((q, idx) => (
          <View key={q.id} style={styles.questionCard}>
            <Text style={styles.questionText}>{idx + 1}. {q.text}</Text>
            {q.options.map((opt: string, i: number) => {
              const isSelected = answers[q.id] === opt;
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
                  onPress={() => handleSelect(q.id, opt)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {String.fromCharCode(65 + i)}. {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        <TouchableOpacity 
          style={[styles.submitBtn, submitting && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Submit Answers</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: t.background },
  loadingContainer: { flex: 1, backgroundColor: t.background, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: t.background },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 20, fontFamily: 'Lato_700Bold', color: t.textPrimary },
  scrollContent: { padding: 20, paddingBottom: 60 },
  subtitle: { fontSize: 16, fontFamily: 'Lato_400Regular', color: t.textSecondary, marginBottom: 24, textAlign: 'center' },
  questionCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: t.border },
  questionText: { fontSize: 18, fontFamily: 'Lato_700Bold', color: t.textPrimary, marginBottom: 16, lineHeight: 24 },
  optionBtn: { padding: 16, borderRadius: 12, backgroundColor: t.background, marginBottom: 12, borderWidth: 1, borderColor: t.border },
  optionBtnSelected: { backgroundColor: t.primary + '15', borderColor: t.primary },
  optionText: { fontSize: 16, fontFamily: 'Lato_400Regular', color: t.textPrimary },
  optionTextSelected: { fontFamily: 'Lato_700Bold', color: t.primary },
  submitBtn: { backgroundColor: t.primary, padding: 18, borderRadius: 24, alignItems: 'center', marginTop: 12 },
  submitBtnText: { color: '#FFF', fontSize: 18, fontFamily: 'Lato_700Bold' },
});
