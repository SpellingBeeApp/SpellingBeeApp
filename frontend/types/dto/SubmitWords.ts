/**
 * @file the DTO for submitting a list of words in the spelling bee
 */
type SubmitWords = {
  /**
   * the room id tht the word list will be added to
   */
  roomId: string;

  /**
   * the word list
   */
  words: string[];
};

export type { SubmitWords };
