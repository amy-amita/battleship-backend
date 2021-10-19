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

// let roomId = "aaa";

// socket.emit("join-room", roomId, (message) => {
//   console.log(message);
// });

socket.emit('createGame', 'test1', (cb: any) => {
    console.log(cb)
})
socket.emit(
    'joinGame',
    'james',
    '6394ba5c-1714-4b9c-8201-59044ec6b98f',
    (cb: any) => {
        console.log(cb)
    }
)

// socket.emit("messageToServer", (message, roomId) => {
//   const input = prompt();
// })
