import { useState } from "react";
import "./Checkout.css";

function Checkout() {
  
  const cartItems = [
    {
      _id: 1,
      name: "Men T-Shirt",
      price: 999,
      quantity: 2,
    },
    {
      _id: 2,
      name: "Jeans",
      price: 1499,
      quantity: 1,
    },
  ];

  const [shippingAddress, setShippingAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [paymentMode, setPaymentMode] = useState("COD");

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = () => {
    alert("Next Step: Place Order API");
  };

  return (
    <section className="checkout">

      <div className="checkoutContainer">

        {/* Left Side */}
        <div className="checkoutLeft">

          <h2>Checkout</h2>

          <div className="formGroup">
            <label>Shipping Address</label>

            <textarea
              rows="4"
              placeholder="Enter Shipping Address"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
            />
          </div>

          <div className="formGroup">
            <label>Contact Number</label>

            <input
              type="text"
              placeholder="Enter Contact Number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
            />
          </div>

          <div className="formGroup">

            <label>Payment Mode</label>

            <div className="paymentOptions">

              <label>
                <input
                  type="radio"
                  value="COD"
                  checked={paymentMode === "COD"}
                  onChange={(e) => setPaymentMode(e.target.value)}
                />
                Cash on Delivery
              </label>

              <label>
                <input
                  type="radio"
                  value="UPI"
                  checked={paymentMode === "UPI"}
                  onChange={(e) => setPaymentMode(e.target.value)}
                />
                UPI
              </label>

              <label>
                <input
                  type="radio"
                  value="Card"
                  checked={paymentMode === "Card"}
                  onChange={(e) => setPaymentMode(e.target.value)}
                />
                Card
              </label>

            </div>
          </div>

        </div>

        {/* Right Side */}

        <div className="checkoutRight">

          <h2>Order Summary</h2>

          {cartItems.map((item) => (

            <div className="summaryItem" key={item._id}>

              <div>
                <h4>{item.name}</h4>
                <p>Qty : {item.quantity}</p>
              </div>

              <h4>₹ {item.price * item.quantity}</h4>

            </div>

          ))}

          <hr />

          <div className="total">

            <h3>Total</h3>

            <h3>₹ {totalAmount}</h3>

          </div>

          <button
            className="placeOrderBtn"
            onClick={handlePlaceOrder}
          >
            Place Order
          </button>

        </div>

      </div>

    </section>
  );
}

export default Checkout;