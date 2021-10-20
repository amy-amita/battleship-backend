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
socket.on('connect', () => {
    console.log(socket.id)
})

//create game
// socket.emit('createGame', 'test001', (cb: any) => {
//     console.log(cb)
// });

//join game
// socket.emit('joinGame', '2a4de412-2f51-4fcf-88e7-09d83abe3a12', 'james', (cb: any) => {
//     console.log(cb)
// });

// //ready w/ username
// socket.emit('ready', 'test001', '30,20,10,00,73,63,53,43,04,14,24,34,02,12,22,32', (cb: any) => {
//     console.log(cb)
// });

// //ready w/ roomId
// socket.emit('ready', '2a4de412-2f51-4fcf-88e7-09d83abe3a12', 'james', '30,20,10,00,73,63,53,43,04,14,24,34,02,12,22,32', (cb: any) => {
//     console.log(cb)
// });

// //attack w/ username
// socket.emit('attack', 'test001', '33', (cb: any) => {
//     console.log(cb)
// });

//attack w/ roomId
// socket.emit(
//     'attack',
//     '2a4de412-2f51-4fcf-88e7-09d83abe3a12',
//     'james',
//     '11',
//     (cb: any) => {
//         console.log(cb)
//     }
// )

socket.emit('findRoom')

socket.on('findRoom', (rooms) => {
    console.log(rooms)
})

socket.on('onlineNum', (count) => {
    console.log(`Player Online: ${count}`)
})
