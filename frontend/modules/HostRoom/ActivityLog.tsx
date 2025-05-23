import { activityTypeToColor } from "@/common/constants/activityTypeToColor";
import { RoomActivity } from "@/types/RoomActivity";
import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { activityTypeToContent } from "@/common/constants/activityTypeToContent";

dayjs.extend(utc);

type ActivityLogProperties = {
  activity: RoomActivity;
};

export const ActivityLog = ({
  activity,
}: ActivityLogProperties): React.JSX.Element => {
  const { type, timestamp } = activity;

  return (
    <div
      className="flex flex-row justify-between border rounded border-opacity-25 p-3 animate__animated animate__fadeInLeft"
      style={{ backgroundColor: activityTypeToColor[type] }}
    >
      <div className="ps-2 text-sm">
        {dayjs.utc(timestamp).local().format("hh:mm:ss A")}
      </div>
      <div className="italic font-bold invisible md:visible md:text-sm">
        {activity.metadata === undefined ||
        (activity.metadata as Record<string, string>)["round"] === undefined
          ? ""
          : `Round ${(activity.metadata as Record<string, string>)["round"]}`}
      </div>
      <div>{activityTypeToContent(type, activity)}</div>
    </div>
  );
};
