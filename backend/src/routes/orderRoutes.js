const express = require("express");
const {
  getAllOrders,
  getUserOrders,
  createOrder,
  updateOrder,
} = require("../controllers/orderControllers");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middlewares/authMiddleware");
const checkAdminMiddleware = require("../middlewares/checkAdminMiddleware");

const router = express.Router();
router.get(
  "/all",
  asyncHandler(authMiddleware),
  asyncHandler(checkAdminMiddleware),
  asyncHandler(getAllOrders),
);
router.get(
  "/user-orders",
  asyncHandler(authMiddleware),
  asyncHandler(getUserOrders),
);
router.post("/create", asyncHandler(authMiddleware), asyncHandler(createOrder));
router.put(
  "/update",
  asyncHandler(authMiddleware),
  asyncHandler(checkAdminMiddleware),
  asyncHandler(updateOrder),
);

module.exports = router;
