import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import apiClient from '@/services/backendService';
import theme from '@/theme/theme';

const t = theme.onboarding;

export default function SyncQuizScreen() {
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
      const res = await apiClient.get('/user/questions?category=SYNCHRONIZATION');
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
        <ActivityIndicator size="large" color="#FF2D55" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={28} color={t.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Synch Quiz</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Do you both see love the same way? ❤️</Text>

        {questions.map((q, idx) => (
          <View key={q.id} style={styles.questionCard}>
            <Text style={styles.questionText}>{idx + 1}. {q.text}</Text>
            <View style={styles.optionsRow}>
              {q.options.map((opt: string, i: number) => {
                const isSelected = answers[q.id] === opt;
                // Sync options are usually Agree, No opinion, Disagree
                let btnColor = '#8E8E93';
                if (isSelected) {
                  if (opt === 'Agree') btnColor = '#34C759'; // Green
                  else if (opt === 'Disagree') btnColor = '#FF3B30'; // Red
                  else btnColor = '#007AFF'; // Blue for no opinion
                }

                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.optionCircle, 
                      isSelected && { backgroundColor: btnColor, borderColor: btnColor }
                    ]}
                    onPress={() => handleSelect(q.id, opt)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionCircleText, isSelected && { color: '#FFF' }]}>
                      {String.fromCharCode(65 + i)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.labelsRow}>
              {q.options.map((opt: string, i: number) => (
                <Text key={i} style={[styles.labelText, answers[q.id] === opt && styles.labelTextSelected]}>
                  {opt}
                </Text>
              ))}
            </View>
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
  container: { flex: 1, backgroundColor: '#FFF0F5' }, // Soft pinkish background
  loadingContainer: { flex: 1, backgroundColor: '#FFF0F5', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#FFF0F5' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 20, fontFamily: 'Lato_700Bold', color: '#FF2D55' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  subtitle: { fontSize: 16, fontFamily: 'Lato_400Regular', color: t.textSecondary, marginBottom: 24, textAlign: 'center' },
  questionCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#FF2D55', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  questionText: { fontSize: 18, fontFamily: 'Lato_700Bold', color: t.textPrimary, marginBottom: 20, lineHeight: 24, textAlign: 'center' },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  optionCircle: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: t.border, alignItems: 'center', justifyContent: 'center' },
  optionCircleText: { fontSize: 20, fontFamily: 'Lato_700Bold', color: t.textSecondary },
  labelsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  labelText: { fontSize: 12, fontFamily: 'Lato_400Regular', color: t.textSecondary, textAlign: 'center', width: 80 },
  labelTextSelected: { fontFamily: 'Lato_700Bold', color: t.textPrimary },
  submitBtn: { backgroundColor: '#FF2D55', padding: 18, borderRadius: 24, alignItems: 'center', marginTop: 12, shadowColor: '#FF2D55', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitBtnText: { color: '#FFF', fontSize: 18, fontFamily: 'Lato_700Bold' },
});
