/**
 * @file Represents the "status" of the Room.
 */

enum RoomStatus {
  /**
   * The room has been created. Pending start.
   */
  CREATED = 0,

  /**
   * The room has started.
   */
  STARTED = 1,

  /**
   * The room has completed (the game has finished).
   */
  ENDED = 2,
}

export { RoomStatus };
