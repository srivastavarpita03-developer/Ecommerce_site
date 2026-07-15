import { useState } from "react";
import "./Cart.css";
import { FaTrash } from "react-icons/fa";

function Cart() {
  const cartItems = [
    {
      _id: "1",
      product: "Oversized Black T-Shirt",
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300",
      quantity: 2,
      price: 899,
      size: "L",
      color: "Black",
    },
    {
      _id: "2",
      product: "Blue Denim Jeans",
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300",
      quantity: 1,
      price: 1599,
      size: "32",
      color: "Blue",
    },
    {
      _id: "3",
      product: "White Sneakers",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300",
      quantity: 1,
      price: 2499,
      size: "7",
      color: "White",
    },
  ];

  return (
    <section className="cartPage">
      <h1>Shopping Cart</h1>

      <div className="cartContainer">
        {/* Left */}

        <div className="cartItems">
          {cartItems.length === 0 ? (
            <h2>Your Cart is Empty</h2>
          ) : (
            cartItems.map((item) => (
              <div className="cartCard" key={item._id}>
                <img src={item.image} alt={item.product} />

                <div className="cartInfo">
                  <h3>{item.product}</h3>
                  <p className="price">₹ {item.price.toLocaleString()}</p>
                </div>

                <div className="cartActions">
                  <div className="quantityBox">
                    <button type="button">-</button>

                    <span>{item.quantity}</span>

                    <button type="button">+</button>
                  </div>

                  <button type="button">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right */}

        <div className="summary">
          <h2>Order Summary</h2>

          <div className="summaryRow">
            <span>Subtotal</span>
            <span>₹ {10000}</span>
          </div>

          <div className="summaryRow">
            <span>Shipping</span>
            <span>Free</span>
          </div>

          <div className="summaryRow">
            <span>Tax</span>
            <span>₹ 0</span>
          </div>

          <hr />

          <div className="summaryRow total">
            <span>Total</span>
            <span>₹ 10000</span>
          </div>

          <button className="checkoutBtn" disabled={cartItems.length === 0}>
            Proceed To Checkout
          </button>
        </div>
      </div>
    </section>
  );
}

export default Cart;
