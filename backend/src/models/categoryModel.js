const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
  {
    name: String,
    icon: String,
    subcategory: {
      type: [],
      default: [],
    },
  },
  { timestamps: true },
);

const categoryModel = mongoose.model("category", categorySchema);
module.exports = categoryModel;
