import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import productCSS from "./Products.module.css";
import { FaRegHeart, FaSearch, FaSlidersH, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

function Product() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [productData, setProductData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [price, setPrice] = useState(5000000);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState("recommended");

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const IMAGE_API = "http://localhost:4000/uploads/";

  async function getData(page = 1) {
    try {
      setLoading(true);
      const response = await api.get(`/products/all?page=${page}&limit=8`);
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

  function openProductDetails(productId) {
    if (!productId) return;
    navigate(`/product/${productId}`);
  }

  useEffect(() => {
    getData(currentPage);
  }, [currentPage]);

  useEffect(() => {
    getCategories();
  }, []);

  // Sync search from URL params (e.g. from header search)
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    setSearch(urlSearch);
  }, [searchParams]);

  let filteredProducts = [...productData];

  if (search.trim()) {
    filteredProducts = filteredProducts.filter((product) =>
      product?.title?.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (selectedCategory) {
    filteredProducts = filteredProducts.filter((product) => {
      const categoryName = product?.category?.name || product?.category;
      return categoryName?.toLowerCase() === selectedCategory.toLowerCase();
    });
  }

  filteredProducts = filteredProducts.filter(
    (product) => Number(product?.price || 0) <= Number(price)
  );

  if (sort === "low-to-high") {
    filteredProducts.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  }
  if (sort === "high-to-low") {
    filteredProducts.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  }
  if (sort === "newest") {
    filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function clearFilters() {
    setSearch("");
    setSelectedCategory("");
    setPrice(5000);
    setSort("recommended");
    setCurrentPage(1);
  }

  function applyFilters() {
    setCurrentPage(1);
    setFilterOpen(false);
  }

  const hasActiveFilters = search || selectedCategory || price < 5000;

  return (
    <main className={productCSS.page}>

      {/* HERO BANNER */}
      <section className={productCSS.hero}>
        <div className={productCSS.heroOverlay} />
        <div className={productCSS.heroContent}>
          <span className={productCSS.heroTag}>CURATED COLLECTION</span>
          <h1 className={productCSS.heroTitle}>Premium Attires</h1>
          <p className={productCSS.heroSub}>
            Discover handpicked fashion pieces crafted for the modern connoisseur
          </p>
        </div>
      </section>

      {/* TOOLBAR */}
      <div className={productCSS.toolbar}>
        <div className={productCSS.toolbarLeft}>
          <button
            className={productCSS.filterToggle}
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <FaSlidersH />
            <span>Filters</span>
            {hasActiveFilters && <span className={productCSS.filterBadge} />}
          </button>

          <p className={productCSS.resultCount}>
            Showing <strong>{filteredProducts.length}</strong> products
          </p>
        </div>

        <div className={productCSS.sortGroup}>
          <label className={productCSS.sortLabel}>Sort by</label>
          <select
            className={productCSS.sortSelect}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recommended">Recommended</option>
            <option value="low-to-high">Price: Low to High</option>
            <option value="high-to-low">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {/* ACTIVE FILTERS */}
      {hasActiveFilters && (
        <div className={productCSS.activeFilters}>
          {search && (
            <span className={productCSS.filterTag}>
              Search: "{search}"
              <button onClick={() => setSearch("")}><FaTimes /></button>
            </span>
          )}
          {selectedCategory && (
            <span className={productCSS.filterTag}>
              {selectedCategory}
              <button onClick={() => setSelectedCategory("")}><FaTimes /></button>
            </span>
          )}
          {price < 5000 && (
            <span className={productCSS.filterTag}>
              Under ₹{Number(price).toLocaleString()}
              <button onClick={() => setPrice(5000)}><FaTimes /></button>
            </span>
          )}
          <button className={productCSS.clearAllBtn} onClick={clearFilters}>
            Clear All
          </button>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className={productCSS.layout}>

        {/* FILTER SIDEBAR */}
        <aside className={`${productCSS.sidebar} ${filterOpen ? productCSS.sidebarOpen : ""}`}>
          <div className={productCSS.sidebarHeader}>
            <h2>Filters</h2>
            <button className={productCSS.sidebarClose} onClick={() => setFilterOpen(false)}>
              <FaTimes />
            </button>
          </div>

          <hr className={productCSS.divider} />

          {/* SEARCH */}
          <div className={productCSS.filterGroup}>
            <h3>Search</h3>
            <div className={productCSS.inputWrap}>
              <FaSearch className={productCSS.inputIcon} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* CATEGORY */}
          <div className={productCSS.filterGroup}>
            <h3>Category</h3>
            <div className={productCSS.checkboxList}>
              {categories.map((category) => (
                <label className={productCSS.checkboxItem} key={category._id}>
                  <input
                    type="checkbox"
                    name="category"
                    value={category.name}
                    checked={selectedCategory === category.name}
                    onChange={(e) =>
                      setSelectedCategory(e.target.checked ? e.target.value : "")
                    }
                  />
                  <span className={productCSS.checkmark} />
                  <span className={productCSS.checkLabel}>{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* PRICE */}
          <div className={productCSS.filterGroup}>
            <h3>Price Range</h3>
            <div className={productCSS.priceRange}>
              <input
                type="range"
                className={productCSS.rangeSlider}
                min="100"
                max="5000"
                step="100"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
              <div className={productCSS.priceTags}>
                <span>₹100</span>
                <span className={productCSS.priceCurrent}>
                  ₹{Number(price).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className={productCSS.sidebarActions}>
            <button className={productCSS.applyBtn} onClick={applyFilters}>
              Apply Filters
            </button>
            <button className={productCSS.clearBtn} onClick={clearFilters}>
              Clear All
            </button>
          </div>
        </aside>

        {/* OVERLAY */}
        {filterOpen && (
          <div className={productCSS.sidebarOverlay} onClick={() => setFilterOpen(false)} />
        )}

        {/* PRODUCTS AREA */}
        <section className={productCSS.productArea}>

          {loading ? (
            <div className={productCSS.skeletonGrid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div className={productCSS.skeletonCard} key={i}>
                  <div className={productCSS.skeletonImage} />
                  <div className={productCSS.skeletonLines}>
                    <div className={`${productCSS.skeletonLine} ${productCSS.w60}`} />
                    <div className={`${productCSS.skeletonLine} ${productCSS.w40}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className={productCSS.emptyState}>
              <div className={productCSS.emptyIcon}>✦</div>
              <h2>No Products Found</h2>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
              <button className={productCSS.applyBtn} onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={productCSS.productGrid}>
              {filteredProducts.map((product) => (
                <div
                  key={product?._id}
                  className={productCSS.productCard}
                  onClick={() => openProductDetails(product._id)}
                >
                  <div className={productCSS.imageWrap}>
                    <img
                      src={IMAGE_API + product?.images?.[0]}
                      alt={product?.title || "Product"}
                      loading="lazy"
                    />

                    <button
                      className={productCSS.favBtn}
                      aria-label="Add to favorites"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert("Wishlist feature coming soon");
                      }}
                    >
                      <FaRegHeart />
                    </button>
                  </div>

                  <div className={productCSS.cardInfo}>
                    <h3 className={productCSS.cardTitle}>{product?.title}</h3>
                    <p className={productCSS.cardPrice}>
                      ₹{Number(product.price).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {productData.length > 0 && filteredProducts.length > 0 && (
            <div className={productCSS.pagination}>
              <button
                className={productCSS.pageArrow}
                disabled={currentPage === 1}
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              >
                <FaChevronLeft />
              </button>

              {new Array(pagination?.totalPages || 0).fill(0).map((_, page) => (
                <button
                  key={page}
                  className={`${productCSS.pageNum} ${
                    currentPage === page + 1 ? productCSS.pageActive : ""
                  }`}
                  onClick={() => setCurrentPage(page + 1)}
                >
                  {page + 1}
                </button>
              ))}

              <button
                className={productCSS.pageArrow}
                disabled={currentPage >= pagination?.totalPages}
                onClick={() =>
                  currentPage < pagination?.totalPages && setCurrentPage(currentPage + 1)
                }
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Product;
