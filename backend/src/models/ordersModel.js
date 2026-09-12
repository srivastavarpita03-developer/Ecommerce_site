const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    // ======================================
    // USER
    // ======================================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    // ======================================
    // ORDER ITEMS
    // ======================================

    items: {
      type: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products",
            required: true,
          },

          quantity: {
            type: Number,
            required: true,
            min: 1,
          },

          variant: {
            type: Object,
            default: {},
          },
        },
      ],

      required: true,
    },

    // ======================================
    // ORDER STATUS
    // ======================================

    orderStatus: {
      type: String,

      enum: [
        "pending",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],

      default: "pending",
    },

    // ======================================
    // SHIPPING ADDRESS
    // ======================================

    shippingAddress: {
      type: String,
      required: true,
    },

    // ======================================
    // CONTACT NUMBER
    // ======================================

    contactNumber: {
      type: String,
      required: true,
    },

    // ======================================
    // PAYMENT STATUS
    // ======================================

    paymentStatus: {
      type: String,

      enum: [
        "pending",
        "processing",
        "completed",
        "paid",
        "failed",
        "refunded",
      ],

      default: "pending",
    },

    // ======================================
    // TOTAL ORDER VALUE
    // ======================================

    totalOrderValue: {
      type: Number,
      required: true,
    },

    // ======================================
    // PAYMENT MODE
    // ======================================

    paymentMode: {
      type: String,

      enum: [
        "COD",
        "UPI",
        "Card",
      ],

      required: true,
    },

    paymentProvider: {
      type: String,
      enum: ["cod", "stripe"],
      default: "cod",
    },

    stripePaymentIntentId: {
      type: String,
      unique: true,
      sparse: true,
    },

    stripePaymentStatus: {
      type: String,
      default: null,
    },

    paymentFailureReason: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    // ======================================
    // DELIVERED DATE
    // ======================================

    deliveredAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

// ======================================
// MODEL
// ======================================

const orderModel = mongoose.model(
  "order",
  orderSchema
);

module.exports = orderModel;
