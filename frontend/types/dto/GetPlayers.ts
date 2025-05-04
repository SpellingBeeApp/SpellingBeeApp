/**
 * @file Get request from the client for receiving the list of players.
 */

import { RoomCode } from "../RoomCode";

/**
 * Request to get the list of players from the specified room.
 */
export type GetPlayers = {
  /**
   * Represents the code of the room.
   */
  code: RoomCode;
};
