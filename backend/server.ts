// server

/**
 * @file the express server using socket.io
 */

import express from "express";
import { Server, Socket } from "socket.io";
import type {
  Rooms,
  CreateRoomData,
  JoinRoomData,
  GetPlayers,
  Player,
  Room,
  RoomCode,
} from "./types";
import { SubmitGuess } from "./types/dto/SubmitGuess";
import { SubmitWords } from "./types/dto/SubmitWords";
import { RoomStatus } from "./common/enum";
import { modifyPlayerForStringify } from "./helpers/modifyPlayerForStringify";
import { isPlayerInRoom } from "./helpers/isPlayerInRoom";
import { modifyRoomForStringify } from "./helpers/modifyRoomForStringify";

const app = express();
const port = 5500;
const server = app.listen(port);
const io = new Server(server, {
  cors: {
    origin: "*", // or '*' for all origins (not recommended in prod)
    methods: ["GET", "POST"],
  },
});

const rooms: Rooms = {};

const connected = (socket: Socket) => {
  /**
   * listener for "joinRoom"
   * handles when players join the room
   */
  socket.on("joinRoom", (data: JoinRoomData) => {
    /**
     * destructuring data
     */
    const { code, player } = data;
    /** checks if code exists in rooms Record ("sort of like a dictionary") */
    if (code in rooms) {
      /**
       * de-structures player joining so we can set isHost to false
       */
      const { isHost, ...rest } = player;

      /**
       * access the key in rooms with the RoomCode and push the player to the players list
       * the idNumber will be their index in the list
       * the guesses is a Set for faster score calculation (I hope they dont include duplicates during the same spelling bee)
       * the round guesses is a Set where it will increment and correspond to the word index ensuring you only get one guess per round (same rules as the participants in real life)
       */
      rooms[code].players.push({
        ...rest,
        idNumber: rooms[code].players.length,
        isHost: false,
        guesses: new Set<string>(),
        roundGuesses: new Set<number>(),
      });

      /**
       * emit to the "room_{ROOMID}_modified" listener for EVERY client tht the room was updated
       */
      socket.broadcast.emit(
        `room_${code}_modified`,
        modifyRoomForStringify(rooms[code])
      );
    }

    /**
     * emits to the "{roomID}_playerJoined" listener
     * same thing as above but makes sure the player list updates for the host as well
     */
    socket.broadcast.emit(
      `${code}_playerJoined`,
      modifyPlayerForStringify(player)
    ); // for host
  });

  /**
   * gets the Room data
   * listener for "getRoom"
   */
  socket.on("getRoom", (code: RoomCode, callback) => {
    if (code in rooms) {
      callback(modifyRoomForStringify(rooms[code]));
    }
  });

  /**
   * listener for "modifyRoom"
   * this updates the Room data so every client has the most up-to-date "Room" data
   */
  socket.on(
    "modifyRoom",
    (code: RoomCode, playerName: string, partialRoom: Partial<Room>) => {
      const doesPlayerExist = isPlayerInRoom(playerName, code, rooms, true);

      if (doesPlayerExist) {
        rooms[code] = { ...rooms[code], ...partialRoom };
        const { host, ...rest } = rooms[code];
        socket.broadcast.emit(
          `room_${code}_modified`,
          modifyRoomForStringify({ ...rest } as Room)
        );
      }
    }
  );

  /**
   * listener for the "createRoom"
   * creates a room
   */
  socket.on("createRoom", (data: CreateRoomData) => {
    const { code, host } = data;

    if (!(code in rooms)) {
      rooms[code] = {
        host,
        players: [],
        status: RoomStatus.CREATED,
        words: new Set<string>(),
        wordIndex: -1,
      };
    }
  });

  /**
   * listener for "submitWords"
   * handles when the host submits a word list for the room
   */
  socket.on("submitWords", (data: SubmitWords, callback) => {
    const { roomId, words } = data;

    console.log(data);

    if (roomId !== undefined && words !== undefined && roomId in rooms) {
      // TODO: convert to set concatenation (ie union)
      for (const eachWord of words) {
        rooms[roomId].words.add(eachWord);
      }

      callback(JSON.stringify([...rooms[roomId].words.values()]));
    }
  });

  /**
   * listener for "guessWords"
   * handles when players guess the current word
   */
  socket.on("guessWord", (data: SubmitGuess) => {
    const { playerName, guess, roomId } = data;
    /**
     * - Checking if playerId is valid.
     * - If guess is valid.
     * - If roomId is valid.
     */
    if (
      playerName !== undefined &&
      guess !== undefined &&
      guess.trim().length > 0 &&
      roomId !== undefined
    ) {
      /**
       * Finding the index of the player.
       */
      const foundPlayerIndex = rooms[roomId].players.findIndex(
        (eachPlayer) => eachPlayer.name === playerName
      );

      /**
       * If the player is not the host, then add to their guesses, and update their score.
       */
      if (foundPlayerIndex !== -1) {
        const foundPlayer = rooms[roomId].players[foundPlayerIndex];
        if (
          foundPlayer?.guesses !== undefined &&
          rooms[roomId].wordIndex !== undefined
        ) {
          /** If player has already guessed for this round. */
          if (
            roomId in rooms &&
            foundPlayer.roundGuesses.has(rooms[roomId].wordIndex)
          ) {
            return;
          }

          foundPlayer.guesses.add(guess);
          foundPlayer.roundGuesses.add(rooms[roomId].wordIndex);

          console.log(foundPlayer.guesses.values());

          const numberCorrect = [...rooms[roomId].words.values()].filter(
            (eachWord) => foundPlayer.guesses?.has(eachWord)
          ).length;

          const score =
            numberCorrect /
            (rooms[roomId].wordIndex === undefined
              ? 1
              : rooms[roomId].wordIndex + 1);
          foundPlayer.score = Math.round(score * 100);

          /** Update the room */
          rooms[roomId].players[foundPlayerIndex] = foundPlayer;
          /** listener for "room_${roomId}_modified" is found in PlayerRoom.tsx */
          socket.broadcast.emit(
            `room_${roomId}_modified`,
            modifyRoomForStringify(rooms[roomId])
          );
          socket.emit(
            `room_${roomId}_modified`,
            modifyRoomForStringify(rooms[roomId])
          );
        }
      }
    }
  });

  /**
   * listener for "getPlayers"
   * handles fetching the players for the room
   * the callback ensures every player is updated so every player sees the other updated players
   *
   * IF YOU WANT ON-->EMIT, supply (data, CALLBACK) as the argument.
   * call `callback` with whatever data you were expecting in the front-end.
   * https://socket.io/docs/v3/emitting-events/#acknowledgements
   */
  socket.on("getPlayers", (data: GetPlayers, callback) => {
    const { code } = data;

    if (code in rooms) {
      callback(
        JSON.stringify(
          rooms[code].players.map((eachPlayer) =>
            modifyPlayerForStringify(eachPlayer)
          )
        )
      );
    }
  });
};

io.on("connection_error", (err) => {
  console.log(err.req); // the request object
  console.log(err.code); // the error code, for example 1
  console.log(err.message); // the error message, for example "Session ID unknown"
  console.log(err.context); // some additional error context
});
io.on("connection", connected);
