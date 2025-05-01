import { useEffect, useRef, useState, useCallback } from "react";
import io, { ManagerOptions, Socket, SocketOptions } from "socket.io-client";

type SocketCallback = (..._args: any[]) => void;

function useSocket(
  url: string,
  options?: Partial<ManagerOptions & SocketOptions>
) {
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    // Initialize socket connection
    const socketIo = io(url, options);

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [url, options]);

  // Function to emit messages
  const emit = useCallback(
    (event: string, data: unknown) => {
      if (socket) {
        socket.emit(event, data);
      }
    },
    [socket]
  );

  // Function to subscribe to an event
  const on = useCallback(
    (event: string, func: SocketCallback) => {
      if (socket) {
        console.log("setting listener for ", event);
        socket.on(event, func);

        return () => {
          console.log("cleaning");
          socket.off(event, func); // Return a cleanup function
        };
      }
    },
    [socket]
  );

  return { socket, emit, on };
}

export default useSocket;
