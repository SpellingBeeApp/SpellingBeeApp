/**
 * Replaces every occurrence of the target word in text so quiz hints
 * don't reveal the spelling. Used for definitions and example sentences.
 */
export const maskWordInText = (text: string, word: string): string => {
  if (!word.trim()) return text;

  const pattern = new RegExp(
    `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
    "gi",
  );

  return text.replace(pattern, "______");
};

/**
 * Returns true if the text visibly contains the target word.
 */
export const textContainsWord = (text: string, word: string): boolean => {
  if (!word.trim()) return false;

  const pattern = new RegExp(
    `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
    "i",
  );

  return pattern.test(text);
};
