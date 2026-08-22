import { PracticeProgress } from "@/types/PracticeWord";

const STORAGE_KEY = "secretbee_practice_progress";

const defaultProgress = (): PracticeProgress => ({
  missedWords: {},
  sessionsCompleted: 0,
});

export const loadPracticeProgress = (): PracticeProgress => {
  if (typeof window === "undefined") return defaultProgress();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultProgress();
    return { ...defaultProgress(), ...JSON.parse(stored) };
  } catch {
    return defaultProgress();
  }
};

export const savePracticeProgress = (progress: PracticeProgress): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

export const MASTERY_STREAK = 3;

export const recordMissedWord = (word: string): PracticeProgress => {
  const progress = loadPracticeProgress();
  const existing = progress.missedWords[word] ?? {
    count: 0,
    lastSeen: 0,
    correctStreak: 0,
  };

  progress.missedWords[word] = {
    count: existing.count + 1,
    lastSeen: Date.now(),
    correctStreak: 0,
  };

  savePracticeProgress(progress);
  return progress;
};

/**
 * Called when a word that was previously missed is spelled correctly.
 * Once it's answered correctly MASTERY_STREAK times in a row, it's
 * considered mastered and removed from the missed-words list.
 */
export const recordCorrectAttempt = (word: string): PracticeProgress => {
  const progress = loadPracticeProgress();
  const existing = progress.missedWords[word];
  if (!existing) return progress;

  const correctStreak = existing.correctStreak + 1;
  if (correctStreak >= MASTERY_STREAK) {
    delete progress.missedWords[word];
  } else {
    progress.missedWords[word] = {
      ...existing,
      correctStreak,
      lastSeen: Date.now(),
    };
  }

  savePracticeProgress(progress);
  return progress;
};

export const recordCompletedSession = (): PracticeProgress => {
  const progress = loadPracticeProgress();
  progress.sessionsCompleted += 1;
  savePracticeProgress(progress);
  return progress;
};
