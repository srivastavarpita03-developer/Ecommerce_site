import { useEffect, useState } from "react";
import api from "../utils/api";
import productCSS from "./Products.module.css";
import { FaRegHeart } from "react-icons/fa";

function Product() {
  const [productData, setProductData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [Price, setPrice] = useState(5000);
  const [currentPage, setCurrentPage] = useState(1);

  const IMAGE_API = "http://localhost:4000/uploads/";

  async function getData(page = 1) {
    try {
      const response = await api.get(
        `/products/all?page=${page}&limit=8`
      );

      const res = response.data;

      if (res.success) {
        setProductData(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.log(err);
    }
  }

  // ==============================
  // ADD TO CART
  // ==============================
  async function addToCart(productId) {
    try {
      const response = await api.post("/products/cart/add", {
        productId: productId,
        quantity: 1,
        variant: {},
      });

      const res = response.data;

      if (res.success) {
        alert("Product Added To Cart");
      } else {
        alert(res.message || "Failed to add product");
      }
    } catch (error) {
      console.log("Add To Cart Error:", error);

      if (error.response?.status === 401) {
        alert("Please login first");
      } else {
        alert(
          error.response?.data?.message ||
            "Failed to add product to cart"
        );
      }
    }
  }

  async function getCategories() {
    try {
      const response = await api.get("/category");

      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getData(currentPage);
  }, [currentPage]);

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <main className={productCSS.container}>
      {/* ================= FILTER ================= */}

      <aside className={productCSS["filter-sidebar"]}>
        <h2>Filters</h2>

        <hr className={productCSS.divider} />

        <div className={productCSS["filter-group"]}>
          <h3>Category</h3>

          {categories.map((category) => (
            <div
              className={productCSS["checkbox-group"]}
              key={category._id}
            >
              <input
                type="checkbox"
                name="category"
                value={category.name}
                checked={selectedCategory === category.name}
                onChange={(e) =>
                  setSelectedCategory(
                    e.target.checked ? e.target.value : ""
                  )
                }
              />

              <label>{category.name}</label>
            </div>
          ))}
        </div>

        <div className={productCSS["filter-group"]}>
          <h3>SIZE</h3>

          <div className={productCSS["size-grid"]}>
            <button type="button" className={productCSS["size-btn"]}>
              XS
            </button>

            <button
              type="button"
              className={
                productCSS["size-btn"] +
                " " +
                productCSS["active"]
              }
            >
              S
            </button>

            <button type="button" className={productCSS["size-btn"]}>
              M
            </button>

            <button type="button" className={productCSS["size-btn"]}>
              L
            </button>

            <button type="button" className={productCSS["size-btn"]}>
              XL
            </button>
          </div>
        </div>

        <div className={productCSS["filter-group"]}>
          <h3>PRICE RANGE</h3>

          <div className={productCSS["price-slider-wrapper"]}>
            <input
              type="range"
              className={productCSS["price-slider"]}
              min="100"
              max="5000"
              value={Price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <div className={productCSS["price-labels"]}>
              <span>₹100</span>
              <span>₹{Price}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className={productCSS["apply-btn"]}
          onClick={() => {
            setCurrentPage(1);
            getData(1);
          }}
        >
          APPLY FILTERS
        </button>
      </aside>

      {/* ================= PRODUCTS ================= */}

      <section className={productCSS["product-container"]}>
        <div className={productCSS["product-header"]}>
          <div className={productCSS["header-title-group"]}>
            <h1>Premium Attires</h1>

            <p className={productCSS["item-count"]}>
              Displaying {productData.length} of{" "}
              {pagination?.total || 0} items
            </p>
          </div>

          <div className={productCSS["sort-dropdown-wrapper"]}>
            <label htmlFor="sort-select">
              <span className={productCSS["sortby-text"]}>
                SORT BY:
              </span>
            </label>

            <select
              id="sort-select"
              className={productCSS["sort-select"]}
              defaultValue="recommended"
            >
              <option value="recommended">
                Recommended
              </option>

              <option value="low-to-high">
                Price: Low to High
              </option>

              <option value="high-to-low">
                Price: High to Low
              </option>

              <option value="newest">
                Newest First
              </option>
            </select>
          </div>
        </div>

        {/* PRODUCT GRID */}

        <div className={productCSS["product-grid"]}>
          {productData?.map((product) => (
            <div
              key={product?._id}
              className={productCSS["product-card"]}
            >
              <div className={productCSS["image-wrapper"]}>
                <img
                  src={
                    IMAGE_API +
                    product?.images?.[0]
                  }
                  alt={product?.title}
                />

                {/* Wishlist */}

                <button
                  type="button"
                  className={productCSS["favorite-btn"]}
                  aria-label="Add to favorites"
                >
                  <FaRegHeart
                    className={productCSS["heart-icon"]}
                  />
                </button>

                {/* ADD TO CART */}

                <button
                  type="button"
                  className={productCSS["quick-add-btn"]}
                  onClick={() =>
                    addToCart(product._id)
                  }
                >
                  Add To Cart
                </button>
              </div>

              <div className={productCSS["product-info"]}>
                <h2
                  className={
                    productCSS["product-title"]
                  }
                >
                  {product?.title}
                </h2>

                <p
                  className={
                    productCSS["product-price"]
                  }
                >
                  ₹{" "}
                  {Number(
                    product.price
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}

        {productData.length > 0 && (
          <div className={productCSS["pagination"]}>
            <button
              className={productCSS["page-arrow"]}
              disabled={currentPage === 1}
              onClick={() => {
                if (currentPage > 1) {
                  setCurrentPage(
                    currentPage - 1
                  );
                }
              }}
            >
              ←
            </button>

            {new Array(
              pagination?.totalPages || 0
            )
              .fill(0)
              .map((_, page) => (
                <button
                  key={page}
                  className={`${productCSS["page-num"]} ${
                    currentPage === page + 1
                      ? productCSS.active
                      : ""
                  }`}
                  onClick={() =>
                    setCurrentPage(page + 1)
                  }
                >
                  {page + 1}
                </button>
              ))}

            <button
              className={
                productCSS["page-arrow"]
              }
              disabled={
                currentPage >=
                pagination?.totalPages
              }
              onClick={() => {
                if (
                  currentPage <
                  pagination.totalPages
                ) {
                  setCurrentPage(
                    currentPage + 1
                  );
                }
              }}
            >
              →
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Product;