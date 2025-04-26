const socket = io('http://localhost:3000')


const hostRoom = document?.getElementById("hostRoom")

hostRoom?.addEventListener('click', function () {
    socket.emit('clientToClient', 'Welcome to the spelling Bee!')
})