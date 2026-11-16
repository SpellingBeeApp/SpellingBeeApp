/* eslint-disable @typescript-eslint/no-explicit-any -- Disabled, needed for this generic hook. */
import { useEffect, useState, useCallback } from "react";
import io, { ManagerOptions, Socket, SocketOptions } from "socket.io-client";

type Callback = (..._args: any[]) => void;

function useSocket(
  url: string,
  options?: Partial<ManagerOptions & SocketOptions>
) {
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    // Always connect to the actual backend `url` — the old prod branch
    // assumed the frontend and backend were served from the same origin
    // (true for the single-VPS setup this app used to run on), which no
    // longer holds now that the frontend (Vercel) and backend (Render)
    // are on separate domains.
    // Polling must come first: listing "websocket" first makes the client
    // attempt a direct WebSocket upgrade with no prior handshake, which
    // Render's proxy (and most reverse proxies) drops. Starting with
    // polling establishes the engine.io session first, then upgrades to
    // a real WebSocket once that connection exists.
    const socketIo = io(url, {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      ...options,
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [url, options]);

  // Function to emit messages
  const emit = useCallback(
    (event: string, ...args: unknown[]) => {
      if (socket) {
        socket.emit(event, ...args);
      }
    },
    [socket]
  );

  // Function to subscribe to an event
  const on = useCallback(
    (event: string, func: Callback) => {
      if (socket) {
        socket.on(event, func);

        return () => {
          socket.off(event, func); // Return a cleanup function
        };
      }
    },
    [socket]
  );

  return { socket, emit, on };
}

export default useSocket;
