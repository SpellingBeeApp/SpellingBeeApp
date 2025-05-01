import { RoomStatus } from "@/common/enum";
import React from "react";

type RoomStatusDisplayProperties = {
  readonly currentWordIndex?: number;
  readonly roomStatus?: RoomStatus;
};

export const RoomStatusDisplay = ({
  currentWordIndex,
  roomStatus,
}: RoomStatusDisplayProperties): React.JSX.Element => {
  let displayText = "";
  if (roomStatus === RoomStatus.CREATED || currentWordIndex === undefined) {
    displayText = "Waiting for game to start...";
  } else {
    displayText = `Guess word #${currentWordIndex + 1}`;
  }

  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center">
        <div className="w-6 h-6 bg-primary rounded-full animate-pulse"></div>
      </div>
      <p className="text-base-content/70">{displayText}</p>
    </div>
  );
};
