require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const nodemailer = require("nodemailer");

const User = require("./models/User");
const Book = require("./models/Book");
const authMiddleware = require("./middleware/auth");

const app = express();

/* ================= CORS CONFIG ================= */

app.use(cors({
  origin: "*", // for production you can restrict to your github URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

const PORT = process.env.PORT || 3000;

/* ================= MONGODB ================= */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

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
    console.log("REGISTER ERROR:", err);
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
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= FORGOT PASSWORD ================= */

app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Email not registered");

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink =
      `https://kiran28-04.github.io/CRUD-APP/reset.html?token=${token}`;

    /* ===== STABLE GMAIL TRANSPORTER ===== */
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    /* ===== VERIFY CONNECTION ===== */
    await transporter.verify();

    await transporter.sendMail({
      from: `"Books App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset",
      html: `
        <h2>Password Reset</h2>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}" style="color:blue;">
          Reset Password
        </a>
        <p>This link expires in 15 minutes.</p>
      `
    });

    res.send("Reset link sent successfully");

  } catch (err) {
    console.log("FORGOT PASSWORD ERROR:", err);
    res.status(500).send("Email sending failed");
  }
});

/* ================= RESET PASSWORD ================= */

app.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const hashed = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(decoded.id, {
      password: hashed
    });

    res.send("Password updated successfully");

  } catch (err) {
    console.log("RESET ERROR:", err);
    res.status(400).send("Invalid or expired token");
  }
});

/* ================= BOOK ROUTES ================= */

app.post("/books", authMiddleware, async (req, res) => {
  try {
    await new Book(req.body).save();
    res.send("Book added");
  } catch (err) {
    console.log("ADD BOOK ERROR:", err);
    res.status(500).send("Server error");
  }
});

app.get("/books", authMiddleware, async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    console.log("GET BOOKS ERROR:", err);
    res.status(500).send("Server error");
  }
});

app.put("/books/:id", authMiddleware, async (req, res) => {
  try {
    await Book.findByIdAndUpdate(req.params.id, req.body);
    res.send("Updated");
  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).send("Server error");
  }
});

app.delete("/books/:id", authMiddleware, async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.send("Deleted");
  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).send("Server error");
  }
});

/* ================= ROOT ================= */

app.get("/", (req, res) => {
  res.send("CRUD API is running 🚀");
});

/* ================= START SERVER ================= */

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
