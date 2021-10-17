const io = require("socket.io")(process.env.PORT || 3031);
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const User = require("./models/userSchema");
const room = require("./models/roomSchema");

mongoose.connect(
  "mongodb+srv://testuser:battleship@cluster0.w9j5l.mongodb.net/battleship?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);


console.log("Server Started!");


io.on("connection", (socket) => {
  console.log(socket.id);

  socket.on("messageToServer", (message, roomId) => {
      socket.to(roomId).emit("messageToClient", message);
  });

  socket.on("join-room", (room, cb) => {
    socket.join(room);
    cb(`Joined Room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected!");
  });
});
