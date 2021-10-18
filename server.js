const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(process.env.PORT || 3031);
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const User = require("./models/userSchema");
const Room = require("./models/roomSchema");

mongoose.connect(
  "mongodb+srv://testuser:battleship@cluster0.w9j5l.mongodb.net/battleship?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

console.log("Server Started!");

io.on("connection", (socket) => {
  console.log(socket.id);

  // open page
  socket.on("userData", async (username, avatarName) => {
    console.log(username);
    // const user = new User({ username, socketId: socket.id, avatarName });
    // const valid = await User.findOne({ username });
    // if (!valid) {
    //   await user.save();
    // } else {
    //   socket.emit("messageToClient", 1); //USERNAME IS ALREADY TAKEN
    // }
  });
  let room;
  // create game
  socket.on("createGame", async (username, cb) => {
    room = new Room({
      roomId: uuidv4(),
      playerOneName: username,
      playerTwoName: "",
      playerOneCurrentScore: 0,
      playerTwoCurrentScore: 0,
      playerOneGameWin: 0,
      playerTwoGameWin: 0,
      playerOneShipPos: [],
      playerTwoShipPos: [],
      playerOneHitMissPos: [],
      playerTwoHitMissPos: [],
      time: 10,
    });
    await room.save();
    cb(`Room ID : ${room.findOne(roomId).roomId}`);
  });

  //join game
  socket.on("joinGame", async (username, roomId, cb) => {
    const filter = { roomId };
    const update = { playerTwoName: username };
    await room.findOneAndUpdate(filter, update, {
      new: true,
    });
    cb(`Joined Room ${roomId}`);
  });

  socket.on("messageToServer", (message, roomId) => {
    socket.to(roomId).emit("messageToClient", message);
  });

  // socket.on("join-room", (room, cb) => {
  //   socket.join(room);
  //   cb(`Joined Room ${room}`);
  // });

  // pre-game
  socket.on("shipsPos", async (username, pos) => {
    console.log(pos);
    const filter = { playerOneName: username };
    const update = { playerOneShipPos: pos };
    await room.findOneAndUpdate(filter, update, {
      new: true,
    });
  });

  socket.on("disconnect", () => {
    console.log("Disconnected!");
  });
});
