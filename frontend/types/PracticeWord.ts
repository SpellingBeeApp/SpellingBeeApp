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

export type WordBoxEntry = {
  /** 1-5 Leitner box. Higher box = longer gap before this word is due again. */
  box: number;
  /** Epoch ms; the word is due for review once Date.now() >= dueAt. */
  dueAt: number;
  /** Total times this word has ever been answered incorrectly. */
  count: number;
  /** Epoch ms of the most recent attempt (right or wrong). */
  lastSeen: number;
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
  wordBoxes: Record<string, WordBoxEntry>;
  sessionsCompleted: number;
  history: AttemptRecord[];
  wordsMastered: number;
  /** Curriculum unit id -> epoch ms when every word in it first reached box 2+. */
  completedUnitIds: Record<string, number>;
};
