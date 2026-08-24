export type SpellingPattern =
  | "schwa-vowel"
  | "double-letters"
  | "silent-letters"
  | "tricky-suffix"
  | "foreign-spelling"
  | "vowel-team";

export type PracticeWord = {
  word: string;
  definition: string;
  partOfSpeech?: string;
  sentence?: string;
  origin?: string;
  patterns?: SpellingPattern[];
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

export type MistakeType =
  | "dropped-letter"
  | "extra-letter"
  | "swapped-letters"
  | "wrong-letter"
  | "other";

export type AttemptRecord = {
  word: string;
  grade: number;
  difficulty: Difficulty;
  correct: boolean;
  mistakeType?: MistakeType;
  timestamp: number;
};

export type PracticeProgress = {
  missedWords: Record<string, MissedWordEntry>;
  sessionsCompleted: number;
  history: AttemptRecord[];
  wordsMastered: number;
};
