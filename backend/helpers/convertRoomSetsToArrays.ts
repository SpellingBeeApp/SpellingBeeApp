/**
 * @file Modifies the server-side room for client-side digestion.
 */

import { Room } from "../types";
import {
  ModifiedPlayer,
  convertPlayerSetsToArrays,
} from "./convertPlayerSetsToArrays";

type ModifiedRoom = Omit<Room, "players" | "words"> & {
  players: ModifiedPlayer[];
  words: Array<string>;
};

/**
 * Takes in a room from the spelling bee game, and modifies it by converting all fields of type `set` to their respective array equivalent.
 * @param room - The room to modify.
 * @returns The modified room.
 */
export const convertRoomSetsToArrays = (room: Room): ModifiedRoom => {
  const { players, words, ...rest } = room;
  return {
    ...rest,
    words: [...words.values()],
    players: players.map((eachPlayer) => convertPlayerSetsToArrays(eachPlayer)),
  };
};
