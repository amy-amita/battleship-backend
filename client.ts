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




const socket = io('https://1dba-49-228-164-20.ngrok.io')
socket.on('connect', () => {
    console.log(socket.id)
});

//create game
// socket.emit('createGame', 'test001', (cb: any) => {
//     console.log(cb)
// });

// //join game
// socket.emit('joinGame', '8371c2f7-e1df-4938-927a-e901500037e7', 'james', (cb: any) => {
//     console.log(cb)
//     });

// //ready w/ roomId
// socket.emit('ready', 'a4f1e5bf-8dbf-474e-b912-ebfb15a07978', 'test001', '30,20,10,00,73,63,53,43,04,14,24,34,02,12,22,32', (cb: any) => {
//     console.log(cb)
// });

// //attack w/ roomId
// socket.emit('attack', '2a4de412-2f51-4fcf-88e7-09d83abe3a12', 'james', '11',
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
        