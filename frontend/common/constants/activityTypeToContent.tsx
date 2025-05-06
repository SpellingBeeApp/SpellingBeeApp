import { RoomActivity } from "@/types/RoomActivity";
import { ActivityType } from "../enum";

export const activityTypeToContent = (
  type: ActivityType,
  activity: RoomActivity
): React.JSX.Element => {
  switch (type) {
    case ActivityType.JOIN: {
      return (
        <span>
          <span className="font-bold">{`${activity.playerName} `}</span>
          {` joined.`.trim()}
        </span>
      );
    }
    case ActivityType.GUESS_RIGHT: {
      return (
        <span>
          <span className="font-bold">{`${activity.playerName} `}</span>
          {` guessed ${
            (activity?.metadata as Record<string, string>)["guess"]
          }!`.trim()}
        </span>
      );
    }
    case ActivityType.GUESS_WRONG: {
      return (
        <span>
          <span className="font-bold">{`${activity.playerName} `}</span>
          {` guessed ${
            (activity?.metadata as Record<string, string>)["guess"]
          }!`.trim()}
        </span>
      );
    }
    case ActivityType.LOG: {
      return (
        <span>
          {`${activity.playerName} ${activity?.metadata as string}.`.trim()}
        </span>
      );
    }
    default: {
      return <span>{`Unable to fetch activity details.`}</span>;
    }
  }
};
