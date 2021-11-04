import mongoose from 'mongoose'

const swearWordSchema = new mongoose.Schema({
    wordList: [String]
})


export default mongoose.model('SwearWord', swearWordSchema)
