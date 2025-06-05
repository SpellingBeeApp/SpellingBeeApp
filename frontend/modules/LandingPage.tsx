"use client";

/**
 * @file The client side Landing Page component where you can either create a room or join a room
 */

import { useRouter } from "next/navigation";
import React from "react";
import Image from "next/image";
import useSocket from "@/hooks/useSocket";
import { CreateRoomData } from "@/types/dto/CreateRoomData";
import { JoinRoomData } from "@/types/dto/JoinRoomData";
import { AnimatePresence, motion } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = React.useState("");
  const [roomCode, setRoomCode] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("create");
  const { socket } = useSocket("http://localhost:5000");

  /**
   * creates a room for the spelling bee
   * @returns void
   */
  const createRoom = () => {
    /**
     * checks to make sure name isnt empty
     */
    if (!playerName.trim()) {
      alert("Please enter your name to create a room");
      return;
    }

    /**
     * generates room code (NOT ENTIRELY UNIQUE AND THERE IS A CHANCE DUPLICATES COULD BE GENERATED. SHOULD CHANGE IN FUTURE)
     */
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let newRoomCode = "";
    for (let i = 0; i < 6; i++) {
      newRoomCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    /**
     * sets player's name and makes them Host
     */
    localStorage.setItem("playerName", playerName);
    localStorage.setItem("isHost", "true");

    /**
     * the payload we will emit to the "createRoom" listener in the server
     * consists of the Room Code and the host which is a Player object with id of -1, name, and isHost boolean set to true
     */
    const payload: CreateRoomData = {
      code: newRoomCode,
      host: {
        idNumber: -1,
        name: playerName,
        isHost: true,
      },
    };

    /**
     * emitting the payload to the "createRoom" listener in the server
     */
    socket?.emit("createRoom", payload);

    /**
     * redirecting them to the created room
     */
    router.push(`/room/${newRoomCode}/host`);
  };

  /**
   * joins an already created Room by supplying the room code
   * @returns void
   */
  const joinRoom = () => {
    /**
     * checks to make sure name isnt empty
     */
    if (!playerName.trim()) {
      alert("Please enter your name to join a room");
      return;
    }

    /**
     * checks to make sure room code isnt empty
     */
    if (!roomCode.trim()) {
      alert("Please enter a room code to join");
      return;
    }

    /**
     * sets player name and isHost boolean to false
     */
    localStorage.setItem("playerName", playerName);
    localStorage.setItem("isHost", "false");

    /**
     * the payload we will emit to the "joinRoom" listener in the server
     * consists of the roomCode and the player object with their name n score set to 0
     */
    const payload: JoinRoomData = {
      code: roomCode,
      player: { name: playerName, score: 0 },
    };

    /**
     * emitting the payload to the "joinRoom" listener in the server
     */
    socket?.emit("joinRoom", payload, (result: boolean) => {
      if (result) {
        router.push(`/room/${roomCode}/play`);
      } else {
        alert(
          `Player ${playerName} already exists in room ${roomCode}. Please pick another name.`
        );
      }
    });

    // /**
    //  * pushing the player to the room with the room code they supplied (TODO: check to see room actually exists)
    //  */
    // router.push(`/room/${roomCode}/play`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 honeycomb-bg">
      <motion.div
        layout
        className="overflow_hidden transition-all"
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="card w-96 bg-base-100 shadow-xl transition-all duration-500 ease-in-out animate-fade overflow-hidden">
          <div className="card-body">
            <div className="flex justify-center mb-4">
              <div className="relative animate__animated animate__bounce">
                <Image
                  alt="Scripps Spelling Bee Logo"
                  src="\logo.svg"
                  width={200}
                  height={300}
                />
              </div>
            </div>
            <p className="text-center text-base-content/70 animate-fade">
              Create or join a spelling competition
            </p>

            <div className="tabs tabs-bordered grow justify-center my-4 animate-fade">
              <a
                className={`tab ${activeTab === "join" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("join")}
              >
                Join a Room
              </a>
              <a
                className={`tab ${activeTab === "create" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("create")}
              >
                Create a Room
              </a>
            </div>

            <div className="space-y-4 animate-fade-right">
              <div className="form-control transition-all">
                <label className="label">
                  <span className="label-text">Your Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="input input-bordered w-full"
                  value={playerName}
                  maxLength={20}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "join" && (
                  <motion.div
                    key="room-code"
                    className="form-control"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <label className="label">
                      <span className="label-text">Room Code</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter room code"
                      className="input input-bordered w-full"
                      value={roomCode}
                      onChange={(e) =>
                        setRoomCode(e.target.value.toUpperCase())
                      }
                      maxLength={6}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                className={`btn btn-primary w-full transform duration-700 ease-in-out ${
                  activeTab === "join" ? "" : "btn-secondary"
                }`}
                onClick={activeTab === "join" ? joinRoom : createRoom}
              >
                {activeTab === "join" ? "Join Room" : "Create New Room"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
