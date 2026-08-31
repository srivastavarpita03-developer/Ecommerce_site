
const express = require("express");

const {
  getAllOrders,
  getUserOrders,
  getUserSingleOrder,
  createOrder,
  updateOrder,
  getSingleOrder,
} = require("../controllers/orderControllers");

const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();


// ======================================
// CUSTOMER - CREATE ORDER
// ======================================

router.post(
  "/",
  asyncHandler(authMiddleware),
  asyncHandler(createOrder)
);


// ======================================
// CUSTOMER - ALL MY ORDERS
// ======================================

router.get(
  "/user-orders",
  asyncHandler(authMiddleware),
  asyncHandler(getUserOrders)
);


// ======================================
// CUSTOMER - SINGLE MY ORDER
// ======================================

router.get(
  "/user-orders/:id",
  asyncHandler(authMiddleware),
  asyncHandler(getUserSingleOrder)
);


// ======================================
// ADMIN - ALL ORDERS
// ======================================

router.get(
  "/all",
  asyncHandler(authMiddleware),
  asyncHandler(getAllOrders)
);


// ======================================
// ADMIN - UPDATE ORDER STATUS
// ======================================

router.put(
  "/status",
  asyncHandler(authMiddleware),
  asyncHandler(updateOrder)
);


// ======================================
// ADMIN - SINGLE ORDER
// ======================================

router.get(
  "/:id",
  asyncHandler(authMiddleware),
  asyncHandler(getSingleOrder)
);


module.exports = router;

