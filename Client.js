const io = require("socket.io-client");

const socket = io("http://localhost:3031");
socket.on("connect", () => {
  console.log(socket.id);
});
