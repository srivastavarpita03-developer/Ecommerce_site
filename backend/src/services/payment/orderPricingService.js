const Product = require("../../models/productsModel");

async function buildOrderFromItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error("Order items are required");
    error.statusCode = 400;
    throw error;
  }

  const canonicalItems = [];
  let totalOrderValue = 0;

  for (const item of items) {
    const quantity = Number(item?.quantity);

    if (!item?.productId || !Number.isInteger(quantity) || quantity < 1) {
      const error = new Error("Each item needs a product ID and a quantity of at least 1");
      error.statusCode = 400;
      throw error;
    }

    const product = await Product.findById(item.productId).select(
      "price stock title"
    );

    if (!product) {
      const error = new Error("One of the selected products is no longer available");
      error.statusCode = 404;
      throw error;
    }

    if (product.stock < quantity) {
      const error = new Error(`${product.title} does not have enough stock`);
      error.statusCode = 409;
      throw error;
    }

    canonicalItems.push({
      productId: product._id,
      quantity,
      variant:
        item.variant && typeof item.variant === "object" && !Array.isArray(item.variant)
          ? item.variant
          : {},
    });

    totalOrderValue += Number(product.price) * quantity;
  }

  return { canonicalItems, totalOrderValue };
}

function validateCheckoutDetails({ shippingAddress, contactNumber }) {
  if (!shippingAddress || typeof shippingAddress !== "string" || !shippingAddress.trim()) {
    const error = new Error("Shipping address is required");
    error.statusCode = 400;
    throw error;
  }

  if (!contactNumber || !/^[0-9]{10}$/.test(String(contactNumber).trim())) {
    const error = new Error("Contact number must be 10 digits");
    error.statusCode = 400;
    throw error;
  }
}

module.exports = { buildOrderFromItems, validateCheckoutDetails };
