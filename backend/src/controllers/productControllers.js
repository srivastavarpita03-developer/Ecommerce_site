const Product = require("../models/productsModel");

async function getAllProducts(req, res) {
  let page = 1;
  let limit = 8;
  if (req.query?.page) {
    page = parseInt(req.query.page);
  }
  if (req.query?.limit) {
    limit = parseInt(req.query?.limit);
  }
  const data = await Product.find({})
    .skip((page - 1) * limit)
    .limit(limit);
  const total = await Product.countDocuments();
  const totalPages = Math.ceil(total / limit);
  const isNextPage = page < totalPages;
  const isPrevPage = page > 1;
  return res.send({
    success: true,
    message: `${total} Products Found`,
    data: data,
    pagination: { total, totalPages, page, limit, isNextPage, isPrevPage },
  });
}
// abc?page=2&limit=10 ==> {page: 5,limit:8}
// Page 1: 1-10
// Page 2: 11-20
// Page 3: 21-30
// Page 4:
async function getSingleProduct(req, res) {
  const productId = req.params.productId;
  const productData = await Product.findById(productId);
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

async function addProduct(req, res) {
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
  const images = req?.files?.map((file) => file.filename);
  const productData = new Product({
    title,
    description,
    price,
    category,
    subcategory,
    discount,
    stock,
    features,
    variant,
    images,
  });
  const newProductData = await productData.save();
  return res.send({
    success: true,
    message: "Product Added Successfully",
    data: newProductData,
  });
}

async function updateProduct(req, res) {
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
  const newImages = req?.files?.map((file) => file.filename);
  const images = [...oldImages, ...newImages];
  const updatedProductData = await Product.findByIdAndUpdate(productId, {
    title,
    description,
    price,
    category,
    subcategory,
    discount,
    stock,
    features,
    variant,
    images,
  });
  return res.send({
    success: true,
    message: "Product Updated Successfully",
    data: updatedProductData,
  });
}

async function deleteProduct(req, res) {
  const data = req.body;
  console.log(data,res.body)
  const { productId } = data;
  await Product.findByIdAndDelete(productId);
  return res.send({ success: true, message: "Product Delete Successfully" });
}

module.exports = {
  getAllProducts,
  getSingleProduct,
  addProduct,
  updateProduct,
  deleteProduct,
};
