/**
 * @file Modifies the server-side room for client-side digestion.
 */

import { Room } from "../types";
import {
  ModifiedPlayer,
  modifyPlayerForStringify,
} from "./modifyPlayerForStringify";

type ModifiedRoom = Omit<Room, "players"> & { players: ModifiedPlayer[] };

/**
 * Takes in a room from the spelling bee game, and modifies it for JSON.stringify.
 * @param room - The room to modify for stringification.
 * @returns The modified room.
 */
export const modifyRoomForStringify = (room: Room): ModifiedRoom => {
  const { players, ...rest } = room;
  return {
    ...rest,
    players: players.map((eachPlayer) => modifyPlayerForStringify(eachPlayer)),
  };
};
