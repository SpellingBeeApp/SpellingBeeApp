/**
 * @file Represents the data structure of a player in the spelling bee game.
 */

/**
 * Player in the spelling bee. Can be host or participant.
 */
type Player = {
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
