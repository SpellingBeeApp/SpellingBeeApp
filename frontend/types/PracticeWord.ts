export type PracticeWord = {
  word: string;
  definition: string;
  partOfSpeech?: string;
  sentence?: string;
  origin?: string;
};

export type Difficulty = "easy" | "medium" | "hard";

export type QuizResult = {
  word: string;
  guess: string;
  correct: boolean;
  timeTaken: number;
};

export type MissedWordEntry = {
  count: number;
  lastSeen: number;
  correctStreak: number;
};

export type PracticeProgress = {
  missedWords: Record<string, MissedWordEntry>;
  sessionsCompleted: number;
};
