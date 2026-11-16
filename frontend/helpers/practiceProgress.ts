import { AttemptRecord, Difficulty, MistakeType, PracticeProgress, WordBoxEntry } from "@/types/PracticeWord";

const STORAGE_KEY = "secretbee_practice_progress";
const MAX_HISTORY = 500;

const defaultProgress = (): PracticeProgress => ({
  wordBoxes: {},
  sessionsCompleted: 0,
  history: [],
  wordsMastered: 0,
  completedUnitIds: {},
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

const DAY_MS = 24 * 60 * 60 * 1000;

/** Leitner boxes: higher box = longer wait before a word is due for review again. */
export const MAX_BOX = 5;

const BOX_INTERVAL_DAYS: Record<number, number> = {
  1: 0,
  2: 1,
  3: 3,
  4: 7,
  5: 14,
};

const dueAtForBox = (box: number): number =>
  Date.now() + BOX_INTERVAL_DAYS[box] * DAY_MS;

const defaultBoxEntry = (): WordBoxEntry => ({
  box: 1,
  dueAt: 0,
  count: 0,
  lastSeen: 0,
});

/**
 * Words whose box is due for review right now, most-overdue first. Drives
 * both the "words due" count on the setup screen and the review session
 * itself — a word only shows up here once its box's interval has elapsed,
 * not just because it was once missed.
 */
export const getDueWords = (progress: PracticeProgress): string[] => {
  const now = Date.now();
  return Object.entries(progress.wordBoxes)
    .filter(([, entry]) => entry.dueAt <= now)
    .sort((a, b) => a[1].dueAt - b[1].dueAt)
    .map(([word]) => word);
};

/**
 * Called when a word is spelled incorrectly. Drops the word straight back
 * to Box 1 regardless of how far it had climbed, so it resurfaces almost
 * immediately instead of waiting out its old, longer interval.
 */
export const recordMissedWord = (word: string): PracticeProgress => {
  const progress = loadPracticeProgress();
  const existing = progress.wordBoxes[word] ?? defaultBoxEntry();

  progress.wordBoxes[word] = {
    box: 1,
    dueAt: dueAtForBox(1),
    count: existing.count + 1,
    lastSeen: Date.now(),
  };

  savePracticeProgress(progress);
  return progress;
};

/**
 * Called when a word is spelled correctly, whether or not it was previously
 * missed. Moves the word up one box (capped at MAX_BOX) and pushes its next
 * due date out accordingly. The first time a word reaches MAX_BOX counts
 * toward `wordsMastered`.
 */
export const recordCorrectAttempt = (word: string): PracticeProgress => {
  const progress = loadPracticeProgress();
  const existing = progress.wordBoxes[word] ?? defaultBoxEntry();
  const newBox = Math.min(MAX_BOX, existing.box + 1);

  if (newBox === MAX_BOX && existing.box < MAX_BOX) {
    progress.wordsMastered += 1;
  }

  progress.wordBoxes[word] = {
    box: newBox,
    dueAt: dueAtForBox(newBox),
    count: existing.count,
    lastSeen: Date.now(),
  };

  savePracticeProgress(progress);
  return progress;
};

/**
 * Marks a curriculum unit complete (no-op if it already is), unlocking the
 * next unit in the path. Does not re-check whether the unit's words have
 * actually been learned — callers should confirm with `canClearUnit` first.
 */
export const markUnitComplete = (unitId: string): PracticeProgress => {
  const progress = loadPracticeProgress();
  if (unitId in progress.completedUnitIds) return progress;

  progress.completedUnitIds[unitId] = Date.now();
  savePracticeProgress(progress);
  return progress;
};

export const recordCompletedSession = (): PracticeProgress => {
  const progress = loadPracticeProgress();
  progress.sessionsCompleted += 1;
  savePracticeProgress(progress);
  return progress;
};

/**
 * Logs a single quiz attempt so the dashboard can look for patterns later
 * (accuracy by grade/difficulty, which mistake types show up most). Keeps
 * only the most recent MAX_HISTORY attempts so localStorage doesn't grow
 * without bound.
 */
export const recordAttempt = (entry: {
  word: string;
  grade: number;
  difficulty: Difficulty;
  correct: boolean;
  mistakeType?: MistakeType;
}): PracticeProgress => {
  const progress = loadPracticeProgress();
  const record: AttemptRecord = { ...entry, timestamp: Date.now() };

  progress.history.push(record);
  if (progress.history.length > MAX_HISTORY) {
    progress.history = progress.history.slice(-MAX_HISTORY);
  }

  savePracticeProgress(progress);
  return progress;
};
