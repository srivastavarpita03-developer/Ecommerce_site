import { useEffect, useState } from "react";
import api from "../utils/api";
import productCSS from "./Products.module.css";
import { FaRegHeart } from "react-icons/fa";

function Product() {
  const products = [
    {
      id: 1,
      name: "Sculpted Charcoal Blazer",
      category: "Tailoring",
      collection: "Bespoke Collection",
      price: 1250,
      badge: "",
      image:
        "https://assets.myntassets.com/h_1440,q_75,w_1080/v1/assets/images/12915296/2020/11/19/d345f551-586e-4269-b5f8-405d915e8df61605767244471-INVICTUS-Men-Blazers-5271605767242255-1.jpg",
      sizes: ["S", "M", "L", "XL"],
      rating: 4.8,
      reviews: 215,
      isNew: false,
      isLimited: false,
    },

    {
      id: 2,
      name: "Signature Wool Overcoat",
      category: "Outerwear",
      collection: "Luxury Winter",
      price: 2100,
      badge: "New Arrival",
      image:
        "https://albertonardoni.com/cdn/shop/files/Men_s_Hunter_Green_Full-Length_Wool_Overcoat2.jpg?format=webp&v=1766740759&width=500",
      colors: ["Green"],
      sizes: ["M", "L", "XL"],
      rating: 4.9,
      reviews: 182,
      isNew: true,
      isLimited: false,
    },

    {
      id: 3,
      name: "Polished Derby Shoes",
      category: "Footwear",
      collection: "Executive Collection",
      price: 850,
      badge: "",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCOfWgTpO2oSssU6tVhh7lSUcf1LwyfPagu0Ik9PTgdzqMGx4sMaHgI53hRYo1eTCcHiq_WMNsikHg-_THdXBV5WwalLHR6nbOMxISdFH1RmTbiP374pVAsBlkAHiEJnhBqkJ4rm4FfT8PJjMGB9hWTX540goGDQDWPcppU0xsfndIJOHR236MSrkFJcW3J94-R8xPuh8nWIX9nn7eJYs6t6WpcxLbrmLRb1O9sXNah4FT2sUGeIPn8skoHGC1Qiai5aipTgSn45KE",
      colors: ["Black"],
      sizes: ["8", "9", "10", "11"],
      rating: 4.7,
      reviews: 143,
      isNew: false,
      isLimited: false,
    },

    {
      id: 4,
      name: "Cashmere Knit Turtleneck",
      category: "Knitwear",
      collection: "Premium Knitwear",
      price: 540,
      badge: "",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuACG2L25adQJtkfLnL8xeXh17xZzq83HFgR8CEgYVDtYicEU0gjRtpsSkMdsO9l9EG0qnXOWrlLJ-H2DEWeKX0jR3p8so068vey_jVa64kclYtX7JoySSNxVWRudJNWSV1jTuYeO5SkKG-Qwt_cJ7Sn7JWtWdePWZB60TzdzMMWwasxoR3T-KStepqb35ppbG7b-40ZYLifHZF8JuWZnVYHLTHeKszhqqKmELSt2DdproQp4DcnnbtzuW0NNDoU98M12Y4ULf4wgRc",
      colors: ["Navy"],
      sizes: ["S", "M", "L"],
      rating: 4.8,
      reviews: 166,
      isNew: false,
      isLimited: false,
    },

    {
      id: 5,
      name: "Executive Leather Briefcase",
      category: "Accessories",
      collection: "Business Luxury",
      price: 1800,
      badge: "Limited",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBAehcT1mLXbgSLJvgEWOUb9jg6x7RdXYqmP6alyi7ef709yxDJR1c0kqPCZi4GoI3C8UP1HAZfzEhCrTu_5tbpU-giChnxTNCxM7UgaKAQelbvp1FgwjiVEvZToqzyorvOOSGghkZgm6hPCPDOn38A1VynZJa4eu9XbPE-lznnlyb8NK5JDqUFe4BjNaGjjDB6dmYQ4-P-ssdEVlX1hhbp4Qu0P-abwN-obdjGa_ooZJDJSHzmOjD7GA_NJErbGP_36YHQwG3BuDY",
      colors: ["Brown"],
      sizes: [],
      rating: 5.0,
      reviews: 94,
      isNew: false,
      isLimited: true,
    },

    {
      id: 6,
      name: "Premium Poplin Shirt",
      category: "Basics",
      collection: "Classic Essentials",
      price: 320,
      badge: "",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBn5Y6KboerpznSy0toMq4g1n5qVf3M8pqnHcAc3KdyGHHtxnMCdc__XZQdjDXUHpMWz6fDfucFUeB4JbIuZBhI5-SEhJiZ_IoLeRREBHf_wxl_WcHuA2Tld1dTCZRpxfNSi1t_AWPSgqeLrfC5f8zgBrHiayGi_VUst5pScLY--5uOyGuNswlBbF84-ReGSBZPQUFB3Yfmx4xSRIhoxWEZVc59BiLpniCHzAKRTZUqgo-5ABzidO1JFToN1w85iao7fd_SGz9tpHs",
      colors: ["White"],
      sizes: ["S", "M", "L", "XL"],
      rating: 4.6,
      reviews: 308,
      isNew: false,
      isLimited: false,
    },
    {
      id: 7,
      name: "Stylish Shrug",
      category: "Overcoat",
      collection: "Premium Collection",
      price: 1999,
      badge: "Limited",
      image:
        "https://i.pinimg.com/736x/f6/6d/01/f66d01cbf5712d37305fd952adff0b64.jpg",
      colors: ["Grey"],
      sizes: ["S", "M", "L", "XL"],
      rating: 4.6,
      reviews: 308,
      isNew: false,
      isLimited: true,
    },
  ];

  const [productData, setProductData] = useState([]);
  const [pagination, setPagination] = useState({});

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
              Displaying {products.length} of 148 items in{" "}
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
                <img src={product?.images?.[0]} alt={product?.title} />

                <button
                  type="button"
                  className={productCSS["favorite-btn"]}
                  aria-label="Add to favorites"
                >
                  <FaRegHeart className={productCSS["heart-icon"]} />
                </button>

                <button type="button" className={productCSS["quick-add-btn"]}>
                  ADD TO CART
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
