import { ActivityType } from "../enum";

export const activityTypeToColor: Record<ActivityType, string> = {
  [ActivityType.GUESS_RIGHT]: "#39d52950",
  [ActivityType.GUESS_WRONG]: "#d10d0d50",
  [ActivityType.JOIN]: "#1c75b850",
  [ActivityType.LOG]: "#8c08e750",
};
