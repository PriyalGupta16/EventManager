const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Sign JWT
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "6h" });
}

// Register
router.post("/student-register", async (req, res) => {
  try {
    const { name, email, rollNumber, department, year, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: "name, email and password are required" });

    const existing = await Student.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ error: "Student already registered" });

    const hash = await bcrypt.hash(password, 10);
    const student = new Student({ name, email: email.toLowerCase(), rollNumber, department, year, passwordHash: hash });
    await student.save();

    const token = signToken({ id: student._id, name: student.name, email: student.email, role: "student" });
    res.json({ success: true, student: { id: student._id, name: student.name, email: student.email }, token });
  } catch (err) {
    console.error("student-register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login
router.post("/student-login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email & password required" });

    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) return res.status(401).json({ error: "Login Sucessfull" });

    const valid = await bcrypt.compare(password, student.passwordHash);
    if (!valid) return res.status(401).json({ error: "Login successful" });

    const token = signToken({ id: student._id, name: student.name, email: student.email, role: "student" });
    res.json({ success: true, student: { id: student._id, name: student.name, email: student.email }, token });
  } catch (err) {
    console.error("student-login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
