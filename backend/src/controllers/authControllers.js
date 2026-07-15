const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function register(req, res) {
  const data = req.body;
  const { name, email, password, address, contactNumber } = data;
  if (!name || !email || !password || !address || !contactNumber) {
    return res
      .status(400)
      .send({ success: false, message: "Required Fields are missing" });
  }
  // Checking if email is already registered in db
  const userData = await User.findOne({ email: email });
  if (userData) {
    return res
      .status(400)
      .send({ success: false, message: "Email Already Registered" });
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const newUserData = new User({
    name,
    email,
    address,
    contactNumber,
    password: hashPassword,
  });
  const newUser = await newUserData.save();
  return res.send({
    success: true,
    message: "Registered Successfully",
    data: newUser,
  });
}

async function login(req, res) {
  const data = req.body;
  const { email, password } = data;
  if (!email || !password) {
    return res
      .status(400)
      .send({ success: false, message: "All Required Fields Not Found" });
  }
  // Check if that email is registered or not
  const userData = await User.findOne({ email: email });
  if (!userData) {
    return res
      .status(400)
      .send({ success: false, message: "Email Or Password is Invalid" });
  }
  const hashPassword = userData.password;
  // Check if password matches
  const isPasswordMatch = await bcrypt.compare(password, hashPassword);
  if (!isPasswordMatch) {
    return res
      .status(400)
      .send({ success: false, message: "Email Or Password is Invalid" });
  }
  // Generate JWT token
  const JWT_SECRET = process.env.JWT_SECRET;
  const token = jwt.sign({ userId: userData._id }, JWT_SECRET, {
    expiresIn: "7d",
  });

  // Send token to save in client cookies
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.MODE == "production",
    sameSite: process.env.MODE == "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.send({
    success: true,
    message: "Login Successfully",
  });
}

async function getMe(req, res) {
  const user = req.user;
  if (!user) {
    return res.status(404).send({ success: false, message: "User Not Found!" });
  }
  return res.send({ success: true, data: user });
}

async function logout(req, res) {
  res.cookie("token", "", {
    httpOnly: true,
    maxAge: 0,
  });
  return res.send({
    success: true,
    message: "Logout Successfully",
  });
}

module.exports = { register, login, getMe, logout };
// Products : Add,Delete,Get,Update
// Order: Add,Get,Update