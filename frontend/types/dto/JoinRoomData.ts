/**
 * @file The DTO for joining a room in the spelling bee game.
 */

import { Player } from "../Player";
import { RoomCode } from "../RoomCode";

type JoinRoomData = {
  code: RoomCode;
  player: Player;
};

export type { JoinRoomData };
