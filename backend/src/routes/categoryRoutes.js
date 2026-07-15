const express = require("express");
const {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryControllers");

const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middlewares/authMiddleware");
const checkAdminMiddleware = require("../middlewares/checkAdminMiddleware");

const router = express.Router();

router.get("/", asyncHandler(getCategories));

router.post(
  "/",
  asyncHandler(authMiddleware),
  asyncHandler(checkAdminMiddleware),
  asyncHandler(addCategory),
);

router.put(
  "/",
  asyncHandler(authMiddleware),
  asyncHandler(checkAdminMiddleware),
  asyncHandler(updateCategory),
);

router.delete(
  "/",
  asyncHandler(authMiddleware),
  asyncHandler(checkAdminMiddleware),
  asyncHandler(deleteCategory),
);

module.exports = router;
