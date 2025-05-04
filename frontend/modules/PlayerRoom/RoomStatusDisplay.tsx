import { RoomStatus } from "@/common/enum";
import React from "react";

/**
 * @file the client side Room Status display component
 * For the players. Changes display text based on room status
 * TODO: Still need to implement when game is over
 */

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
        <div className="w-12 h-12 bg-primary rounded-full animate-pulse"></div>
      </div>
      <p className="text-base-content/70 text-xl">{displayText}</p>
    </div>
  );
};
