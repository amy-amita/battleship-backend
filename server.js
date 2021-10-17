const io = require("socket.io")(process.env.PORT || 3031);
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const User = require("./models/userSchema");
const room = require("./models/roomSchema");
const bodyParser = require("body-parser");

app.use(bodyParser.json());

console.log("Server Started!");

mongoose.connect(
  "mongodb://localhost:27017/realtimeProject",
  { useNewUrlParser: true },
  function (err) {
    if (err) {
      throw err;
    }
    console.log("Database connected");
  }
);

io.on("connection", (socket) => {
  console.log(socket.id);

  socket.on("messageToServer", (message, roomId) => {
    socket.to(roomId).emit("messageToClient", message);
  });
  // socket.on("join-room", (room, callback) => {
  //   socket.join(room);
  //   callback(`Joined Room ${room}`);
  // });
  socket.on("disconnect", () => {
    console.log("Disconnected!");
  });
});
