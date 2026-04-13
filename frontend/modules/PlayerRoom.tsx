"use client";

/**
 * @file The Player room client side component
 */

import { useRouter } from "next/navigation";
import React from "react";
import { Send, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import useSocket from "@/hooks/useSocket";
import { SubmitGuess } from "@/types/dto";
import { Room } from "@/types";
import { RoomStatusDisplay } from "./PlayerRoom/RoomStatusDisplay";
import { RoomStatus } from "@/common/enum";
import TopThreePlayers from "./PlayerRoom/TopThreePlayers";

export default function PlayerRoom({ params }: { params: { roomId: string } }) {
  const router = useRouter();
  // const { emit, on } = useSocket("http://localhost:5000"); // For local development
  // const { emit, on } = useSocket("http://54.149.199.75:5000"); // For previous EC2 deployment
  const { emit, on } = useSocket(process.env.NEXT_PUBLIC_BACKEND_URL!); // Uses env variable
  const [playerName, setPlayerName] = React.useState("");
  const [guess, setGuess] = React.useState("");
  // Use backend-provided wordStartTime for timing
  const roomId = params.roomId?.trim();
  const [room, setRoom] = React.useState<Room>();

  /**
   * listening for the specific roomId modify listener
   * this constantly updates or "modifies" the room when anything changes
   */
  React.useEffect(() => {
    if (roomId !== undefined) {
      on(`room_${roomId}_modified`, (partialRoom: Room) => {
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
    console.log("storedName:", storedName, "isHost:", isHost);

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
    if (!guess.trim() || !room?.wordStartTime) return;
    // Calculate time taken for this word using backend-provided start time
    const endTime = Date.now();
    const timeTaken = Math.round((endTime - room.wordStartTime) / 1000);
    // Always submit guess in lowercase
    const payload: SubmitGuess = {
      guess: guess.toLowerCase(),
      roomId,
      playerName,
      timeTaken,
    };
    emit("guessWord", payload);
    setGuess("");
  };

  const getTotalSeconds = (player: any) => {
    if (!player.guesses || player.guesses.length === 0) return Infinity;
    return player.guesses
      .map((g: any) => (typeof g[3] === "number" ? g[3] : 0))
      .reduce((sum: number, t: number) => sum + t, 0);
  };

  const getPlayerRank = () => {
    if (!playerName || !room) return null;
    const { players } = room;
    const sortedPlayers = [...players].sort((a, b) => {
      // Sort by score descending
      const scoreDiff = (b.score ?? 0) - (a.score ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
      // If scores are equal, sort by total seconds ascending
      return getTotalSeconds(a) - getTotalSeconds(b);
    });
    const playerIndex = sortedPlayers.findIndex((p) => p.name === playerName);
    return playerIndex >= 0 ? playerIndex + 1 : null;
  };

  const playerRank = getPlayerRank();

  const currentPlayer = room?.players.find(
    (eachPlayer) => eachPlayer.name === playerName,
  );

  // Defensive check: if room is missing, show a friendly message
  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <Link href="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 honeycomb-bg">
      <div className="max-w-xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-center mb-6 gap-4 transition-all duration-500 ease-in-out">
          <div className="animate__animated animate__fadeInLeft md:animate-fade self-center md:self-start text-center md:text-left">
            <Link href="/">
              <Image
                alt="Scripps Spelling Bee Logo"
                src="/sb003.png"
                width={300}
                height={300}
                style={{ cursor: "pointer" }}
              />
            </Link>
            <p className="text-base-content/70 text-lg font-semibold">
              Welcome, {playerName} !
            </p>
          </div>

          <div className="flex gap-2 animate-fade-right md:animate-fade">
            <div className="badge badge-outline gap-2">
              <Users className="h-4 w-4" />
              {room === undefined ? 0 : room.players.length} players
            </div>
            <div className="badge badge-secondary">Room: {roomId}</div>
          </div>
        </div>

        <div className="space-y-6 animate-fade-up md:animate-fade">
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
                    onChange={(e) => setGuess(e.target.value.toLowerCase())}
                    onKeyDown={(e) => e.key === "Enter" && submitGuess()}
                  />
                  <button
                    className="btn btn-primary join-item"
                    onClick={submitGuess}
                    disabled={
                      !guess.trim() ||
                      currentPlayer?.roundGuesses?.includes(
                        room?.wordIndex ?? -1,
                      )
                    }
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Scoreboard ✨🐝</h2>
              <div className="space-y-4">
                {room?.status === RoomStatus.ENDED && (
                  <div className="card-body" style={{ padding: "0px" }}>
                    <TopThreePlayers winners={room.players} />
                  </div>
                )}
                {/* Add extra space between word scoreboard and ranking bars */}
                <div className="my-4" />

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
                    [...room.players]
                      .sort((a, b) => {
                        const scoreDiff = (b.score ?? 0) - (a.score ?? 0);
                        if (scoreDiff !== 0) return scoreDiff;
                        // If scores are equal, sort by total seconds ascending
                        const getTotalSeconds = (player: any) => {
                          if (!player.guesses || player.guesses.length === 0)
                            return Infinity;
                          return player.guesses
                            .map((g: any) =>
                              typeof g[3] === "number" ? g[3] : 0,
                            )
                            .reduce((sum: number, t: number) => sum + t, 0);
                        };
                        return getTotalSeconds(a) - getTotalSeconds(b);
                      })
                      .map((player, index) => (
                        <div
                          key={`${player.name}_${index}`}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg gap-2 sm:gap-0 overflow-hidden ${
                            player.name === playerName
                              ? "bg-primary/20"
                              : "bg-base-200"
                          }`}
                          style={{ minWidth: 0 }}
                        >
                          <span className="font-medium truncate max-w-[50vw] sm:max-w-[200px]">
                            {player.name}
                            {player.name === playerName && (
                              <span className="badge badge-sm ml-2">You</span>
                            )}
                          </span>
                          <span className="flex items-center font-bold text-base sm:text-lg whitespace-nowrap overflow-hidden">
                            {/* Trophy/medal for top 3 */}
                            {index === 0 && <span className="mr-1">🏆</span>}
                            {index === 1 && <span className="mr-1">🏁</span>}
                            {index === 2 && <span className="mr-1">⭐</span>}
                            <span
                              className="text-yellow-600 font-extrabold text-lg sm:text-xl"
                              style={{ fontFamily: "monospace" }}
                            >
                              {player.score}%
                            </span>
                            {room?.status === RoomStatus.ENDED &&
                              player.guesses &&
                              player.guesses.length > 0 && (
                                <span
                                  className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-gray-900 via-black to-gray-700 border-2 border-yellow-400 text-yellow-200 font-mono font-extrabold text-xs sm:text-base shadow"
                                  style={{
                                    letterSpacing: "0.05em",
                                    maxWidth: "100%",
                                    overflow: "hidden",
                                  }}
                                  title="Total race time (lower is better)"
                                >
                                  <span className="mr-1 text-base sm:text-lg">
                                    🏁
                                  </span>
                                  <span
                                    className="text-white drop-shadow-sm"
                                    style={{ fontFamily: "monospace" }}
                                  >
                                    {player.guesses
                                      .map((g) =>
                                        typeof g[3] === "number" ? g[3] : 0,
                                      )
                                      .reduce((sum, t) => sum + t, 0)
                                      .toFixed(2)}
                                  </span>
                                  <span className="ml-1 text-yellow-200 font-bold">
                                    s
                                  </span>
                                </span>
                              )}
                          </span>
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
