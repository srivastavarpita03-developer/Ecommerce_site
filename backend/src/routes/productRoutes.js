const express = require("express");
const {
  getAllProducts,
  getSingleProduct,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productControllers");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middlewares/authMiddleware");
const checkAdminMiddleware = require("../middlewares/checkAdminMiddleware");
const upload = require("../utils/upload");

const router = express.Router();

router.get("/all", asyncHandler(getAllProducts));
router.get("/product/:productId", asyncHandler(getSingleProduct));

router.post(
  "/",
  asyncHandler(authMiddleware),
  asyncHandler(checkAdminMiddleware),
  upload.array("images", 10),
  asyncHandler(addProduct),
);
router.put(
  "/",
  asyncHandler(authMiddleware),
  asyncHandler(checkAdminMiddleware),
  upload.array("images", 10),
  asyncHandler(updateProduct),
);
router.delete(
  "/",
  asyncHandler(authMiddleware),
  asyncHandler(checkAdminMiddleware),
  asyncHandler(deleteProduct),
);

module.exports = router;
