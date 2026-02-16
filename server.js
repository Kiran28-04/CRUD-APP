require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");

const User = require("./models/User");
const Book = require("./models/Book");
const authMiddleware = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;

/* MongoDB Atlas Connection */
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Atlas Connected"))
.catch(err => console.log(err));

/* Register */
app.post("/register", async (req,res)=>{
  const {name,email,password} = req.body;

  const exists = await User.findOne({email});
  if(exists) return res.status(400).send("User already exists");

  const hashed = await bcrypt.hash(password,10);
  await new User({name,email,password:hashed}).save();

  res.send("Registration successful");
});

/* Login */
app.post("/login", async (req,res)=>{
  const {email,password} = req.body;

  const user = await User.findOne({email});
  if(!user) return res.status(400).send("User not found");

  const valid = await bcrypt.compare(password,user.password);
  if(!valid) return res.status(400).send("Invalid password");

  const token = jwt.sign(
    {id:user._id},
    process.env.JWT_SECRET,
    {expiresIn:"1h"}
  );

  res.json({token,name:user.name});
});

/* Add Book */
app.post("/books", authMiddleware, async(req,res)=>{
  await new Book(req.body).save();
  res.send("Book added");
});

/* Get Books */
app.get("/books", authMiddleware, async(req,res)=>{
  const books = await Book.find();
  res.json(books);
});

/* Delete */
app.delete("/books/:id", authMiddleware, async(req,res)=>{
  await Book.findByIdAndDelete(req.params.id);
  res.send("Deleted");
});

app.listen(PORT, ()=> console.log("Server running on port",PORT));
