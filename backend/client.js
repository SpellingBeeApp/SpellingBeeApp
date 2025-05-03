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

// multiple rooms for socket: 

let clientRoom; 
// callback function fires on event 'serverToClient'
socket.on('serverToClient', (data)=>{
    alert(data)
})

// here, the room number sent from server, then we update the client room variable with the proper room number
socket.on('serverMsg', (data)=>{
    console.log("i should be in room: " + data)
    clientRoom = data;
})


// here the server sent an io.to to everyone in the room, so everyone in the room's background will update
socket.on('switchFromServer', ()=>{
    console.log("insidw switch")
     if(document.body.style.background === "darkgray"){
        document.body.style.background = "white"
    }else{
        document.body.style.background ="darkgray"
    }
})

// if button clicked, send the client room to server
switchButton.addEventListener('click', ()=>{
    socket.emit('buttonPressed', clientRoom )
})