const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- MongoDB connect ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// --- Session setup ---
app.use(session({
  secret: "supersecret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI
  }),
  cookie: { maxAge: 1000 * 60 * 60 }
}));

app.use(express.static(path.join(__dirname, "../frontend")));

// --- Models ---
const User = mongoose.model("User", new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: String
}));

const Expense = mongoose.model("Expense", new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  date: String,
  description: String,
  category: String,
  amount: Number
}));

// --- Helper middleware ---
// If the client expects JSON (AJAX), return 401 JSON; otherwise redirect to login page.
// Accept header usually includes 'application/json' for fetch/XHR requests.
function requireLogin(req, res, next) {
  if (req.session && req.session.userId) return next();

  const acceptsJson = (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1) || req.xhr;
  if (acceptsJson) {
    return res.status(401).json({ error: 'Not authenticated' });
  } else {
    return res.redirect('/login.html');
  }
}

// --- Routes ---
// Signup
app.post("/signup", async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashed });
    res.redirect("/login.html");
  } catch (err) {
    res.send("⚠️ User already exists or invalid input.");
  }
});

// Login
app.post("/login", async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password;
  console.log("LOGIN EMAIL:", JSON.stringify(email));

  if (!email || !password) return res.send("⚠️ Email and password are required");

  const user = await User.findOne({ email });
  console.log("USER FOUND:", !!user);

  if (!user || !user.password) return res.send("⚠️ User not found");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.send("⚠️ Invalid password");

  req.session.userId = user._id;
  res.redirect("/expenses.html");
});

// Simple /me endpoint for frontend to get logged-in user info
app.get('/me', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) return res.json({ loggedIn: false });
    const user = await User.findById(req.session.userId).select('email');
    if (!user) return res.json({ loggedIn: false });
    res.json({ loggedIn: true, email: user.email, id: user._id });
  } catch (err) {
    console.error('/me error', err);
    res.status(500).json({ loggedIn: false });
  }
});

// Add expense (form)
app.post("/add-expense", requireLogin, async (req, res) => {
  const { date, description, category, amount } = req.body;
  await Expense.create({
    userId: req.session.userId,
    date,
    description,
    category,
    amount
  });
  // redirect works for form submit
  res.redirect("/expenses.html");
});

// Delete expense
app.post("/delete-expense/:id", requireLogin, async (req, res) => {
  const expenseId = req.params.id;
  try {
    await Expense.deleteOne({ _id: expenseId, userId: req.session.userId });
    res.redirect("/expenses.html");
  } catch (err) {
    res.status(500).send("❌ Failed to delete expense");
  }
});

// Edit expense (Update)
app.post("/edit-expense/:id", requireLogin, async (req, res) => {
  const expenseId = req.params.id;
  const { date, description, category, amount } = req.body;
  try {
    await Expense.updateOne(
      { _id: expenseId, userId: req.session.userId },
      { date, description, category, amount }
    );
    res.redirect("/expenses.html");
  } catch (err) {
    res.status(500).send("❌ Failed to update expense");
  }
});

// Fetch expenses (AJAX)
app.get("/expenses-list", requireLogin, async (req, res) => {
  const expenses = await Expense.find({ userId: req.session.userId });
  res.json(expenses);
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login.html");
  });
});

// --- Start server ---
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
