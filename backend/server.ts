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
import { ActivityType, RoomStatus } from "./common/enum";
import { convertPlayerSetsToArrays } from "./helpers/convertPlayerSetsToArrays";
import { isPlayerInRoom } from "./helpers/isPlayerInRoom";
import { convertRoomSetsToArrays } from "./helpers/convertRoomSetsToArrays";
import { createActivity } from "./helpers/createActivity";
import { isGuessRight } from "./helpers/isGuessRight";

const app = express();
const port = 5000;
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
  socket.on("joinRoom", (data: JoinRoomData, callback) => {
    /**
     * destructuring data
     */
    const { code, player } = data;
    /** checks if code exists in rooms Record ("sort of like a dictionary") */
    if (code in rooms) {
      /**
       * stripping `isHost` from the `player` object, and setting `rest` to the remainder of the object (player).
       * So we can set isHost to false
       */
      const { isHost, ...rest } = player;

      const doesPlayerExist = isPlayerInRoom(rest.name, code, rooms);

      if (doesPlayerExist) {
        callback(false);
        return;
      }

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
        guesses: [],
        roundGuesses: new Set<number>(),
      });

      /**
       * Adds an activity to the room.
       */
      rooms[code].activities.push(
        createActivity({
          isHost: false,
          playerName: rest.name,
          type: ActivityType.JOIN,
        })
      );

      /**
       * emit to the "room_{ROOMID}_modified" listener for EVERY client (but the sender) that the room was updated
       */
      socket.broadcast.emit(
        `room_${code}_modified`,
        convertRoomSetsToArrays(rooms[code])
      );

      callback(true);
    }
  });

  /**
   * gets the Room data
   * listener for "getRoom"
   */
  socket.on("getRoom", (code: RoomCode, callback) => {
    if (code in rooms) {
      callback(convertRoomSetsToArrays(rooms[code]));
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
          convertRoomSetsToArrays({ ...rest } as Room)
        );

        socket.emit(
          `room_${code}_modified`,
          convertRoomSetsToArrays(rooms[code])
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
        activities: [],
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
  socket.on("submitWords", (data: SubmitWords) => {
    const { roomId, words } = data;

    if (roomId !== undefined && words !== undefined && roomId in rooms) {
      // TODO: convert to set concatenation (ie union)
      for (const eachWord of words) {
        rooms[roomId].words.add(eachWord);
      }

      console.log(
        rooms[roomId].words,
        data,
        convertRoomSetsToArrays(rooms[roomId])
      );
      socket.emit(
        `room_${roomId}_modified`,
        convertRoomSetsToArrays(rooms[roomId])
      );
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

          foundPlayer.guesses.push(guess);
          foundPlayer.roundGuesses.add(rooms[roomId].wordIndex);

          const roomWords = [...rooms[roomId].words.values()];
          const numberCorrect = foundPlayer.guesses.filter(
            (eachPlayerGuess, eachPlayerGuessIndex) =>
              roomWords[eachPlayerGuessIndex] == eachPlayerGuess
          ).length;

          const score =
            numberCorrect /
            (rooms[roomId].wordIndex === undefined
              ? 1
              : rooms[roomId].wordIndex + 1);
          foundPlayer.score = Math.round(score * 100);

          const isPlayerGuessRight = isGuessRight(
            guess,
            rooms[roomId].words,
            rooms[roomId].wordIndex
          );

          /** Update the room */
          rooms[roomId].players[foundPlayerIndex] = foundPlayer;
          rooms[roomId].activities.push(
            createActivity({
              isHost: false,
              playerName: foundPlayer.name,
              type: isPlayerGuessRight
                ? ActivityType.GUESS_RIGHT
                : ActivityType.GUESS_WRONG,
              metadata: {
                guess,
                round: (rooms[roomId].wordIndex + 1).toString(),
              },
            })
          );

          /** listener for "room_${roomId}_modified" is found in PlayerRoom.tsx */
          socket.broadcast.emit(
            `room_${roomId}_modified`,
            convertRoomSetsToArrays(rooms[roomId])
          );
          socket.emit(
            `room_${roomId}_modified`,
            convertRoomSetsToArrays(rooms[roomId])
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
            convertPlayerSetsToArrays(eachPlayer)
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
