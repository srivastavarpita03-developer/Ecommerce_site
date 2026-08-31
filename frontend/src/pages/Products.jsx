import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import productCSS from "./Products.module.css";
import { FaRegHeart, FaSearch } from "react-icons/fa";

function Product() {
  const navigate = useNavigate();

  const [productData, setProductData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [price, setPrice] = useState(5000000);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recommended");

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const IMAGE_API = "http://localhost:4000/uploads/";

  // ======================================
  // GET PRODUCTS
  // ======================================

  async function getData(page = 1) {
    try {
      setLoading(true);

      const response = await api.get(
        `/products/all?page=${page}&limit=8`
      );

      const res = response.data;

      if (res.success) {
        setProductData(res.data || []);
        setPagination(res.pagination || {});
      }
    } catch (err) {
      console.log("Get Products Error:", err);
    } finally {
      setLoading(false);
    }
  }

  // ======================================
  // GET CATEGORIES
  // ======================================

  async function getCategories() {
    try {
      const response = await api.get("/category");

      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (err) {
      console.log("Get Categories Error:", err);
    }
  }

  // ======================================
  // ADD TO CART
  // ======================================

  async function addToCart(productId) {
    try {
      const response = await api.post(
        "/products/cart/add",
        {
          productId,
          quantity: 1,
          variant: {},
        }
      );

      const res = response.data;

      if (res.success) {
        alert("Product Added To Cart");
      } else {
        alert(
          res.message ||
            "Failed to add product"
        );
      }
    } catch (error) {
      console.log(
        "Add To Cart Error:",
        error
      );

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

  // ======================================
  // OPEN PRODUCT DETAILS
  // ======================================

  function openProductDetails(productId) {
    if (!productId) {
      console.log("Product ID missing");
      return;
    }

    navigate(`/product/${productId}`);
  }

  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {
    getData(currentPage);
  }, [currentPage]);

  useEffect(() => {
    getCategories();
  }, []);

  // ======================================
  // FILTER PRODUCTS
  // ======================================

  let filteredProducts = [...productData];

  // SEARCH
  if (search.trim()) {
    filteredProducts =
      filteredProducts.filter((product) =>
        product?.title
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );
  }

  // CATEGORY
  if (selectedCategory) {
    filteredProducts =
      filteredProducts.filter((product) => {
        const categoryName =
          product?.category?.name ||
          product?.category;

        return (
          categoryName?.toLowerCase() ===
          selectedCategory.toLowerCase()
        );
      });
  }

  // PRICE
  filteredProducts =
    filteredProducts.filter(
      (product) =>
        Number(product?.price || 0) <=
        Number(price)
    );

  // SORT
  if (sort === "low-to-high") {
    filteredProducts.sort(
      (a, b) =>
        Number(a.price || 0) -
        Number(b.price || 0)
    );
  }

  if (sort === "high-to-low") {
    filteredProducts.sort(
      (a, b) =>
        Number(b.price || 0) -
        Number(a.price || 0)
    );
  }

  if (sort === "newest") {
    filteredProducts.sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );
  }

  // ======================================
  // CLEAR FILTERS
  // ======================================

  function clearFilters() {
    setSearch("");
    setSelectedCategory("");
    setPrice(5000);
    setSort("recommended");
    setCurrentPage(1);
  }

  // ======================================
  // APPLY FILTER
  // ======================================

  function applyFilters() {
    setCurrentPage(1);
  }

  return (
    <main className={productCSS.container}>

      {/* =================================
          FILTER SIDEBAR
      ================================= */}

      <aside
        className={
          productCSS["filter-sidebar"]
        }
      >
        <h2>Filters</h2>

        <hr
          className={
            productCSS.divider
          }
        />

        {/* SEARCH */}

        <div
          className={
            productCSS["filter-group"]
          }
        >
          <h3>Search Products</h3>

          <div
            className={
              productCSS["product-search"]
            }
          >
            <FaSearch />

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>
        </div>

        {/* CATEGORY */}

        <div
          className={
            productCSS["filter-group"]
          }
        >
          <h3>Category</h3>

          {categories.map((category) => (
            <div
              className={
                productCSS["checkbox-group"]
              }
              key={category._id}
            >
              <input
                type="checkbox"
                name="category"
                value={category.name}
                checked={
                  selectedCategory ===
                  category.name
                }
                onChange={(e) =>
                  setSelectedCategory(
                    e.target.checked
                      ? e.target.value
                      : ""
                  )
                }
              />

              <label>
                {category.name}
              </label>
            </div>
          ))}
        </div>

        {/* PRICE */}

        <div
          className={
            productCSS["filter-group"]
          }
        >
          <h3>PRICE RANGE</h3>

          <div
            className={
              productCSS[
                "price-slider-wrapper"
              ]
            }
          >
            <input
              type="range"
              className={
                productCSS["price-slider"]
              }
              min="100"
              max="5000"
              step="100"
              value={price}
              onChange={(e) =>
                setPrice(
                  Number(e.target.value)
                )
              }
            />

            <div
              className={
                productCSS["price-labels"]
              }
            >
              <span>₹100</span>

              <span>
                ₹
                {Number(
                  price
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* APPLY */}

        <button
          type="button"
          className={
            productCSS["apply-btn"]
          }
          onClick={applyFilters}
        >
          APPLY FILTERS
        </button>

        {/* CLEAR */}

        <button
          type="button"
          className={
            productCSS["clear-btn"]
          }
          onClick={clearFilters}
        >
          CLEAR FILTERS
        </button>
      </aside>

      {/* =================================
          PRODUCTS
      ================================= */}

      <section
        className={
          productCSS["product-container"]
        }
      >

        {/* HEADER */}

        <div
          className={
            productCSS["product-header"]
          }
        >
          <div
            className={
              productCSS["header-title-group"]
            }
          >
            <h1>Premium Attires</h1>

            <p
              className={
                productCSS["item-count"]
              }
            >
              Showing{" "}
              {filteredProducts.length}{" "}
              products
            </p>
          </div>

          {/* SORT */}

          <div
            className={
              productCSS[
                "sort-dropdown-wrapper"
              ]
            }
          >
            <label htmlFor="sort-select">
              <span
                className={
                  productCSS["sortby-text"]
                }
              >
                SORT BY:
              </span>
            </label>

            <select
              id="sort-select"
              className={
                productCSS["sort-select"]
              }
              value={sort}
              onChange={(e) =>
                setSort(e.target.value)
              }
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

        {/* LOADING */}

        {loading ? (
          <div
            className={
              productCSS["loading"]
            }
          >
            Loading Products...
          </div>
        ) : filteredProducts.length ===
          0 ? (
          <div
            className={
              productCSS["no-products"]
            }
          >
            <h2>
              No Products Found
            </h2>

            <p>
              Try changing your
              search or filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        ) : (

          /* =================================
             PRODUCT GRID
          ================================= */

          <div
            className={
              productCSS["product-grid"]
            }
          >
            {filteredProducts.map(
              (product) => (

                <div
                  key={product?._id}
                  className={
                    productCSS[
                      "product-card"
                    ]
                  }

                  // CLICK CARD
                  onClick={() =>
                    openProductDetails(
                      product._id
                    )
                  }
                >

                  {/* IMAGE */}

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
                        product?.title ||
                        "Product"
                      }
                    />

                    {/* WISHLIST */}

                    <button
                      type="button"
                      className={
                        productCSS[
                          "favorite-btn"
                        ]
                      }
                      aria-label="Add to favorites"

                      onClick={(e) => {
                        // CARD CLICK STOP
                        e.stopPropagation();

                        alert(
                          "Wishlist feature coming soon"
                        );
                      }}
                    >
                      <FaRegHeart
                        className={
                          productCSS[
                            "heart-icon"
                          ]
                        }
                      />
                    </button>

                    {/* ADD TO CART */}

                    <button
                      type="button"
                      className={
                        productCSS[
                          "quick-add-btn"
                        ]
                      }

                      onClick={(e) => {
                        // IMPORTANT
                        // Product details open nahi hoga
                        e.stopPropagation();

                        addToCart(
                          product._id
                        );
                      }}
                    >
                      Add To Cart
                    </button>
                  </div>

                  {/* PRODUCT INFO */}

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

                    {/* VIEW DETAILS */}

                    <button
                      type="button"
                      className={
                        productCSS[
                          "view-details-btn"
                        ]
                      }

                      onClick={(e) => {
                        e.stopPropagation();

                        openProductDetails(
                          product._id
                        );
                      }}
                    >
                      View Details
                    </button>

                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* =================================
            PAGINATION
        ================================= */}

        {productData.length > 0 &&
          filteredProducts.length > 0 && (
            <div
              className={
                productCSS[
                  "pagination"
                ]
              }
            >

              {/* PREVIOUS */}

              <button
                className={
                  productCSS[
                    "page-arrow"
                  ]
                }
                disabled={
                  currentPage === 1
                }
                onClick={() => {
                  if (
                    currentPage > 1
                  ) {
                    setCurrentPage(
                      currentPage - 1
                    );
                  }
                }}
              >
                ←
              </button>

              {/* PAGE NUMBERS */}

              {new Array(
                pagination?.totalPages ||
                  0
              )
                .fill(0)
                .map((_, page) => (
                  <button
                    key={page}
                    className={`
                      ${
                        productCSS[
                          "page-num"
                        ]
                      }
                      ${
                        currentPage ===
                        page + 1
                          ? productCSS.active
                          : ""
                      }
                    `}
                    onClick={() =>
                      setCurrentPage(
                        page + 1
                      )
                    }
                  >
                    {page + 1}
                  </button>
                ))}

              {/* NEXT */}

              <button
                className={
                  productCSS[
                    "page-arrow"
                  ]
                }
                disabled={
                  currentPage >=
                  pagination?.totalPages
                }
                onClick={() => {
                  if (
                    currentPage <
                    pagination?.totalPages
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