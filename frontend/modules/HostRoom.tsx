"use client";

/**
 * @file The Host Room client side component
 */

import { useRouter } from "next/navigation";
import React from "react";
import { ArrowRight, Check, Copy, List, Users } from "lucide-react";
import Image from "next/image";
import useSocket from "@/hooks/useSocket";
import { SubmitWords } from "@/types/dto/SubmitWords";
import { Room } from "@/types";
import { RoomStatus } from "@/common/enum";

type Player = {
  id: string;
  name: string;
  score: number;
};

export default function HostRoom({ params }: { params: { roomId: string } }) {
  const router = useRouter();
  const [playerName, setPlayerName] = React.useState("");
  const [wordListText, setWordListText] = React.useState("");
  const [words, setWords] = React.useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = React.useState(-1);
  const [activeTab, setActiveTab] = React.useState("players");
  const roomId = params.roomId;
  const { emit, on } = useSocket("http://localhost:5500");
  const [players, setPlayers] = React.useState<Player[]>([]);

  /**
   * listening for new players that join and adding them to the rooms player list
   */
  React.useEffect(() => {
    if (on !== undefined) {
      on(`${roomId}_playerJoined`, (newPlayer: Player) => {
        setPlayers((oldPlayers: Player[]) => [...oldPlayers, newPlayer]);
      });
    }
  }, [on, roomId]);

  /**
   * set players name from name provided in localstorage
   */
  React.useEffect(() => {
    const storedName = localStorage.getItem("playerName") || "";
    const isHost = localStorage.getItem("isHost") === "true";

    if (!storedName || !isHost) {
      router.push("/");
      return;
    }

    setPlayerName(storedName);
  }, [router]);

  /**
   * handles submitting word list for players to guess
   * @returns void
   */
  const submitWordList = () => {
    /**
     * makes sure they dont submit an empty list
     */
    if (!wordListText.trim()) {
      alert("Please enter at least one word");
      return;
    }

    /**
     * separates list by line breaks or commas and ensures words are at least one character
     */
    const wordList = wordListText
      .split(/[\n,]/)
      .map((word) => word.trim())
      .filter((word) => word.length > 0);

    /**
     * check again to make sure word list isnt empty
     */
    if (wordList.length === 0) {
      alert("Please enter at least one word!");
      return;
    }

    /**
     * the payload we will emit to the server consisting of the roomId and the word list
     */
    const payload: SubmitWords = {
      roomId,
      words: wordList,
    };

    /**
     * emitting the word list to the "submitWords" listener
     */
    emit("submitWords", payload, (updatedWordList: string) => {
      setWords(JSON.parse(updatedWordList) as string[]);
    });
  };

  /**
   * used with the "Next Word" button to advance through the word list
   * @returns the next index in the word list
   */
  const nextWord = () => {
    /**
     * check to make sure the word list isn't empty
     */
    if (words.length === 0) {
      alert("Please submit a word list first!");
      return;
    }

    /**
     * setting the current word index in the word list
     */
    setCurrentWordIndex((previousWordIndex) => {
      /**
       * the payload is a "Partial" Room only using the wordIndex and room status fields
       * when emitted we will increment the index by 1
       */
      const payload: Partial<Room> = {
        wordIndex: previousWordIndex + 1,
      };

      /**
       * if the index is -1 we will start the game switching the display to say waiting for word#1
       * once it reaches the length of the word list (the last index) the game is over
       * TODO: when game ends we will then display the scoreboard
       */
      if (previousWordIndex === -1) {
        payload.status = RoomStatus.STARTED;
      } else if (previousWordIndex === words.length) {
        payload.status = RoomStatus.ENDED;
      }

      /**
       * emit to the "modifyRoom" listener with the roomId, hostName, and payload above
       * this will only update the corresponding room
       */
      emit("modifyRoom", roomId, playerName, payload);

      /**
       * increment the word list index
       */
      return previousWordIndex + 1;
    });
  };

  /**
   * copies the room code for the host to share easier
   */
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    alert("Room code copied to clipboard");
  };

  /**TODO: Need to get player scores to update properly for host and implement activity log */

  return (
    <div className="min-h-screen p-4 md:p-6 honeycomb-bg">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <Image
              alt="Scripps Spelling Bee Logo"
              src="\logo.svg"
              width={200}
              height={300}
            />
            <p className="text-base-content/70">Host Room</p>
          </div>

          <div className="flex gap-2">
            <div className="badge badge-outline gap-2 mt-1">
              <Users className="h-4 w-4" />
              {players.length} players
            </div>
            <div className="flex items-center gap-2">
              <div className="badge badge-secondary gap-2 mb-1">
                Room: {roomId}
              </div>
              <button
                className="btn btn-ghost btn-square btn-sm"
                onClick={copyRoomCode}
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {currentWordIndex === -1 ? (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Word List</h2>
                  <textarea
                    placeholder="Enter your word list (one word per line or comma-separated)"
                    className="textarea textarea-bordered font-mono h-40"
                    value={wordListText}
                    onChange={(e) => setWordListText(e.target.value)}
                  />
                  <div className="card-actions justify-between">
                    <button
                      className="btn btn-primary"
                      onClick={submitWordList}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Submit Words
                    </button>
                    {words.length > 0 && (
                      <button className="btn btn-secondary" onClick={nextWord}>
                        Start Game
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl font-bold">
                      {words[currentWordIndex]}
                    </h2>
                    <p className="text-base-content/70">
                      Word {currentWordIndex + 1} of {words.length}
                    </p>
                  </div>

                  <div className="card-actions justify-between mt-6">
                    <button
                      className="btn btn-primary"
                      onClick={nextWord}
                      disabled={currentWordIndex >= words.length - 1}
                    >
                      Next Word
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </button>

                    <button className="btn btn-error">End Game</button>
                  </div>
                </div>
              </div>
            )}

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Activity Log</h2>
                <div className="h-[300px] overflow-y-auto">
                  <p className="text-center text-base-content/70">
                    No activity yet
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="tabs tabs-bordered justify-center mb-4">
              <a
                className={`tab ${activeTab === "players" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("players")}
              >
                <Users className="h-4 w-4 mr-2" />
                Players
              </a>
              <a
                className={`tab ${activeTab === "words" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("words")}
              >
                <List className="h-4 w-4 mr-2" />
                Words
              </a>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                {activeTab === "players" ? (
                  <div className="space-y-2">
                    {players.map((player, index) => (
                      <div
                        key={`${player.name}-${index}`}
                        className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                      >
                        <span className="font-medium">
                          {index + 1}. {player.name}
                        </span>
                        <span className="font-bold">{`${player.score}%`}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {words.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-base-content/70">
                          {words.length} words in list
                        </p>
                        <div className="max-h-96 overflow-y-auto space-y-2">
                          {words.map((word, index) => (
                            <div
                              key={index}
                              className="flex justify-between p-2 bg-base-200 rounded-lg"
                            >
                              <span className="font-medium">{word}</span>
                              <span className="text-base-content/70">
                                #{index + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-base-content/70">
                        No words submitted yet
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
