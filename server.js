require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const User = require("./models/User");
const Book = require("./models/Book");
const authMiddleware = require("./middleware/auth");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));


mongoose.connect("mongodb://127.0.0.1:27017/bookCrudApp")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

/* REGISTER */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).send("All fields required");

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).send("User already exists");

    const hashed = await bcrypt.hash(password, 10);

    await new User({ name, email, password: hashed }).save();

    res.send("Registration successful");
  } catch (err) {
    res.status(500).send("Server error");
  }
});

/* LOGIN */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User not found");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).send("Invalid password");

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, name: user.name });

  } catch (err) {
    res.status(500).send("Server error");
  }
});

/* FORGOT PASSWORD */
app.post("/reset-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Email not registered");

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const link = `http://localhost:3000/reset.html?token=${resetToken}`;

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset",
      html: `<a href="${link}">${link}</a>`
    });

    res.send("Reset link sent to email");

  } catch (err) {
    res.status(500).send("Server error");
  }
});

/* UPDATE PASSWORD */
app.post("/update-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).send("Invalid or expired token");

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.send("Password updated successfully");

  } catch (err) {
    res.status(500).send("Server error");
  }
});

/* BOOK CRUD (Protected) */
app.post("/books", authMiddleware, async (req, res) => {
  await new Book(req.body).save();
  res.send("Book added");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


app.put("/books/:id", authMiddleware, async (req, res) => {
  await Book.findByIdAndUpdate(req.params.id, req.body);
  res.send("Book updated");
});

app.delete("/books/:id", authMiddleware, async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.send("Book deleted");
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
