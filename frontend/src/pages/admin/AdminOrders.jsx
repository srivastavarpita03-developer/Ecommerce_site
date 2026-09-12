import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminOrders.css";
import api from "../../utils/api";
import {
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiPackage,
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiArrowLeft,
} from "react-icons/fi";

function AdminOrders() {
  const navigate = useNavigate();

  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function getOrders() {
    try {
      setLoading(true);
      const response = await api.get("/orders/all");
      const res = response.data;
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
        alert(error.response?.data?.message || "Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getOrders();
  }, []);

  function calculateOrderTotal(order) {
    if (order.totalOrderValue) {
      return Number(order.totalOrderValue);
    }
    return (
      order.items?.reduce((total, item) => {
        const price = Number(item.productId?.price || 0);
        const quantity = Number(item.quantity || 0);
        return total + price * quantity;
      }, 0) || 0
    );
  }

  // Stats
  const totalOrders = ordersData.length;
  const pendingOrders = ordersData.filter((o) => o.orderStatus === "pending").length;
  const deliveredOrders = ordersData.filter((o) => o.orderStatus === "delivered").length;
  const totalRevenue = ordersData.reduce((sum, o) => sum + calculateOrderTotal(o), 0);

  if (loading) {
    return (
      <section className="adminOrders">
        <div className="ordersLoading">
          <div className="ordersLoader" />
          <p>Loading Orders...</p>
        </div>
      </section>
    );
  }

  if (ordersData.length === 0) {
    return (
      <section className="adminOrders">
        <div className="ordersHeader">
          <div className="ordersHeaderLeft">
            <button className="backToList" onClick={() => navigate(-1)}>
              <FiArrowLeft />
            </button>
            <div>
              <h1>Orders</h1>
              <p className="ordersSubtitle">Manage customer orders</p>
            </div>
          </div>
        </div>
        <div className="noOrders">
          <FiPackage className="noOrdersIcon" />
          <h2>No Orders Found</h2>
          <p>There are no customer orders yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="adminOrders">

      {/* HEADER */}
      <div className="ordersHeader">
        <div className="ordersHeaderLeft">
          <button className="backToList" onClick={() => navigate(-1)}>
            <FiArrowLeft />
          </button>
          <div>
            <h1>Orders</h1>
            <p className="ordersSubtitle">Manage customer orders</p>
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="orderStats">
        <div className="statCard">
          <div className="statIcon total">
            <FiPackage />
          </div>
          <div className="statInfo">
            <span className="statValue">{totalOrders}</span>
            <span className="statLabel">Total Orders</span>
          </div>
        </div>

        <div className="statCard">
          <div className="statIcon pending">
            <FiClock />
          </div>
          <div className="statInfo">
            <span className="statValue">{pendingOrders}</span>
            <span className="statLabel">Pending</span>
          </div>
        </div>

        <div className="statCard">
          <div className="statIcon delivered">
            <FiCheckCircle />
          </div>
          <div className="statInfo">
            <span className="statValue">{deliveredOrders}</span>
            <span className="statLabel">Delivered</span>
          </div>
        </div>

        <div className="statCard">
          <div className="statIcon revenue">
            <FiTruck />
          </div>
          <div className="statInfo">
            <span className="statValue">₹{totalRevenue.toLocaleString("en-IN")}</span>
            <span className="statLabel">Revenue</span>
          </div>
        </div>
      </div>

      {/* TABLE */}
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
              const total = calculateOrderTotal(order);
              return (
                <tr key={order._id}>
                  <td>
                    <span className="orderId">#{order._id.slice(-8)}</span>
                  </td>
                  <td>
                    <span className="orderDate">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A"}
                    </span>
                  </td>
                  <td>
                    <div className="customerInfo">
                      <div className="customerAvatar">
                        {(order.userId?.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>{order.userId?.name || "Unknown User"}</strong>
                        <small>{order.userId?.email || "N/A"}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong className="orderTotal">₹{total.toLocaleString("en-IN")}</strong>
                  </td>
                  <td>
                    <span className={`paymentBadge ${order.paymentStatus || "pending"}`}>
                      {order.paymentStatus || "pending"}
                    </span>
                  </td>
                  <td>
                    <span className="paymentMode">{order.paymentMode || "N/A"}</span>
                  </td>
                  <td>
                    <span className={`statusBadge ${order.orderStatus || "pending"}`}>
                      {order.orderStatus || "pending"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="viewBtn"
                      onClick={() => navigate(`/admin/orders/${order._id}`)}
                    >
                      <FiEye /> View
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
