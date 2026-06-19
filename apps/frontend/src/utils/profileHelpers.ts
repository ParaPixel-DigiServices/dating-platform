/**
 * profileHelpers.ts
 *
 * Pure utility functions for the profile edit/complete flow.
 * Decouples step-grouping logic from UI components so it can be
 * updated independently when question sets change.
 */

import { demoQuestionnaire } from '@/onboarding_ques_temp/onboarding';
import type { CategoryKey } from '@/hooks/useOnboardingStore';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProfileQuestion {
  id: string;
  text: string;
  description?: string;
  type: 'text' | 'select' | 'date' | 'multiselect' | 'file_upload' | 'slider_range';
  options?: string[];
}

export interface EditStep {
  /** Step index (0-based) */
  index: number;
  /** Section label shown in the progress bar */
  label: string;
  questions: ProfileQuestion[];
}

// ─── Step grouping ────────────────────────────────────────────────────────────

/** How many questions to show per wizard page */
const QUESTIONS_PER_STEP = 3;

/**
 * Groups an array of questions into pages of QUESTIONS_PER_STEP.
 */
function chunkQuestions(questions: ProfileQuestion[], label: string, startIndex: number): EditStep[] {
  const steps: EditStep[] = [];
  for (let i = 0; i < questions.length; i += QUESTIONS_PER_STEP) {
    steps.push({
      index: startIndex + steps.length,
      label,
      questions: questions.slice(i, i + QUESTIONS_PER_STEP) as ProfileQuestion[],
    });
  }
  return steps;
}

/**
 * Returns the full ordered list of wizard steps for a given category.
 * Global questions come first, then category-specific questions.
 */
export function getEditSteps(category: CategoryKey): EditStep[] {
  const globalQs = demoQuestionnaire.globalOnboarding.questions as ProfileQuestion[];
  const categoryKey = categoryToKey(category);
  const categoryQs = categoryKey
    ? (demoQuestionnaire.categories[categoryKey]?.questions ?? []) as ProfileQuestion[]
    : [];

  const globalSteps = chunkQuestions(globalQs, 'Basic Profile', 0);
  const categorySteps = chunkQuestions(
    categoryQs,
    getCategoryLabel(category),
    globalSteps.length
  );

  return [...globalSteps, ...categorySteps];
}

/**
 * Returns a subset of steps for a given step index.
 */
export function getStep(category: CategoryKey, stepIndex: number): EditStep | null {
  const steps = getEditSteps(category);
  return steps[stepIndex] ?? null;
}

/**
 * Returns the total number of steps for a given category.
 */
export function getTotalSteps(category: CategoryKey): number {
  return getEditSteps(category).length;
}

// ─── Section definitions for profile display ──────────────────────────────────

export interface ProfileSection {
  key: string;
  title: string;
  icon: string;
  questionIds: string[];
}

/**
 * Returns the profile display sections for a given category.
 * Max 2 sections: Basic Info + Category-specific.
 */
export function getProfileSections(category: CategoryKey): ProfileSection[] {
  const categoryKey = categoryToKey(category);

  const sections: ProfileSection[] = [
    {
      key: 'basic',
      title: 'Basic Info',
      icon: '👤',
      // name, age, location, height, occupation, education, diet
      questionIds: ['go_1', 'go_2', 'go_4', 'go_7', 'go_6', 'go_5', 'go_8'],
    },
  ];

  // Category-specific section (all questions, not just a preview)
  if (categoryKey) {
    const categoryQs = demoQuestionnaire.categories[categoryKey]?.questions ?? [];
    const allIds = categoryQs.map((q: any) => q.id);
    if (allIds.length > 0) {
      sections.push({
        key: 'category',
        title: getCategoryLabel(category),
        icon: getCategoryIcon(category),
        questionIds: allIds,
      });
    }
  }

  return sections;
}


// ─── Helpers ─────────────────────────────────────────────────────────────────

export function categoryToKey(
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

function getCategoryLabel(category: CategoryKey): string {
  const labels: Record<CategoryKey, string> = {
    Casual: 'Vibes & Preferences',
    Love: 'Love & Connection',
    Marriage: 'Life & Values',
    Find_Your_Roommate: 'Living Preferences',
  };
  return labels[category] ?? 'More About You';
}

function getCategoryIcon(category: CategoryKey): string {
  const icons: Record<CategoryKey, string> = {
    Casual: '🔥',
    Love: '💕',
    Marriage: '💍',
    Find_Your_Roommate: '🏠',
  };
  return icons[category] ?? '💡';
}

/**
 * Find a question definition by ID across all sections,
 * including the read-only collectedDuringOnboarding fields.
 */
export function findQuestionById(id: string): ProfileQuestion | null {
  // Check read-only onboarding-collected fields first
  const readOnly = (demoQuestionnaire.globalOnboarding as any).collectedDuringOnboarding as ProfileQuestion[];
  const fromReadOnly = readOnly?.find((q) => q.id === id);
  if (fromReadOnly) return fromReadOnly;

  // Check editable global questions
  const globalQs = demoQuestionnaire.globalOnboarding.questions as ProfileQuestion[];
  const fromGlobal = globalQs.find((q) => q.id === id);
  if (fromGlobal) return fromGlobal;

  // Check category-specific questions
  for (const cat of Object.values(demoQuestionnaire.categories)) {
    const found = (cat as any).questions.find((q: any) => q.id === id);
    if (found) return found as ProfileQuestion;
  }
  return null;
}

/**
 * Returns all question IDs to display in the full profile view —
 * includes read-only onboarding fields + editable questions.
 */
export function getAllGlobalQuestionIds(): string[] {
  const readOnly = ((demoQuestionnaire.globalOnboarding as any).collectedDuringOnboarding ?? []) as ProfileQuestion[];
  const editable = demoQuestionnaire.globalOnboarding.questions as ProfileQuestion[];
  return [...readOnly, ...editable].map((q) => q.id);
}

/**
 * Returns IDs that are READ-ONLY (collected during onboarding, not editable in wizard).
 */
export function getReadOnlyIds(): string[] {
  const readOnly = ((demoQuestionnaire.globalOnboarding as any).collectedDuringOnboarding ?? []) as ProfileQuestion[];
  return readOnly.map((q) => q.id);
}
