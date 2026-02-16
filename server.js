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

/* =========================
   CORS Configuration
========================= */

app.use(cors({
  origin: "*", // For now allow all (can restrict to GitHub later)
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;

/* =========================
   MongoDB Atlas Connection
========================= */

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Atlas Connected"))
.catch(err => {
  console.error("❌ MongoDB Connection Error:");
  console.error(err);
});

/* =========================
   Health Check Route
========================= */

app.get("/", (req, res) => {
  res.send("🚀 Backend is running successfully");
});

/* =========================
   Register Route
========================= */

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).send("All fields are required");

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).send("User already exists");

    const hashed = await bcrypt.hash(password, 10);

    await new User({
      name,
      email,
      password: hashed
    }).save();

    res.send("Registration successful");

  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

/* =========================
   Login Route
========================= */

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).send("User not found");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).send("Invalid password");

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      name: user.name
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

/* =========================
   Add Book
========================= */

app.post("/books", authMiddleware, async (req, res) => {
  try {
    await new Book(req.body).save();
    res.send("Book added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

/* =========================
   Get Books
========================= */

app.get("/books", authMiddleware, async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

/* =========================
   Delete Book
========================= */

app.delete("/books/:id", authMiddleware, async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.send("Book deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

/* =========================
   Start Server
========================= */

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
