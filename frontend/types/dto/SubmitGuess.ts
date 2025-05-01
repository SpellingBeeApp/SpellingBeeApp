/**
 * @file The DTO for creating (submitting) a guess.
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
  playerName: string;
};

export type { SubmitGuess };
