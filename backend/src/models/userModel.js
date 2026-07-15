const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    wishlist: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "products",
      default: [],
    },
    cart: { type: [], default: [] },
    address: { type: String },
    contactNumber: { type: Number },
  },
  { timestamps: true },
);

const userModel = mongoose.model("users", userSchema);
module.exports = userModel;
