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
  type: 'text' | 'select' | 'date' | 'multiselect' | 'file_upload' | 'slider_range' | 'city_select' | 'height_slider';
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

function chunkQuestions(questions: ProfileQuestion[], label: string, startIndex: number): EditStep[] {
  const steps: EditStep[] = [];
  let currentGroup: ProfileQuestion[] = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    
    // If it's a file upload, it needs its own dedicated step
    if (q.type === 'file_upload') {
      // First, flush the current group if it has any questions
      if (currentGroup.length > 0) {
        steps.push({
          index: startIndex + steps.length,
          label,
          questions: [...currentGroup],
        });
        currentGroup = [];
      }
      // Then add the file upload as its own step
      steps.push({
        index: startIndex + steps.length,
        label: 'Photos', // Custom label for the isolated photo step
        questions: [q],
      });
    } else {
      currentGroup.push(q);
      if (currentGroup.length === QUESTIONS_PER_STEP) {
        steps.push({
          index: startIndex + steps.length,
          label,
          questions: [...currentGroup],
        });
        currentGroup = [];
      }
    }
  }

  // Flush any remaining questions
  if (currentGroup.length > 0) {
    steps.push({
      index: startIndex + steps.length,
      label,
      questions: [...currentGroup],
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
      key: 'overview',
      title: 'Overview',
      icon: 'user',
      // name, age, bio, location, kids, drinking, interests
      questionIds: ['go_1', 'go_2', 'go_bio', 'go_4', 'go_kids', 'go_9a', 'go_11'],
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
    Casual: 'Your Vibe',
    Love: 'Love & Connection',
    Marriage: 'Life & Values',
    Find_Your_Roommate: 'Living Preferences',
  };
  return labels[category] ?? 'More About You';
}

function getCategoryIcon(category: CategoryKey): string {
  const icons: Record<CategoryKey, string> = {
    Casual: 'zap',
    Love: 'heart',
    Marriage: 'anchor',
    Find_Your_Roommate: 'home',
  };
  return icons[category] ?? 'info';
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

/**
 * Safely formats any answer (including objects) into a string for display.
 * Prevents "Objects are not valid as a React child" errors.
 */
export function formatAnswer(ans: any): string | null {
  if (ans === null || ans === undefined || ans === "") return null;
  if (Array.isArray(ans)) return ans.join(", ");
  
  if (typeof ans === "object") {
    // Specifically handle budget range slider { min, max }
    if ("min" in ans && "max" in ans) {
      const formatAmount = (n: number) =>
        n >= 100000 ? "₹1L" : n >= 1000 ? `₹${n / 1000}k` : `₹${n}`;
      return `${formatAmount(ans.min)} – ${formatAmount(ans.max)}`;
    }
    // Fallback for other objects
    return JSON.stringify(ans);
  }
  
  return String(ans);
}
