import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: String,
    socketId: String,
    avatarName: String,
})

userSchema.statics.validate = async function (username: string) {
    const foundUser = await this.findOne({ username })
    if (!foundUser) return false
    return foundUser
}

export default mongoose.model('User', userSchema)
