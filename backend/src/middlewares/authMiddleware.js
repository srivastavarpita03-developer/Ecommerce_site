const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

async function authMiddleware(req, res, next) {
  const { token } = req.cookies;
  
  if (!token) {
    return res
      .status(400)
      .send({ success: false, message: "Unauthorized Access" });
  }
  const tokenData = jwt.verify(token, process.env.JWT_SECRET);
  const userId = tokenData.userId;
  const userData = await User.findById(userId).select("-password");
  req.user = userData;
  next();
}

module.exports = authMiddleware;

// Accessing user info: req.user
// Select * from <>
