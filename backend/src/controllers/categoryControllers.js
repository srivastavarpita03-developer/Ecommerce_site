const Category = require("../models/categoryModel");

async function getCategories(req, res) {
  const allCategories = await Category.find({});
  res.send({ success: true, message: "Success", data: allCategories });
}

async function addCategory(req, res) {
  const data = req.body;
  const { name, icon, subcategory } = data;
  const newCategory = new Category({ name, icon, subcategory });
  const newCategoryData = await newCategory.save();
  res.send({
    success: true,
    message: "Category Added Successfully",
    data: newCategoryData,
  });
}

async function updateCategory(req, res) {
  const data = req.body;
  const { name, icon, subcategory, categoryId } = data;
  const updatedCategory = await Category.findByIdAndUpdate(categoryId, {
    name,
    icon,
    subcategory,
  });

  return res.send({
    success: true,
    message: "Category Updated Successfully",
    data: updateCategory,
  });
}

async function deleteCategory(req, res) {
  const data = req.body;
  const { categoryId } = data;
  await Category.findByIdAndDelete(categoryId);
  return res.send({ success: true, message: "Category Deleted Successfully" });
}

module.exports = { getCategories, addCategory, updateCategory, deleteCategory };
