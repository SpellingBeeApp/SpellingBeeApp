/**
 * @file The DTO for the "createRoom" socket listener.
 */

import { Player } from "../Player";
import { RoomCode } from "../RoomCode";

/**
 * Represents the payload sent over in the socket "createRoom" listener.
 */
export type CreateRoomData = {
  /**
   * The room code.
   */
  code: RoomCode;

  /**
   * The host of the created room.
   */
  host: Player;
};
