import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripePaymentForm from "../components/StripePaymentForm";
import "./Checkout.css";

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

function Checkout() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [shippingAddress, setShippingAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [paymentMode, setPaymentMode] = useState("COD");
  const [clientSecret, setClientSecret] = useState("");
  const [stripeOrderId, setStripeOrderId] = useState("");

  // =====================================
  // GET CART
  // =====================================

  async function getCart() {
    try {
      setLoading(true);

      const response = await api.get("/products/cart");

      const res = response.data;

      console.log("Cart Response:", res);

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

  // =====================================
  // LOAD CART
  // =====================================

  useEffect(() => {
    getCart();
  }, []);

  // =====================================
  // CALCULATE TOTAL
  // =====================================

  const totalAmount = cartItems.reduce(
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

  // =====================================
  // PLACE ORDER
  // =====================================

  async function handlePlaceOrder() {
    // -------------------------------------
    // CART VALIDATION
    // -------------------------------------

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      navigate("/cart");
      return;
    }

    // -------------------------------------
    // ADDRESS VALIDATION
    // -------------------------------------

    const address = String(
      shippingAddress || ""
    ).trim();

    if (!address) {
      alert("Please enter shipping address");
      return;
    }

    // -------------------------------------
    // CONTACT VALIDATION
    // -------------------------------------

    const contact = String(
      contactNumber ?? ""
    ).trim();

    if (!contact) {
      alert("Please enter contact number");
      return;
    }

    if (!/^[0-9]{10}$/.test(contact)) {
      alert(
        "Please enter a valid 10 digit contact number"
      );
      return;
    }

    // -------------------------------------
    // PAYMENT VALIDATION
    // -------------------------------------

    if (!paymentMode) {
      alert("Please select payment mode");
      return;
    }

    try {
      setPlacingOrder(true);

      // -------------------------------------
      // CREATE ORDER ITEMS
      // -------------------------------------

      const orderItems = cartItems.map(
        (item) => ({
          productId:
            item.productId?._id,

          quantity:
            Number(item.quantity || 1),

          variant:
            item.variant || {},
        })
      );

      // Check invalid products
      const invalidProduct = orderItems.some(
        (item) => !item.productId
      );

      if (invalidProduct) {
        alert(
          "Some product information is missing"
        );
        return;
      }

      // -------------------------------------
      // ORDER DATA
      // -------------------------------------

      const orderData = {
        items: orderItems,

        shippingAddress: address,

        contactNumber: contact,

        paymentMode: paymentMode,
      };

      console.log(
        "Sending Order Data:",
        orderData
      );

      // -------------------------------------
      // API CALL
      // -------------------------------------

      if (paymentMode !== "COD") {
        const response = await api.post("/payments/stripe/create-intent", orderData);
        const res = response.data;
        if (res.success) {
          setClientSecret(res.clientSecret);
          setStripeOrderId(res.orderId);
        } else {
          alert(res.message || "Unable to start secure payment");
        }
        return;
      }

      const response = await api.post("/orders/cod", orderData);

      const res = response.data;

      console.log(
        "Order Response:",
        res
      );

      // -------------------------------------
      // SUCCESS
      // -------------------------------------

      if (res.success) {
        alert(
          "Order Placed Successfully!"
        );

        // Local cart empty
        setCartItems([]);

        // Home page
        navigate("/");
      } else {
        alert(
          res.message ||
            "Failed to place order"
        );
      }
    } catch (error) {
      console.log(
        "Place Order Error:",
        error
      );

      console.log(
        "Backend Error:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
          "Failed to place order"
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <section className="checkout">
        <div className="checkoutContainer">
          <div className="checkoutLoading">
            Loading checkout...
          </div>
        </div>
      </section>
    );
  }

  // =====================================
  // EMPTY CART
  // =====================================

  if (cartItems.length === 0) {
    return (
      <section className="checkout">
        <div className="checkoutContainer">
          <div className="checkoutError">
            <h2>Your Cart is Empty</h2>

            <p>
              Please add products before
              placing an order.
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
        </div>
      </section>
    );
  }

  // =====================================
  // CHECKOUT PAGE
  // =====================================

  return (
    <section className="checkout">

      <div className="checkoutContainer">

        {/* =================================
            LEFT SIDE
        ================================= */}

        <div className="checkoutLeft">

          <h2>Checkout</h2>

          {/* SHIPPING ADDRESS */}

          <div className="formGroup">

            <label>
              Shipping Address
            </label>

            <textarea
              rows="4"
              placeholder="Enter your complete shipping address"
              value={shippingAddress}
              onChange={(e) =>
                setShippingAddress(
                  e.target.value
                )
              }
            />

          </div>

          {/* CONTACT NUMBER */}

          <div className="formGroup">

            <label>
              Contact Number
            </label>

            <input
              type="tel"
              inputMode="numeric"
              placeholder="Enter 10 digit contact number"
              value={contactNumber}
              maxLength={10}
              onChange={(e) => {

                const value =
                  e.target.value.replace(
                    /\D/g,
                    ""
                  );

                setContactNumber(value);
              }}
            />

          </div>

          {/* PAYMENT MODE */}

          <div className="formGroup">

            <label>
              Payment Mode
            </label>

            <div className="paymentOptions">

              {/* COD */}

              <label>
                <input
                  type="radio"
                  name="paymentMode"
                  value="COD"
                  checked={
                    paymentMode === "COD"
                  }
                  onChange={(e) => { setPaymentMode(e.target.value); setClientSecret(""); }}
                />

                <span>
                  Cash on Delivery
                </span>
              </label>

              {/* UPI */}

              <label>
                <input
                  type="radio"
                  name="paymentMode"
                  value="UPI"
                  checked={
                    paymentMode === "UPI"
                  }
                  onChange={(e) => { setPaymentMode(e.target.value); setClientSecret(""); }}
                />

                <span>
                  UPI
                </span>
              </label>

              {/* CARD */}

              <label>
                <input
                  type="radio"
                  name="paymentMode"
                  value="Card"
                  checked={
                    paymentMode === "Card"
                  }
                  onChange={(e) => { setPaymentMode(e.target.value); setClientSecret(""); }}
                />

                <span>
                  Card
                </span>
              </label>

            </div>

          </div>

        </div>

        {/* =================================
            RIGHT SIDE
        ================================= */}

        <div className="checkoutRight">

          <h2>
            Order Summary
          </h2>

          {/* CART PRODUCTS */}

          {cartItems.map((item) => {

            const product =
              item.productId;

            if (!product) {
              return null;
            }

            const price = Number(
              product.price || 0
            );

            const quantity = Number(
              item.quantity || 1
            );

            const itemTotal =
              price * quantity;

            return (
              <div
                className="summaryItem"
                key={product._id}
              >

                <div>
                  <h4>
                    {product.title}
                  </h4>

                  <p>
                    Qty: {quantity}
                  </p>
                </div>

                <h4>
                  ₹{" "}
                  {itemTotal.toLocaleString()}
                </h4>

              </div>
            );
          })}

          <hr />

          {/* TOTAL */}

          <div className="total">

            <h3>
              Total
            </h3>

            <h3>
              ₹{" "}
              {totalAmount.toLocaleString()}
            </h3>

          </div>

          {/* PLACE ORDER BUTTON */}

          {clientSecret && stripePromise ? (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
              <StripePaymentForm orderId={stripeOrderId} />
            </Elements>
          ) : (
            <>
              {paymentMode !== "COD" && !stripePromise && (
                <p className="stripePaymentError">Online payments are not configured yet. Add VITE_STRIPE_PUBLISHABLE_KEY to frontend/.env.</p>
              )}
              <button
                className="placeOrderBtn"
                type="button"
                onClick={handlePlaceOrder}
                disabled={placingOrder || (paymentMode !== "COD" && !stripePromise)}
              >
                {placingOrder ? "Starting payment..." : paymentMode === "COD" ? "Place Order" : "Continue to secure payment"}
              </button>
            </>
          )}

        </div>

      </div>

    </section>
  );
}

export default Checkout;
