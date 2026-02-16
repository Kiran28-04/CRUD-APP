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

/* ===== CORS FIX ===== */
app.use(cors({
  origin: [
    "https://kiran28-04.github.io",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "DELETE", "PUT"],
}));

app.use(express.json());

const PORT = process.env.PORT || 3000;

/* ===== MongoDB Connection ===== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

/* ===== REGISTER ===== */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).send("User already exists");

    const hashed = await bcrypt.hash(password, 10);
    await new User({ name, email, password: hashed }).save();

    res.send("Registration successful");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

/* ===== LOGIN ===== */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, name: user.name });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===== ADD BOOK ===== */
app.post("/books", authMiddleware, async (req, res) => {
  try {
    await new Book(req.body).save();
    res.send("Book added");
  } catch (err) {
    res.status(500).send("Server error");
  }
});

/* ===== GET BOOKS ===== */
app.get("/books", authMiddleware, async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

/* ===== DELETE BOOK ===== */
app.delete("/books/:id", authMiddleware, async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.send("Deleted");
  } catch (err) {
    res.status(500).send("Server error");
  }
});

app.listen(PORT, () => console.log("Server running on port", PORT));

app.get("/", (req, res) => {
  res.send("CRUD API is running successfully 🚀");
});
