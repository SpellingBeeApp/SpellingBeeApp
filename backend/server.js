// server
const express = require('express')
const app = express();
const port = 3000;
const server = app.listen(port)
const { Server } = require('socket.io');

// const bodyParser = require('body-parser')
// const io = require('socket.io')(server)
const io = new Server(server, {
  cors: {
    origin: 'http://127.0.0.1:5500', // or '*' for all origins (not recommended in prod)
    methods: ['GET', 'POST'],
  }
});

console.log("This is the server!")

app.get('/', (req, res) => {
  res.send('hello world')
  console.log("hello 2")

})

io.on('connection', (socket) => {
  console.log("a user connected")

  socket.on('chat message', (msg)=>{
    console.log("User said: " + msg)
    socket.emit('chat message', "got your message! thanks client! im the server")

  })
})


