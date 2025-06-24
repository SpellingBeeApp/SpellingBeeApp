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
import { ActivityLog } from "./HostRoom/ActivityLog";
import CSVReader from "./HostRoom/CSVReader";
import { UploadWordListEvent } from "@/types/event/UploadWordlistEvent";
import { EVENTS } from "@/common/constants/Events";

export default function HostRoom({ params }: { params: { roomId: string } }) {
  const router = useRouter();
  const textAreaInputReference = React.useRef<HTMLTextAreaElement | null>(null);
  const [playerName, setPlayerName] = React.useState("");
  const [currentWordIndex, setCurrentWordIndex] = React.useState(-1);
  const [activeTab, setActiveTab] = React.useState("players");
  const roomId = params.roomId;
  const { emit, on } = useSocket("http://localhost:5000");
  const [room, setRoom] = React.useState<Room>();

  /**
   * Callback that fires when the `wordFileUpload` event fires.
   */
  const onWordListUpload = React.useCallback((event: Event) => {
    const customEvent = event as CustomEvent<UploadWordListEvent>;
    const { detail } = customEvent;

    if (detail !== undefined) {
      const { words } = detail;

      const wordListReference = textAreaInputReference.current;

      if (wordListReference !== null) {
        wordListReference.value = words
          .map((eachWord) => `${eachWord}`)
          .join("\n");
      }
    }
  }, []);

  /**
   * Reacting to a change in `roomId` or `on`.
   *
   * Listens for the specific roomId modify event.
   * This will update or "modify" the room when anything changes.
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

  React.useEffect(() => {
    if (document !== undefined) {
      document.addEventListener(EVENTS.wordFileUpload, onWordListUpload);
    }

    return () => {
      document.removeEventListener(EVENTS.wordFileUpload, onWordListUpload);
    };
  }, [onWordListUpload]);

  /**
   * Emitting the `getRoom` listener and receiving the room content in the callback.
   */
  React.useEffect(() => {
    if (roomId !== undefined && emit !== undefined) {
      emit("getRoom", roomId, (room: Room) => {
        setRoom(room);
      });
    }
  }, [emit, roomId]);

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
    const currentRef = textAreaInputReference.current;

    if (currentRef === null) {
      return;
    }

    const wordListText = currentRef.value;

    /**
     * Checks if `wordListText` is empty, ensuring the user does not submit an empty word list.
     */
    if (wordListText.trim().length === 0) {
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
     * check again to make sure word list contains an element
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
    emit("submitWords", payload);
  };

  const endGame = React.useCallback(() => {
    emit("modifyRoom", roomId, playerName, {
      ...room,
      wordIndex: (room?.wordIndex ?? 0) + 1,
      status: RoomStatus.ENDED,
    } as Partial<Room>);
  }, [emit, playerName, room, roomId]);

  /**
   * used with the "Next Word" button to advance through the word list
   * @returns the next index in the word list
   */
  const nextWord = () => {
    /**
     * check to make sure the word list isn't empty
     */
    if (room?.words.length === 0) {
      alert("Please submit a word list first!");
      return;
    }

    /**
     * setting the current word index in the word list
     */
    setCurrentWordIndex((previousWordIndex) => {
      /**
       * the payload is a "Partial" Room only using the wordIndex
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
      } else if (previousWordIndex === room?.words.length) {
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

  if (room === undefined) {
    return <span className="hidden" />;
  }

  const { words } = room;

  return (
    <div className="min-h-screen p-4 md:p-6 honeycomb-bg">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 transition-all duration-500 ease-in-out">
          <div className="animate__animated animate__fadeInLeft md:animate-fade">
            <Image
              alt="Scripps Spelling Bee Logo"
              src="\logo.svg"
              width={200}
              height={300}
            />
            <p className="text-base-content/70">Host View</p>
          </div>

          <div className="flex gap-2 animate-fade-right md:animate-fade">
            <div className="badge badge-outline gap-2 mt-1">
              <Users className="h-4 w-4" />
              {room === undefined ? 0 : room.players.length} players
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up md:animate-fade">
          <div className="lg:col-span-2 space-y-6">
            {currentWordIndex === -1 ? (
              <div className="card bg-base-100 shadow-xl animate-fade">
                <div className="card-body">
                  <h2 className="card-title">Word List</h2>
                  <textarea
                    placeholder="Enter your word list (one word per line or comma-separated)"
                    className="textarea textarea-bordered font-mono h-40"
                    ref={textAreaInputReference}
                  />
                  <div className="card-actions justify-between">
                    <button
                      className="btn btn-primary"
                      onClick={submitWordList}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Submit Words
                    </button>
                    {(room?.words.length ?? 0) > 0 && (
                      <button className="btn btn-secondary" onClick={nextWord}>
                        Start Game
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </button>
                    )}
                    <div className="hover:cursor-pointer">
                      <CSVReader />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl font-bold">
                      {room.words[currentWordIndex]}
                    </h2>
                    <p className="text-base-content/70">
                      Word {currentWordIndex + 1} of {room?.words.length}
                    </p>
                  </div>

                  <div className="card-actions justify-between mt-6">
                    <button
                      className="btn btn-primary"
                      onClick={nextWord}
                      disabled={
                        currentWordIndex >= (room?.words.length ?? 1) - 1
                      }
                    >
                      Next Word
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </button>

                    {room.status === undefined ||
                    room.wordIndex === undefined ? (
                      <></>
                    ) : (
                      <button
                        className="btn btn-error"
                        disabled={
                          room.wordIndex + 1 < room.words.length ||
                          room.status === RoomStatus.ENDED
                        }
                        onClick={endGame}
                      >
                        End Game
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="card bg-base-100 shadow-xl animate-fade-up md:animate-fade">
              <div className="card-body">
                <h2 className="card-title">Activity Log</h2>
                <div className="h-[300px] overflow-y-auto">
                  {room.activities?.length === 0 ? (
                    <p className="text-center text-base-content/70">
                      No activity yet
                    </p>
                  ) : (
                    room.activities?.map((eachActivity, activity_index) => (
                      <ActivityLog
                        activity={eachActivity}
                        key={`activity_index_${activity_index}`}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="animate-fade">
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
                    {room?.players.map((player, index) => (
                      <div
                        key={`${player.name}-${index}`}
                        className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                      >
                        <span className="font-medium">{player.name}</span>
                        <span className="font-bold">{`${player.score}%`}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {(room?.words.length ?? 0) > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-base-content/70">
                          {room?.words.length} words in list
                        </p>
                        <div className="max-h-96 overflow-y-auto space-y-2">
                          {room?.words.map((word, index) => (
                            <div
                              key={index}
                              className={`flex justify-center p-2 bg-base-200 rounded-lg ${
                                index === room.wordIndex ? "bg-gray-400/50" : ""
                              }`}
                            >
                              <span
                                className={`font-medium ${
                                  index === room.wordIndex ? "!font-bold" : ""
                                }`}
                              >
                                {word}
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
