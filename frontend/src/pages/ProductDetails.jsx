import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaHeart,
  FaRegHeart,
  FaShoppingCart,
  FaTruck,
  FaUndo,
  FaLock,
  FaShareAlt,
  FaBolt,
  FaExpand,
  FaHome,
} from "react-icons/fa";
import productCSS from "./ProductDetails.module.css";

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [wishlist, setWishlist] = useState(false);
  const [addingCart, setAddingCart] = useState(false);

  const IMAGE_API = "http://localhost:4000/uploads/";

  // ==========================================
  // GET SINGLE PRODUCT
  // ==========================================

  async function getProductDetails() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/products/product/${productId}`
      );

      const res = response.data;

      if (res.success && res.data) {
        setProduct(res.data);

        // Select first value of every variant by default
        const variants = res.data.variant || [];

        const defaultVariants = {};

        variants.forEach((item) => {
          const key = item?.key || item?.name;

          if (key) {
            const values = getVariantValues(item);

            if (values.length > 0) {
              defaultVariants[key] = values[0];
            }
          }
        });

        setSelectedVariants(defaultVariants);
      } else {
        setError("Product Not Found");
      }
    } catch (err) {
      console.log("Product Details Error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load product"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (productId) {
      getProductDetails();
    }
  }, [productId]);

  // ==========================================
  // VARIANT HELPER
  // ==========================================

  function getVariantValues(variant) {
    if (!variant) return [];

    // Example:
    // { key: "Size", value: "M" }

    if (variant.value) {
      if (Array.isArray(variant.value)) {
        return variant.value;
      }

      return [variant.value];
    }

    // Example:
    // { name: "Size", values: ["S", "M", "L"] }

    if (Array.isArray(variant.values)) {
      return variant.values;
    }

    return [];
  }

  // ==========================================
  // GROUP VARIANTS
  // ==========================================

  function getGroupedVariants() {
    const grouped = {};

    if (!product?.variant) {
      return grouped;
    }

    product.variant.forEach((item) => {
      const key = item?.key || item?.name;

      if (!key) return;

      const values = getVariantValues(item);

      if (!grouped[key]) {
        grouped[key] = [];
      }

      values.forEach((value) => {
        if (
          value &&
          !grouped[key].includes(String(value))
        ) {
          grouped[key].push(String(value));
        }
      });
    });

    return grouped;
  }

  // ==========================================
  // ADD TO CART
  // ==========================================

  async function addToCart() {
    try {
      if (!product?._id) return;

      if (Number(product.stock) <= 0) {
        alert("Product is out of stock");
        return;
      }

      setAddingCart(true);

      const response = await api.post(
        "/products/cart/add",
        {
          productId: product._id,
          quantity: 1,
          variant: selectedVariants,
        }
      );

      const res = response.data;

      if (res.success) {
        alert("Product Added To Cart");
      } else {
        alert(
          res.message ||
            "Failed to add product to cart"
        );
      }
    } catch (err) {
      console.log("Add To Cart Error:", err);

      if (err?.response?.status === 401) {
        alert("Please login first");
      } else {
        alert(
          err?.response?.data?.message ||
            "Failed to add product to cart"
        );
      }
    } finally {
      setAddingCart(false);
    }
  }

  // ==========================================
  // BUY NOW
  // ==========================================

  async function buyNow() {
    try {
      if (!product?._id) return;

      if (Number(product.stock) <= 0) {
        alert("Product is out of stock");
        return;
      }

      const response = await api.post(
        "/products/cart/add",
        {
          productId: product._id,
          quantity: 1,
          variant: selectedVariants,
        }
      );

      if (response.data.success) {
        navigate("/cart");
      }
    } catch (err) {
      console.log("Buy Now Error:", err);

      if (err?.response?.status === 401) {
        alert("Please login first");
      } else {
        alert(
          err?.response?.data?.message ||
            "Unable to continue"
        );
      }
    }
  }

  // ==========================================
  // IMAGE NAVIGATION
  // ==========================================

  function previousImage() {
    if (!product?.images?.length) return;

    setSelectedImage((prev) =>
      prev === 0
        ? product.images.length - 1
        : prev - 1
    );
  }

  function nextImage() {
    if (!product?.images?.length) return;

    setSelectedImage((prev) =>
      prev === product.images.length - 1
        ? 0
        : prev + 1
    );
  }

  // ==========================================
  // SELECT VARIANT
  // ==========================================

  function selectVariant(key, value) {
    setSelectedVariants((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  // ==========================================
  // SHARE
  // ==========================================

  async function shareProduct() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product?.title,
          text: product?.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(
          window.location.href
        );

        alert("Product link copied");
      }
    } catch (error) {
      console.log("Share cancelled");
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className={productCSS.detailsPage}>
        <div className={productCSS.loadingBox}>
          <div className={productCSS.loader}></div>
          <p>Loading product...</p>
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR / PRODUCT NOT FOUND
  // ==========================================

  if (error || !product) {
    return (
      <main className={productCSS.detailsPage}>
        <div className={productCSS.notFound}>
          <h1>Product Not Found</h1>

          <p>
            Sorry, this product is no longer
            available.
          </p>

          <button
            onClick={() => navigate("/products")}
            className={productCSS.backProductsBtn}
          >
            Back To Products
          </button>
        </div>
      </main>
    );
  }

  const images = product.images || [];

  const groupedVariants = getGroupedVariants();

  const discountedPrice =
    product.discount > 0
      ? Math.round(
          Number(product.price) -
            (Number(product.price) *
              Number(product.discount)) /
              100
        )
      : Number(product.price);

  return (
    <main className={productCSS.detailsPage}>
      {/* ==========================================
          BREADCRUMB
      ========================================== */}

      <div className={productCSS.breadcrumb}>
        <button
          onClick={() => navigate("/products")}
        >
          <FaHome />
          Home
        </button>

        <span>›</span>

        <button
          onClick={() => navigate("/products")}
        >
          Products
        </button>

        <span>›</span>

        <span>{product.title}</span>
      </div>

      {/* ==========================================
          PRODUCT MAIN SECTION
      ========================================== */}

      <section className={productCSS.productDetailsContainer}>
        {/* ========================================
            LEFT - IMAGE GALLERY
        ======================================== */}

        <div className={productCSS.gallery}>
          {/* THUMBNAILS */}

          <div className={productCSS.thumbnailList}>
            {images.length > 0 ? (
              images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  className={`${productCSS.thumbnail} ${
                    selectedImage === index
                      ? productCSS.activeThumbnail
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedImage(index)
                  }
                >
                  <img
                    src={IMAGE_API + image}
                    alt={`${product.title} ${
                      index + 1
                    }`}
                  />
                </button>
              ))
            ) : (
              <div
                className={
                  productCSS.noThumbnail
                }
              >
                No Image
              </div>
            )}
          </div>

          {/* MAIN IMAGE */}

          <div className={productCSS.mainImageBox}>
            {images.length > 0 ? (
              <>
                <img
                  src={
                    IMAGE_API +
                    images[selectedImage]
                  }
                  alt={product.title}
                  className={
                    productCSS.mainProductImage
                  }
                />

                {images.length > 1 && (
                  <>
                    <button
                      className={`${productCSS.imageArrow} ${productCSS.leftArrow}`}
                      onClick={previousImage}
                    >
                      <FaArrowLeft />
                    </button>

                    <button
                      className={`${productCSS.imageArrow} ${productCSS.rightArrow}`}
                      onClick={nextImage}
                    >
                      <FaArrowRight />
                    </button>
                  </>
                )}

                <button
                  className={
                    productCSS.expandButton
                  }
                  onClick={() => {
                    window.open(
                      IMAGE_API +
                        images[selectedImage],
                      "_blank"
                    );
                  }}
                  title="View image"
                >
                  <FaExpand />
                </button>
              </>
            ) : (
              <div
                className={
                  productCSS.imagePlaceholder
                }
              >
                No Product Image
              </div>
            )}
          </div>
        </div>

        {/* ========================================
            CENTER - PRODUCT INFORMATION
        ======================================== */}

        <div className={productCSS.productInfo}>
          {/* STOCK */}

          <div
            className={
              Number(product.stock) > 0
                ? productCSS.stockBadge
                : productCSS.outOfStockBadge
            }
          >
            {Number(product.stock) > 0
              ? "IN STOCK"
              : "OUT OF STOCK"}
          </div>

          {/* TITLE */}

          <h1 className={productCSS.productTitle}>
            {product.title}
          </h1>

          {/* RATING */}

          <div className={productCSS.ratingRow}>
            <span className={productCSS.stars}>
              ★★★★★
            </span>

            <span className={productCSS.rating}>
              4.5
            </span>

            <span className={productCSS.reviews}>
              (128 Reviews)
            </span>

            <span className={productCSS.separator}>
              |
            </span>

            <span className={productCSS.sku}>
              SKU: EA-{product._id?.slice(-6)}
            </span>
          </div>

          {/* PRICE */}

          <div className={productCSS.priceSection}>
            <span className={productCSS.currentPrice}>
              ₹{" "}
              {discountedPrice.toLocaleString(
                "en-IN"
              )}
            </span>

            {product.discount > 0 && (
              <>
                <span
                  className={
                    productCSS.originalPrice
                  }
                >
                  ₹{" "}
                  {Number(
                    product.price
                  ).toLocaleString("en-IN")}
                </span>

                <span
                  className={
                    productCSS.discountBadge
                  }
                >
                  {product.discount}% OFF
                </span>
              </>
            )}
          </div>

          <p className={productCSS.taxText}>
            Inclusive of all taxes
          </p>

          {/* DESCRIPTION */}

          <div className={productCSS.descriptionSection}>
            <h2>Description</h2>

            <p>{product.description}</p>
          </div>

          {/* STOCK INFO */}

          <div className={productCSS.stockInfo}>
            <FaCheckCircle />

            <span>
              {Number(product.stock)} items
              available
            </span>
          </div>

          {/* FEATURES */}

          {product.features?.length > 0 && (
            <div
              className={
                productCSS.featuresSection
              }
            >
              <h2>Product Features</h2>

              <div
                className={
                  productCSS.featuresList
                }
              >
                {product.features.map(
                  (feature, index) => (
                    <div
                      className={
                        productCSS.featureItem
                      }
                      key={index}
                    >
                      <span
                        className={
                          productCSS.featureKey
                        }
                      >
                        {feature.key}:
                      </span>

                      <span
                        className={
                          productCSS.featureValue
                        }
                      >
                        {feature.value}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* VARIANTS */}

          {Object.keys(groupedVariants).length >
            0 && (
            <div
              className={
                productCSS.variantsSection
              }
            >
              <h2>Available Variants</h2>

              {Object.entries(
                groupedVariants
              ).map(([key, values]) => (
                <div
                  className={
                    productCSS.variantGroup
                  }
                  key={key}
                >
                  <h3>{key}</h3>

                  <div
                    className={
                      productCSS.variantOptions
                    }
                  >
                    {values.map((value) => (
                      <button
                        key={value}
                        className={`${productCSS.variantButton} ${
                          selectedVariants[
                            key
                          ] === value
                            ? productCSS.selectedVariant
                            : ""
                        }`}
                        onClick={() =>
                          selectVariant(
                            key,
                            value
                          )
                        }
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MOBILE ACTIONS */}

          <div className={productCSS.mobileActions}>
            <button
              onClick={addToCart}
              disabled={
                addingCart ||
                Number(product.stock) <= 0
              }
              className={
                productCSS.mobileCartBtn
              }
            >
              <FaShoppingCart />
              {addingCart
                ? "Adding..."
                : "Add To Cart"}
            </button>

            <button
              onClick={buyNow}
              disabled={Number(product.stock) <= 0}
              className={
                productCSS.mobileBuyBtn
              }
            >
              <FaBolt />
              Buy Now
            </button>
          </div>
        </div>

        {/* ========================================
            RIGHT - PURCHASE CARD
        ======================================== */}

        <aside className={productCSS.purchaseCard}>
          <div className={productCSS.cardPrice}>
            ₹{" "}
            {discountedPrice.toLocaleString(
              "en-IN"
            )}
          </div>

          <p className={productCSS.cardTax}>
            Inclusive of all taxes
          </p>

          {/* ADD TO CART */}

          <button
            className={
              productCSS.addToCartButton
            }
            onClick={addToCart}
            disabled={
              addingCart ||
              Number(product.stock) <= 0
            }
          >
            <FaShoppingCart />

            {addingCart
              ? "Adding..."
              : "Add To Cart"}
          </button>

          {/* BUY NOW */}

          <button
            className={
              productCSS.buyNowButton
            }
            onClick={buyNow}
            disabled={
              Number(product.stock) <= 0
            }
          >
            <FaBolt />
            Buy Now
          </button>

          {/* DELIVERY */}

          <div className={productCSS.benefits}>
            {/* FREE SHIPPING */}

            <div className={productCSS.benefitItem}>
              <div className={productCSS.benefitIcon}>
                <FaTruck />
              </div>

              <div>
                <strong>Free Delivery</strong>

                <p>
                  On orders above ₹999
                </p>
              </div>
            </div>

            {/* RETURN */}

            <div className={productCSS.benefitItem}>
              <div className={productCSS.benefitIcon}>
                <FaUndo />
              </div>

              <div>
                <strong>7 Days Return</strong>

                <p>
                  Easy return & exchange
                </p>
              </div>
            </div>

            {/* PAYMENT */}

            <div className={productCSS.benefitItem}>
              <div className={productCSS.benefitIcon}>
                <FaLock />
              </div>

              <div>
                <strong>
                  Secure Payment
                </strong>

                <p>
                  100% secure transactions
                </p>
              </div>
            </div>
          </div>

          {/* WISHLIST / SHARE */}

          <div className={productCSS.cardBottom}>
            <button
              onClick={() =>
                setWishlist(!wishlist)
              }
            >
              {wishlist ? (
                <FaHeart
                  className={
                    productCSS.wishlistActive
                  }
                />
              ) : (
                <FaRegHeart />
              )}

              <span>
                {wishlist
                  ? "Wishlisted"
                  : "Add To Wishlist"}
              </span>
            </button>

            <button onClick={shareProduct}>
              <FaShareAlt />

              <span>Share</span>
            </button>
          </div>
        </aside>
      </section>

      {/* ==========================================
          BOTTOM PRODUCT BENEFITS
      ========================================== */}

      <section
        className={productCSS.bottomBenefits}
      >
        <div className={productCSS.bottomBenefit}>
          <div
            className={
              productCSS.bottomBenefitIcon
            }
          >
            <FaCheckCircle />
          </div>

          <div>
            <strong>Premium Quality</strong>

            <p>Best quality assured</p>
          </div>
        </div>

        <div className={productCSS.bottomBenefit}>
          <div
            className={
              productCSS.bottomBenefitIcon
            }
          >
            <span>♻</span>
          </div>

          <div>
            <strong>100% Cotton</strong>

            <p>
              Comfortable & breathable
            </p>
          </div>
        </div>

        <div className={productCSS.bottomBenefit}>
          <div
            className={
              productCSS.bottomBenefitIcon
            }
          >
            <span>▣</span>
          </div>

          <div>
            <strong>Easy Care</strong>

            <p>Machine washable</p>
          </div>
        </div>

        <div className={productCSS.bottomBenefit}>
          <div
            className={
              productCSS.bottomBenefitIcon
            }
          >
            <span>♧</span>
          </div>

          <div>
            <strong>Perfect Fit</strong>

            <p>Designed for comfort</p>
          </div>
        </div>
      </section>

      {/* BACK BUTTON */}

      <div className={productCSS.backButtonWrapper}>
        <button
          onClick={() => navigate("/products")}
          className={productCSS.backButton}
        >
          <FaArrowLeft />
          Back To Products
        </button>
      </div>
    </main>
  );
}

export default ProductDetails;