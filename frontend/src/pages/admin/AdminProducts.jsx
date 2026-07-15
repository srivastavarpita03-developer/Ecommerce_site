import style from "./AdminProducts.module.css";
import productCSS from "../Products.module.css";
import { AiFillDelete } from "react-icons/ai";
import { RxCross2 } from "react-icons/rx";
function AdminProducts() {
  let product = {
    title: "Demo Products",
    _id: 1,
    images: [
      "https://pitshirts.in/cdn/shop/files/InShot-20241209_144744296.jpg?v=1755319164&width=1946",
    ],
    price: 10000,
  };
  let productsData = [product, product];
  return (
    <section className={style.adminProducts}>
      {false && (
        <div className={style.addProductOverlay}>
          <form className={style.addProductForm}>
            {/* Header */}
            <div className={style.addProductHeader}>
              <h1>Add Product</h1>
              <RxCross2 className={style.closeButton} />
            </div>

            <div className={style.formBody}>
              {/* Product Name */}
              <div className={style.formRow}>
                <label>Product Name</label>
                <input type="text" placeholder="Enter product name" />
              </div>

              {/* Description */}
              <div className={style.formRow}>
                <label>Description</label>
                <textarea rows="5" placeholder="Enter product description" />
              </div>

              {/* Price */}
              <div className={style.formRow}>
                <label>Price</label>
                <input type="number" placeholder="Enter price" />
              </div>

              {/* Discount */}
              <div className={style.formRow}>
                <label>Discount (%)</label>
                <input type="number" placeholder="Enter discount" />
              </div>

              {/* Stock */}
              <div className={style.formRow}>
                <label>Stock</label>
                <input type="number" placeholder="Available stock" />
              </div>

              {/* Category */}
              <div className={style.formRow}>
                <label>Category</label>

                <select>
                  <option>Select Category</option>
                </select>
              </div>

              {/* Sub Category */}
              <div className={style.formRow}>
                <label>Sub Category</label>

                <input type="text" placeholder="Sub Category" />
              </div>

              {/* Images */}
              <div className={style.formRow}>
                <label>Product Images</label>

                <input type="file" multiple accept="image/*" />
              </div>
              {/* Submit */}

              <button type="submit" className={style.submitBtn}>
                Add Product
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={style.adminProductsHeader}>
        <h1>Admin Products</h1>
        <button>Add Product</button>
      </div>

      {/* Products */}
      <div className={productCSS["product-grid"]}>
        {productsData.map((product) => (
          <div key={product?._id} className={productCSS["product-card"]}>
            <div className={productCSS["image-wrapper"]}>
              <img src={product?.images?.[0]} alt={product?.title} />

              <button
                type="button"
                className={style.productDeleteBtn}
                aria-label="Delete"
              >
                <AiFillDelete className={style.deleteIcon} />
              </button>

              <button type="button" className={productCSS["quick-add-btn"]}>
                Edit
              </button>
            </div>

            <div className={productCSS["product-info"]}>
              <h2 className={productCSS["product-title"]}>{product?.title}</h2>
              <p className={productCSS["product-price"]}>
                ₹ {product.price.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AdminProducts;
