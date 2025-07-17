/**
 * @file Describes the structure of words within the application.
 */

/**
 * Word within the spelling bee game.
 */
export type RoomWord = {
  /**
   * The skipped status of the word.
   */
  skipped: boolean;

  /**
   * The word itself.
   */
  word: string;
};
