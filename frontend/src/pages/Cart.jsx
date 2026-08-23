import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import api from "../utils/api";
import "./Cart.css";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const IMAGE_API = "http://localhost:4000/uploads/";

  // ======================================
  // GET CART
  // ======================================

  async function getCart() {
    try {
      setLoading(true);

      const response = await api.get("/products/cart");

      const res = response.data;

      if (res.success) {
        setCartItems(res.data || []);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.log("Get Cart Error:", error);

      if (error.response?.status === 401) {
        alert("Please login first");
        navigate("/login");
      } else {
        alert(
          error.response?.data?.message ||
            "Failed to load cart"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // ======================================
  // UPDATE QUANTITY
  // ======================================

  async function updateQuantity(productId, quantity) {
    try {
      if (quantity < 1) {
        return;
      }

      const response = await api.put(
        "/products/cart/update",
        {
          productId,
          quantity,
        }
      );

      const res = response.data;

      if (res.success) {
        // Backend already sends updated cart
        setCartItems(res.data || []);
      } else {
        alert(
          res.message ||
            "Failed to update quantity"
        );
      }
    } catch (error) {
      console.log(
        "Update Quantity Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update cart quantity"
      );
    }
  }

  // ======================================
  // REMOVE FROM CART
  // ======================================

  async function removeFromCart(productId) {
    try {
      const response = await api.delete(
        `/products/cart/remove/${productId}`
      );

      const res = response.data;

      if (res.success) {
        alert("Product removed from cart");

        setCartItems(res.data || []);
      } else {
        alert(
          res.message ||
            "Failed to remove product"
        );
      }
    } catch (error) {
      console.log(
        "Remove Cart Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to remove product"
      );
    }
  }

  // ======================================
  // LOAD CART
  // ======================================

  useEffect(() => {
    getCart();
  }, []);

  // ======================================
  // SUBTOTAL
  // ======================================

  const subtotal = cartItems.reduce(
    (total, item) => {
      const price = Number(
        item.productId?.price || 0
      );

      const quantity = Number(
        item.quantity || 1
      );

      return total + price * quantity;
    },
    0
  );

  // ======================================
  // SHIPPING
  // ======================================

  const shipping = 0;

  // ======================================
  // TAX
  // ======================================

  const tax = 0;

  // ======================================
  // TOTAL
  // ======================================

  const total =
    subtotal + shipping + tax;

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <section className="cartPage">
        <h1>Shopping Cart</h1>

        <div className="cartLoading">
          Loading cart...
        </div>
      </section>
    );
  }

  // ======================================
  // CART
  // ======================================

  return (
    <section className="cartPage">

      <h1>Shopping Cart</h1>

      <div className="cartContainer">

        {/* =================================
            LEFT SIDE
        ================================= */}

        <div className="cartItems">

          {cartItems.length === 0 ? (

            <div className="emptyCart">

              <h2>
                Your Cart is Empty
              </h2>

              <p>
                Add some products to
                your cart before checkout.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/products")
                }
              >
                Continue Shopping
              </button>

            </div>

          ) : (

            cartItems.map((item) => {

              const product =
                item.productId;

              if (!product) {
                return null;
              }

              const price =
                Number(product.price || 0);

              const quantity =
                Number(item.quantity || 1);

              const image =
                product.images?.length > 0
                  ? IMAGE_API +
                    product.images[0]
                  : "";

              return (
                <div
                  className="cartCard"
                  key={product._id}
                >

                  {/* IMAGE */}

                  <img
                    src={image}
                    alt={product.title}
                  />

                  {/* PRODUCT INFO */}

                  <div className="cartInfo">

                    <h3>
                      {product.title}
                    </h3>

                    <p className="price">
                      ₹{" "}
                      {price.toLocaleString()}
                    </p>

                    <p>
                      Quantity: {quantity}
                    </p>

                    {/* VARIANT */}

                    {item.variant &&
                      Object.keys(
                        item.variant
                      ).length > 0 && (

                        <div>

                          {Object.entries(
                            item.variant
                          ).map(
                            ([key, value]) => (
                              <p key={key}>
                                {key}: {value}
                              </p>
                            )
                          )}

                        </div>
                      )}

                  </div>

                  {/* ACTIONS */}

                  <div className="cartActions">

                    {/* QUANTITY */}

                    <div className="quantityBox">

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            product._id,
                            quantity - 1
                          )
                        }
                        disabled={
                          quantity <= 1
                        }
                      >
                        -
                      </button>

                      <span>
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            product._id,
                            quantity + 1
                          )
                        }
                      >
                        +
                      </button>

                    </div>

                    {/* DELETE */}

                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(
                          product._id
                        )
                      }
                    >
                      <FaTrash />
                    </button>

                  </div>

                </div>
              );
            })
          )}

        </div>

        {/* =================================
            RIGHT SIDE
        ================================= */}

        {cartItems.length > 0 && (

          <div className="summary">

            <h2>
              Order Summary
            </h2>

            <div className="summaryRow">

              <span>
                Subtotal
              </span>

              <span>
                ₹{" "}
                {subtotal.toLocaleString()}
              </span>

            </div>

            <div className="summaryRow">

              <span>
                Shipping
              </span>

              <span>
                Free
              </span>

            </div>

            <div className="summaryRow">

              <span>
                Tax
              </span>

              <span>
                ₹{" "}
                {tax.toLocaleString()}
              </span>

            </div>

            <hr />

            <div className="summaryRow total">

              <span>
                Total
              </span>

              <span>
                ₹{" "}
                {total.toLocaleString()}
              </span>

            </div>

            {/* CHECKOUT */}

            <button
              className="checkoutBtn"
              type="button"
              onClick={() =>
                navigate("/checkout")
              }
            >
              Proceed To Checkout
            </button>

          </div>

        )}

      </div>

    </section>
  );
}

export default Cart;