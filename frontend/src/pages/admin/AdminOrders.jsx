import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminOrders.css";
import api from "../../utils/api";

function AdminOrders() {
  const navigate = useNavigate();

  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==============================
  // GET ALL ORDERS
  // ==============================

  async function getOrders() {
    try {
      setLoading(true);

      const response = await api.get("/orders/all");

      const res = response.data;

      console.log("Admin Orders:", res);

      if (res.success) {
        setOrdersData(res.data || []);
      } else {
        setOrdersData([]);
      }
    } catch (error) {
      console.log("Get Admin Orders Error:", error);

      if (error.response?.status === 401) {
        alert("Please login as admin first");
      } else {
        alert(
          error.response?.data?.message ||
            "Failed to load orders"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getOrders();
  }, []);

  // ==============================
  // CALCULATE ORDER TOTAL
  // ==============================

  function calculateOrderTotal(order) {
    if (order.totalOrderValue) {
      return Number(order.totalOrderValue);
    }

    return (
      order.items?.reduce((total, item) => {
        const price = Number(
          item.productId?.price || 0
        );

        const quantity = Number(
          item.quantity || 0
        );

        return total + price * quantity;
      }, 0) || 0
    );
  }

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <section className="adminOrders">
        <div className="ordersLoading">
          Loading Orders...
        </div>
      </section>
    );
  }

  // ==============================
  // NO ORDERS
  // ==============================

  if (ordersData.length === 0) {
    return (
      <section className="adminOrders">
        <div className="ordersHeader">
          <h1>Orders</h1>
        </div>

        <div className="noOrders">
          <h2>No Orders Found</h2>
          <p>
            There are no customer orders yet.
          </p>
        </div>
      </section>
    );
  }

  // ==============================
  // UI
  // ==============================

  return (
    <section className="adminOrders">

      <div className="ordersHeader">
        <div>
          <h1>Orders</h1>

          <p>
            Total Orders: {ordersData.length}
          </p>
        </div>
      </div>

      <div className="tableWrapper">

        <table>

          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Mode</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {ordersData.map((order) => {

              const total =
                calculateOrderTotal(order);

              return (
                <tr key={order._id}>

                  {/* ORDER ID */}

                  <td>
                    <span className="orderId">
                      #{order._id.slice(-8)}
                    </span>
                  </td>

                  {/* DATE */}

                  <td>
                    {order.createdAt
                      ? new Date(
                          order.createdAt
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "N/A"}
                  </td>

                  {/* CUSTOMER */}

                  <td>
                    <div className="customerInfo">

                      <strong>
                        {order.userId?.name ||
                          "Unknown User"}
                      </strong>

                      <small>
                        {order.userId?.email ||
                          "N/A"}
                      </small>

                    </div>
                  </td>

                  {/* TOTAL */}

                  <td>
                    <strong>
                      ₹{" "}
                      {total.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </td>

                  {/* PAYMENT */}

                  <td>
                    <span
                      className={`paymentStatus ${
                        order.paymentStatus ||
                        "pending"
                      }`}
                    >
                      {order.paymentStatus ||
                        "pending"}
                    </span>
                  </td>

                  {/* PAYMENT MODE */}

                  <td>
                    {order.paymentMode ||
                      "N/A"}
                  </td>

                  {/* ORDER STATUS */}

                  <td>
                    <span
                      className={`status ${
                        order.orderStatus ||
                        "pending"
                      }`}
                    >
                      {order.orderStatus ||
                        "pending"}
                    </span>
                  </td>

                  {/* VIEW */}

                  <td>

                    <button
                      type="button"
                      className="viewBtn"
                      onClick={() =>
                        navigate(
                          `/admin/orders/${order._id}`
                        )
                      }
                    >
                      View
                    </button>

                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

    </section>
  );
}

export default AdminOrders;