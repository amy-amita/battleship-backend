const mongoose = require("mongoose");

const roomSchema = mongoose.Schema({
  roomId: String,
  playerOneName: String,
  playerTwoName: String,
  playerOneCurrentScore: Number,
  playerTwoCurrentScore: Number,
  playerOneGameWin: Number,
  playerTwoGameWin: Number,
  time: Number,
  shipPosition: Array,
  hitMissPosition: Array,
});

module.exports = mongoose.model("Room", roomSchema);
