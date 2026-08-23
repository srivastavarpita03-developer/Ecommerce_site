const express = require("express");

const {
  getAllProducts,
  getSingleProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
} = require("../controllers/productControllers");

const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middlewares/authMiddleware");
const checkAdminMiddleware = require("../middlewares/checkAdminMiddleware");
const upload = require("../utils/upload");

const router = express.Router();

// ===============================
// PRODUCT ROUTES
// ===============================

router.get(
  "/all",
  asyncHandler(getAllProducts)
);

router.get(
  "/product/:productId",
  asyncHandler(getSingleProduct)
);


// ===============================
// CART ROUTES
// ===============================

// Add product to cart
router.post(
  "/cart/add",
  asyncHandler(authMiddleware),
  asyncHandler(addToCart)
);

// Get cart
router.get(
  "/cart",
  asyncHandler(authMiddleware),
  asyncHandler(getCart)
);

// Update cart quantity
router.put(
  "/cart/update",
  asyncHandler(authMiddleware),
  asyncHandler(updateCartQuantity)
);

// Remove product from cart
router.delete(
  "/cart/remove/:productId",
  asyncHandler(authMiddleware),
  asyncHandler(removeFromCart)
);


// ===============================
// ADMIN PRODUCT ROUTES
// ===============================

router.post(
  "/",
  asyncHandler(authMiddleware),
  asyncHandler(checkAdminMiddleware),
  upload.array("images", 10),
  asyncHandler(addProduct)
);

router.put(
  "/",
  asyncHandler(authMiddleware),
  asyncHandler(checkAdminMiddleware),
  upload.array("images", 10),
  asyncHandler(updateProduct)
);

router.delete(
  "/",
  asyncHandler(authMiddleware),
  asyncHandler(checkAdminMiddleware),
  asyncHandler(deleteProduct)
);

module.exports = router;