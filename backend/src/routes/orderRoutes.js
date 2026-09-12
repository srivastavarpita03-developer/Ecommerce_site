
const express = require("express");

const {
  getAllOrders,
  getUserOrders,
  getUserSingleOrder,
  updateOrder,
  getSingleOrder,
} = require("../controllers/orderControllers");

const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middlewares/authMiddleware");
const checkAdminMiddleware = require("../middlewares/checkAdminMiddleware");
const { createCashOnDeliveryOrder } = require("../controllers/paymentControllers");

const router = express.Router();


// ======================================
// CUSTOMER - CREATE ORDER
// ======================================

router.post(
  "/cod",
  asyncHandler(authMiddleware),
  asyncHandler(createCashOnDeliveryOrder)
);

// Backward-compatible COD route for existing clients. Online payments use /payments/stripe/create-intent.
router.post("/", asyncHandler(authMiddleware), asyncHandler(createCashOnDeliveryOrder));


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
  asyncHandler(checkAdminMiddleware),
  asyncHandler(getAllOrders)
);


// ======================================
// ADMIN - UPDATE ORDER STATUS
// ======================================

router.put(
  "/status",
  asyncHandler(authMiddleware),
  asyncHandler(checkAdminMiddleware),
  asyncHandler(updateOrder)
);


// ======================================
// ADMIN - SINGLE ORDER
// ======================================

router.get(
  "/:id",
  asyncHandler(authMiddleware),
  asyncHandler(checkAdminMiddleware),
  asyncHandler(getSingleOrder)
);


module.exports = router;

