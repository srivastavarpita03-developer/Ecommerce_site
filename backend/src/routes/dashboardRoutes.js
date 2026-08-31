const express = require("express");

const {
  getDashboardData,
} = require("../controllers/dashboardControllers");

const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middlewares/authMiddleware");
const checkAdminMiddleware = require("../middlewares/checkAdminMiddleware");

const router = express.Router();

// ======================================
// ADMIN DASHBOARD
// ======================================

router.get(
  "/",
  asyncHandler(authMiddleware),
  asyncHandler(checkAdminMiddleware),
  asyncHandler(getDashboardData)
);

module.exports = router;