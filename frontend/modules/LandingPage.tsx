"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [activeTab, setActiveTab] = useState("join");

  const createRoom = () => {
    if (!playerName.trim()) {
      alert("Please enter your name to create a room");
      return;
    }

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let newRoomCode = "";
    for (let i = 0; i < 6; i++) {
      newRoomCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    localStorage.setItem("playerName", playerName);
    localStorage.setItem("isHost", "true");

    router.push(`/room/${newRoomCode}/host`);
  };

  const joinRoom = () => {
    if (!playerName.trim()) {
      alert("Please enter your name to join a room");
      return;
    }

    if (!roomCode.trim()) {
      alert("Please enter a room code to join");
      return;
    }

    localStorage.setItem("playerName", playerName);
    localStorage.setItem("isHost", "false");

    router.push(`/room/${roomCode}/play`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 honeycomb-bg">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Image
                alt="Scripps Spelling Bee Logo"
                src="\logo.svg"
                width={200}
                height={300}
              />
            </div>
          </div>
          <p className="text-center text-base-content/70">
            Create or join a spelling competition
          </p>

          <div className="tabs tabs-bordered grow justify-center my-4">
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

          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Your Name</span>
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                className="input input-bordered w-full"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>

            {activeTab === "join" && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Room Code</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter room code"
                  className="input input-bordered w-full uppercase"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
              </div>
            )}

            <button
              className={`btn btn-primary w-full ${
                activeTab === "join" ? "" : "btn-outline"
              }`}
              onClick={activeTab === "join" ? joinRoom : createRoom}
            >
              {activeTab === "join" ? "Join Room" : "Create New Room"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
