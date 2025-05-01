/**
 * @file The DTO for creating (submitting) a word to the word bank.
 */

type SubmitGuess = {
  /**
   * The submitted word.
   */
  guess: string;

  /**
   * The id of the room.
   */
  roomId: string;

  /**
   * The id number of the player.
   */
  playerIdNumber: number;
};

export type { SubmitGuess };
