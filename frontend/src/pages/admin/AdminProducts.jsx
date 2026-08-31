import style from "./AdminProducts.module.css";
import productCSS from "../Products.module.css";
import { AiFillDelete } from "react-icons/ai";
import { RxCross2 } from "react-icons/rx";
import { useState, useEffect } from "react";
import api from "../../utils/api";

function AdminProducts() {
  let [productsData, setProductsData] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const IMAGE_API = "http://localhost:4000/uploads/";

  // ======================================
  // PRODUCT DATA
  // ======================================

  const [data, setData] = useState({
    title: "",
    description: "",
    price: 0,
    discount: 0,
    stock: 0,
    category: "",
    subcategory: "",
    images: [],

    // NEW
    features: [
      {
        key: "",
        value: "",
      },
    ],

    variant: [
      {
        key: "",
        value: "",
      },
    ],
  });

  const [categories, setCategories] = useState([]);

  // ======================================
  // HANDLE BASIC INPUT
  // ======================================

  function handleChange(e) {
    const { name, value } = e.target;

    setData({
      ...data,
      [name]: value,
    });
  }

  // ======================================
  // FEATURES
  // ======================================

  function handleFeatureChange(index, field, value) {
    const updatedFeatures = [...data.features];

    updatedFeatures[index][field] = value;

    setData({
      ...data,
      features: updatedFeatures,
    });
  }

  function addFeature() {
    setData({
      ...data,
      features: [
        ...data.features,
        {
          key: "",
          value: "",
        },
      ],
    });
  }

  function removeFeature(index) {
    const updatedFeatures = data.features.filter(
      (_, i) => i !== index
    );

    setData({
      ...data,
      features:
        updatedFeatures.length > 0
          ? updatedFeatures
          : [{ key: "", value: "" }],
    });
  }

  // ======================================
  // VARIANTS
  // ======================================

  function handleVariantChange(index, field, value) {
    const updatedVariants = [...data.variant];

    updatedVariants[index][field] = value;

    setData({
      ...data,
      variant: updatedVariants,
    });
  }

  function addVariant() {
    setData({
      ...data,
      variant: [
        ...data.variant,
        {
          key: "",
          value: "",
        },
      ],
    });
  }

  function removeVariant(index) {
    const updatedVariants = data.variant.filter(
      (_, i) => i !== index
    );

    setData({
      ...data,
      variant:
        updatedVariants.length > 0
          ? updatedVariants
          : [{ key: "", value: "" }],
    });
  }

  // ======================================
  // SUBMIT PRODUCT
  // ======================================

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();

    // Basic fields
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", data.price);
    formData.append("discount", data.discount);
    formData.append("stock", data.stock);
    formData.append("category", data.category);
    formData.append("subcategory", data.subcategory);

    // ======================================
    // FEATURES
    // ======================================

    const validFeatures = data.features.filter(
      (feature) =>
        feature.key.trim() !== "" &&
        feature.value.trim() !== ""
    );

    formData.append(
      "features",
      JSON.stringify(validFeatures)
    );

    // ======================================
    // VARIANTS
    // ======================================

    const validVariants = data.variant.filter(
      (variant) =>
        variant.key.trim() !== "" &&
        variant.value.trim() !== ""
    );

    formData.append(
      "variant",
      JSON.stringify(validVariants)
    );

    // ======================================
    // IMAGES
    // ======================================

    for (let image of data.images) {
      formData.append("images", image);
    }

    try {
      let response;

      if (editId) {
        formData.append("productId", editId);

        formData.append(
          "oldImages",
          JSON.stringify([])
        );

        response = await api.put(
          "/products",
          formData,
          {
            headers: undefined,
          }
        );
      } else {
        response = await api.post(
          "/products",
          formData,
          {
            headers: undefined,
          }
        );
      }

      if (response.data.success) {
        alert(
          editId
            ? "Product Updated"
            : "Product Added"
        );

        setEditId(null);

        // Reset
        setData({
          title: "",
          description: "",
          price: 0,
          discount: 0,
          stock: 0,
          category: "",
          subcategory: "",
          images: [],

          features: [
            {
              key: "",
              value: "",
            },
          ],

          variant: [
            {
              key: "",
              value: "",
            },
          ],
        });

        setIsMenuOpen(false);

        getProductsData();
      }
    } catch (err) {
      console.log("Product Submit Error:", err);

      alert(
        err.response?.data?.message ||
          "Error saving product"
      );
    }
  }

  // ======================================
  // GET CATEGORIES
  // ======================================

  async function getData() {
    try {
      const response = await api.get("/category");

      const res = response.data;

      if (res?.success) {
        setCategories(res?.data);
      }
    } catch (error) {
      console.log(
        "Category Error:",
        error
      );
    }
  }

  // ======================================
  // GET PRODUCTS
  // ======================================

  async function getProductsData() {
    try {
      const response = await api.get(
        "/products/all"
      );

      const res = response.data;

      if (res?.success) {
        setProductsData(res?.data);
      }
    } catch (error) {
      console.log(
        "Products Error:",
        error
      );
    }
  }

  useEffect(() => {
    getData();
    getProductsData();
  }, []);

  // ======================================
  // DELETE PRODUCT
  // ======================================

  async function deleteProduct(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      const response = await api.delete(
        "/products",
        {
          data: {
            productId: id,
          },
        }
      );

      if (response.data.success) {
        alert(
          "Product Deleted Successfully"
        );

        getProductsData();
      }
    } catch (err) {
      console.log(err);

      alert(
        "Error deleting product"
      );
    }
  }

  // ======================================
  // EDIT PRODUCT
  // ======================================

  function editProduct(product) {
    setEditId(product._id);

    setData({
      title: product.title || "",
      description:
        product.description || "",
      price: product.price || 0,
      discount: product.discount || 0,
      stock: product.stock || 0,

      category:
        product.category?._id ||
        product.category ||
        "",

      subcategory:
        product.subcategory || "",

      images: [],

      // FEATURES
      features:
        product.features?.length > 0
          ? product.features
          : [
              {
                key: "",
                value: "",
              },
            ],

      // VARIANTS
      variant:
        product.variant?.length > 0
          ? product.variant
          : [
              {
                key: "",
                value: "",
              },
            ],
    });

    setIsMenuOpen(true);
  }

  return (
    <section className={style.adminProducts}>

      {/* ======================================
          ADD / UPDATE PRODUCT MODAL
      ====================================== */}

      {isMenuOpen && (
        <div
          className={
            style.addProductOverlay
          }
        >
          <form
            className={
              style.addProductForm
            }
            onSubmit={handleSubmit}
          >

            {/* HEADER */}

            <div
              className={
                style.addProductHeader
              }
            >
              <h1>
                {editId
                  ? "Update Product"
                  : "Add Product"}
              </h1>

              <RxCross2
                className={
                  style.closeButton
                }
                onClick={() =>
                  setIsMenuOpen(false)
                }
              />
            </div>

            <div
              className={
                style.formBody
              }
            >

              {/* PRODUCT NAME */}

              <div
                className={
                  style.formRow
                }
              >
                <label>
                  Product Name
                </label>

                <input
                  type="text"
                  placeholder="Enter product name"
                  name="title"
                  onChange={handleChange}
                  value={data.title}
                />
              </div>

              {/* DESCRIPTION */}

              <div
                className={
                  style.formRow
                }
              >
                <label>
                  Description
                </label>

                <textarea
                  rows="5"
                  placeholder="Enter product description"
                  name="description"
                  onChange={handleChange}
                  value={
                    data.description
                  }
                />
              </div>

              {/* PRICE */}

              <div
                className={
                  style.formRow
                }
              >
                <label>
                  Price
                </label>

                <input
                  type="number"
                  placeholder="Enter price"
                  name="price"
                  onChange={handleChange}
                  value={data.price}
                />
              </div>

              {/* DISCOUNT */}

              <div
                className={
                  style.formRow
                }
              >
                <label>
                  Discount (%)
                </label>

                <input
                  type="number"
                  placeholder="Enter discount"
                  name="discount"
                  onChange={handleChange}
                  value={data.discount}
                />
              </div>

              {/* STOCK */}

              <div
                className={
                  style.formRow
                }
              >
                <label>
                  Stock
                </label>

                <input
                  type="number"
                  placeholder="Available stock"
                  name="stock"
                  onChange={handleChange}
                  value={data.stock}
                />
              </div>

              {/* CATEGORY */}

              <div
                className={
                  style.formRow
                }
              >
                <label>
                  Category
                </label>

                <select
                  name="category"
                  value={data.category}
                  onChange={handleChange}
                >
                  <option value="">
                    Select Category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        value={
                          category._id
                        }
                        key={
                          category._id
                        }
                      >
                        {category?.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* SUB CATEGORY */}

              <div
                className={
                  style.formRow
                }
              >
                <label>
                  Sub Category
                </label>

                <input
                  type="text"
                  placeholder="Sub Category"
                  name="subcategory"
                  value={
                    data.subcategory
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              {/* ==================================
                  FEATURES
              ================================== */}

              <div
                className={
                  style.formRow
                }
              >
                <label>
                  Product Features
                </label>

                {data.features.map(
                  (feature, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginBottom:
                          "10px",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Feature (e.g. Fabric)"
                        value={
                          feature.key
                        }
                        onChange={(e) =>
                          handleFeatureChange(
                            index,
                            "key",
                            e.target.value
                          )
                        }
                      />

                      <input
                        type="text"
                        placeholder="Value (e.g. Cotton)"
                        value={
                          feature.value
                        }
                        onChange={(e) =>
                          handleFeatureChange(
                            index,
                            "value",
                            e.target.value
                          )
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeFeature(
                            index
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  )
                )}

                <button
                  type="button"
                  onClick={
                    addFeature
                  }
                >
                  + Add Feature
                </button>
              </div>

              {/* ==================================
                  VARIANTS
              ================================== */}

              <div
                className={
                  style.formRow
                }
              >
                <label>
                  Product Variants
                </label>

                {data.variant.map(
                  (variant, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginBottom:
                          "10px",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Variant (e.g. Size)"
                        value={
                          variant.key
                        }
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "key",
                            e.target.value
                          )
                        }
                      />

                      <input
                        type="text"
                        placeholder="Value (e.g. M)"
                        value={
                          variant.value
                        }
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "value",
                            e.target.value
                          )
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeVariant(
                            index
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  )
                )}

                <button
                  type="button"
                  onClick={
                    addVariant
                  }
                >
                  + Add Variant
                </button>
              </div>

              {/* ==================================
                  IMAGES
              ================================== */}

              <div
                className={
                  style.formRow
                }
              >
                <label>
                  Product Images
                </label>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    setData({
                      ...data,
                      images:
                        e.target.files,
                    });
                  }}
                />
              </div>

              {/* SUBMIT */}

              <input
                type="submit"
                className={
                  style.submitBtn
                }
                value={
                  editId
                    ? "Update Product"
                    : "Add Product"
                }
              />

            </div>
          </form>
        </div>
      )}

      {/* ======================================
          ADMIN PRODUCT HEADER
      ====================================== */}

      <div
        className={
          style.adminProductsHeader
        }
      >
        <h1>
          Admin Products
        </h1>

        <button
          onClick={() => {
            setEditId(null);

            setData({
              title: "",
              description: "",
              price: 0,
              discount: 0,
              stock: 0,
              category: "",
              subcategory: "",
              images: [],

              features: [
                {
                  key: "",
                  value: "",
                },
              ],

              variant: [
                {
                  key: "",
                  value: "",
                },
              ],
            });

            setIsMenuOpen(true);
          }}
        >
          Add Product
        </button>
      </div>

      {/* ======================================
          PRODUCTS
      ====================================== */}

      <div
        className={
          productCSS["product-grid"]
        }
      >
        {productsData.map(
          (product) => (
            <div
              key={product?._id}
              className={
                productCSS[
                  "product-card"
                ]
              }
            >

              <div
                className={
                  productCSS[
                    "image-wrapper"
                  ]
                }
              >
                <img
                  src={
                    IMAGE_API +
                    product?.images?.[0]
                  }
                  alt={
                    product?.title
                  }
                />

                {/* DELETE */}

                <button
                  type="button"
                  className={
                    style.productDeleteBtn
                  }
                  onClick={() =>
                    deleteProduct(
                      product._id
                    )
                  }
                >
                  <AiFillDelete
                    className={
                      style.deleteIcon
                    }
                  />
                </button>

                {/* EDIT */}

                <button
                  type="button"
                  className={
                    productCSS[
                      "quick-add-btn"
                    ]
                  }
                  onClick={() =>
                    editProduct(
                      product
                    )
                  }
                >
                  Edit
                </button>
              </div>

              <div
                className={
                  productCSS[
                    "product-info"
                  ]
                }
              >
                <h2
                  className={
                    productCSS[
                      "product-title"
                    ]
                  }
                >
                  {product?.title}
                </h2>

                <p
                  className={
                    productCSS[
                      "product-price"
                    ]
                  }
                >
                  ₹{" "}
                  {Number(
                    product.price
                  ).toLocaleString()}
                </p>
              </div>

            </div>
          )
        )}
      </div>

    </section>
  );
}

export default AdminProducts;