import { ALL_PRACTICE_WORDS } from "@/data/practiceWords";
import { MAX_BOX } from "@/helpers/practiceProgress";
import { MistakeType, PracticeProgress, SpellingPattern } from "@/types/PracticeWord";

const MIN_ATTEMPTS_FOR_PATTERN = 3;

export type PatternStat = {
  pattern: SpellingPattern;
  attempts: number;
  correct: number;
  accuracy: number;
};

export type MistakeTypeStat = {
  mistakeType: MistakeType;
  count: number;
};

export type MissedWordStat = {
  word: string;
  count: number;
  box: number;
  dueAt: number;
};

export type DashboardStats = {
  totalAttempts: number;
  overallAccuracy: number | null;
  sessionsCompleted: number;
  wordsMastered: number;
  patternStats: PatternStat[];
  mistakeTypeStats: MistakeTypeStat[];
  mostMissedWords: MissedWordStat[];
  currentStreak: number;
};

const toLocalDayKey = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

/**
 * Consecutive calendar days (local time) with at least one practice attempt,
 * counting back from today. A day is only "missed" once it has fully passed —
 * practicing yesterday but not yet today still counts as an active streak.
 */
const computeCurrentStreak = (history: PracticeProgress["history"]): number => {
  if (history.length === 0) return 0;

  const practicedDays = new Set(history.map((attempt) => toLocalDayKey(attempt.timestamp)));
  const cursor = new Date();
  if (!practicedDays.has(toLocalDayKey(cursor.getTime()))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (practicedDays.has(toLocalDayKey(cursor.getTime()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export const computeDashboardStats = (
  progress: PracticeProgress,
): DashboardStats => {
  const { history, wordBoxes, sessionsCompleted, wordsMastered } = progress;

  const totalAttempts = history.length;
  const totalCorrect = history.filter((attempt) => attempt.correct).length;
  const overallAccuracy =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : null;

  const perPattern: Record<string, { attempts: number; correct: number }> = {};
  history.forEach((attempt) => {
    const patterns = ALL_PRACTICE_WORDS[attempt.word]?.patterns ?? [];
    patterns.forEach((pattern) => {
      const entry = perPattern[pattern] ?? { attempts: 0, correct: 0 };
      entry.attempts += 1;
      if (attempt.correct) entry.correct += 1;
      perPattern[pattern] = entry;
    });
  });

  const patternStats: PatternStat[] = Object.entries(perPattern)
    .filter(([, { attempts }]) => attempts >= MIN_ATTEMPTS_FOR_PATTERN)
    .map(([pattern, { attempts, correct }]) => ({
      pattern: pattern as SpellingPattern,
      attempts,
      correct,
      accuracy: Math.round((correct / attempts) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const perMistakeType: Record<string, number> = {};
  history.forEach((attempt) => {
    if (attempt.correct || !attempt.mistakeType) return;
    perMistakeType[attempt.mistakeType] =
      (perMistakeType[attempt.mistakeType] ?? 0) + 1;
  });

  const mistakeTypeStats: MistakeTypeStat[] = Object.entries(perMistakeType)
    .map(([mistakeType, count]) => ({
      mistakeType: mistakeType as MistakeType,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const mostMissedWords: MissedWordStat[] = Object.entries(wordBoxes)
    .filter(([, entry]) => entry.count > 0 && entry.box < MAX_BOX)
    .map(([word, entry]) => ({
      word,
      count: entry.count,
      box: entry.box,
      dueAt: entry.dueAt,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    totalAttempts,
    overallAccuracy,
    sessionsCompleted,
    wordsMastered,
    patternStats,
    mistakeTypeStats,
    mostMissedWords,
    currentStreak: computeCurrentStreak(history),
  };
};
