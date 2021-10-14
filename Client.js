import { io } from "socket.io-client";

const socket = io(3031);
socket.on("connect", () => {
  console.log(socket.id);
});
