"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { Send, Users } from "lucide-react";
import Image from "next/image";
import useSocket from "@/hooks/useSocket";
import { SubmitGuess } from "@/types/dto";
import { Room } from "@/types";
import { RoomStatusDisplay } from "./PlayerRoom/RoomStatusDisplay";

export default function PlayerRoom({ params }: { params: { roomId: string } }) {
  const router = useRouter();
  const { emit, on } = useSocket("http://localhost:5500");
  const [playerName, setPlayerName] = React.useState("");
  const [guess, setGuess] = React.useState("");
  const roomId = params.roomId?.trim();
  const [room, setRoom] = React.useState<Room>();

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

  React.useEffect(() => {
    if (roomId !== undefined && emit !== undefined) {
      emit("getRoom", roomId, (room: Room) => {
        setRoom(room);
      });
    }
  }, [emit, roomId]);

  React.useEffect(() => {
    const storedName = localStorage.getItem("playerName") || "";
    const isHost = localStorage.getItem("isHost") === "true";

    if (!storedName || isHost) {
      router.push("/");
      return;
    }

    setPlayerName(storedName);
  }, [router]);

  const submitGuess = () => {
    if (!guess.trim()) return;

    const payload: SubmitGuess = {
      guess,
      roomId,
      playerName,
    };
    emit("guessWord", payload);
    // fill in guesses from socket here
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

  return (
    <div className="min-h-screen p-4 md:p-6 honeycomb-bg">
      <div className="max-w-xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <Image
              alt="Scripps Spelling Bee Logo"
              src="\logo.svg"
              width={200}
              height={300}
            />
            <p className="text-base-content/70">Player View</p>
          </div>

          <div className="flex gap-2">
            <div className="badge badge-outline gap-2">
              <Users className="h-4 w-4" />
              {room === undefined ? 0 : room.players.length} players
            </div>
            <div className="badge badge-secondary">Room: {roomId}</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <RoomStatusDisplay
                currentWordIndex={room?.wordIndex}
                roomStatus={room?.status}
              />

              <div className="mt-8 mb-2">
                <p className="text-center text-lg font-medium">
                  Spell the word:
                </p>
              </div>

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
                    currentPlayer?.roundGuesses?.includes(room?.wordIndex ?? -1)
                  }
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Scoreboard</h2>
              <div className="space-y-4">
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
