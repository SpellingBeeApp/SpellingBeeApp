// server
const express = require('express')
const app = express();
const port = 3000;
const server = app.listen(port)
const { Server } = require('socket.io');
let clientNo = 0;

const io = new Server(server, {
  cors: {
    origin: 'http://127.0.0.1:5500', // or '*' for all origins (not recommended in prod)
    methods: ['GET', 'POST'],
  }
});
let players = {}
let spellingBeeWords = []

const connected = (socket) => {

  // multiple rooms for socket 
  // increment client number once client is added
  clientNo++;
  // once user joins add him to room (clientno/2 for now) 
  // we want to get room number from endpoint and add user to that room. Once game is over clean out data in room
  socket.join(Math.round(clientNo / 2))

  // once client is logged in send the room number to client
  socket.emit('serverMsg', Math.round(clientNo / 2))

  // once the button is pressed, we send the client room and io.to will send a message to all the clients in the room. This is for host
  socket.on('buttonPressed', (clientRoom) => {
    io.to(clientRoom).emit('switchFromServer')
  })


  // this method will store new player id to players object variable
  socket.on('newPlayer', (data) => {
    players[socket.id] = data
    Object.entries(players).forEach(([socketId, player]) => {
      console.log(`Player Info: ID: ${socketId}, Name: ${player.playerName}`);
    })
    console.log("Total Number of players: " + Object.keys(players).length)

  })

  // this method disconnects client once browser is changed, or connection is cut. this is a built in callback method from socketio.
  // socket.on('disconnect', ()=>{

  //   if (players[socket.id]) {
  //     console.log("Good bye, " + players[socket.id].playerName);
  //     delete players[socket.id];
  //     console.log("Current number of players: " + Object.keys(players).length);
  // }
  // })

  // this middleware will render what the client spelled and submitted
  socket.on('clientSubmitWord', (data) => {
    players[socket.id].words.push(data)
    console.log("Client word is: " + data + "; " + players[socket.id].playerName + " total words entered are: ")
    players[socket.id].words.forEach(word => console.log(word))


    //players[socket.id].words.push(data)
  })

  // this method will listen to the request from the middleware named: clientoclient 
  socket.on('clientToClient', (data) => {
    // once we get a request, we want to broadcast a response to all clients
    socket.broadcast.emit("serverToClient", data)
  })

  // store host words to spellingBeeWords array
  socket.on('hostSpellingWords', (data) => {
    spellingBeeWords = data;
  })

  // listening for host to prompt user to enter word
  socket.on('nextWord', () => {
    console.log("next word")
    socket.broadcast.emit('changeWord')
  })


  socket.on('getScore', () => {
    Object.entries(players).forEach(([socketId, player]) => {
      // console.log(`Player Info: ID: ${socketId}, Name: ${player.playerName}` );
      player.words.forEach((word, index) => word === spellingBeeWords[index] ? player.correctAmount += 1 : player.wrongAmount -= 1)
      player.finalScore = (player.correctAmount / player.words.length) * 100;
      console.log(`${player.playerName} final score is: ` + player.finalScore)
    })
  })

}


io.on('connection', connected)

