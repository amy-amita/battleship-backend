const io = require("socket.io-client");
const readline = require("readline");
const { format } = require("path");
const { SSL_OP_NO_TICKET } = require("constants");
const prompt = require("prompt-sync")();

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

const socket = io("http://localhost:3031");
console.log(typeof socket);
socket.on("connect", () => {
  console.log(socket.id);
});

let roomId = "aaa";

socket.emit("join-room", roomId, (message) => {
  console.log(message);
});

socket.emit("createGame", "amy");

// socket.emit("messageToServer", (message, roomId) => {
//   const input = prompt();
// })
