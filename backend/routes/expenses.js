const express = require("express");
const jwt = require("jsonwebtoken");
const Expense = require("../models/Expense");

const router = express.Router();
const SECRET = "supersecret";

// Middleware: verify JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Add expense
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { date, description, category, amount } = req.body;
    const expense = new Expense({
      userId: req.user.id,
      date,
      description,
      category,
      amount,
    });
    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: "Failed to add expense" });
  }
});

// Get all expenses
router.get("/", authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

module.exports = router;
