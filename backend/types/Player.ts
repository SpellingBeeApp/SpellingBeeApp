/**
 * @file Represents the data structure of a player in the spelling bee game.
 */

import { Guess } from "./Guess";

/**
 * Player in the spelling bee. Can be host or participant.
 */
type Player = {
  /**
   * The guesses made by the player
   */
  guesses?: Array<Guess>;

  /**
   * The index of the player (defaults to -1 for the host).
   */
  idNumber: number;

  /**
   * Whether the player is the host of the room.
   */
  isHost?: boolean;

  /**
   * Name when a player registers.
   */
  name: string;

  /**
   * The rounds that the player has guessed.
   */
  roundGuesses: Set<number>;

  /**
   * The score of the player.
   */
  score?: number;
};

export type { Player };
