const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: String,
  socketId: String,
  roomId: Number,
  avatarNo: Number,
});

userSchema.statics.validate = async function (username) {
  const foundUser = await this.findOne({ username });
  if (!foundUser) return false;
  return foundUser;
};

module.exports = mongoose.model("User", userSchema);
