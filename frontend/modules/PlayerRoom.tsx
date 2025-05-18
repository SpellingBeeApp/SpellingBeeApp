"use client";

/**
 * @file The Player room client side component
 */

import { useRouter } from "next/navigation";
import React from "react";
import { Send, Users } from "lucide-react";
import Image from "next/image";
import useSocket from "@/hooks/useSocket";
import { SubmitGuess } from "@/types/dto";
import { Room } from "@/types";
import { RoomStatusDisplay } from "./PlayerRoom/RoomStatusDisplay";
import { RoomStatus } from "@/common/enum";
import Scoreboard from "./ScoreBoard";

export default function PlayerRoom({ params }: { params: { roomId: string } }) {
  const router = useRouter();
  const { emit, on } = useSocket("http://localhost:5500");
  const [playerName, setPlayerName] = React.useState("");
  const [guess, setGuess] = React.useState("");
  const roomId = params.roomId?.trim();
  const [room, setRoom] = React.useState<Room>();

  /**
   * listening for the specific roomId modify listener
   * this constantly updates or "modifies" the room when anything changes
   */
  React.useEffect(() => {
    if (roomId !== undefined) {
      on(`room_${roomId}_modified`, (partialRoom: Room) => {
        console.log(partialRoom);
        setRoom((oldRoom) => {
          if (oldRoom === undefined) {
            return { ...partialRoom };
          }
          return { ...oldRoom, ...partialRoom };
        });
      });
    }
  }, [roomId, on]);

  /**
   * emitting to the get Room listener and getting the room info in server
   */
  React.useEffect(() => {
    if (roomId !== undefined && emit !== undefined) {
      emit("getRoom", roomId, (room: Room) => {
        setRoom(room);
      });
    }
  }, [emit, roomId]);

  /**
   * getting the player name from local storage and setting it
   */
  React.useEffect(() => {
    const storedName = localStorage.getItem("playerName") || "";
    const isHost = localStorage.getItem("isHost") === "true";

    if (!storedName || isHost) {
      router.push("/");
      return;
    }

    setPlayerName(storedName);
  }, [router]);

  /**
   * emits to the "guessWord" listener when the players guess the current word
   * @returns void
   */
  const submitGuess = () => {
    if (!guess.trim()) return;

    /**
     * the payload we will emit to the server consisting of the guess, the roomId, and the playerName
     */
    const payload: SubmitGuess = {
      guess,
      roomId,
      playerName,
    };

    /**
     * emitting tht guess to the "guessWord" listener in the server and setting the guess to the word inputted
     */
    emit("guessWord", payload);
    setGuess(guess);
  };

  const getPlayerRank = () => {
    if (!playerName || !room) return null;
    const { players } = room;
    const sortedPlayers = [...players].sort(
      (a, b) => (b.score ?? 0) - (a.score ?? 0)
    );
    const playerIndex = sortedPlayers.findIndex((p) => p.name === playerName);

    return playerIndex >= 0 ? playerIndex + 1 : null;
  };

  const playerRank = getPlayerRank();

  const currentPlayer = room?.players.find(
    (eachPlayer) => eachPlayer.name === playerName
  );

  /**TODO: Need to reset word guess input on submit */

  return (
    <div className="min-h-screen p-4 md:p-6 honeycomb-bg">
      <div className="max-w-xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="animate-fade-right">
            <Image
              alt="Scripps Spelling Bee Logo"
              src="\logo.svg"
              width={200}
              height={300}
            />
            <p className="text-base-content/70">Player View</p>
          </div>

          <div className="flex gap-2 animate-fade-left">
            <div className="badge badge-outline gap-2">
              <Users className="h-4 w-4" />
              {room === undefined ? 0 : room.players.length} players
            </div>
            <div className="badge badge-secondary">Room: {roomId}</div>
          </div>
        </div>

        <div className="space-y-6 animate-fade-up">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <RoomStatusDisplay  
                currentWordIndex={room?.wordIndex}
                roomStatus={room?.status}
              />

              <div className="mt-8 mb-2">
                {" "}
                {room?.status === RoomStatus.STARTED ? (
                  <p className="text-center text-lg font-medium">
                    Spell the word:
                  </p>
                ) : null}
              </div>

              {room?.status === RoomStatus.STARTED ? (
                <div className="join w-full">
                  <input
                    type="text"
                    placeholder="Type your answer..."
                    className="input input-bordered join-item w-full"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitGuess()}
                  />
                  <button
                    className="btn btn-primary join-item"
                    onClick={submitGuess}
                    disabled={
                      !guess.trim() ||
                      currentPlayer?.roundGuesses?.includes(
                        room?.wordIndex ?? -1
                      )
                    }
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* {room?.status === RoomStatus.ENDED && <div className="card bg-base-100 shadow-xl">
             <div className="card-body" style={{}}>
            
             <div className="w-full flex justify-center">
  <h2 className="text-2xl font-sans animate-party">
    🎉 Top Three Winners 🏆
  </h2>
</div>
            <Scoreboard winners={room.players} />
            </div>
            </div>} */}


          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Scoreboard</h2>
              <div className="space-y-4">


              {room?.status === RoomStatus.ENDED && 
             <div className="card-body" style={{}}>
            
             <div className="w-full flex justify-center">
  <h2 className="text-2xl font-sans animate-party">
    🎉 Top Three Winners 🏆
  </h2>
</div>
            <Scoreboard winners={room.players} />
            </div>
            }


                {playerRank && (
                  <div className="bg-base-200 p-3 rounded-lg text-center">
                    <p className="font-medium">
                      Your Rank: {playerRank} of{" "}
                      {room === undefined ? 0 : room.players.length}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  {room !== undefined &&
                    room.players.map((player, index) => (
                      <div
                        key={`${player.name}_${index}`}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          player.name === playerName
                            ? "bg-primary/20"
                            : "bg-base-200"
                        }`}
                      >
                        <span className="font-medium">
                          {index + 1}. {player.name}
                          {player.name === playerName && (
                            <span className="badge badge-sm ml-2">You</span>
                          )}
                        </span>
                        <span className="font-bold">{`${player.score}%`}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
