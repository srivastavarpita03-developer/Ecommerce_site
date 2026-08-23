const express = require("express");

const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
} = require("../controllers/authControllers");

const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// ======================================
// REGISTER
// ======================================

router.post(
  "/register",
  asyncHandler(register)
);

// ======================================
// LOGIN
// ======================================

router.post(
  "/login",
  asyncHandler(login)
);

// ======================================
// GET CURRENT USER
// ======================================

router.get(
  "/me",
  asyncHandler(authMiddleware),
  asyncHandler(getMe)
);

// ======================================
// UPDATE PROFILE
// ======================================

router.put(
  "/profile",
  asyncHandler(authMiddleware),
  asyncHandler(updateProfile)
);

// ======================================
// CHANGE PASSWORD
// ======================================

router.put(
  "/change-password",
  asyncHandler(authMiddleware),
  asyncHandler(changePassword)
);

// ======================================
// LOGOUT
// ======================================

router.post(
  "/logout",
  asyncHandler(logout)
);

module.exports = router;


// POST http://localhost:4000/api/v1/auth/register

// POST http://localhost:4000/api/v1/auth/login

// GET http://localhost:4000/api/v1/auth/me

// PUT http://localhost:4000/api/v1/auth/profile

// PUT http://localhost:4000/api/v1/auth/change-password

// GET http://localhost:4000/api/v1/auth/logout