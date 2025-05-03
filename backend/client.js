const socket = io('http://localhost:3000')

socket.emit('chat message', 'hello there!')
const clientWord = document?.getElementById('clientWord')
const wordInput = document?.getElementById('wordInput')
const playerName = document?.getElementById('playerName')
const submitName = document?.getElementById('enterName')
const switchButton = document?.getElementById("switchButton")


submitName?.addEventListener('click', () => {
    event.preventDefault()
    console.log("clicked submit name button. name is: " + playerName.value)
    socket.emit('newPlayer', { playerName: playerName.value, words: [], correctAmount: 0, wrongAmount: 0, finalScore: 0 })

})

// middle ware function for when client enters spelling of word
clientWord?.addEventListener('submit', () => {
    event.preventDefault()
    console.log("user clicked enter: " + wordInput.value)
    socket.emit('clientSubmitWord', wordInput.value)
})

socket.on('serverToClient', (data) => {
    alert(data)
})

socket.on('changeWord', () => {
    console.log("changed word")
    alert("Please enter word")
    //    socket.emit('clientSubmitWord', wordInput.value)
})