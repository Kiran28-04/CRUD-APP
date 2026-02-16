require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const User = require("./models/User");
const Book = require("./models/Book");
const authMiddleware = require("./middleware/auth");

const app = express();

/* ================= CORS ================= */

app.use(cors({
  origin: [
    "https://kiran28-04.github.io",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "DELETE", "PUT"]
}));

app.use(express.json());

const PORT = process.env.PORT || 3000;

/* ================= MongoDB ================= */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

/* ================= HOME ================= */

app.get("/", (req, res) => {
  res.send("CRUD API is running successfully 🚀");
});

/* ================= REGISTER ================= */

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

/* ================= LOGIN ================= */

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

/* ================= FORGOT PASSWORD ================= */

app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User not found");

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const resetURL = `https://kiran28-04.github.io/CRUD-APP/reset.html?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset - Books App",
      html: `
        <h3>Password Reset</h3>
        <p>Click the link below to reset your password:</p>
        <a href="${resetURL}">${resetURL}</a>
        <p>This link expires in 1 hour.</p>
      `
    });

    res.send("Reset link sent successfully");

  } catch (err) {
    console.log("Forgot Error:", err);
    res.status(500).send("Email sending failed");
  }
});

/* ================= RESET PASSWORD ================= */

app.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).send("Invalid or expired token");

    const hashed = await bcrypt.hash(password, 10);

    user.password = hashed;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.send("Password reset successful");

  } catch (err) {
    console.log("Reset Error:", err);
    res.status(500).send("Reset failed");
  }
});

/* ================= ADD BOOK ================= */

app.post("/books", authMiddleware, async (req, res) => {
  try {
    await new Book(req.body).save();
    res.send("Book added");
  } catch (err) {
    res.status(500).send("Server error");
  }
});

/* ================= UPDATE BOOK ================= */

app.put("/books/:id", authMiddleware, async (req, res) => {
  try {
    await Book.findByIdAndUpdate(req.params.id, req.body);
    res.send("Book updated");
  } catch (err) {
    res.status(500).send("Server error");
  }
});

/* ================= GET BOOKS ================= */

app.get("/books", authMiddleware, async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

/* ================= DELETE BOOK ================= */

app.delete("/books/:id", authMiddleware, async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.send("Deleted");
  } catch (err) {
    res.status(500).send("Server error");
  }
});

/* ================= START SERVER ================= */

app.listen(PORT, () => console.log("Server running on port", PORT));
