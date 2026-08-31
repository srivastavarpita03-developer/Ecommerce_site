const Product = require("../models/productsModel");
const User = require("../models/userModel");

// ======================================
// GET ALL PRODUCTS
// ======================================

async function getAllProducts(req, res) {
  let page = 1;
  let limit = 8;

  if (req.query?.page) {
    page = parseInt(req.query.page);
  }

  if (req.query?.limit) {
    limit = parseInt(req.query.limit);
  }

  const { maxPrice } = req.query;

  let filter = {};

  if (maxPrice) {
    filter.price = {
      $lte: Number(maxPrice),
    };
  }

  const data = await Product.find(filter)
    .populate("category")
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Product.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  const isNextPage = page < totalPages;
  const isPrevPage = page > 1;

  return res.send({
    success: true,
    message: `${total} Products Found`,
    data: data,
    pagination: {
      total,
      totalPages,
      page,
      limit,
      isNextPage,
      isPrevPage,
    },
  });
}


// ======================================
// GET SINGLE PRODUCT
// ======================================

async function getSingleProduct(req, res) {
  const productId = req.params.productId;

  const productData = await Product.findById(productId)
    .populate("category");

  if (!productData) {
    return res.status(404).send({
      success: false,
      message: "Product Not Found.",
    });
  }

  return res.send({
    success: true,
    message: "Product Found",
    data: productData,
  });
}


// ======================================
// ADD PRODUCT - ADMIN
// ======================================

async function addProduct(req, res) {
  try {
    const data = req.body;

    const {
      title,
      description,
      price,
      category,
      subcategory,
      discount,
      stock,
      features,
      variant,
    } = data;

    // ======================================
    // PARSE FEATURES
    // ======================================

    let parsedFeatures = [];

    if (features) {
      try {
        parsedFeatures =
          typeof features === "string"
            ? JSON.parse(features)
            : features;
      } catch (error) {
        return res.status(400).send({
          success: false,
          message: "Invalid features format",
        });
      }
    }

    // ======================================
    // PARSE VARIANT
    // ======================================

    let parsedVariant = [];

    if (variant) {
      try {
        parsedVariant =
          typeof variant === "string"
            ? JSON.parse(variant)
            : variant;
      } catch (error) {
        return res.status(400).send({
          success: false,
          message: "Invalid variant format",
        });
      }
    }

    // ======================================
    // IMAGES
    // ======================================

    const images =
      req?.files?.map(
        (file) => file.filename
      ) || [];

    // ======================================
    // CREATE PRODUCT
    // ======================================

    const productData = new Product({
      title,
      description,
      price: Number(price),
      category,
      subcategory,
      discount: Number(discount || 0),
      stock: Number(stock),
      features: parsedFeatures,
      variant: parsedVariant,
      images,
    });

    const newProductData =
      await productData.save();

    return res.send({
      success: true,
      message: "Product Added Successfully",
      data: newProductData,
    });

  } catch (error) {
    console.log(
      "Add Product Error:",
      error
    );

    return res.status(500).send({
      success: false,
      message: "Failed To Add Product",
      error: error.message,
    });
  }
}


// ======================================
// UPDATE PRODUCT - ADMIN
// ======================================

async function updateProduct(req, res) {
  try {
    const data = req.body;

    const {
      title,
      description,
      price,
      category,
      subcategory,
      discount,
      stock,
      features,
      variant,
      productId,
      oldImages,
    } = data;

    // ======================================
    // PARSE FEATURES
    // ======================================

    let parsedFeatures = [];

    if (features) {
      try {
        parsedFeatures =
          typeof features === "string"
            ? JSON.parse(features)
            : features;
      } catch (error) {
        return res.status(400).send({
          success: false,
          message: "Invalid features format",
        });
      }
    }

    // ======================================
    // PARSE VARIANT
    // ======================================

    let parsedVariant = [];

    if (variant) {
      try {
        parsedVariant =
          typeof variant === "string"
            ? JSON.parse(variant)
            : variant;
      } catch (error) {
        return res.status(400).send({
          success: false,
          message: "Invalid variant format",
        });
      }
    }

    // ======================================
    // OLD IMAGES
    // ======================================

    let parsedOldImages = [];

    if (oldImages) {
      try {
        parsedOldImages =
          typeof oldImages === "string"
            ? JSON.parse(oldImages)
            : oldImages;
      } catch (error) {
        parsedOldImages = [];
      }
    }

    // ======================================
    // NEW IMAGES
    // ======================================

    const newImages =
      req?.files?.map(
        (file) => file.filename
      ) || [];

    const images = [
      ...parsedOldImages,
      ...newImages,
    ];

    // ======================================
    // UPDATE PRODUCT
    // ======================================

    const updatedProductData =
      await Product.findByIdAndUpdate(
        productId,
        {
          title,
          description,
          price: Number(price),
          category,
          subcategory,
          discount: Number(discount || 0),
          stock: Number(stock),
          features: parsedFeatures,
          variant: parsedVariant,
          images,
        },
        {
          new: true,
        }
      );

    if (!updatedProductData) {
      return res.status(404).send({
        success: false,
        message: "Product Not Found",
      });
    }

    return res.send({
      success: true,
      message:
        "Product Updated Successfully",
      data: updatedProductData,
    });

  } catch (error) {
    console.log(
      "Update Product Error:",
      error
    );

    return res.status(500).send({
      success: false,
      message: "Failed To Update Product",
      error: error.message,
    });
  }
}


