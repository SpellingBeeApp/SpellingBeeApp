export type PracticeWord = {
  word: string;
  definition: string;
  partOfSpeech?: string;
  sentence?: string;
};

export type Difficulty = "easy" | "medium" | "hard";

export type QuizResult = {
  word: string;
  guess: string;
  correct: boolean;
  timeTaken: number;
};

export type PracticeProgress = {
  missedWords: Record<string, { count: number; lastSeen: number }>;
  sessionsCompleted: number;
};
