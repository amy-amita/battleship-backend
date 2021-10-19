import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema({
    roomId: String,
    playerOneName: String,
    playerTwoName: String,
    playerOneCurrentScore: Number,
    playerTwoCurrentScore: Number,
    playerOneGameWin: Number,
    playerTwoGameWin: Number,
    playerOneShipPos: String,
    playerTwoShipPos: String,
    playerOneHitPos: String,
    playerTwoHitPos: String,
    playerOneMissPos: String,
    playerTwoMissPos: String,
    time: Number,
})

export default mongoose.model('Room', roomSchema)
