const express = require("express");

const {
  getAllOrders,
  getUserOrders,
  createOrder,
  updateOrder,
  getSingleOrder,
} = require("../controllers/orderControllers");

const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middlewares/authMiddleware");
const checkAdminMiddleware = require("../middlewares/checkAdminMiddleware");

const router = express.Router();

// ADMIN - ALL ORDERS
router.get(
  "/all",
  asyncHandler(authMiddleware),
  asyncHandler(checkAdminMiddleware),
  asyncHandler(getAllOrders)
);

// USER - MY ORDERS
router.get(
  "/user-orders",
  asyncHandler(authMiddleware),
  asyncHandler(getUserOrders)
);

// ADMIN - SINGLE ORDER
router.get(
  "/:id",
  asyncHandler(authMiddleware),
  asyncHandler(checkAdminMiddleware),
  asyncHandler(getSingleOrder)
);

// USER - CREATE ORDER
router.post(
  "/create",
  asyncHandler(authMiddleware),
  asyncHandler(createOrder)
);

// ADMIN - UPDATE ORDER
router.put(
  "/update",
  asyncHandler(authMiddleware),
  asyncHandler(checkAdminMiddleware),
  asyncHandler(updateOrder)
);

module.exports = router;