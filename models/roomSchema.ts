import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema({
    roomId: String,
    pName: {'p1': String, 'p2': String},
    pScore: {'p1': Number, 'p2': Number},
    pWinRound: {'p1': Number, 'p2': Number},
    pShipPos: {'p1': String, 'p2': String},
    pHitPos: {'p1': String, 'p2': String},
    pMissPos:{'p1': String, 'p2': String},
    time: Number,
})

export default mongoose.model('Room', roomSchema)
