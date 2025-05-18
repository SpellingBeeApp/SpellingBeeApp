import { RoomStatus } from "@/common/enum";
import React from "react";
import Confetti from "../Confetti"

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
  } else if (roomStatus === RoomStatus.STARTED) {
    displayText = `Guess word #${currentWordIndex + 1}`;
  } else {
    displayText = "Thank you for participating!";
  }

  return (
    <>
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center">
        <div
          className={`w-12 h-12 ${
            roomStatus === RoomStatus.ENDED ? "bg-green-500" : "bg-primary"
          } rounded-full transition-colors animate-pulse`}
        >
          {roomStatus === RoomStatus.ENDED && <Confetti/>}
          </div>
      </div>
      <p className="text-base-content/70 text-xl">{displayText}</p>
    </div>
    </>
  );
};
