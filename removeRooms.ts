import mongoose from 'mongoose'
import Room from './models/roomSchema'

//------------------------------------------- Connect to Database -------------------------------------------------//

const deleteRooms = async () => {
    const database = await mongoose.connect(
        'mongodb+srv://testuser:battleship@cluster0.w9j5l.mongodb.net/battleship?retryWrites=true&w=majority'
    )

    await Room.deleteMany({})

    database.disconnect()
}

deleteRooms()
