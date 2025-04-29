import { io, Socket } from "socket.io-client";

export type Player = {
  id: string;
  name: string;
  score: number;
};

export type Room = {
  id: string;
  hostId: string;
  players: Player[];
  words: string[];
  currentWordIndex: number;
  isActive: boolean;
};

let socket: Socket | null = null;

export const initSocket = () => {
  if (!socket) {
    // connect to external socket server here
    socket = io("http://your-socket-server:3000", {
      transports: ["websocket"],
      autoConnect: true,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