// ======================================
// DELETE PRODUCT - ADMIN
// ======================================

async function deleteProduct(req, res) {
  try {
    const data = req.body;

    const { productId } = data;

    await Product.findByIdAndDelete(productId);

    return res.send({
      success: true,
      message: "Product Delete Successfully",
    });

  } catch (error) {
    console.log(
      "Delete Product Error:",
      error
    );

    return res.status(500).send({
      success: false,
      message: "Failed To Delete Product",
      error: error.message,
    });
  }
}


// ======================================
// ADD TO CART
// ======================================

async function addToCart(req, res) {
  try {
    const userId = req.user._id;

    const {
      productId,
      quantity = 1,
      variant = {},
    } = req.body;

    if (!productId) {
      return res.status(400).send({
        success: false,
        message: "Product ID is required",
      });
    }

    const product =
      await Product.findById(productId);

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product Not Found",
      });
    }

    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User Not Found",
      });
    }

    const existingItem =
      user.cart.find(
        (item) =>
          item.productId?.toString() ===
          productId
      );

    if (existingItem) {
      existingItem.quantity +=
        Number(quantity);
    } else {
      user.cart.push({
        productId,
        quantity: Number(quantity),
        variant,
      });
    }

    await user.save();

    return res.send({
      success: true,
      message: "Product Added To Cart",
      data: user.cart,
    });

  } catch (error) {
    console.log(
      "Add To Cart Error:",
      error
    );

    return res.status(500).send({
      success: false,
      message:
        "Failed To Add Product To Cart",
      error: error.message,
    });
  }
}


// ======================================
// GET CART
// ======================================

async function getCart(req, res) {
  try {
    const userId = req.user._id;

    const user =
      await User.findById(userId)
        .populate("cart.productId");

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User Not Found",
      });
    }

    return res.send({
      success: true,
      message: "Cart Fetched Successfully",
      data: user.cart,
    });

  } catch (error) {
    console.log(
      "Get Cart Error:",
      error
    );

    return res.status(500).send({
      success: false,
      message: "Failed To Get Cart",
      error: error.message,
    });
  }
}


// ======================================
// UPDATE CART QUANTITY
// ======================================

async function updateCartQuantity(req, res) {
  try {
    const userId = req.user._id;

    const {
      productId,
      quantity,
    } = req.body;

    if (
      !productId ||
      quantity === undefined
    ) {
      return res.status(400).send({
        success: false,
        message:
          "Product ID and quantity are required",
      });
    }

    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User Not Found",
      });
    }

    const cartItem =
      user.cart.find(
        (item) =>
          item.productId.toString() ===
          productId
      );

    if (!cartItem) {
      return res.status(404).send({
        success: false,
        message:
          "Product not found in cart",
      });
    }

    if (Number(quantity) < 1) {
      return res.status(400).send({
        success: false,
        message:
          "Quantity must be at least 1",
      });
    }

    cartItem.quantity =
      Number(quantity);

    await user.save();

    const updatedUser =
      await User.findById(userId)
        .populate("cart.productId");

    return res.send({
      success: true,
      message:
        "Cart quantity updated",
      data: updatedUser.cart,
    });

  } catch (error) {
    console.log(
      "Update Cart Quantity Error:",
      error
    );

    return res.status(500).send({
      success: false,
      message:
        "Failed to update quantity",
      error: error.message,
    });
  }
}


// ======================================
// REMOVE FROM CART
// ======================================

async function removeFromCart(req, res) {
  try {
    const userId = req.user._id;

    const {
      productId,
    } = req.params;

    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User Not Found",
      });
    }

    user.cart =
      user.cart.filter(
        (item) =>
          item.productId?.toString() !==
          productId
      );

    await user.save();

    return res.send({
      success: true,
      message:
        "Product Removed From Cart",
      data: user.cart,
    });

  } catch (error) {
    console.log(
      "Remove Cart Error:",
      error
    );

    return res.status(500).send({
      success: false,
      message:
        "Failed To Remove Product",
      error: error.message,
    });
  }
}


// ======================================
// EXPORT
// ======================================

module.exports = {
  getAllProducts,
  getSingleProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
};