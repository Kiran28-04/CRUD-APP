const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  bookName:String,
  author:String,
  genre:String,
  price:Number
});

module.exports = mongoose.model("Book",BookSchema);
