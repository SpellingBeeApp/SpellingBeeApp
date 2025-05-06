/**
 * @file Represents the type for a Room in the spelling bee game.
 */

import { RoomStatus } from "../common/enum";
import type { Player } from "./Player";
import { RoomActivity } from "./RoomActivity";

/**
 * Room in the spelling bee.
 */
type Room = {
  activities: Array<RoomActivity>;

  /**
   * The host of the room.
   */
  host: Player;

  /**
   * The participants of the room.
   */
  players: Player[];

  /**
   * The status of the room, defaults to `RoomStatus.CREATED`.
   */
  status?: RoomStatus;

  /**
   * The list of words for the game.
   */
  words: Array<string>;

  /**
   * The current index of the "guessable" word in the game.
   */
  wordIndex?: number;
};

export type { Room };
