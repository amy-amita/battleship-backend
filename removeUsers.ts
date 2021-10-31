import mongoose from 'mongoose'
import User from './models/userSchema'

//------------------------------------------- Connect to Database -------------------------------------------------//

const deleteUsers = async () => {
    const database = await mongoose.connect(
        'mongodb+srv://testuser:battleship@cluster0.w9j5l.mongodb.net/battleship?retryWrites=true&w=majority'
    )

    await User.deleteMany({})

    database.disconnect()
}

deleteUsers()
