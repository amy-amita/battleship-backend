const mongoose = require("mongoose");

const roomSchema = mongoose.Schema({
  roomId: String,
  playerOneSocketId: String,
  playerTwoSocketId: String,
  playerOneCurrentScore: Number,
  playerTwoCurrentScore: Number,
  playerOneGameWin: Number,
  playerTwoGameWin: Number,
  time: Number,
  shipPosition: Array,
  hitMissPosition: Array,
});

module.exports = mongoose.model("Room", roomSchema);
