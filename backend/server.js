// server
const express = require('express')
const app = express();
const port = 3000;
const server = app.listen(port)
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: 'http://127.0.0.1:5500', // or '*' for all origins (not recommended in prod)
    methods: ['GET', 'POST'],
  }
});
let players = {}
let spellingBeeWords = []

const connected = (socket) => {
  // this method will store new player id to players object variable
  socket.on('newPlayer', (data) => {
    players[socket.id] = data
    Object.entries(players).forEach(([socketId, player]) => {
      console.log(`Player Info: ID: ${socketId}, Name: ${player.playerName}`);
    })
    console.log("Total Number of players: " + Object.keys(players).length)

  })

  // this middleware will render what the client spelled and submitted
  socket.on('clientSubmitWord', (data) => {
    players[socket.id].words.push(data)
    console.log("word is: " + data + " " + players[socket.id].playerName + " words entered are: ")
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
}


io.on('connection', connected)


// app.get('/', (req, res) => {
//   res.send('hello world')
//   console.log("hello 2")

// })

// io.on('connection', (socket) => {
//   // console.log("a user connected")

//   // socket.on('clientToServer', (msg)=>{
//   //   console.log("This is a message from client to server: "+ msg)
//     // socket.emit('serverToClient',"the server has recieved your message: " + msg)
//   })
// socket.on('chat message', (msg)=>{
//   console.log("User said: " + msg)
//   socket.emit('chat message', "got your message! thanks client! im the server")

// })

// const bodyParser = require('body-parser')
// const io = require('socket.io')(server)


