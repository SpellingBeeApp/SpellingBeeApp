const socket = io('http://localhost:3000')

// here im sending a message to server
socket.emit('chat message', 'hello there!')
// button to say hello
const sayHelloButton = document.getElementById("sayHello")
// here im recieving message from server

// socket.on('chat message', (data)=>{
//     console.log("Server responds: " + data)
// })
console.log(sayHelloButton)
sayHelloButton.addEventListener('click', function (){
    console.log("testing")
    socket.emit('clientToClient', 'Hello to the fellow clients. Welcome to the spelling Bee!')
})
socket.emit('clientToServer', "Hey its me client. How are you server")


socket.on('serverToClient', (data) => {
    // socket.emit("Hey server. im client. I got your message" + data)
    // console.log("Server responds: " + data)
    alert(data)
})

