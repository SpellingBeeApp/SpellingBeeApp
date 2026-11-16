import { GRADE_LEVELS, PRACTICE_GRADES } from "@/data/practiceWords";
import { PracticeProgress } from "@/types/PracticeWord";

export type CurriculumUnit = {
  id: string;
  grade: number;
  /** 1-based position of this unit within its grade. */
  unitNumber: number;
  words: string[];
};

const UNIT_SIZE = 10;

/**
 * A word is considered "learned" for curriculum purposes once it's been
 * spelled correctly at least once (box 2+) — it doesn't need to reach full
 * mastery (MAX_BOX) to unlock the next unit, since long-term retention is
 * the Leitner system's job, not the curriculum gate's.
 */
export const MIN_BOX_TO_CLEAR_UNIT = 2;

/**
 * Round-robins a grade's easy/medium/hard word pools into one ordered list
 * (easy[0], medium[0], hard[0], easy[1], ...) instead of walking every easy
 * word before any medium or hard word. A student should see a mix of
 * difficulty from unit 1 of a grade, not grind a whole easy tier first.
 */
const interleaveByDifficulty = (grade: number): string[] => {
  const { easy, medium, hard } = PRACTICE_GRADES[grade];
  const maxLength = Math.max(easy.length, medium.length, hard.length);
  const interleaved: string[] = [];

  for (let i = 0; i < maxLength; i++) {
    if (easy[i]) interleaved.push(easy[i].word);
    if (medium[i]) interleaved.push(medium[i].word);
    if (hard[i]) interleaved.push(hard[i].word);
  }

  return interleaved;
};

/**
 * The full curriculum: each grade's words (blended across difficulty, see
 * `interleaveByDifficulty`) chunked into fixed-size units, in the fixed
 * order a student is meant to work through them (grade 3 -> grade 12).
 * Built once from the static word bank, so it's the same for every student
 * — only completion state (in PracticeProgress) differs per student.
 */
export const CURRICULUM_UNITS: CurriculumUnit[] = GRADE_LEVELS.flatMap((grade) => {
  const words = interleaveByDifficulty(grade);
  const units: CurriculumUnit[] = [];

  for (let i = 0; i < words.length; i += UNIT_SIZE) {
    units.push({
      id: `${grade}-${units.length + 1}`,
      grade,
      unitNumber: units.length + 1,
      words: words.slice(i, i + UNIT_SIZE),
    });
  }

  return units;
});

export const isUnitComplete = (
  progress: PracticeProgress,
  unit: CurriculumUnit,
): boolean => unit.id in progress.completedUnitIds;

/**
 * Units unlock strictly in order: the first unit is always open, and every
 * other unit opens only once the one directly before it is complete. This
 * is what makes it a curriculum to follow rather than free selection.
 */
export const isUnitUnlocked = (
  progress: PracticeProgress,
  unitIndex: number,
): boolean => {
  if (unitIndex === 0) return true;
  const previousUnit = CURRICULUM_UNITS[unitIndex - 1];
  return isUnitComplete(progress, previousUnit);
};

/**
 * True once every word in the unit has been spelled correctly at least
 * once (box >= MIN_BOX_TO_CLEAR_UNIT). Checked after a unit quiz session to
 * decide whether to mark the unit complete and unlock the next one.
 */
export const canClearUnit = (
  progress: PracticeProgress,
  unit: CurriculumUnit,
): boolean =>
  unit.words.every(
    (word) => (progress.wordBoxes[word]?.box ?? 0) >= MIN_BOX_TO_CLEAR_UNIT,
  );

export const getNextUnit = (unit: CurriculumUnit): CurriculumUnit | null => {
  const index = CURRICULUM_UNITS.findIndex((u) => u.id === unit.id);
  return CURRICULUM_UNITS[index + 1] ?? null;
};

export const findUnitById = (unitId: string): CurriculumUnit | undefined =>
  CURRICULUM_UNITS.find((u) => u.id === unitId);

export type CurriculumProgressSummary = {
  completedUnits: number;
  totalUnits: number;
  currentUnit: CurriculumUnit | null;
};

/** The first not-yet-complete unit is where the student should pick up. */
export const getCurriculumProgressSummary = (
  progress: PracticeProgress,
): CurriculumProgressSummary => {
  const completedUnits = CURRICULUM_UNITS.filter((unit) =>
    isUnitComplete(progress, unit),
  ).length;

  return {
    completedUnits,
    totalUnits: CURRICULUM_UNITS.length,
    currentUnit: CURRICULUM_UNITS[completedUnits] ?? null,
  };
};
