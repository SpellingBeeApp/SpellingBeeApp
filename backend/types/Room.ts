/**
 * @file Represents the type for a Room in the spelling bee game.
 */

import type { Player } from "./Player";
import type { RoomCode } from "./RoomCode";

/**
 * Room in the spelling bee.
 */
type Room = {
  /**
   * The host of the room.
   */
  host: Player;

  /**
   * The participants of the room.
   */
  players: Player[];

  /**
   * The list of words for the game.
   */
  words: Set<string>;
};

export type { Room };
