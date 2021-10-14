const io = require("socket.io")(process.env.PORT || 3031);

console.log("Server Started!");

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("messageToServer", (message, room) => {
    if (room === " ") {
      socket.broadcast.emit("messageToClient", message);
    } else {
      socket.to(room).emit("messageToClient", message);
    }
  });
  socket.on("join-room", (room, callback) => {
    socket.join(room);
    callback(`Joined Room ${room}`);
  });
  socket.on("disconnect", () => {
    console.log("Disconnected!");
  });
});
