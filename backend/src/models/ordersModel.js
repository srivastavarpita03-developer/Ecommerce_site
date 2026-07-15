const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    items: {
      type: [
        {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
          quantity: Number,
          variant: Object,
        },
      ],
    },
    orderStatus: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled", "returned"],
      default: "pending",
    },

    shippingAddress: String,
    paymentStatus: { type: String, enum: ["pending", "completed"] },

    totalOrderValue: Number,
    payementMode: String,
    deliveredAt: Date,
  },
  { timestamps: true },
);

const orderModel = mongoose.model("order", orderSchema);
module.exports = orderModel;
