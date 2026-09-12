const Order = require("../models/ordersModel");
const User = require("../models/userModel");
const Product = require("../models/productsModel");

// ======================================
// GET ALL ORDERS - ADMIN
// ======================================

async function getAllOrders(req, res) {
  try {
    const allOrders = await Order.find({})
      .populate("userId")
      .populate("items.productId")
      .sort({ createdAt: -1 });

    return res.send({
      success: true,
      message: "Orders Fetched Successfully",
      data: allOrders,
    });
  } catch (error) {
    console.log("Get All Orders Error:", error);

    return res.status(500).send({
      success: false,
      message: "Failed To Get Orders",
      error: error.message,
    });
  }
}

// ======================================
// GET USER ORDERS
// ======================================

async function getUserOrders(req, res) {
  try {
    const userId = req.user._id;

    console.log("USER ID:", userId);

    const userOrders = await Order.find({
      userId: userId,
    })
      .populate("userId")
      .populate("items.productId")
      .sort({ createdAt: -1 });

    console.log("USER ORDERS:", userOrders);

    return res.status(200).send({
      success: true,
      message: "User Orders Fetched Successfully",
      data: userOrders,
    });

  } catch (error) {
    console.log(
      "Get User Orders Error:",
      error
    );

    return res.status(500).send({
      success: false,
      message: "Failed To Get User Orders",
      error: error.message,
    });
  }
}


// ======================================
// GET SINGLE ORDER - USER
// ======================================

async function getUserSingleOrder(req, res) {
  try {

    // URL se order ID
    const { id } = req.params;

    // Login user ki ID
    const userId = req.user._id;

    console.log("USER ID:", userId);
    console.log("ORDER ID:", id);


    // ======================================
    // ORDER FIND KARO
    // ======================================

    const order = await Order.findOne({
      _id: id,
      userId: userId,
    })
      .populate("userId")
      .populate("items.productId");


    // ======================================
    // ORDER NAHI MILA
    // ======================================

    if (!order) {

      return res.status(404).send({
        success: false,
        message: "Order not found",
      });

    }


    // ======================================
    // RESPONSE
    // ======================================

    return res.status(200).send({

      success: true,

      message: "Order Details Fetched Successfully",

      data: order,

    });

  } catch (error) {

    console.log(
      "Get User Single Order Error:",
      error
    );


    return res.status(500).send({

      success: false,

      message: "Failed To Get Order Details",

      error: error.message,

    });

  }
}



// ======================================
// CREATE ORDER
// ======================================

