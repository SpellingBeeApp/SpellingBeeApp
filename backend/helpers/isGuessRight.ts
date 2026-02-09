export const isGuessRight = (
  guess: string,
  words: Set<string>,
  wordIndex?: number
) =>
  wordIndex === undefined
    ? false
    : guess.replace(/\s+/g, "") === [...words.values()][wordIndex].replace(/\s+/g, "");
