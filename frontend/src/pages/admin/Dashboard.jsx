import { useEffect, useState } from "react";
import api from "../../utils/api";
import "./Dashboard.css";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  // ======================================
  // GET DASHBOARD DATA
  // ======================================

  async function getDashboardData() {
    try {
      setLoading(true);

      const response = await api.get("/dashboard");

      const res = response.data;

      if (res.success) {
        setDashboard(res.data);
      } else {
        alert(res.message || "Failed to load dashboard");
      }
    } catch (error) {
      console.log("Dashboard Error:", error);

      if (error.response?.status === 401) {
        alert("Unauthorized Access. Please login as admin.");
      } else {
        alert(
          error.response?.data?.message ||
            "Failed to load dashboard"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getDashboardData();
  }, []);

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  // ======================================
  // NO DATA
  // ======================================

  if (!dashboard) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          Dashboard data not available.
        </div>
      </div>
    );
  }

  // ======================================
  // DASHBOARD
  // ======================================

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome to Elite Attire Admin Panel</p>
        </div>

        <button
          type="button"
          className="refresh-btn"
          onClick={getDashboardData}
        >
          Refresh
        </button>
      </div>

      {/* STAT CARDS */}

      <div className="dashboard-cards">

        {/* PRODUCTS */}

        <div className="dashboard-card">
          <div className="card-title">
            Total Products
          </div>

          <div className="card-value">
            {dashboard.totalProducts}
          </div>

          <div className="card-description">
            Products available
          </div>
        </div>

        {/* USERS */}

        <div className="dashboard-card">
          <div className="card-title">
            Total Users
          </div>

          <div className="card-value">
            {dashboard.totalUsers}
          </div>

          <div className="card-description">
            Registered users
          </div>
        </div>

        {/* ORDERS */}

        <div className="dashboard-card">
          <div className="card-title">
            Total Orders
          </div>

          <div className="card-value">
            {dashboard.totalOrders}
          </div>

          <div className="card-description">
            Orders received
          </div>
        </div>

        {/* REVENUE */}

        <div className="dashboard-card">
          <div className="card-title">
            Total Revenue
          </div>

          <div className="card-value">
            ₹ {Number(
              dashboard.totalRevenue || 0
            ).toLocaleString()}
          </div>

          <div className="card-description">
            Total sales revenue
          </div>
        </div>

      </div>

      {/* ORDER STATUS */}

      <div className="order-status-section">

        <h2>Order Overview</h2>

        <div className="order-status-cards">

          <div className="status-card pending">
            <h3>Pending Orders</h3>

            <strong>
              {dashboard.pendingOrders}
            </strong>
          </div>

          <div className="status-card delivered">
            <h3>Delivered Orders</h3>

            <strong>
              {dashboard.deliveredOrders}
            </strong>
          </div>

          <div className="status-card cancelled">
            <h3>Cancelled Orders</h3>

            <strong>
              {dashboard.cancelledOrders}
            </strong>
          </div>

        </div>

      </div>

      {/* RECENT ORDERS */}

      <div className="recent-orders-section">

        <div className="section-header">
          <h2>Recent Orders</h2>
        </div>

        {dashboard.recentOrders?.length === 0 ? (

          <div className="no-orders">
            No recent orders found.
          </div>

        ) : (

          <div className="orders-table-wrapper">

            <table className="orders-table">

              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Order ID</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>

                {dashboard.recentOrders?.map(
                  (order) => (

                    <tr key={order._id}>

                      <td>
                        <div className="customer-info">
                          <strong>
                            {order.userId?.name ||
                              "Unknown User"}
                          </strong>

                          <span>
                            {order.userId?.email ||
                              "No Email"}
                          </span>
                        </div>
                      </td>

                      <td>
                        #{order._id.slice(-6)}
                      </td>

                      <td>
                        ₹{" "}
                        {Number(
                          order.totalOrderValue || 0
                        ).toLocaleString()}
                      </td>

                      <td>
                        {order.paymentMode}
                      </td>

                      <td>
                        <span
                          className={`order-status ${order.orderStatus}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>

                      <td>
                        {new Date(
                          order.createdAt
                        ).toLocaleDateString()}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Dashboard;