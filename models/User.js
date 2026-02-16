const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  // ADD THESE FOR RESET FEATURE
  resetToken: String,
  resetTokenExpire: Date
});

module.exports = mongoose.model("User", schema);
