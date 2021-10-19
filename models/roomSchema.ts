import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema({
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
})

export default mongoose.model('Room', roomSchema)
