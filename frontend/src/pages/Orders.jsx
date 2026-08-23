import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./Orders.css";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function getOrders() {
    try {
      setLoading(true);

      console.log("1. Getting user orders...");

      const response = await api.get("/orders/user-orders");

      console.log("2. Orders API response:", response.data);

      const res = response.data;

      if (res.success) {
        setOrders(res.data || []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.log("3. Orders Error:", error);

      console.log(
        "Status:",
        error.response?.status
      );

      console.log(
        "Message:",
        error.response?.data?.message
      );

      // Unauthorized
      if (
        error.response?.status === 401 ||
        error.response?.status === 400
      ) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      alert(
        error.response?.data?.message ||
          "Failed to load orders"
      );
    } finally {
      setLoading(false);
      console.log("4. Loading finished");
    }
  }

  useEffect(() => {
    getOrders();
  }, []);

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <section className="ordersPage">
        <div className="ordersContainer">
          <h2>Loading Orders...</h2>
        </div>
      </section>
    );
  }

  // ==============================
  // NO ORDERS
  // ==============================

  if (orders.length === 0) {
    return (
      <section className="ordersPage">
        <div className="ordersContainer emptyOrders">

          <h2>No Orders Found</h2>

          <p>
            You have not placed any orders yet.
          </p>

          <button
            type="button"
            onClick={() => navigate("/products")}
          >
            Start Shopping
          </button>

        </div>
      </section>
    );
  }

  // ==============================
  // ORDERS
  // ==============================

  return (
    <section className="ordersPage">

      <div className="ordersContainer">

        <h1>My Orders</h1>

        {orders.map((order) => (

          <div
            className="orderCard"
            key={order._id}
          >

            {/* HEADER */}

            <div className="orderHeader">

              <div>
                <h3>
                  Order #{order._id.slice(-8)}
                </h3>

                <p>
                  Date:{" "}
                  {new Date(
                    order.createdAt
                  ).toLocaleDateString()}
                </p>
              </div>

              <span
                className={`orderStatus ${order.orderStatus}`}
              >
                {order.orderStatus}
              </span>

            </div>

            {/* ITEMS */}

            <div className="orderItems">

              {order.items?.map((item, index) => {

                const product =
                  item.productId;

                if (!product) {
                  return (
                    <div
                      key={index}
                      className="orderItem"
                    >
                      Product unavailable
                    </div>
                  );
                }

                const price =
                  Number(product.price || 0);

                const quantity =
                  Number(item.quantity || 1);

                return (
                  <div
                    className="orderItem"
                    key={index}
                  >

                    <div>
                      <h4>
                        {product.title}
                      </h4>

                      <p>
                        Quantity: {quantity}
                      </p>
                    </div>

                    <strong>
                      ₹{" "}
                      {(
                        price * quantity
                      ).toLocaleString()}
                    </strong>

                  </div>
                );
              })}

            </div>

            {/* ORDER DETAILS */}

            <div className="orderDetails">

              <div>
                <span>
                  Shipping Address
                </span>

                <strong>
                  {order.shippingAddress}
                </strong>
              </div>

              <div>
                <span>
                  Contact Number
                </span>

                <strong>
                  {order.contactNumber}
                </strong>
              </div>

              <div>
                <span>
                  Payment Mode
                </span>

                <strong>
                  {order.paymentMode}
                </strong>
              </div>

              <div>
                <span>
                  Payment Status
                </span>

                <strong>
                  {order.paymentStatus}
                </strong>
              </div>

            </div>

            {/* TOTAL */}

            <div className="orderTotal">

              <span>
                Total Amount
              </span>

              <strong>
                ₹{" "}
                {Number(
                  order.totalOrderValue || 0
                ).toLocaleString()}
              </strong>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}

export default Orders;