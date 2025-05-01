// server

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
  socket.on("joinRoom", (data: JoinRoomData) => {
    const { code, player } = data;
    if (code in rooms) {
      const { isHost, ...rest } = player;
      rooms[code].players.push({
        ...rest,
        idNumber: rooms[code].players.length,
        isHost: false,
        guesses: new Set<string>(),
        roundGuesses: new Set<number>(),
      });
      socket.broadcast.emit(
        `room_${code}_modified`,
        modifyRoomForStringify(rooms[code])
      );
    }

    socket.broadcast.emit(
      `${code}_playerJoined`,
      modifyPlayerForStringify(player)
    ); // for host
  });

  socket.on("getRoom", (code: RoomCode, callback) => {
    if (code in rooms) {
      callback(rooms[code]);
    }
  });

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

  socket.on("submitWords", (data: SubmitWords, callback) => {
    const { roomId, words } = data;

    if (roomId !== undefined && words !== undefined && roomId in rooms) {
      // TODO: convert to set concatenation (ie union)
      for (const eachWord of words) {
        rooms[roomId].words.add(eachWord);
      }

      callback(JSON.stringify([...rooms[roomId].words.values()]));
    }
  });

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
   * IF YOU WANT ON-->EMIT, SUPPLY (data, CALLBACK) as the argument.
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

  // this method will store new player id to players object variable
  // socket.on("newPlayer", (data) => {
  //   players[socket.id] = data;
  //   Object.entries(players).forEach(([socketId, player]) => {
  //     console.log(`Player Info: ID: ${socketId}, Name: ${player.playerName}`);
  //   });
  //   console.log("Total Number of players: " + Object.keys(players).length);
  // });
  // this method disconnects client once browser is changed, or connection is cut. this is a built in callback method from socketio.
  // socket.on('disconnect', ()=>{

  //   if (players[socket.id]) {
  //     console.log("Good bye, " + players[socket.id].playerName);
  //     delete players[socket.id];
  //     console.log("Current number of players: " + Object.keys(players).length);
  // }
  // })

  // this middleware will render what the client spelled and submitted
  // socket.on("clientSubmitWord", (data) => {
  //   if (socket.id in players) {
  //     players[socket.id].words.push(data);
  //     console.log(
  //       "Client word is: " +
  //         data +
  //         "; " +
  //         players[socket.id].playerName +
  //         " total words entered are: "
  //     );
  //     players[socket.id].words.forEach((word) => console.log(word));
  //   }

  //   //players[socket.id].words.push(data)
  // });

  // // this method will listen to the request from the middleware named: clientoclient
  // socket.on("clientToClient", (data) => {
  //   // once we get a request, we want to broadcast a response to all clients
  //   socket.broadcast.emit("serverToClient", data);
  // });

  // // store host words to spellingBeeWords array
  // socket.on("hostSpellingWords", (data) => {
  //   spellingBeeWords = data;
  // });

  // // listening for host to prompt user to enter word
  // socket.on("nextWord", () => {
  //   console.log("next word");
  //   socket.broadcast.emit("changeWord");
  // });

  // socket.on("getScore", () => {
  //   Object.entries(players).forEach(([socketId, player]) => {
  //     // console.log(`Player Info: ID: ${socketId}, Name: ${player.playerName}` );
  //     player.words.forEach((word, index) =>
  //       word === spellingBeeWords[index]
  //         ? (player.correctAmount += 1)
  //         : (player.wrongAmount -= 1)
  //     );
  //     player.finalScore = (player.correctAmount / player.words.length) * 100;
  //     console.log(`${player.playerName} final score is: ` + player.finalScore);
  //   });
  // });
};

io.on("connection_error", (err) => {
  console.log(err.req); // the request object
  console.log(err.code); // the error code, for example 1
  console.log(err.message); // the error message, for example "Session ID unknown"
  console.log(err.context); // some additional error context
});
io.on("connection", connected);
