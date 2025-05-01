import { useEffect, useRef, useState, useCallback } from "react";
import io, { ManagerOptions, Socket, SocketOptions } from "socket.io-client";

type Callback = (..._args: any[]) => void;

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
    (event: string, data: unknown, ackFunc?: Callback) => {
      if (socket) {
        if (ackFunc !== undefined) {
          socket.emit(event, data, ackFunc);
        } else {
          socket.emit(event, data);
        }
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
