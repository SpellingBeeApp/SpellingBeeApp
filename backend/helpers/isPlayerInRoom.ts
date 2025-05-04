/**
 * @file Detects if given player name and a  room code. If the given player code exists in the room.
 */

import { RoomCode, Rooms } from "../types";

/**
 * Checks if a given player exists in the room.
 *
 * @param playerCode - The code of the player.
 * @param roomCode - The specified room code.
 * @param rooms - The list of already existing rooms.
 * @param isHost - If the found player IS host.
 * @returns If the player exists in the room.
 */
export const isPlayerInRoom = (
  playerName: string,
  roomCode: RoomCode,
  rooms: Rooms,
  isHost: boolean = false
): boolean => {
  if (roomCode in rooms) {
    const room = rooms[roomCode];
    const foundPlayer =
      (!isHost &&
        room.players.some((eachPlayer) => eachPlayer.name === playerName)) ||
      room.host.name === playerName;
    return foundPlayer;
  }

  return false;
};
