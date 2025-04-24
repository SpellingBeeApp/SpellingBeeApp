const socket = io('http://localhost:3000')

// here im sending a message to server
socket.emit('chat message', 'hello there!')

// here im recieving message from server

socket.on('chat message', (data)=>{
    console.log("Server responds: " + data)
})