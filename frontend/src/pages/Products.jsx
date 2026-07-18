import { useEffect, useState } from "react";
import api from "../utils/api";
import productCSS from "./Products.module.css";
import { FaRegHeart } from "react-icons/fa";

function Product() {
  const [productData, setProductData] = useState([]);
  const [pagination, setPagination] = useState({});
  const IMAGE_API = "http://localhost:4000/uploads/";

  async function getData() {
    try {
      const response = await api.get("/products/all");
      const res = response.data;
      if (res?.success) {
        console.log(res);
        setProductData(res?.data);
        setPagination(res?.pagination);
      }
    } catch (err) {
      alert("Error In Fetching Data!!");
      console.log(err);
    }
  }

  async function orderProduct(id) {
    const data = {
      items: [
        {
          productId: id,
          quantity: 1,
          variant: {},
        },
      ],
    };
    const response = await api.post("/orders/create", data);
    const res = response.data;
    if (res?.success) {
      alert("Order Successfully");
    } else {
      alert("Order Failed");
    }
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <main className={productCSS.container}>
      {/* Filter section */}
      <aside className={productCSS["filter-sidebar"]}>
        <h2>Filters</h2>
        <hr className={productCSS.divider} />

        <div className={productCSS["filter-group"]}>
          <h3>Category</h3>
          <div className={productCSS["checkbox-group"]}>
            <input
              type="checkbox"
              name="category"
              id="outerwear"
              value="Outerwear"
            />
            <label htmlFor="outerwear">Outerwear</label>
          </div>

          <div className={productCSS["checkbox-group"]}>
            <input
              type="checkbox"
              name="category"
              id="tailoring"
              value="Tailoring"
            />
            <label htmlFor="tailoring">Tailoring</label>
          </div>

          <div className={productCSS["checkbox-group"]}>
            <input
              type="checkbox"
              name="category"
              id="accessories"
              value="Accessories"
            />
            <label htmlFor="accessories">Accessories</label>
          </div>
        </div>

        <div className={productCSS["filter-group"]}>
          <h3>SIZE</h3>
          <div className={productCSS["size-grid"]}>
            <button type="button" className={productCSS["size-btn"]}>
              XS
            </button>
            <button
              type="button"
              className={productCSS["size-btn"] + " " + productCSS["active"]}
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
              defaultValue="2500"
            />
            <div className={productCSS["price-labels"]}>
              <span>&#x20B9;100</span>
              <span>&#x20B9;5,000</span>
            </div>
          </div>
        </div>

        <button type="button" className={productCSS["apply-btn"]}>
          APPLY FILTERS
        </button>
      </aside>

      {/* Product section */}
      <section className={productCSS["product-container"]}>
        <div className={productCSS["product-header"]}>
          <div className={productCSS["header-title-group"]}>
            <h1>Premium Attires</h1>
            <p className={productCSS["item-count"]}>
              Displaying {productData.length} of {pagination?.total} items in{" "}
              <span>Tailoring</span>
            </p>
          </div>

          <div className={productCSS["sort-dropdown-wrapper"]}>
            <label htmlFor="sort-select">
              <span className={productCSS["sortby-text"]}>SORT BY:</span>
            </label>
            <select
              id="sort-select"
              className={productCSS["sort-select"]}
              defaultValue="recommended"
            >
              <option value="recommended">Recommended</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        <div className={productCSS["product-grid"]}>
          {productData?.map((product) => (
            <div key={product?._id} className={productCSS["product-card"]}>
              <div className={productCSS["image-wrapper"]}>
                <img
                  src={IMAGE_API + product?.images?.[0]}
                  alt={product?.title}
                />

                <button
                  type="button"
                  className={productCSS["favorite-btn"]}
                  aria-label="Add to favorites"
                >
                  <FaRegHeart className={productCSS["heart-icon"]} />
                </button>

                <button
                  type="button"
                  className={productCSS["quick-add-btn"]}
                  onClick={() => {
                    orderProduct(product._id);
                  }}
                >
                  Order
                </button>
              </div>

              <div className={productCSS["product-info"]}>
                <h2 className={productCSS["product-title"]}>
                  {product?.title}
                </h2>
                <p className={productCSS["product-price"]}>
                  ₹ {product.price.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {productData.length > 0 && (
          <div className={productCSS["pagination"]}>
            <button type="button" className={productCSS["page-arrow"]} disabled>
              ←
            </button>

            {new Array(pagination?.totalPages).fill(0).map((_, page) => {
              return (
                <button
                  type="button"
                  className={productCSS["page-num"]}
                  key={page}
                >
                  {page + 1}
                </button>
              );
            })}

            <button type="button" className={productCSS["page-arrow"]}>
              →
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Product;
