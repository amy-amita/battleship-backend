import io from 'socket.io-client'

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

// // create game
// socket.emit('createGame', 'test001', 10, 3, (cb: any) => {
//     console.log(cb)
// });

// //join game
// socket.emit('joinGame', 'c069323e-09dc-4394-b1f3-37969a669f37', 'james', (cb: any) => {
//     console.log(cb)
//     });

// // findRoom
// socket.emit('findRoom');

// //ready w/ roomId
// socket.emit(
//     'ready',
//     'c069323e-09dc-4394-b1f3-37969a669f37',
//     'test001',
//     '30,20,10,00,73,63,53,43,04,14,24,34,02,12,22,32',
//     (cb: any) => {
//         console.log(cb)
//     }
// )

// //attack w/ roomId
// socket.emit('attack', '8371c2f7-e1df-4938-927a-e901500037e7', 'test001', '77',
//     (cb: any) => {
//         console.log(cb)
// })

// // socket.emit('findRoom')
// socket.on('findRoom', (rooms) => {
//     console.log(rooms)
// });

// socket.on('onlineNum', (count) => {
//     console.log(`Player Online: ${count}`)
// });

// socket.emit('addWord');

// socket.emit('chat', '8371c2f7-e1df-4938-927a-e901500037e7','test001', 'fuck you bitch kuay Jenwit I na hee');

// socket.on('chat', (username:string, message:string)=> {
//     console.log(username, message);
// })
