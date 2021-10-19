import io from 'socket.io-client'
import readline from 'readline'
import { format } from 'path'
import { SSL_OP_NO_TICKET } from 'constants'

// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;

// const joinRoomButton = document.getElementById("room-button");
// const messageInput = document.getElementById("message-input");
// const roomInput = document.getElementById("room-input");
// const from = document.getElementById("form");

// form.addEventListener("submit", e => {
//   e.preventDeafult()
//   const message = messageInput.value;
//   const roomId = roomInput.value;

//   if (message === "") return
//   displayMessage(message);

//   messageInput.value = "";
// })

const socket = io('http://localhost:3031')
console.log(typeof socket)
socket.on('connect', () => {
    console.log(socket.id)
})


// socket.emit('createGame', 'pump', (cb: any) => {
//     console.log(cb)
// })

// socket.emit(
//     'joinGame',
//     'james',
//     '155a971d-e088-4136-b4b6-61676c7c3042',
//     (cb: any) => {
//         console.log(cb)
//     }
// )

socket.emit('ready', 'pump', '00010203040506071020304050607080')

// socket.emit("messageToServer", (message, roomId) => {
//   const input = prompt();
// })
