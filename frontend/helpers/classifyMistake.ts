import { MistakeType } from "@/types/PracticeWord";

const droppedOneLetter = (shorter: string, longer: string): boolean => {
  for (let i = 0; i < longer.length; i++) {
    if (longer.slice(0, i) + longer.slice(i + 1) === shorter) return true;
  }
  return false;
};

const swappedAdjacentLetters = (guess: string, correct: string): boolean => {
  const diffPositions: number[] = [];
  for (let i = 0; i < correct.length; i++) {
    if (guess[i] !== correct[i]) diffPositions.push(i);
  }
  if (diffPositions.length !== 2) return false;
  const [a, b] = diffPositions;
  return (
    b === a + 1 && guess[a] === correct[b] && guess[b] === correct[a]
  );
};

/**
 * Classifies the kind of spelling mistake by comparing the guess to the
 * correct word, so the dashboard can show which error type a user makes
 * most often (dropped a letter, added one, swapped two, or used the wrong
 * letter). Purely a string comparison, no AI involved.
 */
export const classifyMistake = (
  guess: string,
  correctWord: string,
): MistakeType => {
  const g = guess.trim().toLowerCase();
  const c = correctWord.trim().toLowerCase();

  if (g.length === c.length - 1 && droppedOneLetter(g, c)) {
    return "dropped-letter";
  }
  if (g.length === c.length + 1 && droppedOneLetter(c, g)) {
    return "extra-letter";
  }
  if (g.length === c.length) {
    if (swappedAdjacentLetters(g, c)) return "swapped-letters";
    return "wrong-letter";
  }
  return "other";
};