async function createOrder(req, res) {
  try {
    // ==============================
    // USER ID
    // ==============================

    const userId = req.user._id;

    // ==============================
    // REQUEST DATA
    // ==============================

    const {
      items,
      shippingAddress,
      contactNumber,
      totalOrderValue,
      paymentMode,
      paymentStatus,
    } = req.body;

    console.log("CREATE ORDER REQUEST:");
    console.log(req.body);

    // ==============================
    // CHECK ITEMS
    // ==============================

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Order items are required",
      });
    }

    // ==============================
    // CHECK SHIPPING ADDRESS
    // ==============================

    if (
      !shippingAddress ||
      typeof shippingAddress !== "string" ||
      !shippingAddress.trim()
    ) {
      return res.status(400).send({
        success: false,
        message: "Shipping address is required",
      });
    }

    // ==============================
    // CHECK CONTACT NUMBER
    // ==============================

    if (
      !contactNumber ||
      typeof contactNumber !== "string" ||
      !contactNumber.trim()
    ) {
      return res.status(400).send({
        success: false,
        message: "Contact number is required",
      });
    }

    if (!/^[0-9]{10}$/.test(contactNumber.trim())) {
      return res.status(400).send({
        success: false,
        message: "Contact number must be 10 digits",
      });
    }

    // ==============================
    // CHECK PAYMENT MODE
    // ==============================

    if (!paymentMode) {
      return res.status(400).send({
        success: false,
        message: "Payment mode is required",
      });
    }

    const allowedPaymentModes = [
      "COD",
      "UPI",
      "Card",
    ];

    if (!allowedPaymentModes.includes(paymentMode)) {
      return res.status(400).send({
        success: false,
        message: "Invalid payment mode",
      });
    }

    // ==============================
    // CHECK TOTAL
    // ==============================

    if (
      totalOrderValue === undefined ||
      totalOrderValue === null ||
      Number(totalOrderValue) < 0
    ) {
      return res.status(400).send({
        success: false,
        message: "Valid order total is required",
      });
    }

    // ==============================
    // CHECK USER
    // ==============================

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // ==============================
    // CHECK PRODUCTS
    // ==============================

    for (const item of items) {
      if (!item.productId) {
        return res.status(400).send({
          success: false,
          message: "Product ID is required",
        });
      }

      const product = await Product.findById(
        item.productId
      );

      if (!product) {
        return res.status(404).send({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      if (!item.quantity || Number(item.quantity) < 1) {
        return res.status(400).send({
          success: false,
          message: "Product quantity must be at least 1",
        });
      }
    }

    // ==============================
    // CREATE ORDER
    // ==============================

    const newOrder = new Order({
      userId: userId,

      items: items,

      shippingAddress: shippingAddress.trim(),

      contactNumber: contactNumber.trim(),

      totalOrderValue: Number(totalOrderValue),

      paymentMode: paymentMode,

      paymentStatus: paymentStatus || "pending",

      orderStatus: "pending",

      deliveredAt: null,
    });

    // ==============================
    // SAVE ORDER
    // ==============================

    const newOrderData = await newOrder.save();

    // ==============================
    // EMPTY USER CART
    // ==============================

    user.cart = [];

    await user.save();

    // ==============================
    // RESPONSE
    // ==============================

    return res.status(201).send({
      success: true,
      message: "Order Placed Successfully",
      data: newOrderData,
    });

  } catch (error) {
    console.log("Create Order Error:", error);

    return res.status(500).send({
      success: false,
      message: "Failed To Place Order",
      error: error.message,
    });
  }
}

// ======================================
// UPDATE ORDER STATUS - ADMIN
// ======================================

async function updateOrder(req, res) {
  try {
    const {
      orderId,
      status,
    } = req.body;

    // ==============================
    // VALIDATION
    // ==============================

    if (!orderId) {
      return res.status(400).send({
        success: false,
        message: "Order ID is required",
      });
    }

    if (!status) {
      return res.status(400).send({
        success: false,
        message: "Order status is required",
      });
    }

    // ==============================
    // DELIVERED DATE
    // ==============================

    let deliveredAt = null;

    if (status === "delivered") {
      deliveredAt = new Date();
    }

    // ==============================
    // UPDATE ORDER
    // ==============================

    const updatedOrderData =
      await Order.findByIdAndUpdate(
        orderId,
        {
          orderStatus: status,
          deliveredAt: deliveredAt,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    // ==============================
    // CHECK ORDER
    // ==============================

    if (!updatedOrderData) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }

    // ==============================
    // RESPONSE
    // ==============================

    return res.send({
      success: true,
      message: "Order Status Updated",
      data: updatedOrderData,
    });

  } catch (error) {
    console.log("Update Order Error:", error);

    return res.status(500).send({
      success: false,
      message: "Failed To Update Order",
      error: error.message,
    });
  }
}

// ======================================
// GET SINGLE ORDER - ADMIN
// ======================================

async function getSingleOrder(req, res) {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("userId")
      .populate("items.productId");

    // ==============================
    // ORDER NOT FOUND
    // ==============================

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }

    // ==============================
    // RESPONSE
    // ==============================

    return res.send({
      success: true,
      message: "Order Fetched Successfully",
      data: order,
    });

  } catch (error) {
    console.log("Get Single Order Error:", error);

    return res.status(500).send({
      success: false,
      message: "Failed To Get Order",
      error: error.message,
    });
  }
}

// ======================================
// EXPORT
// ======================================

module.exports = {
  getAllOrders,
  getUserOrders,
  getUserSingleOrder,
  createOrder,
  updateOrder,
  getSingleOrder,
};
