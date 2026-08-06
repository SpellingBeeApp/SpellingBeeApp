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

export const recordMissedWord = (word: string): PracticeProgress => {
  const progress = loadPracticeProgress();
  const existing = progress.missedWords[word] ?? { count: 0, lastSeen: 0 };

  progress.missedWords[word] = {
    count: existing.count + 1,
    lastSeen: Date.now(),
  };

  savePracticeProgress(progress);
  return progress;
};

export const recordCompletedSession = (): PracticeProgress => {
  const progress = loadPracticeProgress();
  progress.sessionsCompleted += 1;
  savePracticeProgress(progress);
  return progress;
};
