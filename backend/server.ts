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
} from "./types";
import { SubmitGuess } from "./types/dto/SubmitGuess";
import { SubmitWords } from "./types/dto/SubmitWords";

const app = express();
const port = 5500;
const server = app.listen(port);
const io = new Server(server, {
  cors: {
    origin: "*", // or '*' for all origins (not recommended in prod)
    methods: ["GET", "POST"],
  },
});

/**
 * Takes in a player from the spelling bee game, and modifies it for JSON.stringify.
 * @param player - The player to modify for stringification.
 * @returns The modified player.
 */
const modifyPlayerForStringify = (
  player: Player
): Omit<Player, "guesses"> & { guesses: Array<string> } => {
  const { guesses, ...rest } = player;

  if (guesses !== undefined) {
    const convertedGuesses = [...guesses.values()];
    return { ...rest, guesses: convertedGuesses };
  }

  return { ...rest, guesses: [] };
};

const rooms: Rooms = {};
let players = {};
let spellingBeeWords = [];

const connected = (socket: Socket) => {
  // this method will store new player id to players object variable
  // socket.on("newPlayer", (data) => {
  //   players[socket.id] = data;
  //   Object.entries(players).forEach(([socketId, player]) => {
  //     console.log(`Player Info: ID: ${socketId}, Name: ${player.playerName}`);
  //   });
  //   console.log("Total Number of players: " + Object.keys(players).length);
  // });

  socket.on("joinRoom", (data: JoinRoomData) => {
    const { code, player } = data;
    if (code in rooms) {
      const { isHost, ...rest } = player;
      rooms[code].players.push({
        ...rest,
        idNumber: rooms[code].players.length,
        isHost: false,
        guesses: new Set<string>(),
      });
    }

    socket.broadcast.emit(`${code}_playerJoined`, player);
  });

  socket.on("createRoom", (data: CreateRoomData) => {
    const { code, host } = data;

    if (!(code in rooms)) {
      rooms[code] = {
        host,
        players: [],
        words: new Set<string>(),
      };
    }
  });

  socket.on("submitWords", (data: SubmitWords, callback) => {
    const { roomId, words } = data;

    if (roomId !== undefined && words !== undefined && roomId in rooms) {
      // TODO: convert to set concatenation
      for (const eachWord of words) {
        rooms[roomId].words.add(eachWord);
      }

      console.log(rooms[roomId]);
      callback(JSON.stringify([...rooms[roomId].words.values()]));
    }
  });

  socket.on("guessWord", (data: SubmitGuess, callback) => {
    const { playerIdNumber, guess, roomId } = data;

    if (
      playerIdNumber !== undefined &&
      guess !== undefined &&
      guess.trim().length > 0 &&
      roomId !== undefined
    ) {
      const foundPlayerIndex = rooms[roomId].players.findIndex(
        (eachPlayer) => eachPlayer.idNumber === playerIdNumber
      );
      if (foundPlayerIndex !== -1) {
        const foundPlayer = rooms[roomId].players[foundPlayerIndex];
        if (foundPlayer?.guesses !== undefined) {
          foundPlayer.guesses.add(guess);
          // TODO: remove intersection in place of manual intersection
          foundPlayer.score = rooms[roomId].words.intersection(
            foundPlayer.guesses
          ).size;

          /** Update the room */
          rooms[roomId].players[foundPlayerIndex] = foundPlayer;
          callback(
            JSON.stringify(
              rooms[roomId].players.map((eachPlayer) =>
                modifyPlayerForStringify(eachPlayer)
              )
            )
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
