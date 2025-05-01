/**
 * @file The DTO for submitting a list of words to use in a room
 */
export type SubmitWords = {
  /**
   * the room id the word list will be associated with
   */
  roomId: string;

  /**
   * the word list
   */
  words: string[];
};
