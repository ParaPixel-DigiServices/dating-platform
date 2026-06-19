/**
 * userProfileStore.ts
 *
 * Acts as a local DB replacement for user profile answers.
 * Maps questionId (e.g. "go_1", "m_3") → the user's answer.
 *
 * When the real backend is ready, swap the persist layer with API calls.
 * The rest of the app reads from this store unchanged.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CategoryKey } from '@/hooks/useOnboardingStore';
import { demoQuestionnaire } from './onboarding';

// ─── Types ───────────────────────────────────────────────────────────────────

/** Any serialisable value a question can hold */
export type AnswerValue = string | string[] | number | null;

export interface UserProfileStore {
  /** { questionId: answer } — e.g. { "go_1": "John Doe", "m_3": "Yes" } */
  answers: Record<string, AnswerValue>;

  // Mutators
  setAnswer: (questionId: string, value: AnswerValue) => void;
  setAnswers: (batch: Record<string, AnswerValue>) => void;
  clearAnswers: () => void;

  // Selectors
  getAnswer: (questionId: string) => AnswerValue;
  isProfileComplete: (category: CategoryKey) => boolean;
  getCompletionPercent: (category: CategoryKey) => number;
  getAnsweredCount: (category: CategoryKey) => { answered: number; total: number };
}

// ─── Required question IDs for completion check ───────────────────────────────

/**
 * A profile is considered "complete" when these global questions are answered
 * PLUS at least 5 category-specific questions.
 */
const REQUIRED_GLOBAL_IDS = ['go_1', 'go_2', 'go_3', 'go_4', 'go_6'];

const MIN_CATEGORY_ANSWERED = 5;

// ─── Store ───────────────────────────────────────────────────────────────────

export const useUserProfileStore = create<UserProfileStore>()(
  persist(
    (set, get) => ({
      answers: {},

      // ── Mutators ────────────────────────────────────────────────────────

      setAnswer: (questionId, value) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: value },
        })),

      setAnswers: (batch) =>
        set((state) => ({
          answers: { ...state.answers, ...batch },
        })),

      clearAnswers: () => set({ answers: {} }),

      // ── Selectors ───────────────────────────────────────────────────────

      getAnswer: (questionId) => get().answers[questionId] ?? null,

      getAnsweredCount: (category) => {
        const { answers } = get();
        const categoryKey = getCategoryKey(category);

        const globalQs = demoQuestionnaire.globalOnboarding.questions;
        const categoryQs = categoryKey
          ? (demoQuestionnaire.categories[categoryKey]?.questions ?? [])
          : [];

        const allQs = [...globalQs, ...categoryQs];
        const total = allQs.length;
        const answered = allQs.filter(
          (q) => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== ''
        ).length;

        return { answered, total };
      },

      isProfileComplete: (category) => {
        const { answers } = get();
        const categoryKey = getCategoryKey(category);

        // Check required globals
        const globalsDone = REQUIRED_GLOBAL_IDS.every(
          (id) => answers[id] !== undefined && answers[id] !== null && answers[id] !== ''
        );

        // Check min category questions
        const categoryQs = categoryKey
          ? (demoQuestionnaire.categories[categoryKey]?.questions ?? [])
          : [];
        const categoryAnswered = categoryQs.filter(
          (q) => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== ''
        ).length;

        return globalsDone && categoryAnswered >= MIN_CATEGORY_ANSWERED;
      },

      getCompletionPercent: (category) => {
        const { answered, total } = get().getAnsweredCount(category);
        if (total === 0) return 0;
        return Math.round((answered / total) * 100);
      },
    }),
    {
      name: 'user-profile-answers',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Map CategoryKey → key in demoQuestionnaire.categories */
function getCategoryKey(
  category: CategoryKey
): keyof typeof demoQuestionnaire.categories | null {
  const map: Record<CategoryKey, keyof typeof demoQuestionnaire.categories | null> = {
    Casual: 'casual',
    Love: 'love',
    Marriage: 'marriage',
    Find_Your_Roommate: 'Find_Your_Roommate',
  };
  return map[category] ?? null;
}
