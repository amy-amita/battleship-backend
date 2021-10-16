const io = require("socket.io-client");
const readline = require("readline");
const prompt = require("prompt-sync")();

const socket = io("http://localhost:3031");
socket.on("connect", () => {
  console.log(socket.id);
});

let room = socket.id;

const message = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
message.question("message: ");


socket.emit('messageToServer', message, room);

socket.emit("join-room", room => { 

})