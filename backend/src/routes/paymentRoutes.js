const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const {
  createStripePaymentIntent,
  getPaymentStatus,
} = require("../controllers/paymentControllers");

const router = express.Router();

router.post("/stripe/create-intent", authMiddleware, asyncHandler(createStripePaymentIntent));
router.get("/orders/:orderId/status", authMiddleware, asyncHandler(getPaymentStatus));

module.exports = router;
