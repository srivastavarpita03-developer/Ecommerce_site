const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.token;

    // console.log("Auth Token:", token ? "Token Present" : "Token Missing");
    // console.log(token);

    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access",
      });
    }

    const tokenData = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userId = tokenData.userId;

    const userData = await User.findById(userId)
      .select("-password");

    if (!userData) {
      return res.status(401).send({
        success: false,
        message: "User not found",
      });
    }

    req.user = userData;

    next();

  } catch (error) {
    console.log("Auth Middleware Error:", error.message);

    return res.status(401).send({
      success: false,
      message: "Unauthorized Access",
    });
  }
}

module.exports = authMiddleware;