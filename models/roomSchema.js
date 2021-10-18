const mongoose = require("mongoose");

const roomSchema = mongoose.Schema({
  roomId: String,
  playerOneName: String,
  playerTwoName: String,
  playerOneCurrentScore: Number,
  playerTwoCurrentScore: Number,
  playerOneGameWin: Number,
  playerTwoGameWin: Number,
  playerOneShipPos: Array,
  playerOneTwoPos: Array,
  playerOneHitMissPos: Array,
  playerTwoHitMissPos: Array,
  time: Number,
});

module.exports = mongoose.model("Room", roomSchema);
