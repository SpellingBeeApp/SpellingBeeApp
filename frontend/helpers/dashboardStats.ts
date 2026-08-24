import { ALL_PRACTICE_WORDS } from "@/data/practiceWords";
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
  correctStreak: number;
};

export type DashboardStats = {
  totalAttempts: number;
  overallAccuracy: number | null;
  sessionsCompleted: number;
  wordsMastered: number;
  patternStats: PatternStat[];
  mistakeTypeStats: MistakeTypeStat[];
  mostMissedWords: MissedWordStat[];
};

export const computeDashboardStats = (
  progress: PracticeProgress,
): DashboardStats => {
  const { history, missedWords, sessionsCompleted, wordsMastered } = progress;

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

  const mostMissedWords: MissedWordStat[] = Object.entries(missedWords)
    .map(([word, entry]) => ({
      word,
      count: entry.count,
      correctStreak: entry.correctStreak,
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
  };
};
