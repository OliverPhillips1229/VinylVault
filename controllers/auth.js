const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const bcrypt = require("bcrypt");

// GET /auth/sign-up
router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up.ejs");
});

// POST /auth/sign-up
router.post("/sign-up", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.send("Password and Confirm Password must match");
  }
  
  // Check if username is already taken
  const usernameInDatabase = await User.findOne({ username });
  if (usernameInDatabase) {
    return res.send("Username already taken.");
  }
  
  // Check if email is already taken
  const emailInDatabase = await User.findOne({ email });
  if (emailInDatabase) {
    return res.send("Email already taken.");
  }
  
  // Let the User model's pre-save hook handle password hashing
  const user = await User.create({ username, email, password });
  req.session.user = { username: user.username, email: user.email, _id: user._id };
  res.redirect("/");
});

// GET /auth/sign-in
router.get("/sign-in", (req, res) => {
  res.render("auth/sign-in.ejs");
});

// POST /auth/sign-in
router.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;
  const userInDatabase = await User.findOne({ email });
  if (!userInDatabase) {
    return res.send("Login failed. Please try again.");
  }
  // Use the model's validatePassword method for consistency
  const validPassword = await userInDatabase.validatePassword(password);
  if (!validPassword) {
    return res.send("Login failed. Please try again.");
  }
  req.session.user = { username: userInDatabase.username, email: userInDatabase.email, _id: userInDatabase._id };
  res.redirect("/");
});

// GET /auth/sign-out
router.get("/sign-out", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
