const socket = io('http://localhost:3000')

// here im sending a message to server
socket.emit('chat message', 'hello there!')
// button to say hello
const hostRoom = document.getElementById("hostRoom")
const clientWord = document.getElementById('clientWord')
const wordInput = document.getElementById('wordInput')
const playerName = document.getElementById('playerName')
const submitName = document.getElementById('enterName')
// here im recieving message from server

// socket.on('chat message', (data)=>{
//     console.log("Server responds: " + data)
// })



submitName.addEventListener('click', ()=>{
    event.preventDefault()
    console.log("clicked submit name button. name is: " + playerName.value)
    socket.emit('newPlayer', {playerName: playerName.value, words: []})

})
hostRoom.addEventListener('click', function () {

    socket.emit('clientToClient', 'Welcome to the spelling Bee!')
})

// middle ware function for when client enters spelling of word
clientWord.addEventListener('submit', () => {
    event.preventDefault()
    console.log("user clicked enter: " + wordInput.value)
    socket.emit('clientSubmitWord', wordInput.value)
})


socket.on('serverToClient', (data) => {
    alert(data)
})