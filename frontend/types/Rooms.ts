/**
 * @file Represents the "rooms" of the spelling bee game.
 */

import type { Room } from "./Room";
import type { RoomCode } from "./RoomCode";

/**
 * The storage of rooms. Is a "dictionary" that has a key of `RoomCode` (string) and a value of `Room`.
 */
type Rooms = Record<RoomCode, Room>;

export type { Rooms };
