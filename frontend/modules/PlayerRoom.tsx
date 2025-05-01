"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { Send, Users } from "lucide-react";
import Image from "next/image";
import useSocket from "@/hooks/useSocket";
import { GetPlayers } from "@/types/dto";

type Player = {
  id: string;
  name: string;
  score: number;
};

export default function PlayerRoom({ params }: { params: { roomId: string } }) {
  const router = useRouter();
  const [playerName, setPlayerName] = React.useState("");
  const [guess, setGuess] = React.useState("");
  const [currentWordIndex, setCurrentWordIndex] = React.useState(1);
  const roomId = params.roomId;
  const [players, setPlayers] = React.useState<Player[]>([]);
  const { emit, on } = useSocket("http://localhost:5500");

  React.useEffect(() => {
    if (emit !== undefined && on !== undefined && roomId !== undefined) {
      const payload: GetPlayers = {
        code: roomId,
      };
      console.log("emitting");
      emit("getPlayers", payload);
      on(`${roomId}_players`, (players: string) => {
        console.log("players = ", players);
      });
    }
  }, [roomId, emit, on]);

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

    // fill in guesses from socket here
    setGuess("");
  };

  const getPlayerRank = () => {
    if (!playerName) return null;

    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const playerIndex = sortedPlayers.findIndex((p) => p.name === playerName);

    return playerIndex >= 0 ? playerIndex + 1 : null;
  };

  const playerRank = getPlayerRank();

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
              {players.length} players
            </div>
            <div className="badge badge-secondary">Room: {roomId}</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 bg-primary rounded-full animate-pulse"></div>
                </div>
                <p className="text-base-content/70">
                  Waiting for word #{currentWordIndex}
                </p>
              </div>

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
                  disabled={!guess.trim()}
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
                      Your Rank: {playerRank} of {players.length}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  {players.map((player, index) => (
                    <div
                      key={player.id}
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
                      <span className="font-bold">{player.score}</span>
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
