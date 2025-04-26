const socket = io('http://localhost:3000')


const hostRoom = document?.getElementById("hostRoom")

// host words for spelling bee

const word1 = document.getElementById('hostWord1')
const word2 = document.getElementById('hostWord2')
const word3 = document.getElementById('hostWord3')
const word4 = document.getElementById('hostWord4')
const word5 = document.getElementById('hostWord5')



hostRoom?.addEventListener('click', function () {
    socket.emit('clientToClient', 'Welcome to the spelling Bee!')
    socket.emit('hostSpellingWords', [word1.value, word2.value, word3.value, word4.value, word5.value])
})