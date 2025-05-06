export const isGuessRight = (
  guess: string,
  words: Set<string>,
  wordIndex?: number
) =>
  wordIndex === undefined ? false : guess === [...words.values()][wordIndex];
