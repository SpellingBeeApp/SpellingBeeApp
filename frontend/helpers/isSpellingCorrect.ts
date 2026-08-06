export const isSpellingCorrect = (guess: string, answer: string): boolean =>
  guess.replace(/\s+/g, "").toLowerCase() ===
  answer.replace(/\s+/g, "").toLowerCase();
