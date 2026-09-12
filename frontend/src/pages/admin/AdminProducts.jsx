import style from "./AdminProducts.module.css";
import { AiFillDelete } from "react-icons/ai";
import { RxCross2 } from "react-icons/rx";
import { FiUploadCloud, FiPlus, FiTrash2 } from "react-icons/fi";
import { BsBoxSeam, BsTag, BsLayers, BsImage } from "react-icons/bs";
import { useState, useEffect } from "react";
import api from "../../utils/api";
import Swal from "sweetalert2";

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
    features: [{ key: "", value: "" }],
    variant: [{ key: "", value: "" }],
  });

  const [categories, setCategories] = useState([]);

  // ======================================
  // IMAGE STATES
  // ======================================

  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  // ======================================
  // HANDLE BASIC INPUT
  // ======================================

  function handleChange(e) {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  }

  // ======================================
  // FEATURES
  // ======================================

  function handleFeatureChange(index, field, value) {
    const updated = [...data.features];
    updated[index][field] = value;
    setData({ ...data, features: updated });
  }

  function addFeature() {
    setData({ ...data, features: [...data.features, { key: "", value: "" }] });
  }

  function removeFeature(index) {
    const updated = data.features.filter((_, i) => i !== index);
    setData({ ...data, features: updated.length > 0 ? updated : [{ key: "", value: "" }] });
  }

  // ======================================
  // VARIANTS
  // ======================================

  function handleVariantChange(index, field, value) {
    const updated = [...data.variant];
    updated[index][field] = value;
    setData({ ...data, variant: updated });
  }

  function addVariant() {
    setData({ ...data, variant: [...data.variant, { key: "", value: "" }] });
  }

  function removeVariant(index) {
    const updated = data.variant.filter((_, i) => i !== index);
    setData({ ...data, variant: updated.length > 0 ? updated : [{ key: "", value: "" }] });
  }

  // ======================================
  // IMAGE HANDLERS
  // ======================================

  function handleImageSelect(e) {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
  }

  function removeNewImage(index) {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removeExistingImage(filename) {
    setExistingImages((prev) => prev.filter((img) => img !== filename));
    setRemovedImages((prev) => [...prev, filename]);
  }

  // ======================================
  // SUBMIT PRODUCT
  // ======================================

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", data.price);
    formData.append("discount", data.discount);
    formData.append("stock", data.stock);
    formData.append("category", data.category);
    formData.append("subcategory", data.subcategory);

    const validFeatures = data.features.filter(
      (f) => f.key.trim() !== "" && f.value.trim() !== ""
    );
    formData.append("features", JSON.stringify(validFeatures));

    const validVariants = data.variant.filter(
      (v) => v.key.trim() !== "" && v.value.trim() !== ""
    );
    formData.append("variant", JSON.stringify(validVariants));

    // NEW IMAGES
    for (let image of newImages) {
      formData.append("images", image);
    }

    try {
      let response;

      if (editId) {
        // UPDATE: send remaining existing images + removed list
        formData.append("productId", editId);
        formData.append("oldImages", JSON.stringify(existingImages));

        response = await api.put("/products", formData, {
          headers: undefined,
        });
      } else {
        response = await api.post("/products", formData, {
          headers: undefined,
        });
      }

      if (response.data.success) {
        alert(editId ? "Product Updated" : "Product Added");
        resetForm();
        setIsMenuOpen(false);
        getProductsData();
      }
    } catch (err) {
      console.log("Product Submit Error:", err);
      alert(err.response?.data?.message || "Error saving product");
    }
  }

  function resetForm() {
    setEditId(null);
    setData({
      title: "",
      description: "",
      price: 0,
      discount: 0,
      stock: 0,
      category: "",
      subcategory: "",
      features: [{ key: "", value: "" }],
      variant: [{ key: "", value: "" }],
    });
    setNewImages([]);
    setExistingImages([]);
    setRemovedImages([]);
  }

  // ======================================
  // GET CATEGORIES
  // ======================================

  async function getData() {
    try {
      const response = await api.get("/category");
      if (response.data?.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.log("Category Error:", error);
    }
  }

  // ======================================
  // GET PRODUCTS
  // ======================================

  async function getProductsData() {
    try {
      const response = await api.get("/products/all");
      if (response.data?.success) {
        setProductsData(response.data.data);
      }
    } catch (error) {
      console.log("Products Error:", error);
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
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete product?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
    });
    if (!confirmation.isConfirmed) return;

    try {
      const response = await api.delete("/products", { data: { productId: id } });
      if (response.data.success) {
        alert("Product Deleted Successfully");
        getProductsData();
      }
    } catch (err) {
      console.log(err);
      alert("Error deleting product");
    }
  }

  // ======================================
  // EDIT PRODUCT
  // ======================================

  function editProduct(product) {
    setEditId(product._id);

    setData({
      title: product.title || "",
      description: product.description || "",
      price: product.price || 0,
      discount: product.discount || 0,
      stock: product.stock || 0,
      category: product.category?._id || product.category || "",
      subcategory: product.subcategory || "",
      features: product.features?.length > 0 ? product.features : [{ key: "", value: "" }],
      variant: product.variant?.length > 0 ? product.variant : [{ key: "", value: "" }],
    });

    setExistingImages(product.images || []);
    setNewImages([]);
    setRemovedImages([]);

    setIsMenuOpen(true);
  }

  return (
    <section className={style.adminProducts}>

      {/* ======================================
          ADD / UPDATE PRODUCT MODAL
      ====================================== */}

      {isMenuOpen && (
        <div className={style.modalOverlay}>
          <div className={style.modalBackdrop} onClick={() => setIsMenuOpen(false)} />

          <form className={style.modalForm} onSubmit={handleSubmit}>

            {/* MODAL HEADER */}
            <div className={style.modalHeader}>
              <div className={style.modalHeaderLeft}>
                <div className={style.modalHeaderIcon}>
                  <BsBoxSeam />
                </div>
                <div>
                  <h1 className={style.modalTitle}>
                    {editId ? "Update Product" : "Add New Product"}
                  </h1>
                  <p className={style.modalSubtitle}>
                    {editId ? "Edit product details below" : "Fill in the details to add a new product"}
                  </p>
                </div>
              </div>
              <button type="button" className={style.closeBtn} onClick={() => setIsMenuOpen(false)}>
                <RxCross2 />
              </button>
            </div>

            <div className={style.modalBody}>

              {/* ===== BASIC INFO ===== */}
              <div className={style.section}>
                <div className={style.sectionHeader}>
                  <BsTag className={style.sectionIcon} />
                  <div>
                    <h3 className={style.sectionTitle}>Basic Information</h3>
                    <p className={style.sectionDesc}>Product name and description</p>
                  </div>
                </div>

                <div className={style.fieldGrid}>
                  <div className={style.fieldFull}>
                    <label className={style.fieldLabel}>Product Name</label>
                    <input
                      type="text"
                      className={style.fieldInput}
                      placeholder="e.g. Premium Cotton T-Shirt"
                      name="title"
                      onChange={handleChange}
                      value={data.title}
                    />
                  </div>

                  <div className={style.fieldFull}>
                    <label className={style.fieldLabel}>Description</label>
                    <textarea
                      className={style.fieldTextarea}
                      rows="4"
                      placeholder="Write a compelling product description..."
                      name="description"
                      onChange={handleChange}
                      value={data.description}
                    />
                  </div>
                </div>
              </div>

              {/* ===== PRICING & INVENTORY ===== */}
              <div className={style.section}>
                <div className={style.sectionHeader}>
                  <BsLayers className={style.sectionIcon} />
                  <div>
                    <h3 className={style.sectionTitle}>Pricing & Inventory</h3>
                    <p className={style.sectionDesc}>Set price, discount, and stock</p>
                  </div>
                </div>

                <div className={style.fieldGrid}>
                  <div className={style.field}>
                    <label className={style.fieldLabel}>Price (₹)</label>
                    <div className={style.inputPrefix}>
                      <span className={style.prefix}>₹</span>
                      <input
                        type="number"
                        className={style.fieldInputPrefixed}
                        placeholder="0"
                        name="price"
                        onChange={handleChange}
                        value={data.price}
                      />
                    </div>
                  </div>

                  <div className={style.field}>
                    <label className={style.fieldLabel}>Discount (%)</label>
                    <div className={style.inputPrefix}>
                      <span className={style.prefix}>%</span>
                      <input
                        type="number"
                        className={style.fieldInputPrefixed}
                        placeholder="0"
                        name="discount"
                        onChange={handleChange}
                        value={data.discount}
                      />
                    </div>
                  </div>

                  <div className={style.field}>
                    <label className={style.fieldLabel}>Stock</label>
                    <input
                      type="number"
                      className={style.fieldInput}
                      placeholder="0"
                      name="stock"
                      onChange={handleChange}
                      value={data.stock}
                    />
                  </div>

                  <div className={style.field}>
                    <label className={style.fieldLabel}>Category</label>
                    <select
                      className={style.fieldSelect}
                      name="category"
                      value={data.category}
                      onChange={handleChange}
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option value={category._id} key={category._id}>
                          {category?.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={style.fieldFull}>
                    <label className={style.fieldLabel}>Sub Category</label>
                    <input
                      type="text"
                      className={style.fieldInput}
                      placeholder="e.g. Casual Wear"
                      name="subcategory"
                      value={data.subcategory}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* ===== FEATURES ===== */}
              <div className={style.section}>
                <div className={style.sectionHeader}>
                  <BsTag className={style.sectionIcon} />
                  <div>
                    <h3 className={style.sectionTitle}>Product Features</h3>
                    <p className={style.sectionDesc}>Key-value pairs like Fabric: Cotton</p>
                  </div>
                </div>

                <div className={style.dynamicList}>
                  {data.features.map((feature, index) => (
                    <div key={index} className={style.dynamicRow}>
                      <input
                        type="text"
                        className={style.dynamicInput}
                        placeholder="Feature (e.g. Fabric)"
                        value={feature.key}
                        onChange={(e) => handleFeatureChange(index, "key", e.target.value)}
                      />
                      <input
                        type="text"
                        className={style.dynamicInput}
                        placeholder="Value (e.g. Cotton)"
                        value={feature.value}
                        onChange={(e) => handleFeatureChange(index, "value", e.target.value)}
                      />
                      <button type="button" className={style.removeBtn} onClick={() => removeFeature(index)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>

                <button type="button" className={style.addBtn} onClick={addFeature}>
                  <FiPlus /> Add Feature
                </button>
              </div>

              {/* ===== VARIANTS ===== */}
              <div className={style.section}>
                <div className={style.sectionHeader}>
                  <BsLayers className={style.sectionIcon} />
                  <div>
                    <h3 className={style.sectionTitle}>Product Variants</h3>
                    <p className={style.sectionDesc}>Key-value pairs like Size: M</p>
                  </div>
                </div>

                <div className={style.dynamicList}>
                  {data.variant.map((variant, index) => (
                    <div key={index} className={style.dynamicRow}>
                      <input
                        type="text"
                        className={style.dynamicInput}
                        placeholder="Variant (e.g. Size)"
                        value={variant.key}
                        onChange={(e) => handleVariantChange(index, "key", e.target.value)}
                      />
                      <input
                        type="text"
                        className={style.dynamicInput}
                        placeholder="Value (e.g. M)"
                        value={variant.value}
                        onChange={(e) => handleVariantChange(index, "value", e.target.value)}
                      />
                      <button type="button" className={style.removeBtn} onClick={() => removeVariant(index)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>

                <button type="button" className={style.addBtn} onClick={addVariant}>
                  <FiPlus /> Add Variant
                </button>
              </div>

              {/* ===== IMAGES ===== */}
              <div className={style.section}>
                <div className={style.sectionHeader}>
                  <BsImage className={style.sectionIcon} />
                  <div>
                    <h3 className={style.sectionTitle}>Product Images</h3>
                    <p className={style.sectionDesc}>Upload product photos</p>
                  </div>
                </div>

                {/* EXISTING IMAGES (from server) */}
                {existingImages.length > 0 && (
                  <div className={style.imagePreviewGrid}>
                    {existingImages.map((filename) => (
                      <div key={filename} className={style.imagePreviewItem}>
                        <img src={IMAGE_API + filename} alt={filename} />
                        <button
                          type="button"
                          className={style.imageRemoveBtn}
                          onClick={() => removeExistingImage(filename)}
                        >
                          <RxCross2 />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* NEW IMAGES (just selected) */}
                {newImages.length > 0 && (
                  <div className={style.imagePreviewGrid}>
                    {newImages.map((file, index) => (
                      <div key={index} className={style.imagePreviewItem}>
                        <img src={URL.createObjectURL(file)} alt={file.name} />
                        <button
                          type="button"
                          className={style.imageRemoveBtn}
                          onClick={() => removeNewImage(index)}
                        >
                          <RxCross2 />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className={style.fileUpload}>
                  <FiUploadCloud className={style.uploadIcon} />
                  <span className={style.uploadText}>Click to upload or drag and drop</span>
                  <span className={style.uploadHint}>PNG, JPG, WEBP — Max 5MB each</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                </label>
              </div>

            </div>

            {/* MODAL FOOTER */}
            <div className={style.modalFooter}>
              <button type="button" className={style.cancelBtn} onClick={() => setIsMenuOpen(false)}>
                Cancel
              </button>
              <button type="submit" className={style.submitBtn}>
                {editId ? "Update Product" : "Add Product"}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ======================================
          ADMIN PRODUCT HEADER
      ====================================== */}

      <div className={style.adminProductsHeader}>
        <h1>Admin Products</h1>

        <button
          onClick={() => {
            resetForm();
            setIsMenuOpen(true);
          }}
        >
          Add Product
        </button>
      </div>

      {/* ======================================
          PRODUCTS
      ====================================== */}

      <div className={style.productGrid}>
        {productsData.map((product) => (
          <div key={product?._id} className={style.productCard}>

            <div className={style.imageWrap}>
              <img
                src={IMAGE_API + product?.images?.[0]}
                alt={product?.title}
              />

              <button
                type="button"
                className={style.productDeleteBtn}
                onClick={() => deleteProduct(product._id)}
              >
                <AiFillDelete className={style.deleteIcon} />
              </button>

              <button
                type="button"
                className={style.editBtn}
                onClick={() => editProduct(product)}
              >
                Edit
              </button>
            </div>

            <div className={style.cardInfo}>
              <h2 className={style.cardTitle}>{product?.title}</h2>
              <p className={style.cardPrice}>
                ₹ {Number(product.price).toLocaleString()}
              </p>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
}

export default AdminProducts;
