const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: { type: [] },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "category" },
    subcategory: { type: String },
    discount: Number,
    stock: { type: Number, required: true },
    features: { type: [{ key: String, value: String }], default: [] },
    variant: { type: [], default: [] },
  },
  { timestamps: true },
);

const productModel = mongoose.model("products", productSchema);
module.exports = productModel;
