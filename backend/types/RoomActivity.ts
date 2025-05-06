import { ActivityType } from "../common/enum";

export type RoomActivity = {
  /**
   * The timestamp of the activity.
   */
  timestamp: Date | string;

  /**
   * The id of the player (username).
   */
  playerName: string;

  type: ActivityType;

  isHost?: boolean;

  metadata?: Record<string, string> | string;
};
