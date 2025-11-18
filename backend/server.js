const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

//  MongoDB CONNECTION


mongoose
  .connect("mongodb://127.0.0.1:27017/students", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));



// 2️⃣ MODELS


const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String, // student / club
});

const EventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: String,
  createdBy: String, // userId
});

const User = mongoose.model("User", UserSchema);
const Event = mongoose.model("Event", EventSchema);



// 3️⃣ JWT Middleware

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Malformed Authorization header" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });

    req.user = decoded; // { userId, role }
    next();
  });
}



// USER SIGNUP

app.post("/signup", async (req, res) => {
  const { email, password, role } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const user = new User({
    email,
    password: hash,
    role,
  });

  await user.save();

  res.json({ message: "Signup successful!" });
});



// USER LOGIN


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Incorrect password" });

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ message: "Login successful", token });
});


//  CREATE EVENT  (club role only)


app.post("/events", authenticateToken, async (req, res) => {
  if (req.user.role !== "club") {
    return res.status(403).json({ error: "Only club users can create events" });
  }

  const { title, description, date } = req.body;

  const event = new Event({
    title,
    description,
    date,
    createdBy: req.user.userId,
  });

  await event.save();

  res.json({ message: "Event created!", event });
});



// GET ALL EVENTS


app.get("/events", authenticateToken, async (req, res) => {
  const events = await Event.find();
  res.json(events);
});



//  SERVER START


app.listen(5000, () => console.log("🚀 Server running on port 5000"));
