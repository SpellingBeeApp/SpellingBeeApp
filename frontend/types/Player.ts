/**
 * @file Represents the data structure of a player in the spelling bee game.
 */

/**
 * Player in the spelling bee. Can be host or participant.
 */
type Player = {
  /**
   * The index of the player (defaults to -1 for the host).
   */
  idNumber?: number;

  /**
   * Whether the player is the host of the room.
   */
  isHost?: boolean;

  /**
   * Name when a player registers.
   */
  name: string;

  /**
   * The score of the player.
   */
  score?: number;
};

export type { Player };
