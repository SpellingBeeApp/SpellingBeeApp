import { RoomActivity } from "../types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

/**
 * Inserts a timestamp into the activity to complete the RoomActivity.
 *
 * @param payload - The unfinished activity
 * @returns The finished activity, with timestamp inserted.
 */
export const createActivity = (
  payload: Omit<RoomActivity, "timestamp">
): RoomActivity => ({ ...payload, timestamp: dayjs.utc().format() });
