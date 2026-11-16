export type LetterDiff = {
  char: string;
  isWrong: boolean;
};

/**
 * Compares the correct word to a guess using a longest-common-subsequence
 * alignment (not a raw position-by-position compare) so the quiz feedback
 * underlines only the letters that are actually wrong. A plain positional
 * compare falls apart on a single dropped or extra letter — everything
 * after it shifts out of position and gets flagged as wrong even though
 * the rest of the word was spelled correctly.
 */
export const diffSpelling = (correctWord: string, guess: string): LetterDiff[] => {
  const correct = correctWord.toLowerCase();
  const normalizedGuess = guess.trim().toLowerCase();
  const n = correct.length;
  const m = normalizedGuess.length;

  const lcsLength: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      lcsLength[i][j] =
        correct[i - 1] === normalizedGuess[j - 1]
          ? lcsLength[i - 1][j - 1] + 1
          : Math.max(lcsLength[i - 1][j], lcsLength[i][j - 1]);
    }
  }

  const matchedIndices = new Set<number>();
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (
      correct[i - 1] === normalizedGuess[j - 1] &&
      lcsLength[i][j] === lcsLength[i - 1][j - 1] + 1
    ) {
      matchedIndices.add(i - 1);
      i--;
      j--;
    } else if (lcsLength[i - 1][j] >= lcsLength[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return correctWord.split("").map((char, index) => ({
    char,
    isWrong: !matchedIndices.has(index),
  }));
};
